import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Lock,
  UserCheck,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Fingerprint,
  Server,
  Clock,
  ChevronLeft,
  TrendingUp,
  FolderGit2,
  BookOpen,
  Settings,
} from 'lucide-react';

interface VerifiedUser {
  username?: string;
  email: string;
  name: string;
  role: string;
  verifiedAt: string;
  expiresAt: string;
}

interface VerifiedLoginPanelProps {
  onAuthenticated: (token: string, user: VerifiedUser) => void;
  onBackToSite?: () => void;
}

export const VerifiedLoginPanel: React.FC<VerifiedLoginPanelProps> = ({
  onAuthenticated,
  onBackToSite,
}) => {
  // Login mode: 'direct' = Usuario + Contraseña, '2fa' = Doble Factor OTP
  const [loginMode, setLoginMode] = useState<'direct' | '2fa'>('direct');
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields
  const [usernameOrEmail, setUsernameOrEmail] = useState<string>('gaston.barea');
  const [password, setPassword] = useState<string>('gaston2026');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // 2FA OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [maskedEmail, setMaskedEmail] = useState<string>('ga***@gmail.com');
  const [otpHint, setOtpHint] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(600);

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successNotice, setSuccessNotice] = useState<string>('');
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step !== 2) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  // Direct Username + Password Login
  const handleDirectPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanIdentity = usernameOrEmail.trim();
    const cleanPassword = password.trim();

    if (!cleanIdentity || !cleanPassword) {
      setErrorMessage('Ingresa tu usuario o correo y tu contraseña para acceder al Panel de Control.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessNotice('');

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernameOrEmail: cleanIdentity,
          password: cleanPassword,
          rememberMe,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.token) {
        setSuccessNotice('¡Sesión iniciada correctamente!');
        localStorage.setItem('gb_blog_auth', 'true');
        localStorage.setItem('gb_admin_token', data.token);
        localStorage.setItem('gb_master_passkey', cleanPassword || 'gaston2026');
        localStorage.setItem('gb_verified_user', JSON.stringify(data.user));
        onAuthenticated(data.token, data.user);
        return;
      } else {
        setErrorMessage(data.error || 'Usuario o contraseña inválidos.');
      }
    } catch {
      // Local fallback for static preview
      const validUsers = [
        'gastonbarea.com@gmail.com',
        'gaston.barea',
        'gaston',
        'admin',
        'admin@gastonbarea.com',
      ];
      const validPass = ['gaston2026', 'admin2026', 'admin'];
      if (
        validUsers.includes(cleanIdentity.toLowerCase()) &&
        validPass.includes(cleanPassword)
      ) {
        const fallbackUser: VerifiedUser = {
          username: 'gaston.barea',
          email: 'gastonbarea.com@gmail.com',
          name: 'Gastón Barea',
          role: 'Super Admin & PMO Director',
          verifiedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };
        localStorage.setItem('gb_blog_auth', 'true');
        localStorage.setItem('gb_admin_token', 'local_verified_token');
        localStorage.setItem('gb_master_passkey', cleanPassword);
        localStorage.setItem('gb_verified_user', JSON.stringify(fallbackUser));
        onAuthenticated('local_verified_token', fallbackUser);
        return;
      }
      setErrorMessage('Usuario o contraseña incorrectos.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Step 1 Submit (2FA Flow)
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessNotice('');

    const normalizedEmail =
      usernameOrEmail.includes('@') ? usernameOrEmail.trim() : 'gastonbarea.com@gmail.com';

    try {
      const res = await fetch('/api/admin/auth/verify-step-1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMaskedEmail(data.maskedEmail || normalizedEmail);
        if (data.otpHint) setOtpHint(data.otpHint);
        setTimeLeft(data.expiresInSeconds || 600);
        setStep(2);
        setTimeout(() => {
          otpInputsRef.current[0]?.focus();
        }, 150);
      } else {
        setErrorMessage(data.error || 'Credenciales inválidas.');
        if (data.attemptsLeft !== undefined) {
          setAttemptsLeft(data.attemptsLeft);
        }
      }
    } catch {
      if (password === 'gaston2026' || password === 'admin') {
        const dummyCode = '749216';
        setOtpHint(dummyCode);
        setMaskedEmail(normalizedEmail);
        setStep(2);
      } else {
        setErrorMessage('Error al conectar con el servidor de autenticación.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      const newDigits = [...otpDigits];
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
      }
      setOtpDigits(newDigits);
      if (pasted.length === 6) {
        verifyCode(pasted);
      }
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    const fullCode = newDigits.join('');
    if (fullCode.length === 6) {
      verifyCode(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Verify Code (Step 2)
  const verifyCode = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length < 6) {
      setErrorMessage('Ingresa los 6 dígitos del código de verificación.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const normalizedEmail =
      usernameOrEmail.includes('@') ? usernameOrEmail.trim() : 'gastonbarea.com@gmail.com';

    try {
      const res = await fetch('/api/admin/auth/verify-step-2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          code,
          rememberMe,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.token) {
        setSuccessNotice('¡Acceso Verificado Correctamente!');
        localStorage.setItem('gb_blog_auth', 'true');
        localStorage.setItem('gb_admin_token', data.token);
        localStorage.setItem('gb_master_passkey', password || 'gaston2026');
        localStorage.setItem('gb_verified_user', JSON.stringify(data.user));

        setTimeout(() => {
          onAuthenticated(data.token, data.user);
        }, 400);
      } else {
        setErrorMessage(data.error || 'Código incorrecto o expirado.');
      }
    } catch {
      if (code === otpHint || code === '749216' || code === 'gaston2026') {
        const dummyUser: VerifiedUser = {
          username: 'gaston.barea',
          email: normalizedEmail,
          name: 'Gastón Barea',
          role: 'Super Admin & PMO Director',
          verifiedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };
        localStorage.setItem('gb_blog_auth', 'true');
        localStorage.setItem('gb_admin_token', 'local_verified_token');
        onAuthenticated('local_verified_token', dummyUser);
      } else {
        setErrorMessage('Error al validar el código con el servidor.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP Code
  const handleResendCode = async () => {
    setIsLoading(true);
    setErrorMessage('');
    const normalizedEmail =
      usernameOrEmail.includes('@') ? usernameOrEmail.trim() : 'gastonbarea.com@gmail.com';
    try {
      const res = await fetch('/api/admin/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const data = await res.json();
      if (data.otpHint) setOtpHint(data.otpHint);
      setTimeLeft(600);
      setOtpDigits(['', '', '', '', '', '']);
      setSuccessNotice('Se ha enviado un nuevo código de verificación.');
      setTimeout(() => setSuccessNotice(''), 3000);
    } catch {
      const newDummy = Math.floor(100000 + Math.random() * 900000).toString();
      setOtpHint(newDummy);
      setTimeLeft(600);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-4rem)]">
      {/* LEFT 5 COLUMNS: Architectural Executive Overview Panel */}
      <div className="lg:col-span-5 bg-[#0A0A0F] text-white p-8 sm:p-12 lg:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-sky-400">
              <ShieldCheck className="w-4 h-4" />
              <span>PANEL DE CONTROL & CRM · ACCESO AUTORIZADO</span>
            </span>
            {onBackToSite && (
              <button
                type="button"
                onClick={onBackToSite}
                className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver al Inicio</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Panel de Control Operativo, CRM & PMO
            </h1>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Administración centralizada de oportunidades comerciales, cotizaciones ejecutivas,
              proyectos activos del Portal de Clientes, tickets con SLA, publicaciones del Blog y
              configuración general de gastonbarea.com.
            </p>
          </div>

          {/* Core Modules Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-4 bg-white/[0.04] border border-white/10 space-y-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <div className="text-xs font-bold text-white">CRM & Presupuestos</div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Pipeline comercial, seguimiento de leads y generador de propuestas PDF.
              </p>
            </div>
            <div className="p-4 bg-white/[0.04] border border-white/10 space-y-1.5">
              <FolderGit2 className="w-4 h-4 text-sky-400" />
              <div className="text-xs font-bold text-white">Gestión Portal Clientes</div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Respuesta a consultas técnicas, control de hitos y resolución de tickets SLA.
              </p>
            </div>
            <div className="p-4 bg-white/[0.04] border border-white/10 space-y-1.5">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <div className="text-xs font-bold text-white">Editor de Publicaciones</div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Gestión de artículos técnicos de arquitectura, IA y bioeconomía.
              </p>
            </div>
            <div className="p-4 bg-white/[0.04] border border-white/10 space-y-1.5">
              <Settings className="w-4 h-4 text-purple-400" />
              <div className="text-xs font-bold text-white">Pasarelas & Parámetros</div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Configuración de CBU, Mercado Pago, Stripe, WhatsApp y enlaces.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Demo Credential Fill Box */}
        <div className="pt-8 mt-8 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-sky-400 font-semibold">
              Credenciales Administrativas (1-Click):
            </span>
            <span className="text-[11px] font-mono text-neutral-400">TLS 1.3</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setUsernameOrEmail('gaston.barea');
              setPassword('gaston2026');
              setLoginMode('direct');
              setErrorMessage('');
            }}
            className="w-full text-left p-3.5 bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
          >
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white group-hover:text-sky-300 transition-colors">
                Gastón Barea · Super Admin & PMO Director
              </div>
              <div className="text-[11px] font-mono text-neutral-400 truncate mt-0.5">
                Usuario: <strong className="text-white">gaston.barea</strong> · Clave:{' '}
                <strong className="text-emerald-300">gaston2026</strong>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-sky-500/20 text-sky-300 text-[10px] font-mono font-semibold shrink-0">
              Autocompletar
            </span>
          </button>
        </div>
      </div>

      {/* RIGHT 7 COLUMNS: Authentication Form Workspace */}
      <div className="lg:col-span-7 bg-white p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto space-y-7">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#291B64]/8 text-[#291B64] text-xs font-sans font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Autenticación de Administrador</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1D1D1F] tracking-tight">
              Iniciar Sesión en el Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-[#515154]">
              Ingresa con tu usuario administrativo y contraseña maestra para acceder al Panel de Control.
            </p>
          </div>

          {/* Login Method Selector Tabs */}
          <div className="grid grid-cols-2 border border-black/10 bg-[#F5F5F7] p-1">
            <button
              type="button"
              onClick={() => {
                setLoginMode('direct');
                setErrorMessage('');
              }}
              className={`py-2.5 px-3 text-xs font-sans font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                loginMode === 'direct'
                  ? 'bg-white text-[#1D1D1F] shadow-xs'
                  : 'text-[#515154] hover:text-[#1D1D1F]'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-[#291B64]" />
              <span>Usuario y Contraseña</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode('2fa');
                setErrorMessage('');
              }}
              className={`py-2.5 px-3 text-xs font-sans font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                loginMode === '2fa'
                  ? 'bg-white text-[#1D1D1F] shadow-xs'
                  : 'text-[#515154] hover:text-[#1D1D1F]'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5 text-[#291B64]" />
              <span>Doble Factor (2FA OTP)</span>
            </button>
          </div>

          {/* Error and Success Banners */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">
                <div>{errorMessage}</div>
                {attemptsLeft !== null && attemptsLeft > 0 && (
                  <div className="text-[11px] text-rose-600 font-mono mt-0.5">
                    Intentos restantes antes de bloqueo: {attemptsLeft}
                  </div>
                )}
              </div>
            </div>
          )}

          {successNotice && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* MODE 1: DIRECT USERNAME + PASSWORD */}
          {loginMode === 'direct' && (
            <form onSubmit={handleDirectPasswordSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-sans font-semibold text-[#1D1D1F] mb-1.5">
                  Usuario o Correo Electrónico
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="gaston.barea o gastonbarea.com@gmail.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#F5F5F7] border border-black/15 text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#291B64] transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-sans font-semibold text-[#1D1D1F]">
                    Contraseña Maestra
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">Clave: gaston2026</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="w-full pl-10 pr-11 py-3 bg-[#F5F5F7] border border-black/15 text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#291B64] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="inline-flex items-center gap-2 text-[#515154] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-[#291B64]"
                  />
                  <span>Mantener sesión iniciada en este navegador</span>
                </label>

                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Server className="w-3 h-3 text-emerald-500" />
                  <span>Activo</span>
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#291B64] hover:bg-[#382586] text-white font-sans font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Iniciar Sesión en el Panel de Control</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 2: 2FA OTP STEP 1 & STEP 2 */}
          {loginMode === '2fa' && step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-5">
              <div>
                <label className="block text-xs font-sans font-semibold text-[#1D1D1F] mb-1.5">
                  Correo Electrónico Verificado
                </label>
                <input
                  type="text"
                  required
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="gastonbarea.com@gmail.com"
                  className="w-full px-4 py-3 bg-[#F5F5F7] border border-black/15 text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#291B64]"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold text-[#1D1D1F] mb-1.5">
                  Contraseña Maestra
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña del administrador"
                  className="w-full px-4 py-3 bg-[#F5F5F7] border border-black/15 text-sm text-[#1D1D1F] focus:bg-white focus:outline-none focus:border-[#291B64]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#291B64] hover:bg-[#382586] text-white font-sans font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Solicitar Código 2FA</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {loginMode === '2fa' && step === 2 && (
            <div className="space-y-5 text-xs">
              <div className="p-3.5 bg-[#F5F5F7] border border-black/10 text-center space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Código de Autenticación de 2 Factores
                </span>
                <p className="text-xs text-slate-700">
                  Se ha generado un código de 6 dígitos para:
                </p>
                <div className="font-mono font-extrabold text-[#291B64] text-sm">
                  {maskedEmail}
                </div>
              </div>

              {otpHint && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Fingerprint className="w-4 h-4 text-emerald-600" />
                    <span>Código OTP:</span>
                    <strong className="text-sm tracking-widest font-extrabold ml-1">
                      {otpHint}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const digits = otpHint.split('');
                      setOtpDigits(digits);
                      verifyCode(otpHint);
                    }}
                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-[11px] font-bold cursor-pointer"
                  >
                    Autocompletar
                  </button>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 text-center mb-2.5">
                  Ingresa los 6 dígitos:
                </label>
                <div className="flex items-center justify-center gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputsRef.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-11 h-13 text-center text-xl font-mono font-extrabold bg-[#F5F5F7] border border-black/15 text-slate-900 focus:bg-white focus:border-[#291B64] focus:outline-none"
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Expira en: {formatTimer(timeLeft)}</span>
                </div>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="text-[#291B64] hover:underline font-semibold cursor-pointer"
                >
                  Reenviar código
                </button>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => verifyCode()}
                  disabled={isLoading}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verificar Identidad & Acceder</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setErrorMessage('');
                  }}
                  className="w-full py-2 text-slate-500 hover:text-slate-800 text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Volver a credenciales</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

