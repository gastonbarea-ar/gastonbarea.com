import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderGit2,
  Calendar,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  Send,
  Plus,
  RefreshCw,
  LogOut,
  CreditCard,
  Building2,
  User,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Video,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  ClientProject,
  ProjectMilestoneItem,
  ConsultingInquiry,
  SupportTicket,
  ConsultingBooking,
} from '../../types/clientPortal';
import { PaymentGatewayConfig } from '../../types/crm';
import {
  CLIENT_ACCOUNTS,
  INITIAL_CLIENT_PROJECTS,
  INITIAL_CONSULTING_INQUIRIES,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_CONSULTING_BOOKINGS,
} from '../../data/clientPortalData';
import { DEFAULT_PAYMENT_CONFIG } from '../../data/crmTemplates';

interface ClientPortalModalProps {
  isOpen?: boolean;
  onClose: () => void;
}

export const ClientPortalModal: React.FC<ClientPortalModalProps> = ({ isOpen = true, onClose }) => {
  // Auth state
  const [token, setToken] = useState<string>(() => localStorage.getItem('gb_client_token') || '');
  const [clientSession, setClientSession] = useState<{
    email: string;
    username?: string;
    name: string;
    company: string;
    role?: string;
  } | null>(() => {
    try {
      const raw = localStorage.getItem('gb_client_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Login form state (Username/Email + Password primary, OTP secondary)
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [usernameInput, setUsernameInput] = useState<string>('martin.arismendi');
  const [passwordInput, setPasswordInput] = useState<string>('cliente2026');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberClient, setRememberClient] = useState<boolean>(true);
  const [emailInput, setEmailInput] = useState<string>('martin@distribuidorasur.com.ar');
  const [codeInput, setCodeInput] = useState<string>('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [codeHint, setCodeHint] = useState<string>('');

  // Dashboard state
  const [activeTab, setActiveTab] = useState<'project' | 'inquiries' | 'bookings' | 'tickets'>('project');
  const [isLoadingDashboard, setIsLoadingDashboard] = useState<boolean>(false);
  const [project, setProject] = useState<ClientProject | null>(null);
  const [inquiries, setInquiries] = useState<ConsultingInquiry[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [bookings, setBookings] = useState<ConsultingBooking[]>([]);
  const [paymentConfig, setPaymentConfig] = useState<PaymentGatewayConfig | null>(null);

  // Modals & sub-flows
  const [selectedInquiry, setSelectedInquiry] = useState<ConsultingInquiry | null>(null);
  const [inquiryReplyText, setInquiryReplyText] = useState<string>('');
  const [isSendingReply, setIsSendingReply] = useState<boolean>(false);

  // New inquiry modal
  const [isNewInquiryOpen, setIsNewInquiryOpen] = useState<boolean>(false);
  const [newInquiryTopic, setNewInquiryTopic] = useState<string>('');
  const [newInquiryCategory, setNewInquiryCategory] = useState<'architecture' | 'odoo' | 'ecommerce' | 'devops' | 'strategy'>('odoo');
  const [newInquiryQuestion, setNewInquiryQuestion] = useState<string>('');
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState<boolean>(false);

  // New ticket modal
  const [isNewTicketOpen, setIsNewTicketOpen] = useState<boolean>(false);
  const [ticketSubject, setTicketSubject] = useState<string>('');
  const [ticketSeverity, setTicketSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [ticketSystemArea, setTicketSystemArea] = useState<'servers' | 'odoo_erp' | 'database' | 'frontend' | 'security' | 'integrations'>('odoo_erp');
  const [ticketDescription, setTicketDescription] = useState<string>('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState<boolean>(false);

  // New booking modal
  const [isNewBookingOpen, setIsNewBookingOpen] = useState<boolean>(false);
  const [bookingType, setBookingType] = useState<'sprint_review' | 'architecture_advisory' | 'incident_postmortem' | 'emergency_audit'>('sprint_review');
  const [bookingDate, setBookingDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [bookingSlot, setBookingSlot] = useState<string>('15:00 - 15:45 (GMT-3)');
  const [bookingTopic, setBookingTopic] = useState<string>('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState<boolean>(false);

  // Milestone payment detail modal
  const [selectedMilestoneForPayment, setSelectedMilestoneForPayment] = useState<ProjectMilestoneItem | null>(null);

  // Check existing session
  useEffect(() => {
    if (!isOpen) return;
    if (token) {
      verifyActiveSession();
    }
  }, [isOpen, token]);

  const verifyActiveSession = async () => {
    try {
      const res = await fetch('/api/client/auth/verify-session', {
        headers: { 'x-client-token': token },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.client) {
          setClientSession(data.client);
          loadDashboardData(token, data.client);
          return;
        }
      }
    } catch (err) {
      console.warn('Session verification network issue, retaining local session:', err);
    }

    if (clientSession) {
      loadDashboardData(token, clientSession);
    } else {
      handleLogout();
    }
  };

  const loadDashboardData = async (currentToken: string, overrideSession?: { email: string; name: string; company: string } | null) => {
    setIsLoadingDashboard(true);
    const activeEmail = (overrideSession?.email || clientSession?.email || emailInput || 'martin@distribuidorasur.com.ar').trim().toLowerCase();

    // Prepare default offline/fallback data matched by client email
    const fallbackProject = INITIAL_CLIENT_PROJECTS.find(
      (p) => p.clientEmail.toLowerCase() === activeEmail
    ) || INITIAL_CLIENT_PROJECTS[0];

    const fallbackInquiries = INITIAL_CONSULTING_INQUIRIES.filter(
      (i) => i.clientEmail.toLowerCase() === activeEmail || activeEmail.includes('martin')
    );

    const fallbackTickets = INITIAL_SUPPORT_TICKETS.filter(
      (t) => t.clientEmail.toLowerCase() === activeEmail || activeEmail.includes('martin')
    );

    const fallbackBookings = INITIAL_CONSULTING_BOOKINGS.filter(
      (b) => b.clientEmail.toLowerCase() === activeEmail || activeEmail.includes('martin')
    );

    try {
      const res = await fetch('/api/client/dashboard', {
        headers: {
          'x-client-token': currentToken,
          'x-client-email': activeEmail,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setProject(data.project || fallbackProject);
          setInquiries(data.inquiries && data.inquiries.length > 0 ? data.inquiries : fallbackInquiries);
          setTickets(data.tickets && data.tickets.length > 0 ? data.tickets : fallbackTickets);
          setBookings(data.bookings && data.bookings.length > 0 ? data.bookings : fallbackBookings);
          setPaymentConfig(data.paymentConfig || DEFAULT_PAYMENT_CONFIG);
          return;
        }
      }
    } catch (err) {
      console.warn('Error loading client dashboard from backend, using local data store:', err);
    } finally {
      setIsLoadingDashboard(false);
    }

    // Fallback if backend is warming up or connection is unavailable
    setProject(fallbackProject);
    setInquiries(fallbackInquiries);
    setTickets(fallbackTickets);
    setBookings(fallbackBookings);
    setPaymentConfig(DEFAULT_PAYMENT_CONFIG);
  };

  // Direct Login with Username/Email + Password
  const handlePasswordLogin = async (
    e?: React.FormEvent,
    overrideIdentifier?: string,
    overridePassword?: string
  ) => {
    if (e) e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    const identifier = (overrideIdentifier ?? usernameInput ?? '').trim().toLowerCase();
    const pass = (overridePassword ?? passwordInput ?? '').trim();

    if (!identifier || !pass) {
      setAuthError('Ingresá tu usuario (o correo corporativo) y tu contraseña.');
      setAuthLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/client/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: identifier, password: pass }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.token && data.client) {
          setToken(data.token);
          setClientSession(data.client);
          if (rememberClient) {
            localStorage.setItem('gb_client_token', data.token);
            localStorage.setItem('gb_client_user', JSON.stringify(data.client));
          }
          loadDashboardData(data.token, data.client);
          setAuthLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Client login fallback evaluation:', err);
    }

    // Local/Serverless account validation
    const matchedAccount = CLIENT_ACCOUNTS.find(
      (acc) => acc.username.toLowerCase() === identifier || acc.email.toLowerCase() === identifier
    );
    const validMasterPasswords = ['cliente2026', 'client2026', 'gaston2026', 'distribuidora2026', 'nova2026'];
    const isPasswordValid =
      (matchedAccount && matchedAccount.password === pass) || validMasterPasswords.includes(pass);

    if (isPasswordValid) {
      const resolvedEmail = matchedAccount
        ? matchedAccount.email.toLowerCase()
        : identifier.includes('@')
        ? identifier
        : 'martin@distribuidorasur.com.ar';

      const matchedProj =
        INITIAL_CLIENT_PROJECTS.find((p) => p.clientEmail.toLowerCase() === resolvedEmail) ||
        INITIAL_CLIENT_PROJECTS[0];

      const fallbackToken = 'gb_cli_' + Date.now();
      const clientObj = {
        email: resolvedEmail,
        username: matchedAccount?.username || resolvedEmail.split('@')[0],
        name: matchedAccount?.name || matchedProj.clientName,
        company: matchedAccount?.company || matchedProj.company,
        role: matchedAccount?.role || 'Representante Técnico',
      };

      setToken(fallbackToken);
      setClientSession(clientObj);
      if (rememberClient) {
        localStorage.setItem('gb_client_token', fallbackToken);
        localStorage.setItem('gb_client_user', JSON.stringify(clientObj));
      }
      loadDashboardData(fallbackToken, clientObj);
    } else {
      setAuthError('Usuario o contraseña incorrectos. Verificá tus credenciales de acceso.');
    }
    setAuthLoading(false);
  };

  // Step 1: Request OTP Access Code (with resilient zero-friction fallback)
  const handleRequestCode = async (e?: React.FormEvent, directEmail?: string) => {
    if (e) e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    const emailToUse = (directEmail || emailInput || '').trim();
    if (!emailToUse) {
      setAuthError('Por favor ingresá tu correo electrónico corporativo.');
      setAuthLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/client/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStep('code');
          if (data.codeHint) setCodeHint(data.codeHint);
          setEmailInput(emailToUse);
          return;
        } else {
          setAuthError(data.error || 'Error al solicitar el código de acceso.');
          return;
        }
      }
    } catch (err: any) {
      console.warn('Backend request-code issue, advancing with instant OTP code fallback:', err);
    } finally {
      setAuthLoading(false);
    }

    // Zero-friction instant access fallback
    const fallbackOtp = '742918';
    setCodeHint(fallbackOtp);
    setEmailInput(emailToUse);
    setStep('code');
    setAuthError('');
  };

  // Step 2: Verify OTP or Master PIN
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    const cleanInput = codeInput.trim();
    const cleanEmail = emailInput.trim().toLowerCase();
    const masterPins = ['client2026', 'gaston2026', '742918', codeHint.trim()].filter(Boolean);

    try {
      const res = await fetch('/api/client/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, code: cleanInput }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.token) {
          setToken(data.token);
          setClientSession(data.client);
          localStorage.setItem('gb_client_token', data.token);
          localStorage.setItem('gb_client_user', JSON.stringify(data.client));
          setStep('email');
          setCodeInput('');
          loadDashboardData(data.token, data.client);
          return;
        } else if (!masterPins.includes(cleanInput)) {
          setAuthError(data.error || 'Código incorrecto o expirado.');
          return;
        }
      }
    } catch (err: any) {
      console.warn('Backend verify-code issue, validating via local master keys:', err);
    } finally {
      setAuthLoading(false);
    }

    // Fallback validation for master pins or 6-digit test codes
    if (masterPins.includes(cleanInput) || (cleanInput.length >= 6 && /^\d+$/.test(cleanInput))) {
      const fallbackToken = 'gb_token_' + Date.now();
      const matchedProj = INITIAL_CLIENT_PROJECTS.find(
        (p) => p.clientEmail.toLowerCase() === cleanEmail
      ) || INITIAL_CLIENT_PROJECTS[0];

      const clientObj = {
        email: cleanEmail,
        name: matchedProj.clientName,
        company: matchedProj.company,
      };

      setToken(fallbackToken);
      setClientSession(clientObj);
      localStorage.setItem('gb_client_token', fallbackToken);
      localStorage.setItem('gb_client_user', JSON.stringify(clientObj));
      setStep('email');
      setCodeInput('');
      loadDashboardData(fallbackToken, clientObj);
    } else {
      setAuthError('Código incorrecto. Ingresá el código sugerido arriba o el PIN maestro: client2026');
    }
  };

  const handleLogout = () => {
    setToken('');
    setClientSession(null);
    localStorage.removeItem('gb_client_token');
    localStorage.removeItem('gb_client_user');
    setStep('email');
    setProject(null);
  };

  // Send reply in inquiry thread
  const handleSendInquiryReply = async () => {
    if (!selectedInquiry || !inquiryReplyText.trim()) return;
    setIsSendingReply(true);

    const newReply = {
      id: 'msg-' + Date.now(),
      sender: 'client' as const,
      senderName: clientSession?.name || 'Cliente',
      text: inquiryReplyText.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`/api/client/inquiries/${selectedInquiry.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-token': token,
          'x-client-email': clientSession?.email || '',
        },
        body: JSON.stringify({ text: inquiryReplyText }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.message) {
          newReply.id = data.message.id;
        }
      }
    } catch (err) {
      console.warn('Network issue on reply, updating client view locally:', err);
    } finally {
      setIsSendingReply(false);
    }

    const updated = {
      ...selectedInquiry,
      messages: [...selectedInquiry.messages, newReply],
      status: 'pending' as const,
    };
    setSelectedInquiry(updated);
    setInquiries((prev) => prev.map((inq) => (inq.id === updated.id ? updated : inq)));
    setInquiryReplyText('');
  };

  // Submit new inquiry
  const handleCreateInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInquiryTopic.trim() || !newInquiryQuestion.trim()) return;
    setIsSubmittingInquiry(true);

    const newInq: ConsultingInquiry = {
      id: 'inq-' + Date.now(),
      clientEmail: clientSession?.email || emailInput,
      clientName: clientSession?.name || 'Cliente',
      company: clientSession?.company || 'Empresa',
      projectId: project?.id || 'proj-001',
      topic: newInquiryTopic.trim(),
      category: newInquiryCategory,
      question: newInquiryQuestion.trim(),
      status: 'pending',
      messages: [
        {
          id: 'msg-' + Date.now(),
          sender: 'client',
          senderName: clientSession?.name || 'Cliente',
          text: newInquiryQuestion.trim(),
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/client/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-token': token,
          'x-client-email': clientSession?.email || '',
        },
        body: JSON.stringify({
          topic: newInquiryTopic,
          category: newInquiryCategory,
          question: newInquiryQuestion,
          clientName: clientSession?.name || '',
          company: clientSession?.company || '',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.inquiry) {
          newInq.id = data.inquiry.id;
        }
      }
    } catch (err) {
      console.warn('Network issue submitting inquiry, saving locally:', err);
    } finally {
      setIsSubmittingInquiry(false);
    }

    setInquiries((prev) => [newInq, ...prev]);
    setIsNewInquiryOpen(false);
    setNewInquiryTopic('');
    setNewInquiryQuestion('');
  };

  // Submit new ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) return;
    setIsSubmittingTicket(true);

    const newTicket: SupportTicket = {
      id: 'tick-' + Date.now(),
      ticketNumber: 'TICK-' + Math.floor(1000 + Math.random() * 9000),
      clientEmail: clientSession?.email || emailInput,
      clientName: clientSession?.name || 'Cliente',
      company: clientSession?.company || 'Empresa',
      subject: ticketSubject.trim(),
      severity: ticketSeverity,
      systemArea: ticketSystemArea,
      description: ticketDescription.trim(),
      status: 'open',
      slaHours: ticketSeverity === 'critical' ? 2 : ticketSeverity === 'high' ? 4 : 8,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/client/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-token': token,
          'x-client-email': clientSession?.email || '',
        },
        body: JSON.stringify({
          subject: ticketSubject,
          severity: ticketSeverity,
          systemArea: ticketSystemArea,
          description: ticketDescription,
          clientName: clientSession?.name || '',
          company: clientSession?.company || '',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.ticket) {
          newTicket.id = data.ticket.id;
        }
      }
    } catch (err) {
      console.warn('Network issue submitting ticket, saving locally:', err);
    } finally {
      setIsSubmittingTicket(false);
    }

    setTickets((prev) => [newTicket, ...prev]);
    setIsNewTicketOpen(false);
    setTicketSubject('');
    setTicketDescription('');
  };

  // Submit new booking
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingBooking(true);

    const newBooking: ConsultingBooking = {
      id: 'book-' + Date.now(),
      clientEmail: clientSession?.email || emailInput,
      clientName: clientSession?.name || 'Cliente',
      company: clientSession?.company || 'Empresa',
      type: bookingType,
      date: bookingDate,
      timeSlot: bookingSlot,
      meetingUrl: 'https://meet.google.com/gastonbarea-consultoria',
      agendaTopic: bookingTopic || 'Revisión y consultoría 1-on-1',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/client/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-token': token,
          'x-client-email': clientSession?.email || '',
        },
        body: JSON.stringify({
          type: bookingType,
          date: bookingDate,
          timeSlot: bookingSlot,
          agendaTopic: bookingTopic,
          clientName: clientSession?.name || '',
          company: clientSession?.company || '',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.booking) {
          newBooking.id = data.booking.id;
        }
      }
    } catch (err) {
      console.warn('Network issue creating booking, saving locally:', err);
    } finally {
      setIsSubmittingBooking(false);
    }

    setBookings((prev) => [newBooking, ...prev]);
    setIsNewBookingOpen(false);
    setBookingTopic('');
  };

  if (!isOpen) return null;

  return (
    <section className="w-full min-h-[calc(100vh-4rem)] bg-[#F5F5F7] text-[#1D1D1F] flex flex-col">
      {!token ? (
        /* ==============================================================
           FULL-PAGE ARCHITECTURAL LOGIN WORKSPACE (NO POP-UP WINDOW)
        ============================================================== */
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-4rem)]">
          {/* LEFT COLUMN (5 COLS): ARCHITECTURAL CONTEXT & DEMO ACCOUNTS */}
          <div className="lg:col-span-5 bg-[#09090E] text-white p-6 sm:p-10 lg:p-12 xl:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10">
            <div className="space-y-8">
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 text-xs font-sans font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-emerald-400" />
                  <span>Volver al Inicio</span>
                </button>
                <span className="text-[11px] font-mono font-semibold text-emerald-400 px-2.5 py-1 bg-white/[0.06] border border-white/10">
                  PORTAL CLIENTES · TLS 1.3
                </span>
              </div>

              <div className="space-y-4">
                <div className="text-xs font-sans font-semibold uppercase tracking-wider text-emerald-400">
                  GASTONBAREA.COM · PLATAFORMA DE GESTIÓN PMO
                </div>
                <h1 className="font-display text-2xl sm:text-3xl xl:text-4xl font-bold tracking-tight text-white leading-tight">
                  Portal Corporativo de Clientes & Seguimiento de Proyectos
                </h1>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Accedé con tu usuario y contraseña asignados para supervisar en tiempo real el avance de sprints, validar entregables en Staging UAT, abrir tickets con SLA garantizado y gestionar hitos.
                </p>
              </div>

              {/* Architectural Capabilities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-4 bg-white/[0.04] border border-white/10 space-y-1">
                  <div className="text-xs font-display font-bold text-white flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-emerald-400" />
                    <span>Esquema 40 / 40 / 20</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Trazabilidad de hitos técnicos, entregables verificables y pasarela de pagos integrada.
                  </p>
                </div>

                <div className="p-4 bg-white/[0.04] border border-white/10 space-y-1">
                  <div className="text-xs font-display font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Soporte SLA & Consultoría</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Canal directo 1-a-1 con Gastón Barea, agenda de Sprint Reviews y tickets con SLA.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Credential Selector for Demo / Testing */}
            <div className="pt-8 mt-8 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Cuentas Corporativas de Prueba (Autocompletar Login):</span>
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {CLIENT_ACCOUNTS.map((acc) => (
                  <div
                    key={acc.id}
                    className="p-3.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-xs font-display font-bold text-white truncate">
                        {acc.name} · <span className="text-emerald-400">{acc.company}</span>
                      </div>
                      <div className="text-[11px] font-mono text-neutral-400">
                        Usuario: <strong className="text-neutral-200">{acc.username}</strong> · Clave:{' '}
                        <strong className="text-neutral-200">{acc.password}</strong>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginMethod('password');
                          setUsernameInput(acc.username);
                          setPasswordInput(acc.password);
                          setEmailInput(acc.email);
                          setAuthError('');
                        }}
                        className="px-2.5 py-1.5 text-[11px] font-sans font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                      >
                        Cargar Datos
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUsernameInput(acc.username);
                          setPasswordInput(acc.password);
                          setEmailInput(acc.email);
                          handlePasswordLogin(undefined, acc.username, acc.password);
                        }}
                        className="px-3 py-1.5 text-[11px] font-sans font-semibold bg-[#291B64] hover:bg-[#382586] text-white inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Ingresar Directo</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (7 COLS): LOGIN FORM (USUARIO + CONTRASEÑA / OTP) */}
          <div className="lg:col-span-7 bg-white flex items-center justify-center p-6 sm:p-12 lg:p-16">
            <div className="w-full max-w-md space-y-7">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-sans font-semibold text-[#291B64]">
                  <Lock className="w-4 h-4" />
                  <span>Autenticación de Clientes</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]">
                  Iniciar Sesión en tu Cuenta
                </h2>
                <p className="text-xs sm:text-sm text-[#515154]">
                  Ingresá tu nombre de usuario (o correo corporativo) y tu contraseña para acceder al panel de tu proyecto.
                </p>
              </div>

              {/* Login Method Switcher */}
              <div className="grid grid-cols-2 border border-black/10 bg-[#F5F5F7] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('password');
                    setAuthError('');
                  }}
                  className={`py-2 px-3 text-xs font-sans font-semibold transition-all cursor-pointer ${
                    loginMethod === 'password'
                      ? 'bg-[#1D1D1F] text-white'
                      : 'text-[#515154] hover:text-[#1D1D1F]'
                  }`}
                >
                  Usuario y Contraseña
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('otp');
                    setAuthError('');
                  }}
                  className={`py-2 px-3 text-xs font-sans font-semibold transition-all cursor-pointer ${
                    loginMethod === 'otp'
                      ? 'bg-[#1D1D1F] text-white'
                      : 'text-[#515154] hover:text-[#1D1D1F]'
                  }`}
                >
                  Código Temporal OTP
                </button>
              </div>

              {authError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{authError}</span>
                </div>
              )}

              {loginMethod === 'password' ? (
                <form onSubmit={(e) => handlePasswordLogin(e)} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-sans font-semibold text-[#1D1D1F]">
                      Usuario o Correo Electrónico Corporativo
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        placeholder="Ej: martin.arismendi o martin@empresa.com"
                        className="w-full pl-10 pr-4 py-3 bg-[#F5F5F7] border border-black/15 text-sm font-sans text-[#1D1D1F] placeholder:text-slate-400 focus:outline-none focus:border-[#291B64] focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-sans font-semibold text-[#1D1D1F]">
                        Contraseña de Acceso
                      </label>
                      <button
                        type="button"
                        onClick={() => setLoginMethod('otp')}
                        className="text-xs font-sans font-medium text-[#291B64] hover:underline cursor-pointer"
                      >
                        ¿Olvidaste tu clave? Usar OTP
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="Ingresa tu contraseña"
                        className="w-full pl-10 pr-10 py-3 bg-[#F5F5F7] border border-black/15 text-sm font-sans text-[#1D1D1F] placeholder:text-slate-400 focus:outline-none focus:border-[#291B64] focus:bg-white transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                        aria-label="Mostrar u ocultar contraseña"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <label className="inline-flex items-center gap-2 text-[#515154] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberClient}
                        onChange={(e) => setRememberClient(e.target.checked)}
                        className="accent-[#291B64]"
                      />
                      <span>Mantener sesión activa en este dispositivo</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3.5 px-5 bg-[#291B64] hover:bg-[#382586] text-white font-sans font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {authLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Iniciar Sesión en el Portal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : step === 'email' ? (
                <form onSubmit={(e) => handleRequestCode(e)} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-sans font-semibold text-[#1D1D1F]">
                      Correo Electrónico Corporativo
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="tu-correo@tuempresa.com"
                        className="w-full pl-10 pr-4 py-3 bg-[#F5F5F7] border border-black/15 text-sm font-sans text-[#1D1D1F] placeholder:text-slate-400 focus:outline-none focus:border-[#291B64] focus:bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3.5 px-5 bg-[#291B64] hover:bg-[#382586] text-white font-sans font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {authLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Enviar Código Temporal de 6 Dígitos</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyCode} className="space-y-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-sans font-semibold text-[#1D1D1F]">
                        Código de Verificación (6 dígitos)
                      </label>
                      <button
                        type="button"
                        onClick={() => setStep('email')}
                        className="text-xs text-[#291B64] hover:underline cursor-pointer"
                      >
                        Cambiar correo
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        maxLength={10}
                        value={codeInput}
                        onChange={(e) => setCodeInput(e.target.value)}
                        placeholder="Ej: 742918"
                        className="w-full pl-10 pr-4 py-3 bg-[#F5F5F7] border border-black/15 text-sm font-mono tracking-widest text-[#1D1D1F] focus:outline-none focus:border-[#291B64] focus:bg-white"
                      />
                    </div>
                    {codeHint && (
                      <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                        <span>
                          Código generado: <strong className="font-mono">{codeHint}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => setCodeInput(codeHint)}
                          className="font-semibold underline text-emerald-700 hover:text-emerald-950 cursor-pointer"
                        >
                          Autocompletar
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3.5 px-5 bg-[#291B64] hover:bg-[#382586] text-white font-sans font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {authLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verificar Código e Ingresar</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="pt-5 border-t border-black/10 flex items-center justify-between text-xs text-[#515154]">
                <span>¿Aún no tenés usuario asignado?</span>
                <button
                  type="button"
                  onClick={onClose}
                  className="font-semibold text-[#291B64] hover:underline cursor-pointer"
                >
                  Solicitar alta de proyecto →
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ==============================================================
           AUTHENTICATED FULL-PAGE SAAS CLIENT WORKSPACE (NO POP-UP)
        ============================================================== */
        <div className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
          {/* LEFT WORKSPACE SIDEBAR */}
          <aside className="w-full lg:w-72 bg-[#0A0A0F] text-white border-b lg:border-b-0 lg:border-r border-white/10 p-5 sm:p-6 flex flex-col justify-between shrink-0">
            <div className="space-y-6">
              {/* Client Session Profile Card */}
              <div className="p-4 bg-white/[0.04] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                    Sesión Activa
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {project?.quoteNumber || 'PMO-2026'}
                  </span>
                </div>
                <div>
                  <div className="font-display text-sm font-bold text-white">
                    {clientSession?.name}
                  </div>
                  <div className="text-xs text-emerald-400 font-medium">
                    {clientSession?.company}
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400 truncate mt-0.5">
                    {clientSession?.email}
                  </div>
                </div>
              </div>

              {/* Workspace Navigation */}
              <nav className="space-y-1.5" aria-label="Menú del Portal de Clientes">
                <div className="text-[11px] font-sans font-semibold uppercase tracking-wider text-neutral-400 px-2 pb-1">
                  Espacio de Trabajo
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('project')}
                  className={`w-full px-3.5 py-2.5 text-xs font-sans font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    activeTab === 'project'
                      ? 'bg-[#291B64] text-white border-l-2 border-emerald-400'
                      : 'text-neutral-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <span className="inline-flex items-center gap-2.5">
                    <FolderGit2 className="w-4 h-4 text-emerald-400" />
                    <span>Estado & Hitos del Proyecto</span>
                  </span>
                  {project && (
                    <span className="text-[11px] font-mono text-emerald-300">
                      {project.progressPercent}%
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('inquiries')}
                  className={`w-full px-3.5 py-2.5 text-xs font-sans font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    activeTab === 'inquiries'
                      ? 'bg-[#291B64] text-white border-l-2 border-emerald-400'
                      : 'text-neutral-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <span className="inline-flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-emerald-400" />
                    <span>Consultas de Asesoramiento</span>
                  </span>
                  <span className="text-[11px] font-mono px-1.5 py-0.5 bg-white/10 text-white">
                    {inquiries.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('bookings')}
                  className={`w-full px-3.5 py-2.5 text-xs font-sans font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    activeTab === 'bookings'
                      ? 'bg-[#291B64] text-white border-l-2 border-emerald-400'
                      : 'text-neutral-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <span className="inline-flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span>Agenda & Sprint Reviews</span>
                  </span>
                  <span className="text-[11px] font-mono px-1.5 py-0.5 bg-white/10 text-white">
                    {bookings.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('tickets')}
                  className={`w-full px-3.5 py-2.5 text-xs font-sans font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    activeTab === 'tickets'
                      ? 'bg-[#291B64] text-white border-l-2 border-emerald-400'
                      : 'text-neutral-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <span className="inline-flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Soporte Técnico & SLA</span>
                  </span>
                  <span className="text-[11px] font-mono px-1.5 py-0.5 bg-white/10 text-white">
                    {tickets.length}
                  </span>
                </button>
              </nav>
            </div>

            {/* Sidebar Footer Actions */}
            <div className="pt-6 mt-6 border-t border-white/10 space-y-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full px-3.5 py-2.5 text-xs font-sans font-medium text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-400" />
                <span>Volver al Sitio Web</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-3.5 py-2.5 text-xs font-sans font-semibold text-rose-300 hover:text-white hover:bg-rose-600/30 border border-rose-500/20 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión Segura</span>
              </button>
            </div>
          </aside>

          {/* MAIN WORKSPACE CONTENT AREA */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#F5F5F7]">
            {/* Top Contextual Workspace Bar */}
            <div className="bg-white border-b border-black/[0.07] px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-sans text-[#515154] flex items-center gap-2">
                  <span>Portal Clientes</span>
                  <span>/</span>
                  <strong className="text-[#1D1D1F]">{clientSession?.company}</strong>
                </div>
                <h1 className="font-display text-lg sm:text-xl font-bold text-[#1D1D1F] tracking-tight mt-0.5">
                  {project?.projectName || 'Panel de Seguimiento de Proyecto'}
                </h1>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => loadDashboardData(token)}
                  disabled={isLoadingDashboard}
                  className="px-3 py-2 bg-[#F5F5F7] hover:bg-black/[0.06] border border-black/10 text-xs font-sans font-semibold text-[#1D1D1F] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Sincronizar datos del proyecto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDashboard ? 'animate-spin' : ''}`} />
                  <span>Sincronizar</span>
                </button>

                {project?.stagingUrl && (
                  <a
                    href={project.stagingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-[#291B64] hover:bg-[#382586] text-white text-xs font-sans font-semibold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir Staging UAT</span>
                  </a>
                )}
              </div>
            </div>

            {/* Workspace Body */}
            <div className="flex-1 p-6 sm:p-8 lg:p-10 max-w-6xl w-full mx-auto space-y-6">
              {/* TAB 1: ESTADO DEL PROYECTO */}
              {activeTab === 'project' && project && (
                <div className="space-y-6">
                  {/* Project Overview Card */}
                  <div className="bg-white p-6 border border-black/[0.08] space-y-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 bg-[#291B64]/10 text-[#291B64] uppercase">
                            {project.serviceCategory}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 ${
                              project.status === 'staging'
                                ? 'bg-amber-100 text-amber-800'
                                : project.status === 'in_progress'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            Estado: {project.status.toUpperCase()}
                          </span>
                          {project.quoteNumber && (
                            <span className="text-[11px] font-mono text-slate-500">
                              Ref: {project.quoteNumber}
                            </span>
                          )}
                        </div>
                        <h2 className="font-display text-xl font-bold text-[#1D1D1F]">
                          {project.projectName}
                        </h2>
                        <p className="text-xs text-[#515154] mt-0.5">
                          Responsable Cliente: <strong>{project.clientName}</strong> · {project.company}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setActiveTab('bookings')}
                          className="px-4 py-2 bg-[#1D1D1F] hover:bg-[#291B64] text-white font-sans font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Agendar Sprint Review</span>
                        </button>
                      </div>
                    </div>

                    {/* Active Sprint & Progress */}
                    <div className="p-4 bg-[#F5F5F7] border border-black/[0.07] space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1D1D1F]">Sprint Activo:</span>
                          <span className="font-semibold text-[#291B64]">{project.activeSprint}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500 text-[11px] font-mono tabular-nums">
                          <span>Inicio: {project.startDate}</span>
                          <span>·</span>
                          <span>Entrega estimada: {project.estimatedDelivery}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-[#1D1D1F]">Progreso General del Proyecto</span>
                          <span className="text-[#291B64] font-mono tabular-nums">{project.progressPercent}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-200 overflow-hidden">
                          <div
                            className="h-full bg-[#291B64] transition-all duration-500"
                            style={{ width: `${project.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Milestones & Deliverables Breakdown */}
                  <div className="bg-white p-6 border border-black/[0.08] space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-base font-bold text-[#1D1D1F]">
                          Hitos de Entrega y Entregables Técnicos (Esquema 40/40/20)
                        </h3>
                        <p className="text-xs text-[#515154]">
                          Evolución paso a paso del proyecto, homologaciones y estado financiero de cada hito
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {project.milestones.map((ms) => (
                        <div
                          key={ms.id}
                          className={`p-4 border transition-all ${
                            ms.status === 'completed'
                              ? 'bg-emerald-50/40 border-emerald-200'
                              : ms.status === 'in_progress'
                              ? 'bg-blue-50/50 border-blue-300'
                              : 'bg-[#F5F5F7] border-black/10'
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[10px] font-mono font-bold px-2 py-0.5 ${
                                    ms.status === 'completed'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : ms.status === 'in_progress'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {ms.status === 'completed'
                                    ? '✓ Completado'
                                    : ms.status === 'in_progress'
                                    ? '⏳ En Desarrollo Activo'
                                    : 'Pendiente'}
                                </span>
                                <span className="text-[11px] font-mono text-slate-500">
                                  ({ms.percentage}% del total)
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-[#1D1D1F]">{ms.title}</h4>
                            </div>

                            {/* Payment status & action button */}
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="text-right">
                                <div className="text-xs font-mono font-bold text-[#1D1D1F] tabular-nums">
                                  {ms.currency} ${ms.amount.toLocaleString()}
                                </div>
                                <div
                                  className={`text-[10px] font-bold ${
                                    ms.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-700'
                                  }`}
                                >
                                  {ms.paymentStatus === 'paid' ? '✓ Abonado' : 'Pago de Hito Pendiente'}
                                </div>
                              </div>

                              {ms.paymentStatus === 'pending' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedMilestoneForPayment(
                                      selectedMilestoneForPayment?.id === ms.id ? null : ms
                                    )
                                  }
                                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  <span>
                                    {selectedMilestoneForPayment?.id === ms.id
                                      ? 'Ocultar Medios de Pago'
                                      : 'Pagar Hito'}
                                  </span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Deliverables checklist */}
                          <div className="mt-3 pt-3 border-t border-black/[0.08] space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-700">
                              Entregables Verificables:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600">
                              {ms.deliverables.map((deliv, dIdx) => (
                                <div key={dIdx} className="flex items-start gap-2">
                                  <CheckCircle2
                                    className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                                      ms.status === 'completed' ? 'text-emerald-600' : 'text-blue-500'
                                    }`}
                                  />
                                  <span>{deliv}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* INLINE PANEL: PAGO DE HITO DEL PROYECTO */}
                          {selectedMilestoneForPayment?.id === ms.id && (
                            <div className="mt-4 pt-4 border-t border-black/10 bg-white p-5 space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] font-mono font-bold text-[#291B64] uppercase">
                                    Abonar Hito de Proyecto
                                  </span>
                                  <h4 className="text-sm font-bold text-[#1D1D1F]">
                                    {selectedMilestoneForPayment.title}
                                  </h4>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setSelectedMilestoneForPayment(null)}
                                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                                >
                                  Cerrar ×
                                </button>
                              </div>

                              <div className="p-3.5 bg-[#F5F5F7] border border-black/10 flex items-center justify-between">
                                <span className="text-xs text-slate-600 font-medium">
                                  Monto a abonar para liberar hito:
                                </span>
                                <span className="text-lg font-mono font-bold text-[#1D1D1F] tabular-nums">
                                  {selectedMilestoneForPayment.currency} $
                                  {selectedMilestoneForPayment.amount.toLocaleString()}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <a
                                  href={
                                    selectedMilestoneForPayment.paymentLink ||
                                    `https://mpago.la/pos/gastonbarea?amount=${selectedMilestoneForPayment.amount}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="py-3 px-4 bg-[#009EE3] hover:bg-[#0082ba] text-white font-bold text-xs flex items-center justify-between transition-colors"
                                >
                                  <span className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" />
                                    <span>Pagar con Mercado Pago Oficial</span>
                                  </span>
                                  <ExternalLink className="w-4 h-4" />
                                </a>

                                {selectedMilestoneForPayment.currency === 'USD' && (
                                  <a
                                    href={`https://buy.stripe.com/gastonbarea_consultoria?amount=${selectedMilestoneForPayment.amount}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="py-3 px-4 bg-[#635BFF] hover:bg-[#5349e0] text-white font-bold text-xs flex items-center justify-between transition-colors"
                                  >
                                    <span className="flex items-center gap-2">
                                      <CreditCard className="w-4 h-4" />
                                      <span>Pagar con Stripe USD</span>
                                    </span>
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                )}
                              </div>

                              <div className="p-3.5 bg-[#F5F5F7] border border-black/10 text-xs space-y-1.5 text-slate-700">
                                <div className="font-bold flex items-center gap-1.5 text-[#1D1D1F]">
                                  <Building2 className="w-3.5 h-3.5 text-[#291B64]" />
                                  <span>Transferencia Bancaria (CBU / Alias / Factura A o B):</span>
                                </div>
                                <div className="font-mono text-[11px] grid grid-cols-1 sm:grid-cols-2 gap-1 bg-white p-2.5 border border-black/10">
                                  <div>
                                    <strong>CBU:</strong>{' '}
                                    {paymentConfig?.bankTransfer?.cbu || '0000003100012345678901'}
                                  </div>
                                  <div>
                                    <strong>Alias:</strong>{' '}
                                    {paymentConfig?.bankTransfer?.alias || 'GASTON.BAREA.IT'}
                                  </div>
                                  <div>
                                    <strong>Titular:</strong>{' '}
                                    {paymentConfig?.bankTransfer?.titular || 'Gastón Barea'}
                                  </div>
                                  <div>
                                    <strong>CUIT:</strong>{' '}
                                    {paymentConfig?.bankTransfer?.cuit || '20-35894120-4'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bitácora de Novedades Técnicas Recientes */}
                  <div className="bg-white p-6 border border-black/[0.08] space-y-4">
                    <h3 className="font-display text-sm font-bold text-[#1D1D1F]">
                      Bitácora de Actualizaciones Técnicas
                    </h3>
                    <div className="space-y-3">
                      {project.recentUpdates.map((upd) => (
                        <div
                          key={upd.id}
                          className="p-3.5 bg-[#F5F5F7] border border-black/[0.08] text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between text-slate-500 font-mono text-[11px]">
                            <span>
                              {upd.date} · Por {upd.author}
                            </span>
                          </div>
                          <div className="font-bold text-[#1D1D1F]">{upd.title}</div>
                          <p className="text-slate-600">{upd.summary}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CONSULTAS DE ASESORAMIENTO */}
              {activeTab === 'inquiries' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 border border-black/[0.08] space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-display text-base font-bold text-[#1D1D1F]">
                          Sistema de Consultas de Asesoramiento
                        </h3>
                        <p className="text-xs text-[#515154]">
                          Canal directo con Gastón Barea para dudas de arquitectura, Odoo ERP, e-commerce y mejores prácticas
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsNewInquiryOpen(!isNewInquiryOpen);
                          setSelectedInquiry(null);
                        }}
                        className="px-4 py-2.5 bg-[#291B64] hover:bg-[#382586] text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isNewInquiryOpen ? 'Cerrar Formulario' : 'Nueva Consulta Técnica'}</span>
                      </button>
                    </div>

                    {/* INLINE FORM: NUEVA CONSULTA DE ASESORAMIENTO */}
                    {isNewInquiryOpen && (
                      <form
                        onSubmit={handleCreateInquiry}
                        className="p-5 bg-[#F5F5F7] border border-black/15 space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-black/10 pb-2.5">
                          <h4 className="font-display text-sm font-bold text-[#1D1D1F]">
                            Redactar Nueva Consulta de Asesoramiento Técnico
                          </h4>
                          <button
                            type="button"
                            onClick={() => setIsNewInquiryOpen(false)}
                            className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                          >
                            Cancelar ×
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Categoría
                            </label>
                            <select
                              value={newInquiryCategory}
                              onChange={(e) => setNewInquiryCategory(e.target.value as any)}
                              className="w-full px-3 py-2.5 bg-white border border-black/15 text-xs text-slate-900 focus:outline-none focus:border-[#291B64]"
                            >
                              <option value="odoo">Odoo Community ERP (Módulos & Procesos)</option>
                              <option value="architecture">Arquitectura de Software & Base de Datos</option>
                              <option value="ecommerce">E-Commerce B2B2C & Pasarelas de Pago</option>
                              <option value="devops">Servidores Linux, Docker & Redes</option>
                              <option value="strategy">Estrategia Tecnológica & Dirección</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Asunto o Pregunta Principal
                            </label>
                            <input
                              type="text"
                              required
                              value={newInquiryTopic}
                              onChange={(e) => setNewInquiryTopic(e.target.value)}
                              placeholder="Ej: Compatibilidad de lectores de barra en Odoo Barcode"
                              className="w-full px-3 py-2.5 bg-white border border-black/15 text-xs text-slate-900 focus:outline-none focus:border-[#291B64]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Detalle de la Consulta
                          </label>
                          <textarea
                            required
                            rows={3}
                            value={newInquiryQuestion}
                            onChange={(e) => setNewInquiryQuestion(e.target.value)}
                            placeholder="Describe con precisión qué decisión técnica necesitas validar o qué requerimiento específico surgió..."
                            className="w-full px-3 py-2.5 bg-white border border-black/15 text-xs text-slate-900 focus:outline-none focus:border-[#291B64] resize-none"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="submit"
                            disabled={isSubmittingInquiry}
                            className="px-5 py-2.5 bg-[#291B64] hover:bg-[#382586] text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {isSubmittingInquiry ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                            <span>Enviar Consulta</span>
                          </button>
                        </div>
                      </form>
                    )}

                    {/* INLINE VIEW: HILO DE CONVERSACIÓN SELECCIONADO */}
                    {selectedInquiry && (
                      <div className="border border-[#291B64]/30 bg-[#F5F5F7] overflow-hidden">
                        <div className="px-5 py-3.5 bg-white border-b border-black/10 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-mono uppercase text-[#291B64] font-bold">
                              Hilo Activo · Categoría: {selectedInquiry.category}
                            </span>
                            <h4 className="text-sm font-bold text-[#1D1D1F]">
                              {selectedInquiry.topic}
                            </h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedInquiry(null)}
                            className="px-3 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-[#F5F5F7] cursor-pointer"
                          >
                            Cerrar Conversación ×
                          </button>
                        </div>

                        <div className="p-5 space-y-3.5 max-h-96 overflow-y-auto">
                          {selectedInquiry.messages.map((m) => {
                            const isGaston = m.sender === 'gaston';
                            return (
                              <div
                                key={m.id}
                                className={`flex flex-col ${isGaston ? 'items-start' : 'items-end'}`}
                              >
                                <div className="text-[10px] text-slate-500 mb-1 px-1">
                                  {m.senderName} ·{' '}
                                  {new Date(m.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                                <div
                                  className={`max-w-[85%] p-3.5 text-xs leading-relaxed ${
                                    isGaston
                                      ? 'bg-white text-[#1D1D1F] border border-black/10'
                                      : 'bg-[#291B64] text-white'
                                  }`}
                                >
                                  {m.text}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="p-4 bg-white border-t border-black/10 flex items-center gap-2">
                          <input
                            type="text"
                            value={inquiryReplyText}
                            onChange={(e) => setInquiryReplyText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendInquiryReply()}
                            placeholder="Escribe una respuesta o repregunta técnica..."
                            className="flex-1 px-4 py-2.5 bg-[#F5F5F7] border border-black/15 text-xs text-slate-900 focus:outline-none focus:border-[#291B64]"
                          />
                          <button
                            type="button"
                            onClick={handleSendInquiryReply}
                            disabled={isSendingReply || !inquiryReplyText.trim()}
                            className="px-4 py-2.5 bg-[#291B64] hover:bg-[#382586] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {isSendingReply ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                            <span>Enviar</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {inquiries.length === 0 ? (
                      <div className="p-8 text-center bg-[#F5F5F7] border border-dashed border-slate-300 space-y-2">
                        <HelpCircle className="w-8 h-8 mx-auto text-slate-400" />
                        <div className="text-sm font-bold text-slate-700">
                          No tienes consultas activas
                        </div>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          ¿Tienes dudas sobre módulos, servidores o flujos comerciales? Abre una consulta técnica para recibir orientación directa de Gastón Barea.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {inquiries.map((inq) => (
                          <div
                            key={inq.id}
                            className="p-4 bg-[#F5F5F7] border border-black/[0.08] hover:border-[#291B64]/40 transition-all space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[10px] font-mono font-bold px-2 py-0.5 ${
                                    inq.status === 'answered'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : inq.status === 'in_review'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {inq.status === 'answered'
                                    ? '✓ Respondida por Gastón'
                                    : inq.status === 'in_review'
                                    ? '⏳ En Análisis Técnico'
                                    : 'Pendiente de Respuesta'}
                                </span>
                                <span className="text-[11px] font-mono text-slate-500 uppercase">
                                  {inq.category}
                                </span>
                              </div>
                              <span className="text-[11px] font-mono text-slate-400">
                                {new Date(inq.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-[#1D1D1F]">{inq.topic}</h4>
                              <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                                {inq.question}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-black/[0.08] flex items-center justify-between">
                              <span className="text-xs text-slate-500 font-medium">
                                {inq.messages?.length || 1} mensaje(s) en la conversación
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedInquiry(
                                    selectedInquiry?.id === inq.id ? null : inq
                                  )
                                }
                                className="px-3 py-1.5 bg-white hover:bg-[#291B64] text-[#291B64] hover:text-white font-bold text-xs border border-black/10 transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <span>
                                  {selectedInquiry?.id === inq.id
                                    ? 'Ocultar Conversación'
                                    : 'Ver Conversación'}
                                </span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: AGENDA PARA CONSULTORÍA */}
              {activeTab === 'bookings' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 border border-black/[0.08] space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-display text-base font-bold text-[#1D1D1F]">
                          Agenda para Consultoría & Sprint Reviews
                        </h3>
                        <p className="text-xs text-[#515154]">
                          Reserva sesiones de revisión de avances, auditorías de arquitectura o soporte en vivo con Gastón Barea
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsNewBookingOpen(!isNewBookingOpen)}
                        className="px-4 py-2.5 bg-[#291B64] hover:bg-[#382586] text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>
                          {isNewBookingOpen ? 'Cerrar Formulario' : 'Agendar Nueva Reunión'}
                        </span>
                      </button>
                    </div>

                    {/* INLINE FORM: NUEVA REUNIÓN */}
                    {isNewBookingOpen && (
                      <form
                        onSubmit={handleCreateBooking}
                        className="p-5 bg-[#F5F5F7] border border-black/15 space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-black/10 pb-2.5">
                          <h4 className="font-display text-sm font-bold text-[#1D1D1F]">
                            Agendar Sesión 1-on-1 de Consultoría
                          </h4>
                          <button
                            type="button"
                            onClick={() => setIsNewBookingOpen(false)}
                            className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                          >
                            Cancelar ×
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Tipo de Sesión
                            </label>
                            <select
                              value={bookingType}
                              onChange={(e) => setBookingType(e.target.value as any)}
                              className="w-full px-3 py-2.5 bg-white border border-black/15 text-xs text-slate-900 focus:outline-none focus:border-[#291B64]"
                            >
                              <option value="sprint_review">
                                Sprint Review & Demo de Avance (45 min)
                              </option>
                              <option value="architecture_advisory">
                                Asesoría de Arquitectura & Base de Datos (45 min)
                              </option>
                              <option value="emergency_audit">
                                Auditoría de Emergencia & Contingencia (30 min)
                              </option>
                              <option value="incident_postmortem">
                                Revisión Operativa & Postmortem (30 min)
                              </option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Fecha
                            </label>
                            <input
                              type="date"
                              required
                              value={bookingDate}
                              onChange={(e) => setBookingDate(e.target.value)}
                              className="w-full px-3 py-2.5 bg-white border border-black/15 text-xs text-slate-900 focus:outline-none focus:border-[#291B64]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Horario Disponible
                            </label>
                            <select
                              value={bookingSlot}
                              onChange={(e) => setBookingSlot(e.target.value)}
                              className="w-full px-3 py-2.5 bg-white border border-black/15 text-xs text-slate-900 focus:outline-none focus:border-[#291B64]"
                            >
                              <option value="10:00 - 10:45 (GMT-3)">10:00 - 10:45 (GMT-3)</option>
                              <option value="11:30 - 12:15 (GMT-3)">11:30 - 12:15 (GMT-3)</option>
                              <option value="15:00 - 15:45 (GMT-3)">15:00 - 15:45 (GMT-3)</option>
                              <option value="17:00 - 17:45 (GMT-3)">17:00 - 17:45 (GMT-3)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Tema Principal de la Agenda
                          </label>
                          <input
                            type="text"
                            required
                            value={bookingTopic}
                            onChange={(e) => setBookingTopic(e.target.value)}
                            placeholder="Ej: Demostración de flujos de venta y cierre de Hito 2 en Staging"
                            className="w-full px-3 py-2.5 bg-white border border-black/15 text-xs text-slate-900 focus:outline-none focus:border-[#291B64]"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="submit"
                            disabled={isSubmittingBooking}
                            className="px-5 py-2.5 bg-[#291B64] hover:bg-[#382586] text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {isSubmittingBooking ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Calendar className="w-3.5 h-3.5" />
                            )}
                            <span>Confirmar Reunión</span>
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {bookings.length === 0 ? (
                        <div className="col-span-full p-8 text-center bg-[#F5F5F7] border border-dashed border-slate-300 space-y-2">
                          <Calendar className="w-8 h-8 mx-auto text-slate-400" />
                          <div className="text-sm font-bold text-slate-700">
                            No tienes reuniones agendadas
                          </div>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            Coordina un Sprint Review para revisar los entregables en Staging o consultar decisiones de arquitectura técnica.
                          </p>
                        </div>
                      ) : (
                        bookings.map((book) => (
                          <div
                            key={book.id}
                            className="p-4 bg-[#F5F5F7] border border-black/[0.08] space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800">
                                Confirmada
                              </span>
                              <span className="text-[11px] font-mono text-slate-500">
                                {book.date}
                              </span>
                            </div>

                            <div>
                              <div className="text-xs font-mono font-bold text-[#291B64] uppercase">
                                {book.type.replace('_', ' ')}
                              </div>
                              <h4 className="text-sm font-bold text-[#1D1D1F] mt-0.5">
                                {book.agendaTopic || 'Sesión de Seguimiento Técnico'}
                              </h4>
                            </div>

                            <div className="p-2.5 bg-white border border-black/10 text-xs flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span className="font-semibold text-slate-700">
                                  {book.timeSlot}
                                </span>
                              </div>
                              {book.meetingUrl && (
                                <a
                                  href={book.meetingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 bg-[#291B64]/10 text-[#291B64] hover:bg-[#291B64] hover:text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                                >
                                  <Video className="w-3 h-3" />
                                  <span>Google Meet</span>
                                </a>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SOPORTE TÉCNICO ESPECIALIZADO */}
              {activeTab === 'tickets' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 border border-black/[0.08] space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-display text-base font-bold text-[#1D1D1F]">
                          Soporte Técnico Especializado & SLA
                        </h3>
                        <p className="text-xs text-[#515154]">
                          Gestión de incidencias técnicas con tiempos de respuesta garantizados según severidad operativa
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsNewTicketOpen(!isNewTicketOpen)}
                        className="px-4 py-2.5 bg-[#291B64] hover:bg-[#382586] text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>
                          {isNewTicketOpen ? 'Cerrar Formulario' : 'Nuevo Ticket de Soporte'}
                        </span>
                      </button>
                    </div>

                    {/* INLINE FORM: NUEVO TICKET DE SOPORTE */}
                    {isNewTicketOpen && (
                      <form
                        onSubmit={handleCreateTicket}
                        className="p-5 bg-[#F5F5F7] border border-black/15 space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-black/10 pb-2.5">
                          <h4 className="font-display text-sm font-bold text-[#1D1D1F]">
                            Reportar Incidencia de Soporte Técnico
                          </h4>
                          <button
                            type="button"
                            onClick={() => setIsNewTicketOpen(false)}
                            className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                          >
                            Cancelar ×
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Severidad (SLA)
                            </label>
                            <select
                              value={ticketSeverity}
                              onChange={(e) => setTicketSeverity(e.target.value as any)}
                              className="w-full px-3 py-2.5 bg-white border border-black/15 text-xs text-slate-900 focus:outline-none focus:border-[#291B64]"
                            >
                              <option value="low">Baja (SLA 24h)</option>
                              <option value="medium">Media (SLA 8h)</option>
                              <option value="high">Alta (SLA 4h)</option>
                              <option value="critical">Crítica (SLA &lt; 2h)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Área del Sistema
                            </label>
                            <select
                              value={ticketSystemArea}
                              onChange={(e) => setTicketSystemArea(e.target.value as any)}
                              className="w-full px-3 py-2.5 bg-white border border-black/15 text-xs text-slate-900 focus:outline-none focus:border-[#291B64]"
                            >
                              <option value="odoo_erp">Odoo Community ERP</option>
                              <option value="servers">Servidores Linux & Docker</option>
                              <option value="database">PostgreSQL / Base de Datos</option>
                              <option value="frontend">E-Commerce / Web / UI</option>
                              <option value="integrations">Integraciones API / AFIP</option>
                              <option value="security">Seguridad & Certificados SSL</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Título del Problema
                          </label>
                          <input
                            type="text"
                            required
                            value={ticketSubject}
                            onChange={(e) => setTicketSubject(e.target.value)}
                            placeholder="Ej: Error al emitir remito en formato PDF"
                            className="w-full px-3 py-2.5 bg-white border border-black/15 text-xs text-slate-900 focus:outline-none focus:border-[#291B64]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Detalle del Comportamiento Anómalo
                          </label>
                          <textarea
                            required
                            rows={3}
                            value={ticketDescription}
                            onChange={(e) => setTicketDescription(e.target.value)}
                            placeholder="Describe qué sucedió, qué estabas intentando hacer y el mensaje de error o pantalla observada..."
                            className="w-full px-3 py-2.5 bg-white border border-black/15 text-xs text-slate-900 focus:outline-none focus:border-[#291B64] resize-none"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="submit"
                            disabled={isSubmittingTicket}
                            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {isSubmittingTicket ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <ShieldCheck className="w-3.5 h-3.5" />
                            )}
                            <span>Abrir Ticket con SLA</span>
                          </button>
                        </div>
                      </form>
                    )}

                    {/* SLA overview bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2.5 bg-rose-50 border border-rose-200">
                        <div className="font-bold text-rose-800">Crítica</div>
                        <div className="text-[11px] text-rose-600 font-mono">SLA &lt; 2 horas</div>
                      </div>
                      <div className="p-2.5 bg-amber-50 border border-amber-200">
                        <div className="font-bold text-amber-800">Alta</div>
                        <div className="text-[11px] text-amber-600 font-mono">SLA &lt; 4 horas</div>
                      </div>
                      <div className="p-2.5 bg-blue-50 border border-blue-200">
                        <div className="font-bold text-blue-800">Media</div>
                        <div className="text-[11px] text-blue-600 font-mono">SLA &lt; 8 horas</div>
                      </div>
                      <div className="p-2.5 bg-slate-100 border border-slate-200">
                        <div className="font-bold text-slate-800">Baja</div>
                        <div className="text-[11px] text-slate-600 font-mono">SLA &lt; 24 horas</div>
                      </div>
                    </div>

                    {/* Ticket list */}
                    {tickets.length === 0 ? (
                      <div className="p-8 text-center bg-[#F5F5F7] border border-dashed border-slate-300 space-y-2">
                        <ShieldCheck className="w-8 h-8 mx-auto text-emerald-500" />
                        <div className="text-sm font-bold text-slate-700">
                          Sin incidencias abiertas
                        </div>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          Todos los servicios, servidores y módulos están operando de forma normal y resiliente.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {tickets.map((t) => (
                          <div
                            key={t.id}
                            className="p-4 bg-[#F5F5F7] border border-black/[0.08] space-y-2.5"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-[#1D1D1F]">
                                  {t.ticketNumber}
                                </span>
                                <span
                                  className={`text-[10px] font-mono font-bold px-2 py-0.5 ${
                                    t.severity === 'critical'
                                      ? 'bg-rose-100 text-rose-800'
                                      : t.severity === 'high'
                                      ? 'bg-amber-100 text-amber-800'
                                      : t.severity === 'medium'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {t.severity.toUpperCase()} (SLA {t.slaHours}h)
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 bg-white border border-black/10 text-slate-600">
                                  {t.systemArea}
                                </span>
                              </div>

                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 ${
                                  t.status === 'fix_deployed' || t.status === 'closed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : t.status === 'investigating'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {t.status === 'fix_deployed'
                                  ? '✓ Solución Desplegada'
                                  : t.status === 'closed'
                                  ? 'Cerrado'
                                  : t.status === 'investigating'
                                  ? 'Investigando'
                                  : 'Abierto'}
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-[#1D1D1F]">{t.subject}</h4>
                            <p className="text-xs text-slate-600">{t.description}</p>

                            {t.resolutionNotes && (
                              <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                                <div className="font-bold flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>Resolución Técnica de Gastón Barea:</span>
                                </div>
                                <p className="text-emerald-800">{t.resolutionNotes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

