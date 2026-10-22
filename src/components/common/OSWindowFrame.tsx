import React, { useState } from 'react';
import { 
  Terminal, 
  Minus, 
  Square, 
  X, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2, 
  ShieldCheck, 
  Cpu, 
  Activity,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export type OSAccentTheme = 'indigo' | 'sky' | 'emerald' | 'amber' | 'purple';

interface OSWindowFrameProps {
  id?: string;
  processName: string; // e.g. "sys/three-pillars.sh"
  windowTitle: string;  // e.g. "ESTRATEGIA & 3 PILARES DE NEGOCIO"
  statusBadge?: string; // e.g. "RUNNING · 99.98% SLA"
  securityBadge?: string; // e.g. "ZERO-TRUST & NDA"
  portBadge?: string;   // e.g. "TLS 1.3 · PORT 443"
  accentTheme?: OSAccentTheme;
  themeMode?: 'dark' | 'light';
  children: React.ReactNode;
  footerTelemetry?: {
    label: string;
    value: string;
    highlight?: boolean;
  }[];
  className?: string;
  bodyClassName?: string;
  defaultMinimized?: boolean;
}

export const OSWindowFrame: React.FC<OSWindowFrameProps> = ({
  id,
  processName,
  windowTitle,
  statusBadge = 'PROCESO ACTIVO',
  securityBadge = 'NDA & ZERO-TRUST',
  portBadge = 'PORT 443 · TLS 1.3',
  accentTheme = 'indigo',
  themeMode = 'dark',
  children,
  footerTelemetry,
  className = '',
  bodyClassName = '',
  defaultMinimized = false,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(defaultMinimized);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [copiedPath, setCopiedPath] = useState<boolean>(false);

  const isLight = themeMode === 'light';

  const themeConfig = {
    indigo: {
      glow: 'from-blue-600/25 via-indigo-600/35 to-blue-500/25',
      border: 'border-indigo-500/40 hover:border-indigo-400/60 shadow-indigo-950/30',
      borderLight: 'border-indigo-500/50 hover:border-indigo-500 shadow-indigo-500/10',
      terminalColor: 'text-indigo-400',
      terminalColorLight: 'text-indigo-600',
      terminalPath: 'text-indigo-300',
      terminalPathLight: 'text-indigo-700',
      pulseDot: 'bg-indigo-400',
      statusBadge: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300',
      statusBadgeLight: 'bg-indigo-100/90 border-indigo-300 text-indigo-900',
      statusIcon: 'text-indigo-400',
      statusIconLight: 'text-indigo-600',
      highlightText: 'text-indigo-300',
      highlightTextLight: 'text-indigo-700 font-bold',
    },
    sky: {
      glow: 'from-indigo-600/25 via-sky-600/35 to-cyan-500/25',
      border: 'border-sky-500/40 hover:border-sky-400/60 shadow-sky-950/30',
      borderLight: 'border-sky-500/50 hover:border-sky-500 shadow-sky-500/10',
      terminalColor: 'text-sky-400',
      terminalColorLight: 'text-sky-600',
      terminalPath: 'text-sky-300',
      terminalPathLight: 'text-sky-700',
      pulseDot: 'bg-sky-400',
      statusBadge: 'bg-sky-500/15 border-sky-400/30 text-sky-300',
      statusBadgeLight: 'bg-sky-100/90 border-sky-300 text-sky-900',
      statusIcon: 'text-sky-400',
      statusIconLight: 'text-sky-600',
      highlightText: 'text-sky-300',
      highlightTextLight: 'text-sky-700 font-bold',
    },
    emerald: {
      glow: 'from-emerald-600/25 via-teal-600/35 to-emerald-500/25',
      border: 'border-emerald-500/40 hover:border-emerald-400/60 shadow-emerald-950/30',
      borderLight: 'border-emerald-500/60 hover:border-emerald-600 shadow-emerald-500/15',
      terminalColor: 'text-emerald-400',
      terminalColorLight: 'text-emerald-600',
      terminalPath: 'text-emerald-300',
      terminalPathLight: 'text-emerald-700',
      pulseDot: 'bg-emerald-500',
      statusBadge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
      statusBadgeLight: 'bg-emerald-100/90 border-emerald-300 text-emerald-900',
      statusIcon: 'text-emerald-400',
      statusIconLight: 'text-emerald-600',
      highlightText: 'text-emerald-300',
      highlightTextLight: 'text-emerald-700 font-bold',
    },
    amber: {
      glow: 'from-amber-600/25 via-orange-600/35 to-amber-500/25',
      border: 'border-amber-500/40 hover:border-amber-400/60 shadow-amber-950/30',
      borderLight: 'border-amber-500/50 hover:border-amber-500 shadow-amber-500/10',
      terminalColor: 'text-amber-400',
      terminalColorLight: 'text-amber-600',
      terminalPath: 'text-amber-300',
      terminalPathLight: 'text-amber-700',
      pulseDot: 'bg-amber-500',
      statusBadge: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
      statusBadgeLight: 'bg-amber-100/90 border-amber-300 text-amber-900',
      statusIcon: 'text-amber-400',
      statusIconLight: 'text-amber-600',
      highlightText: 'text-amber-300',
      highlightTextLight: 'text-amber-700 font-bold',
    },
    purple: {
      glow: 'from-blue-600/25 via-purple-600/35 to-pink-500/25',
      border: 'border-purple-500/40 hover:border-purple-400/60 shadow-purple-950/30',
      borderLight: 'border-purple-500/50 hover:border-purple-500 shadow-purple-500/10',
      terminalColor: 'text-purple-400',
      terminalColorLight: 'text-purple-600',
      terminalPath: 'text-purple-300',
      terminalPathLight: 'text-purple-700',
      pulseDot: 'bg-purple-500',
      statusBadge: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
      statusBadgeLight: 'bg-purple-100/90 border-purple-300 text-purple-900',
      statusIcon: 'text-purple-400',
      statusIconLight: 'text-purple-600',
      highlightText: 'text-purple-300',
      highlightTextLight: 'text-purple-700 font-bold',
    },
  };

  const theme = themeConfig[accentTheme] || themeConfig.indigo;

  const handleCopyPath = () => {
    navigator.clipboard.writeText(`gastonbarea-os run ${processName}`);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  return (
    <div
      id={id}
      className={`w-full max-w-[1400px] mx-auto px-2 sm:px-4 md:px-6 my-6 sm:my-10 transition-all duration-300 ${
        isMaximized ? 'fixed inset-2 sm:inset-4 z-50 max-w-none my-0 overflow-y-auto' : ''
      } ${className}`}
    >
      {/* Ambient Window Glow with thematic color */}
      <div className="relative">
        <div
          className={`absolute -inset-1.5 bg-gradient-to-r ${theme.glow} rounded-2xl sm:rounded-3xl md:rounded-[2rem] blur-xl -z-10 opacity-70 pointer-events-none transition-all duration-500`}
          aria-hidden="true"
        />

        {/* OS Window Container */}
        <div className={`rounded-2xl sm:rounded-3xl md:rounded-[2rem] ${
          isLight 
            ? `bg-[#F4F4F4] border-2 ${theme.borderLight} shadow-2xl text-slate-900`
            : `bg-slate-950 border ${theme.border} shadow-2xl text-white`
        } overflow-hidden transition-all duration-300`}>
          
          {/* 1. OS WINDOW TITLEBAR (Mac/Unix Functional Workspace Header) */}
          <div className={`px-3 sm:px-6 py-3 ${
            isLight
              ? 'bg-slate-200/90 backdrop-blur-2xl border-b border-slate-300 text-slate-800'
              : 'bg-slate-900/90 backdrop-blur-2xl border-b border-white/10 text-white'
          } flex items-center justify-between gap-3 text-xs select-none`}>
            
            {/* Left: Window Controls (Traffic Lights) + Path */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Traffic Lights */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? 'Restaurar ventana' : 'Minimizar ventana'}
                  className="w-3 h-3 rounded-full bg-[#FF5F56] hover:brightness-110 active:scale-90 transition-transform cursor-pointer border border-[#E0443E] flex items-center justify-center group"
                >
                  <X className="w-2 h-2 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? 'Expandir ventana' : 'Minimizar ventana'}
                  className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:brightness-110 active:scale-90 transition-transform cursor-pointer border border-[#DEA123] flex items-center justify-center group"
                >
                  <Minus className="w-2 h-2 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsMaximized(!isMaximized)}
                  title={isMaximized ? 'Restaurar tamaño normal' : 'Maximizar a pantalla completa'}
                  className="w-3 h-3 rounded-full bg-[#27C93F] hover:brightness-110 active:scale-90 transition-transform cursor-pointer border border-[#1AAB29] flex items-center justify-center group"
                >
                  {isMaximized ? (
                    <Minimize2 className="w-2 h-2 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <Maximize2 className="w-2 h-2 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              </div>

              {/* Monospace System Path & Terminal Indicator */}
              <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px]">
                <Terminal className={`w-3.5 h-3.5 ${isLight ? theme.terminalColorLight : theme.terminalColor} shrink-0`} />
                <span className={isLight ? 'text-slate-500' : 'text-slate-500'}>gb-os@cluster:~$</span>
                <span className={`${isLight ? theme.terminalPathLight : theme.terminalPath} font-semibold`}>{processName}</span>
              </div>
            </div>

            {/* Center: Window Title Badge */}
            <div className="flex items-center gap-2 overflow-hidden text-center mx-auto px-2">
              <span className={`w-2 h-2 rounded-full ${theme.pulseDot} animate-pulse shrink-0`} />
              <span className={`font-mono text-[10px] sm:text-xs font-bold ${
                isLight ? 'text-slate-900' : 'text-white'
              } tracking-wide uppercase truncate`}>
                {windowTitle}
              </span>
            </div>

            {/* Right: Security & Network Telemetry Pills */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 font-mono text-[10px]">
              {securityBadge && (
                <div className={`hidden md:flex items-center gap-1 px-2.5 py-0.5 rounded-full ${
                  isLight
                    ? 'bg-white border border-slate-300 text-slate-700 shadow-xs'
                    : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                } font-semibold`}>
                  <ShieldCheck className={`w-3 h-3 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                  <span>{securityBadge}</span>
                </div>
              )}

              {statusBadge && (
                <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full ${
                  isLight ? `${theme.statusBadgeLight} shadow-xs` : theme.statusBadge
                } font-semibold`}>
                  <Activity className={`w-3 h-3 ${isLight ? theme.statusIconLight : theme.statusIcon}`} />
                  <span className="hidden sm:inline">{statusBadge}</span>
                  <span className="sm:hidden">ACTIVO</span>
                </div>
              )}

              {/* Copy Process Command button */}
              <button
                type="button"
                onClick={handleCopyPath}
                title="Copiar comando de ejecución de este proceso"
                className={`p-1 ${
                  isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-300/50' : 'text-slate-400 hover:text-white hover:bg-white/10'
                } rounded-md transition-colors cursor-pointer`}
              >
                {copiedPath ? (
                  <Check className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Collapse / Expand Toggle Arrow */}
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className={`p-1 ${
                  isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-300/50' : 'text-slate-400 hover:text-white hover:bg-white/10'
                } rounded-md transition-colors cursor-pointer sm:hidden`}
                aria-label="Alternar vista"
              >
                {isMinimized ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>

          </div>

          {/* 2. OS WINDOW INTERIOR (Body Viewport) */}
          {!isMinimized && (
            <div className={`relative transition-all duration-300 ${bodyClassName}`}>
              {children}
            </div>
          )}

          {/* 3. OS WINDOW STATUS DOCK / TELEMETRY FOOTER */}
          <div className={`px-4 sm:px-6 py-2.5 ${
            isLight
              ? 'bg-slate-200/90 border-t border-slate-300 text-slate-600'
              : 'bg-slate-900/95 border-t border-white/10 text-slate-400'
          } flex flex-wrap items-center justify-between gap-2 font-mono text-[10px]`}>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`flex items-center gap-1 ${isLight ? 'text-emerald-700' : 'text-emerald-400'} font-semibold`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isLight ? 'bg-emerald-600' : 'bg-emerald-400'} animate-pulse`} />
                KERNEL: ONLINE (v4.2-STABLE)
              </span>
              <span className={isLight ? 'text-slate-400 hidden sm:inline' : 'text-slate-600 hidden sm:inline'}>|</span>
              <span className={`hidden sm:inline ${isLight ? 'text-slate-700 font-medium' : 'text-slate-300'}`}>{portBadge}</span>
              <span className={isLight ? 'text-slate-400 hidden md:inline' : 'text-slate-600 hidden md:inline'}>|</span>
              <span className={`hidden md:inline ${isLight ? 'text-slate-700 font-medium' : 'text-slate-300'}`}>UPTIME: 99.98%</span>
            </div>

            <div className="flex items-center gap-3">
              {footerTelemetry ? (
                footerTelemetry.map((item, idx) => (
                  <span
                    key={idx}
                    className={item.highlight ? (isLight ? theme.highlightTextLight : 'text-sky-300 font-semibold') : (isLight ? 'text-slate-600' : 'text-slate-400')}
                  >
                    {item.label}: <strong className={isLight ? 'text-slate-900' : 'text-slate-200'}>{item.value}</strong>
                  </span>
                ))
              ) : (
                <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                  SYS_MEM: <strong className={isLight ? 'text-slate-900' : 'text-slate-200'}>OPTIMAL</strong> · LATENCY: <strong className={isLight ? 'text-slate-900' : 'text-slate-200'}>&lt;35ms</strong>
                </span>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
