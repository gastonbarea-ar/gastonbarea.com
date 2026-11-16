import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  BookOpen,
  Video,
  MessageSquare,
  UserCheck,
  Play,
  PlusCircle,
  FolderKanban,
  Cpu,
  Layers,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { motion, useInView } from 'motion/react';
import { BlogPost } from '../types/blog';
import { INITIAL_BLOG_POSTS } from '../data/blogData';
import { PROJECTS_CATALOG } from '../data/projectsData';
import { ArticleReaderModal } from './blog/ArticleReaderModal';
import { PostEditorModal } from './blog/PostEditorModal';
import { PageSectionId } from './Header';
import { ArnClientIntakeWidget } from './ArnClientIntakeWidget';
import digitalTwinImg from '../assets/images/digital_twin_architecture_1794799691080.jpg';
import odooLinuxImg from '../assets/images/odoo_linux_engineering_1794799691939.jpg';

interface HomeBlocksViewProps {
  onNavigatePage: (page: PageSectionId, serviceCode?: string) => void;
  onSelectService: (serviceName: string) => void;
  onAskDigitalTwin: (prompt: string) => void;
  onScheduleClick: (context?: string) => void;
  onWhatsAppClick: (customText?: string) => void;
  onClientPortalClick: () => void;
}

const EASE_EXECUTIVE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// ----------------------------------------------------------------------------
// Animated Numeric Counter (tabular-nums, GPU-friendly, respects reduced motion)
// ----------------------------------------------------------------------------
const AnimatedMetricNumber: React.FC<{
  target: number;
  suffix?: string;
  className?: string;
}> = ({ target, suffix = '', className = '' }) => {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState<number>(target);

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(target);
      return;
    }

    let rafId = 0;
    const duration = 900;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [inView, target]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {display}
      {suffix}
    </span>
  );
};

// ----------------------------------------------------------------------------
// Lightweight HTML5 Canvas: Interactive ARN Node Mesh (60fps, mouse-reactive)
// ----------------------------------------------------------------------------
const ArnNodeCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const nodes = Array.from({ length: 28 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: i % 5 === 0 ? 2.6 : 1.5,
      isEmerald: i % 3 === 0,
    }));

    const pointer = { x: -999, y: -999 };
    const handlePointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const handlePointerLeave = () => {
      pointer.x = -999;
      pointer.y = -999;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    canvas.parentElement?.addEventListener('mousemove', handlePointerMove);
    canvas.parentElement?.addEventListener('mouseleave', handlePointerLeave);
    window.addEventListener('resize', handleResize);

    let rafId = 0;
    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (!prefersReducedMotion) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;
        }

        // Draw edges between nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dx = n.x - m.x;
          const dy = n.y - m.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 145) {
            ctx.beginPath();
            ctx.strokeStyle =
              n.isEmerald || m.isEmerald
                ? `rgba(52, 211, 153, ${(1 - dist / 145) * 0.22})`
                : `rgba(129, 140, 248, ${(1 - dist / 145) * 0.18})`;
            ctx.lineWidth = 0.85;
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.stroke();
          }
        }

        // Draw pointer highlight edge
        const pDist = Math.hypot(n.x - pointer.x, n.y - pointer.y);
        if (pDist < 170) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(52, 211, 153, ${(1 - pDist / 170) * 0.48})`;
          ctx.lineWidth = 1.1;
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.isEmerald ? 'rgba(52, 211, 153, 0.75)' : 'rgba(165, 180, 252, 0.65)';
        ctx.fill();
      }

      if (!prefersReducedMotion) {
        rafId = requestAnimationFrame(drawFrame);
      }
    };

    drawFrame();

    return () => {
      cancelAnimationFrame(rafId);
      canvas.parentElement?.removeEventListener('mousemove', handlePointerMove);
      canvas.parentElement?.removeEventListener('mouseleave', handlePointerLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 w-full h-full opacity-75"
    />
  );
};

export const HomeBlocksView: React.FC<HomeBlocksViewProps> = ({
  onNavigatePage,
  onSelectService,
  onScheduleClick,
  onWhatsAppClick,
  onClientPortalClick,
}) => {
  const [posts, setPosts] = useState<BlogPost[]>(() => {
    try {
      const saved = localStorage.getItem('gb_blog_posts_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_BLOG_POSTS;
  });

  const [selectedPostForReading, setSelectedPostForReading] = useState<BlogPost | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [activeTimelineIdx, setActiveTimelineIdx] = useState<number>(2);
  const [activeAgentPhase, setActiveAgentPhase] = useState<number>(0);
  const [spotlightPos, setSpotlightPos] = useState<{ x: number; y: number }>({ x: 50, y: 40 });
  const [isClientLoggedIn, setIsClientLoggedIn] = useState<boolean>(() => {
    try {
      return Boolean(
        localStorage.getItem('gb_client_token') && localStorage.getItem('gb_client_user')
      );
    } catch {
      return false;
    }
  });

  // Cycle animated ReAct 4-Phase demo inside the Bento Card
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      setActiveAgentPhase((prev) => (prev + 1) % 4);
    }, 2400);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const syncAuthSession = () => {
      try {
        setIsClientLoggedIn(
          Boolean(localStorage.getItem('gb_client_token') && localStorage.getItem('gb_client_user'))
        );
      } catch {
        setIsClientLoggedIn(false);
      }
    };
    syncAuthSession();
    window.addEventListener('storage', syncAuthSession);
    window.addEventListener('gb-client-auth-change', syncAuthSession);
    window.addEventListener('focus', syncAuthSession);
    window.addEventListener('hashchange', syncAuthSession);
    return () => {
      window.removeEventListener('storage', syncAuthSession);
      window.removeEventListener('gb-client-auth-change', syncAuthSession);
      window.removeEventListener('focus', syncAuthSession);
      window.removeEventListener('hashchange', syncAuthSession);
    };
  }, []);

  const handleSavePost = (newPost: BlogPost) => {
    const existingIndex = posts.findIndex((p) => p.id === newPost.id);
    let updated: BlogPost[];
    if (existingIndex >= 0) {
      updated = [...posts];
      updated[existingIndex] = newPost;
    } else {
      updated = [newPost, ...posts];
    }
    setPosts(updated);
    try {
      localStorage.setItem('gb_blog_posts_v2', JSON.stringify(updated));
    } catch {
      // ignore storage error
    }
  };

  const agentPhases = [
    { step: '01', name: 'Evaluar', detail: 'Desglose de subtareas & escala empresa' },
    { step: '02', name: 'Memoria', detail: 'Contexto CRM, Supabase & Stock ARN' },
    { step: '03', name: 'Herramientas', detail: 'Cálculo 40/40/20 · Meet · Usuarios' },
    { step: '04', name: 'Verificar', detail: 'Auditoría matemática & respuesta final' },
  ];

  const experienceEras = [
    {
      period: '1996 – 2012',
      title: 'Cimientos en Ingeniería de Sistemas, Linux y Redes Productivas',
      summary:
        'Automatización operativa, servidores críticos y conectividad para industrias, cooperativas y organismos regionales.',
      highlight: 'Infraestructura & Sistemas Críticos',
    },
    {
      period: '2012 – 2021',
      title: 'Dirección Ejecutiva PMO con Clientes, PostgreSQL & Sistemas ERP',
      summary:
        'Liderazgo directo de proyectos complejos junto a directorios y equipos técnicos, garantizando plazos y retorno de inversión.',
      highlight: '14 Años Liderando PMO Externa',
    },
    {
      period: '2021 – 2026',
      title: 'Base Tecnológica (EBTs), IA Services, Bioeconomía & Odoo v18',
      summary:
        'Despliegue de Gemelos Digitales corporativos, agentes autónomos dual-engine, trazabilidad bioeconómica IoT y plataformas B2B2C.',
      highlight: 'Human Innovation & IA Autónoma',
    },
  ];

  const featuredProjects = PROJECTS_CATALOG.slice(0, 3);
  const featuredPost = posts[0] || INITIAL_BLOG_POSTS[0];
  const secondaryPosts = posts.slice(1, 3);

  return (
    <div className="w-full">
      {/* =====================================================================
          02. ASYMMETRIC LIVING BENTO GRID — SOLUCIONES & ARQUITECTURA
         ===================================================================== */}
      <section className="w-full py-20 md:py-28 bg-white text-[#1D1D1F]">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 space-y-12 text-left">
          {/* Editorial Header */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.45, ease: EASE_EXECUTIVE }}
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-slate-200/80"
          >
            <div className="space-y-2.5 max-w-2xl">
              <div className="text-xs font-mono font-semibold text-[#291B64]">
                02. Soluciones · IA Services & Verticales de Ingeniería
              </div>
              <h2
                className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#1D1D1F] leading-[1.06]"
                style={{ textWrap: 'balance' }}
              >
                Soluciones tecnológicas integrales bajo una misma dirección ejecutiva.
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => onNavigatePage('ia-services')}
                className="px-5 py-3 rounded-xl text-xs font-mono font-bold text-[#291B64] bg-[#F4F5FA] hover:bg-[#291B64] hover:text-white border border-slate-200/80 transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>IA Services & Estructurador</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigatePage('servicios')}
                className="px-6 py-3 rounded-xl text-xs font-mono font-bold text-white bg-[#291B64] hover:bg-[#382586] transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Ver Todas las Soluciones</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* ASYMMETRIC BENTO GRID (12 Columns, Live Visual Demos + Bespoke Assets) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* BENTO 1 (7 Cols): Marquee IA Services & Dual-Engine ReAct Live Demo */}
            <motion.article
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, ease: EASE_EXECUTIVE }}
              onClick={() => onNavigatePage('ia-services')}
              className="lg:col-span-7 group relative rounded-2xl bg-[#090B14] text-white overflow-hidden border border-slate-800/80 cursor-pointer flex flex-col justify-between min-h-[420px] shadow-xl"
            >
              {/* Subtle Ambient Artwork Layer */}
              <div className="relative h-52 sm:h-60 w-full overflow-hidden bg-[#05060B]">
                <img
                  src={digitalTwinImg}
                  alt="Visualización arquitectónica de Gemelo Digital Corporativo e IA Services"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center opacity-85 group-hover:scale-[1.03] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090B14] via-[#090B14]/45 to-transparent" />
                <div className="absolute top-4 left-5 right-5 flex items-center justify-between text-[11px] font-mono text-emerald-400">
                  <span>01. IA Services & Gemelos Digitales</span>
                  <span className="text-neutral-300">Gemini 3 Flash + Groq LPU</span>
                </div>
              </div>

              <div className="p-6 sm:p-8 pt-2 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-2.5">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                    Agentes Autónomos & Gemelos Digitales conectados a tus datos
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
                    Arquitecturas RAG, tableros predictivos y motor agéntico ARN de 4 fases que evalúa objetivos, consulta tu CRM/ERP y audita presupuestos 24/7.
                  </p>
                </div>

                {/* Live Animated 4-Phase ReAct Micro-Visualizer */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  {agentPhases.map((phase, idx) => {
                    const isActive = activeAgentPhase === idx;
                    return (
                      <div
                        key={phase.step}
                        className={`p-3 rounded-xl border transition-all duration-300 ${
                          isActive
                            ? 'bg-[#291B64]/80 border-emerald-400/60 shadow-[0_0_24px_-8px_rgba(52,211,153,0.45)]'
                            : 'bg-white/[0.04] border-white/10 opacity-75'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                          <span className="text-emerald-400 font-bold tabular-nums">{phase.step}</span>
                          <span className="text-white font-semibold">{phase.name}</span>
                        </div>
                        <p className="text-[11px] text-neutral-300 leading-tight line-clamp-2">
                          {phase.detail}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-mono text-emerald-400 font-semibold">
                  <span className="group-hover:underline underline-offset-4">
                    Abrir Estructurador IA & Gemelo Digital
                  </span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </motion.article>

            {/* BENTO 2 (5 Cols): Bioeconomía & Telemetría IoT */}
            <motion.article
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: 0.08, ease: EASE_EXECUTIVE }}
              onClick={() => onNavigatePage('bioeconomia')}
              className="lg:col-span-5 group rounded-2xl bg-[#0B241C] text-white border border-emerald-500/25 overflow-hidden cursor-pointer flex flex-col justify-between p-6 sm:p-8 min-h-[420px] shadow-xl relative"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-emerald-400/15 blur-[80px]"
              />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-bold tabular-nums">02. Bioeconomía & IoT</span>
                  <span className="text-emerald-200/80">Trazabilidad · ESG</span>
                </div>

                <h3 className="font-display text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                  Trazabilidad de lote, telemetría de campo y biomasa certificada
                </h3>

                <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
                  Pasaportes digitales por lote productivo, sensores IoT en planta/campo y certificación exportable en tiempo real.
                </p>

                {/* Live Animated SVG IoT Telemetry Curve */}
                <div className="mt-4 p-4 rounded-xl bg-[#071812] border border-emerald-400/20 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-emerald-300">
                    <span className="inline-flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5" />
                      <span>Telemetría de Bioproceso · Lote #PAT-408</span>
                    </span>
                    <span className="tabular-nums font-bold">99.4% Estabilidad</span>
                  </div>
                  <svg viewBox="0 0 320 68" className="w-full h-16 overflow-visible" aria-hidden="true">
                    <defs>
                      <linearGradient id="bioGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(52, 211, 153, 0.35)" />
                        <stop offset="100%" stopColor="rgba(52, 211, 153, 0)" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 50 Q 40 22 80 34 T 160 20 T 240 28 T 320 12 L 320 68 L 0 68 Z"
                      fill="url(#bioGrad)"
                    />
                    <path
                      d="M 0 50 Q 40 22 80 34 T 160 20 T 240 28 T 320 12"
                      fill="none"
                      stroke="#34D399"
                      strokeWidth="2.2"
                    />
                    <path
                      d="M 0 50 Q 40 22 80 34 T 160 20 T 240 28 T 320 12"
                      fill="none"
                      stroke="#A7F3D0"
                      strokeWidth="2.2"
                      className="animate-flow-line"
                    />
                  </svg>
                </div>
              </div>

              <div className="relative z-10 pt-6 border-t border-emerald-400/15 flex items-center justify-between text-xs font-mono text-emerald-300 font-semibold">
                <span className="group-hover:underline underline-offset-4">
                  Explorar vertical Bioeconomía & Casos
                </span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </motion.article>

            {/* BENTO 3 (4 Cols): Proyectos de Base Tecnológica (EBTs) */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: 0.04, ease: EASE_EXECUTIVE }}
              onClick={() => onNavigatePage('servicios', '01')}
              className="lg:col-span-4 group p-6 sm:p-7 rounded-2xl bg-[#F7F8FC] hover:bg-white border border-slate-200/80 hover:border-[#291B64]/40 transition-all cursor-pointer flex flex-col justify-between space-y-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#291B64] font-bold tabular-nums">03. Ingeniería EBTs</span>
                  <Cpu className="w-4 h-4 text-[#291B64]" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#1D1D1F] group-hover:text-[#291B64] transition-colors leading-snug">
                  Proyectos de Base Tecnológica & Plataformas Digitales
                </h3>
                <p className="text-xs sm:text-sm text-[#515154] leading-relaxed">
                  Desarrollo full-stack (React, TypeScript, Node.js, PostgreSQL) para transformar conocimiento científico o industrial en activos digitales escalables.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200/70 flex items-center justify-between text-xs font-semibold text-[#291B64]">
                <span className="group-hover:underline underline-offset-4">Ver entregables EBTs</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </motion.article>

            {/* BENTO 4 (4 Cols): Dirección Ejecutiva PMO 40·40·20% */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: 0.08, ease: EASE_EXECUTIVE }}
              onClick={() => onNavigatePage('servicios', '04')}
              className="lg:col-span-4 group p-6 sm:p-7 rounded-2xl bg-[#F7F8FC] hover:bg-white border border-slate-200/80 hover:border-[#291B64]/40 transition-all cursor-pointer flex flex-col justify-between space-y-6"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#291B64] font-bold tabular-nums">04. Dirección PMO</span>
                  <Layers className="w-4 h-4 text-[#291B64]" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#1D1D1F] group-hover:text-[#291B64] transition-colors leading-snug">
                  Gobernanza por Hitos Auditables 40 · 40 · 20%
                </h3>
                <p className="text-xs sm:text-sm text-[#515154] leading-relaxed">
                  14 años dirigiendo proyectos con clientes bajo control financiero y validaciones reales en Servidor Staging antes de salir a producción.
                </p>

                {/* Animated 40/40/20 Milestone Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden flex gap-0.5 p-0.5">
                    <div className="h-full w-[40%] rounded-l-full bg-[#291B64]" />
                    <div className="h-full w-[40%] bg-indigo-500" />
                    <div className="h-full w-[20%] rounded-r-full bg-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 tabular-nums">
                    <span>40% Inicio</span>
                    <span>40% Staging</span>
                    <span className="text-emerald-700 font-bold">20% Producción</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-200/70 flex items-center justify-between text-xs font-semibold text-[#291B64]">
                <span className="group-hover:underline underline-offset-4">Conocer metodología PMO</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </motion.article>

            {/* BENTO 5 (4 Cols): Odoo Community ERP v18 & Linux/Docker with Visual Asset */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: 0.12, ease: EASE_EXECUTIVE }}
              onClick={() => onNavigatePage('servicios', '05')}
              className="lg:col-span-4 group rounded-2xl bg-[#0F131F] text-white border border-slate-800 overflow-hidden cursor-pointer flex flex-col justify-between shadow-lg"
            >
              <div className="relative h-32 w-full overflow-hidden bg-black">
                <img
                  src={odooLinuxImg}
                  alt="Infraestructura crítica Linux, Docker y Odoo Community ERP v18"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center opacity-80 group-hover:scale-[1.04] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F131F] via-[#0F131F]/40 to-transparent" />
                <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-emerald-400">
                  <span>05 & 06. Odoo v18 + Linux</span>
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              <div className="p-6 pt-3 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-display text-xl font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                    Odoo ERP v18 B2B2C & Infraestructura Linux 24/7
                  </h3>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Producción MRP, e-commerce sin costo de licencias y servidores blindados con Docker, WireGuard VPN y backups automatizados.
                  </p>
                </div>
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-emerald-400">
                  <span className="group-hover:underline underline-offset-4">Explorar Odoo & Linux</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </motion.article>
          </div>
        </div>
      </section>

      {/* =====================================================================
          03. IA SERVICES & GEMELO DIGITAL STUDIO (CURSOR SPOTLIGHT + ARN CANVAS)
         ===================================================================== */}
      <section
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          setSpotlightPos({ x, y });
        }}
        className="relative w-full py-20 md:py-28 bg-[#0E0926] text-white overflow-hidden"
      >
        {/* Interactive Canvas Node Mesh */}
        <ArnNodeCanvas />

        {/* Interactive Cursor Spotlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(650px circle at ${spotlightPos.x}% ${spotlightPos.y}%, rgba(99, 68, 245, 0.24), rgba(16, 185, 129, 0.08) 40%, transparent 72%)`,
          }}
        />

        <div className="relative z-10 w-full px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center text-left">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.45, ease: EASE_EXECUTIVE }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="text-xs font-mono text-emerald-400 font-semibold">
                03. IA Services & Gemelos Digitales Corporativos
              </div>

              <h2
                className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.08]"
                style={{ textWrap: 'balance' }}
              >
                Convertimos su web y operación en un Gemelo Digital inteligente.
              </h2>

              <p className="text-sm sm:text-base text-neutral-200 leading-relaxed max-w-2xl">
                Esta misma plataforma demuestra <strong className="text-white">IA Services</strong> en producción: arquitectura Dual-Engine (Gemini + Groq) conectada a su CRM, catálogo de servicios en escala y portal privado de clientes.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-6 border-t border-white/15">
                <div className="space-y-1.5">
                  <div className="font-mono text-2xl sm:text-3xl font-bold text-emerald-400 tabular-nums">
                    24/7
                  </div>
                  <div className="text-sm font-bold text-white">Pre-Ingeniería & Ventas</div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Diagnóstico automático y enrutamiento inteligente hacia la solución exacta.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="font-mono text-2xl sm:text-3xl font-bold text-emerald-400 tabular-nums">
                    RAG + BI
                  </div>
                  <div className="text-sm font-bold text-white">Datos Propios Auditables</div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Agentes conectados a PostgreSQL, catálogos Odoo y manuales técnicos.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="font-mono text-2xl sm:text-3xl font-bold text-emerald-400 tabular-nums">
                    3–6 Sem
                  </div>
                  <div className="text-sm font-bold text-white">Despliegue por Hitos</div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    40% Arquitectura, 40% validación en Staging y 20% salida a producción.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.45, delay: 0.1, ease: EASE_EXECUTIVE }}
              className="lg:col-span-5 p-7 sm:p-9 rounded-2xl studio-card-dark backdrop-blur-xl space-y-6"
            >
              <div className="text-xs font-mono text-emerald-400 font-semibold">
                Herramienta en Vivo · Estructurador de Proyectos
              </div>

              <h3 className="font-display text-2xl font-bold text-white leading-snug">
                Simule ahora la hoja de ruta técnica de su proyecto con IA.
              </h3>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Seleccione el perfil de su organización, el desafío principal y su stack actual para generar al instante fases de trabajo, tiempos y entregables.
              </p>

              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  onClick={() => onNavigatePage('ia-services')}
                  className="w-full px-5 py-3.5 rounded-xl text-xs sm:text-sm font-mono font-bold text-white bg-[#291B64] hover:bg-[#382586] transition-colors flex items-center justify-between gap-2 cursor-pointer shadow-md"
                >
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                    <span>Abrir Estructurador de Proyectos IA</span>
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onSelectService('02. IA Services: Gemelos Digitales, Agentes Inteligentes & BI')
                  }
                  className="w-full px-5 py-3.5 rounded-xl text-xs font-semibold text-neutral-200 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                >
                  <span>Solicitar cotización de IA Services</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          04. INDUSTRIA 4.0 & PROYECTOS EN PRODUCCIÓN
         ===================================================================== */}
      <section className="w-full py-20 md:py-28 bg-[#F4F6F9] text-[#1D1D1F]">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 space-y-12 text-left">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-slate-200">
            <div className="space-y-2.5 max-w-3xl">
              <div className="text-xs font-mono text-emerald-800 font-semibold">
                04. Industria 4.0 · Proyectos Realizados & En Producción
              </div>
              <h2
                className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#1D1D1F] leading-[1.08]"
                style={{ textWrap: 'balance' }}
              >
                Arquitecturas operativas en producción y despliegues ejecutados.
              </h2>
            </div>

            <button
              type="button"
              onClick={() => onNavigatePage('proyectos')}
              className="px-6 py-3 rounded-xl text-xs font-mono font-bold text-white bg-[#291B64] hover:bg-[#382586] transition-colors inline-flex items-center gap-2 cursor-pointer self-start lg:self-auto shrink-0 shadow-sm"
            >
              <FolderKanban className="w-4 h-4" />
              <span>Ver Todos los Proyectos ({PROJECTS_CATALOG.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Industry 4.0 Visual Showcase Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-70px' }}
            transition={{ duration: 0.45, ease: EASE_EXECUTIVE }}
            className="grid grid-cols-1 lg:grid-cols-12 rounded-2xl bg-[#0C0E14] text-white overflow-hidden items-stretch border border-slate-800 shadow-2xl"
          >
            <div className="lg:col-span-7 relative min-h-[280px] sm:min-h-[360px] bg-black overflow-hidden">
              <img
                src="/assets/industry-4-0.jpg"
                alt="Ingeniería de Industria 4.0, automatización industrial y control de planta en tiempo real"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-white/90">
                <span>Industria 4.0 · Telemetría en Planta</span>
                <span className="text-emerald-400 font-bold">En Producción 24/7</span>
              </div>
            </div>

            <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="text-xs font-mono text-emerald-400 font-semibold">
                  Convergencia OT / IT · Planta Conectada
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-white leading-snug">
                  Automatización industrial, sensores IoT y ERP sincronizados en tiempo real.
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  Integramos líneas de producción, celdas robóticas y control de calidad con PostgreSQL, tableros predictivos de IA y Odoo MRP v18 sin costos de licencias.
                </p>
              </div>

              <div className="pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                <span className="text-emerald-400 font-bold tabular-nums">
                  -42% mermas · 99.98% uptime
                </span>
                <button
                  type="button"
                  onClick={() => onNavigatePage('proyectos')}
                  className="text-white hover:text-emerald-400 font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>Explorar despliegues</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Featured Production Projects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {featuredProjects.map((proj, idx) => (
              <motion.article
                key={proj.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: idx * 0.06, ease: EASE_EXECUTIVE }}
                onClick={() => onNavigatePage('proyectos')}
                className="group rounded-2xl bg-white hover:bg-[#0C0E14] hover:text-white border border-slate-200/90 hover:border-slate-800 p-7 flex flex-col justify-between space-y-6 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-xl"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs font-mono">
                    <span className="font-bold text-[#291B64] group-hover:text-emerald-400 tabular-nums">
                      {proj.code}
                    </span>
                    <span className="font-semibold text-emerald-700 group-hover:text-emerald-300">
                      {proj.statusLabel}
                    </span>
                  </div>

                  <div className="text-xs font-mono text-slate-500 group-hover:text-neutral-400">
                    {proj.category}
                  </div>

                  <h3 className="font-display text-xl font-bold text-[#1D1D1F] group-hover:text-white leading-snug">
                    {proj.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#515154] group-hover:text-neutral-300 leading-relaxed">
                    {proj.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/80 group-hover:border-white/15 flex items-center justify-between gap-2 text-xs font-mono">
                  <span className="font-bold text-[#291B64] group-hover:text-emerald-400 tabular-nums">
                    {proj.impactMetrics}
                  </span>
                  <ArrowUpRight className="w-4 h-4 shrink-0" />
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          05. EXPERIENCE · CONTADORES ANIMADOS & TIMELINE INTERACTIVA (1996–2026)
         ===================================================================== */}
      <section className="w-full py-20 md:py-28 bg-white text-[#1D1D1F]">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start text-left">
            <div className="lg:col-span-5 space-y-6">
              <div className="text-xs font-mono text-[#291B64] font-semibold">
                05. Experience & Dirección Ejecutiva PMO
              </div>
              <h2
                className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#1D1D1F] leading-tight"
                style={{ textWrap: 'balance' }}
              >
                30 años en el sector tecnológico-productivo y 14 años dirigiendo proyectos con clientes.
              </h2>
              <p className="text-sm text-[#515154] leading-relaxed">
                Desde 1996 desarrollando infraestructura, software y arquitecturas productivas desde Patagonia hacia el mundo, y desde 2012 liderando directamente la ejecución PMO con clientes.
              </p>

              {/* Animated Key Counters */}
              <div className="grid grid-cols-3 gap-4 py-5 border-y border-slate-200/80">
                <div>
                  <div className="font-display text-3xl font-bold text-[#291B64]">
                    <AnimatedMetricNumber target={30} suffix="+" />
                  </div>
                  <div className="text-xs font-mono text-slate-600 mt-0.5">Años Tech</div>
                </div>
                <div>
                  <div className="font-display text-3xl font-bold text-[#1D1D1F]">
                    <AnimatedMetricNumber target={14} suffix="+" />
                  </div>
                  <div className="text-xs font-mono text-slate-600 mt-0.5">Años PMO</div>
                </div>
                <div>
                  <div className="font-display text-3xl font-bold text-emerald-700 tabular-nums">
                    40·40·20
                  </div>
                  <div className="text-xs font-mono text-slate-600 mt-0.5">Hitos Auditados</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigatePage('trayectoria')}
                  className="px-6 py-3 rounded-xl text-xs font-mono font-bold text-white bg-[#291B64] hover:bg-[#382586] transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Ver Experience Completa</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onClientPortalClick}
                  className="text-xs font-semibold text-[#291B64] hover:underline underline-offset-4 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Portal de Clientes (40·40·20%)</span>
                </button>
              </div>
            </div>

            {/* Interactive Chronological Timeline */}
            <div className="lg:col-span-7 space-y-4">
              {experienceEras.map((era, idx) => {
                const isSelected = activeTimelineIdx === idx;
                return (
                  <div
                    key={era.period}
                    onMouseEnter={() => setActiveTimelineIdx(idx)}
                    onClick={() => setActiveTimelineIdx(idx)}
                    className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer grid grid-cols-1 sm:grid-cols-12 gap-4 items-baseline ${
                      isSelected
                        ? 'bg-[#F7F8FC] border-[#291B64]/40 shadow-md'
                        : 'bg-white border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="sm:col-span-3 space-y-1">
                      <div
                        className={`font-mono text-xs font-bold tabular-nums ${
                          isSelected ? 'text-[#291B64]' : 'text-slate-500'
                        }`}
                      >
                        {era.period}
                      </div>
                      <div className="text-[11px] font-mono text-emerald-700 font-medium">
                        {era.highlight}
                      </div>
                    </div>
                    <div className="sm:col-span-9 space-y-1.5">
                      <h3 className="font-display text-lg font-bold text-[#1D1D1F]">
                        {era.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#515154] leading-relaxed">
                        {era.summary}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          06. BIOECONOMÍA & PUBLICACIONES EJECUTIVAS
         ===================================================================== */}
      <section className="relative w-full py-20 md:py-28 bg-[#081F17] text-white overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/3 w-[520px] h-[520px] rounded-full bg-emerald-400/12 blur-[140px]"
        />

        <div className="relative z-10 w-full px-4 sm:px-8 lg:px-12 xl:px-16 space-y-12 text-left">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-emerald-400/20">
            <div className="space-y-2.5 max-w-2xl">
              <div className="text-xs font-mono text-emerald-400 font-semibold">
                06. Bioeconomía, Cultivos & Publicaciones
              </div>
              <h2
                className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.08]"
                style={{ textWrap: 'balance' }}
              >
                Artículos, análisis técnico y notas sobre bioeconomía, agroindustria e IA.
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => onNavigatePage('bioeconomia')}
                className="px-4 py-3 rounded-xl text-xs font-mono font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Vertical Bioeconomía</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsEditorOpen(true)}
                className="px-4 py-3 rounded-xl text-xs font-mono font-semibold text-white bg-white/10 hover:bg-white/20 transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>Nueva Publicación</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigatePage('blog')}
                className="px-5 py-3 rounded-xl text-xs font-mono font-bold text-white bg-[#13382B] hover:bg-[#1B4C3B] border border-emerald-400/30 transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-emerald-300" />
                <span>Blog ({posts.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {featuredPost && (
              <article
                onClick={() => setSelectedPostForReading(featuredPost)}
                className="lg:col-span-7 rounded-2xl bg-[#0F2D23] border border-emerald-400/20 flex flex-col justify-between overflow-hidden cursor-pointer group hover:bg-[#13382C] transition-colors shadow-xl"
              >
                <div>
                  <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-[#061510]">
                    <img
                      src="/assets/bioeconomy-crops.jpg"
                      alt="Cultivos sostenibles, bioeconomía y trazabilidad digital agroindustrial"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F2D23] via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-emerald-300">
                      <span>Bioeconomía · Biomasa Certificada</span>
                      <span>Pasaporte Digital</span>
                    </div>
                  </div>

                  <div className="p-7 sm:p-9 space-y-3.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-emerald-400">
                      <span className="font-bold">Destacado</span>
                      <span aria-hidden="true">·</span>
                      <span>{featuredPost.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{featuredPost.publishedAt}</span>
                      <span aria-hidden="true">·</span>
                      <span>{featuredPost.readTime}</span>
                    </div>

                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">
                      {featuredPost.title}
                    </h3>

                    <p className="text-sm text-emerald-100/85 leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-7 sm:px-9 pb-7 pt-5 border-t border-emerald-400/15 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-xs font-mono text-emerald-200/80">
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <Play className="w-3.5 h-3.5" />
                      <span>Incluye Video YouTube</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Por {featuredPost.author.name}</span>
                  </div>

                  <span className="text-xs font-mono font-bold text-emerald-300 group-hover:text-white inline-flex items-center gap-1.5">
                    <span>Leer artículo completo</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </article>
            )}

            <div className="lg:col-span-5 rounded-2xl flex flex-col justify-between divide-y divide-emerald-900/10 bg-[#EFF6F2] text-[#1D1D1F] p-6 sm:p-8 shadow-xl">
              <div className="space-y-6">
                <div className="text-xs font-mono font-bold text-emerald-900">
                  Últimas publicaciones ejecutivas
                </div>

                <div className="divide-y divide-emerald-950/10">
                  {secondaryPosts.map((post, idx) => (
                    <article
                      key={post.id}
                      onClick={() => setSelectedPostForReading(post)}
                      className="py-5 first:pt-0 last:pb-0 group cursor-pointer space-y-2"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-emerald-900/70">
                        <span className="text-emerald-800 font-semibold">{post.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{post.publishedAt}</span>
                        <span aria-hidden="true">·</span>
                        <span>{post.readTime}</span>
                      </div>

                      <h4 className="font-display text-lg font-bold text-[#0D261E] group-hover:text-emerald-700 transition-colors leading-snug">
                        0{idx + 2}. {post.title}
                      </h4>

                      <p className="text-xs text-[#3A4D44] line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-emerald-950/10 flex items-center justify-between">
                <span className="text-xs text-[#3A4D44]">
                  Explorá artículos completos o filtrá por temática
                </span>
                <button
                  type="button"
                  onClick={() => onNavigatePage('blog')}
                  className="text-xs font-mono font-bold text-emerald-900 hover:underline inline-flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span>Ir al Blog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          07. CIERRE EJECUTIVO & PORTAL ARN
         ===================================================================== */}
      <section className="w-full py-16 md:py-24 bg-[#07080D] text-white">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 space-y-8">
          <div className="p-8 sm:p-10 rounded-2xl studio-card-dark flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-left">
            <div className="space-y-2.5 max-w-2xl">
              <div className="text-xs font-mono text-emerald-400 font-semibold">
                07. Tratamiento de Presupuesto ARN & Protocolo NDA
              </div>
              <h2
                className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight"
                style={{ textWrap: 'balance' }}
              >
                ¿Listo para evaluar tu proyecto tecnológico, de IA Services o bioeconomía?
              </h2>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Registrate en 1 paso en el Portal de Clientes para seleccionar tu servicio del Stock ARN según dotación y tratar tu presupuesto 40/40/20 de forma privada.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onClientPortalClick}
                className="min-h-[46px] px-5 py-3 rounded-xl text-xs sm:text-sm font-mono font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>
                  {isClientLoggedIn
                    ? 'Abrir Mi Portal de Clientes'
                    : 'Registrarme en Portal (#portal)'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onScheduleClick('Sesión Ejecutiva desde Bloque de Cierre Home')}
                className="min-h-[46px] px-5 py-3 rounded-xl text-xs sm:text-sm font-mono font-bold text-white bg-[#291B64] hover:bg-[#382586] transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Video className="w-4 h-4 text-emerald-300" />
                <span>Agendar Meet (30m)</span>
              </button>

              <button
                type="button"
                onClick={() => onWhatsAppClick()}
                className="min-h-[46px] px-5 py-3 rounded-xl text-xs font-mono font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          {isClientLoggedIn && (
            <ArnClientIntakeWidget
              variant="hero-dark"
              onOpenPortalWithSession={onClientPortalClick}
              onScheduleClick={onScheduleClick}
              onWhatsAppClick={onWhatsAppClick}
            />
          )}
        </div>
      </section>

      <ArticleReaderModal
        post={selectedPostForReading}
        onClose={() => setSelectedPostForReading(null)}
        onScheduleClick={() => {
          setSelectedPostForReading(null);
          onScheduleClick();
        }}
        onWhatsAppClick={(txt) => {
          setSelectedPostForReading(null);
          onWhatsAppClick(txt);
        }}
      />

      <PostEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSavePost={handleSavePost}
        postToEdit={null}
      />
    </div>
  );
};
