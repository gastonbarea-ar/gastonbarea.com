import React, { useState } from 'react';
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
} from 'lucide-react';
import { BlogPost } from '../types/blog';
import { INITIAL_BLOG_POSTS } from '../data/blogData';
import { ArticleReaderModal } from './blog/ArticleReaderModal';
import { PostEditorModal } from './blog/PostEditorModal';
import { PageSectionId } from './Header';

interface HomeBlocksViewProps {
  onNavigatePage: (page: PageSectionId, serviceCode?: string) => void;
  onSelectService: (serviceName: string) => void;
  onAskDigitalTwin: (prompt: string) => void;
  onScheduleClick: (context?: string) => void;
  onWhatsAppClick: (customText?: string) => void;
  onClientPortalClick: () => void;
}

export const HomeBlocksView: React.FC<HomeBlocksViewProps> = ({
  onNavigatePage,
  onSelectService,
  onAskDigitalTwin,
  onScheduleClick,
  onWhatsAppClick,
  onClientPortalClick,
}) => {
  // Sync blog posts with localStorage so Home Blog Block and Blog Page share the exact same articles
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

  const coreVerticals = [
    {
      code: '01',
      kicker: 'Ingeniería de Producto · EBTs',
      title: 'Proyectos de Base Tecnológica & Plataformas Digitales',
      summary:
        'Estructuración técnica y desarrollo full-stack (React, Node.js, PostgreSQL) para transformar conocimiento científico o industrial en activos escalables.',
    },
    {
      code: '02',
      kicker: 'Gemelos Digitales · Agentes RAG · BI',
      title: 'IA Services: Arquitecturas Inteligentes & Gemelos Digitales',
      summary:
        'Integración de agentes de IA conectados a sus bases de datos, catálogos y procesos para asesorar clientes y automatizar operaciones 24/7.',
    },
    {
      code: '03',
      kicker: 'Trazabilidad · Telemetría IoT',
      title: 'Proyectos Basados en Bioeconomía & Producción Sostenible',
      summary:
        'Pasaportes digitales de lote, monitoreo IoT de bioprocesos, valorización de biomasa y certificación para mercados internacionales.',
    },
    {
      code: '04',
      kicker: '14 Años Liderando Proyectos con Clientes',
      title: 'Dirección Ejecutiva de Proyectos (PMO Externa)',
      summary:
        'Gobernanza técnica y control de presupuesto por hitos verificables: 40% inicio, 40% validación en servidor Staging y 20% salida a producción.',
    },
    {
      code: '05',
      kicker: 'Cero Costo de Licencias · Mayorista & Minorista',
      title: 'Odoo Community ERP v18 & E-Commerce B2B2C',
      summary:
        'Unificación de producción (MRP), inventario multidepósito, facturación fiscal y portales B2B2C sincronizados en tiempo real.',
    },
    {
      code: '06',
      kicker: '30 Años de Rigor Técnico · Continuidad 24/7',
      title: 'Infraestructura Crítica Linux, Docker & Soberanía de Datos',
      summary:
        'Blindaje de servidores Linux Ubuntu, contenedores Docker aislados, redes privadas WireGuard VPN y copias de seguridad automatizadas.',
    },
  ];

  const featuredPost = posts[0] || INITIAL_BLOG_POSTS[0];
  const secondaryPosts = posts.slice(1, 3);

  return (
    <div className="w-full">
      {/* =====================================================================
          BLOQUE 3: SOLUCIONES & VERTICALES (Diseño Abierto Editorial en Blanco)
         ===================================================================== */}
      <section className="w-full py-20 md:py-28 bg-white text-[#1D1D1F]">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 space-y-14 text-left">
          {/* Block Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-black/[0.08]">
            <div className="space-y-3 max-w-2xl">
              <div className="text-xs font-mono text-[#291B64] font-semibold">
                BLOQUE 01 · SOLUCIONES & ARQUITECTURA
              </div>
              <h2
                className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#1D1D1F] leading-[1.08]"
                style={{ textWrap: 'balance' }}
              >
                Seis verticales de ingeniería para transformar su operación.
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => onNavigatePage('servicios')}
                className="px-6 py-3.5 text-xs font-mono font-bold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Ver Página Completa de Soluciones</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Frameless Architectural Grid (Divided only by subtle hairlines & generous whitespace) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12">
            {coreVerticals.map((item) => (
              <div
                key={item.code}
                onClick={() => onNavigatePage('servicios', item.code)}
                className="group pt-6 border-t border-black/[0.1] hover:border-[#291B64] transition-colors flex flex-col justify-between space-y-6 cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs font-mono">
                    <span className="text-[#291B64] font-bold tabular-nums">{item.code}.</span>
                    <span className="text-[#515154]">{item.kicker}</span>
                  </div>

                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#1D1D1F] group-hover:text-[#291B64] transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-sm text-[#515154] leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2 text-xs font-semibold text-[#291B64]">
                  <span className="group-hover:underline underline-offset-4">
                    Explorar alcance y entregables
                  </span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          BLOQUE 4: IA SERVICES & GEMELO DIGITAL (Bloque Personalizado Violeta Profundo)
         ===================================================================== */}
      <section className="w-full py-20 md:py-28 bg-[#170F3E] text-white">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center text-left">
            {/* Left (7 cols): IA Services Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="text-xs font-mono text-emerald-400 font-semibold">
                BLOQUE 02 · IA SERVICES & GEMELOS DIGITALES CORPORATIVOS
              </div>

              <h2
                className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.08]"
                style={{ textWrap: 'balance' }}
              >
                Convertimos su web y operación en un Gemelo Digital inteligente.
              </h2>

              <p className="text-sm sm:text-base text-neutral-200 leading-relaxed max-w-2xl">
                Esta misma plataforma es un ejemplo real de <strong className="text-white">IA Services</strong>: una arquitectura viva que dialoga con sus clientes, responde consultas técnicas con sus propios documentos (RAG), estructura presupuestos en vivo y se conecta con su CRM y ERP.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-6 border-t border-white/15">
                <div className="space-y-1.5">
                  <div className="font-mono text-2xl sm:text-3xl font-bold text-emerald-400 tabular-nums">
                    24/7
                  </div>
                  <div className="text-sm font-bold text-white">Pre-Ingeniería & Ventas</div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Diagnóstico automático de clientes y enrutamiento hacia la solución ideal.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="font-mono text-2xl sm:text-3xl font-bold text-emerald-400 tabular-nums">
                    RAG + BI
                  </div>
                  <div className="text-sm font-bold text-white">Datos Propios Auditables</div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Agentes conectados a PostgreSQL, catálogos Odoo y manuales industriales.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="font-mono text-2xl sm:text-3xl font-bold text-emerald-400 tabular-nums">
                    3–6 Sem
                  </div>
                  <div className="text-sm font-bold text-white">Despliegue por Hitos</div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    40% Arquitectura, 40% validación en Staging y 20% puesta en producción.
                  </p>
                </div>
              </div>
            </div>

            {/* Right (5 cols): Interactive Structurer Callout (Clean tonal surface, no heavy border) */}
            <div className="lg:col-span-5 p-8 sm:p-10 bg-[#0D0926] space-y-6">
              <div className="text-xs font-mono text-emerald-400">
                HERRAMIENTA EN VIVO · ESTRUCTURADOR DE PROYECTOS
              </div>

              <h3 className="font-display text-2xl font-bold text-white leading-snug">
                Simule ahora la hoja de ruta técnica de su proyecto con IA.
              </h3>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Seleccione el perfil de su organización, el desafío principal y su stack actual para generar al instante fases de trabajo, tiempos y entregables.
              </p>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigatePage('ia-services')}
                  className="w-full px-6 py-4 text-xs sm:text-sm font-mono font-bold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors flex items-center justify-between gap-2 cursor-pointer"
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
                  className="w-full px-6 py-3.5 text-xs font-semibold text-neutral-200 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] rounded-none transition-colors flex items-center justify-between gap-2 cursor-pointer"
                >
                  <span>Solicitar cotización de IA Services</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          BLOQUE 5: BIOECONOMÍA & EVIDENCIA DE IMPACTO (Bloque Orgánico sin Marcos)
         ===================================================================== */}
      <section className="w-full py-20 md:py-28 bg-[#F3F6F4] text-[#1D1D1F]">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 space-y-14 text-left">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="text-xs font-mono text-emerald-900 font-semibold">
                BLOQUE 03 · BIOECONOMÍA, TELEMETRÍA IOT & CASOS REALES
              </div>
              <h2
                className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#1D1D1F] leading-[1.08]"
                style={{ textWrap: 'balance' }}
              >
                Ingeniería digital aplicada a recursos biológicos y producción sostenible.
              </h2>
            </div>

            <button
              type="button"
              onClick={() => onNavigatePage('bioeconomia')}
              className="px-6 py-3.5 text-xs font-mono font-bold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors inline-flex items-center gap-2 cursor-pointer self-start lg:self-auto shrink-0"
            >
              <span>Explorar Bioeconomía y Casos de Éxito</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Large Unframed Impact Metrics + Case Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-6 border-t border-emerald-950/10 items-start">
            <div className="lg:col-span-4 space-y-2">
              <div className="font-display text-4xl sm:text-5xl font-bold text-[#291B64] tabular-nums">
                -42%
              </div>
              <div className="text-base font-bold text-[#1D1D1F]">
                Reducción de mermas operativas en planta
              </div>
              <p className="text-xs sm:text-sm text-[#515154] leading-relaxed">
                Integración de sensores IoT, balanzas en línea y PostgreSQL para controlar el rendimiento de transformación de biomasa en tiempo real.
              </p>
            </div>

            <div className="lg:col-span-4 space-y-2">
              <div className="font-display text-4xl sm:text-5xl font-bold text-emerald-900 tabular-nums">
                100%
              </div>
              <div className="text-base font-bold text-[#1D1D1F]">
                Trazabilidad digital de origen a destino
              </div>
              <p className="text-xs sm:text-sm text-[#515154] leading-relaxed">
                Pasaportes digitales de lote para cadenas agroindustriales, forestales y pesqueras listos para auditorías ESG y exportación.
              </p>
            </div>

            <div className="lg:col-span-4 space-y-2">
              <div className="font-display text-4xl sm:text-5xl font-bold text-[#291B64] tabular-nums">
                +165%
              </div>
              <div className="text-base font-bold text-[#1D1D1F]">
                Pedidos B2B autogestionados con Odoo v18
              </div>
              <p className="text-xs sm:text-sm text-[#515154] leading-relaxed">
                Sincronización de stock multidepósito y listas de precios mayoristas sin costos perpetuos de licencias por usuario.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          BLOQUE 6: TRAYECTORIA 30 AÑOS TECH · 14 AÑOS PMO (Bloque Editorial Limpio)
         ===================================================================== */}
      <section className="w-full py-20 md:py-28 bg-white text-[#1D1D1F]">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start text-left">
            <div className="lg:col-span-5 space-y-5">
              <div className="text-xs font-mono text-[#291B64] font-semibold">
                BLOQUE 04 · RESPALDO & DIRECCIÓN EJECUTIVA
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
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigatePage('trayectoria')}
                  className="px-6 py-3.5 text-xs font-mono font-bold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Ver Trayectoria Completa (1996–2026)</span>
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

            {/* Right (7 cols): Open Chronological Stream (No boxes, just clean horizontal hairlines) */}
            <div className="lg:col-span-7 divide-y divide-black/[0.08] border-t border-b border-black/[0.08]">
              <div className="py-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-baseline">
                <div className="sm:col-span-3 font-mono text-xs font-bold text-[#291B64] tabular-nums">
                  1996 – 2012
                </div>
                <div className="sm:col-span-9 space-y-1">
                  <h3 className="font-display text-lg font-bold text-[#1D1D1F]">
                    Cimientos en Ingeniería de Sistemas, Linux y Redes Productivas
                  </h3>
                  <p className="text-xs sm:text-sm text-[#515154] leading-relaxed">
                    Automatización operativa, servidores críticos y conectividad para industrias, cooperativas y organismos regionales.
                  </p>
                </div>
              </div>

              <div className="py-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-baseline">
                <div className="sm:col-span-3 font-mono text-xs font-bold text-[#291B64] tabular-nums">
                  2012 – 2021
                </div>
                <div className="sm:col-span-9 space-y-1">
                  <h3 className="font-display text-lg font-bold text-[#1D1D1F]">
                    Dirección Ejecutiva PMO con Clientes, PostgreSQL & Sistemas ERP
                  </h3>
                  <p className="text-xs sm:text-sm text-[#515154] leading-relaxed">
                    Liderazgo directo de proyectos complejos junto a directorios y equipos técnicos, garantizando plazos y retorno de inversión.
                  </p>
                </div>
              </div>

              <div className="py-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-baseline">
                <div className="sm:col-span-3 font-mono text-xs font-bold text-emerald-800 tabular-nums">
                  2021 – 2026
                </div>
                <div className="sm:col-span-9 space-y-1">
                  <h3 className="font-display text-lg font-bold text-[#1D1D1F]">
                    Base Tecnológica (EBTs), IA Services, Bioeconomía & Odoo v18
                  </h3>
                  <p className="text-xs sm:text-sm text-[#515154] leading-relaxed">
                    Despliegue de Gemelos Digitales corporativos, trazabilidad bioeconómica con IoT y plataformas B2B2C de alto rendimiento.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          BLOQUE 7: BLOG & PUBLICACIONES DESTACADAS (Restaurado y Personalizado en Home)
         ===================================================================== */}
      <section className="w-full py-20 md:py-28 bg-[#F7F7FA] text-[#1D1D1F]">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 space-y-12 text-left">
          {/* Blog Block Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-black/[0.08]">
            <div className="space-y-3 max-w-2xl">
              <div className="text-xs font-mono text-[#291B64] font-semibold">
                BLOQUE 05 · BLOG & PUBLICACIONES DE GASTÓN BAREA
              </div>
              <h2
                className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#1D1D1F] leading-[1.08]"
                style={{ textWrap: 'balance' }}
              >
                Artículos, análisis técnico y notas sobre bioeconomía e IA.
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditorOpen(true)}
                className="px-4 py-3 text-xs font-mono font-semibold text-[#1D1D1F] bg-white hover:bg-black/[0.05] rounded-none transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-[#291B64]" />
                <span>Nueva Publicación</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigatePage('blog')}
                className="px-6 py-3.5 text-xs font-mono font-bold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Abrir Página Completa del Blog ({posts.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Editorial Magazine Split: Featured Article (7 cols) + Recent Articles (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            {/* Featured Lead Article */}
            {featuredPost && (
              <article
                onClick={() => setSelectedPostForReading(featuredPost)}
                className="lg:col-span-7 p-8 sm:p-10 bg-white flex flex-col justify-between space-y-8 cursor-pointer group hover:bg-[#120D2B] hover:text-white transition-colors"
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#291B64] group-hover:text-emerald-400">
                    <span className="font-bold">DESTACADO DEL BLOG</span>
                    <span aria-hidden="true">·</span>
                    <span>{featuredPost.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{featuredPost.publishedAt}</span>
                    <span aria-hidden="true">·</span>
                    <span>{featuredPost.readTime}</span>
                  </div>

                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#1D1D1F] group-hover:text-white leading-tight transition-colors">
                    {featuredPost.title}
                  </h3>

                  <p className="text-sm sm:text-base text-[#515154] group-hover:text-neutral-300 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="pt-6 border-t border-black/[0.08] group-hover:border-white/15 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-xs font-mono text-[#515154] group-hover:text-neutral-300">
                    <span className="inline-flex items-center gap-1.5 text-[#291B64] group-hover:text-emerald-400 font-semibold">
                      <Play className="w-3.5 h-3.5" />
                      <span>Incluye Video YouTube</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Por {featuredPost.author.name}</span>
                  </div>

                  <span className="text-xs font-mono font-bold text-[#291B64] group-hover:text-white inline-flex items-center gap-1.5">
                    <span>Leer artículo completo</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </article>
            )}

            {/* Right Column: Secondary Articles List (Clean unframed stack) */}
            <div className="lg:col-span-5 flex flex-col justify-between divide-y divide-black/[0.08] bg-white p-6 sm:p-8">
              <div className="space-y-6">
                <div className="text-xs font-mono font-bold text-[#515154]">
                  ÚLTIMAS PUBLICACIONES EJECUTIVAS
                </div>

                <div className="divide-y divide-black/[0.08]">
                  {secondaryPosts.map((post, idx) => (
                    <article
                      key={post.id}
                      onClick={() => setSelectedPostForReading(post)}
                      className="py-5 first:pt-0 last:pb-0 group cursor-pointer space-y-2"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#515154]">
                        <span className="text-[#291B64] font-semibold">{post.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{post.publishedAt}</span>
                        <span aria-hidden="true">·</span>
                        <span>{post.readTime}</span>
                      </div>

                      <h4 className="font-display text-lg font-bold text-[#1D1D1F] group-hover:text-[#291B64] transition-colors leading-snug">
                        0{idx + 2}. {post.title}
                      </h4>

                      <p className="text-xs text-[#515154] line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-black/[0.08] flex items-center justify-between">
                <span className="text-xs text-[#515154]">
                  ¿Querés explorar todos los artículos o filtrar por temática?
                </span>
                <button
                  type="button"
                  onClick={() => onNavigatePage('blog')}
                  className="text-xs font-mono font-bold text-[#291B64] hover:underline inline-flex items-center gap-1 cursor-pointer shrink-0"
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
          BLOQUE 8: CONTACTO EJECUTIVO DIRECTO (Cierre Limpio en Negro/Violeta)
         ===================================================================== */}
      <section className="w-full py-20 md:py-24 bg-[#0A0A0E] text-white">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 text-left">
            <div className="space-y-3 max-w-2xl">
              <div className="text-xs font-mono text-emerald-400 font-semibold">
                BLOQUE 06 · CONTACTO DIRECTO & PROTOCOLO NDA
              </div>
              <h2
                className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight"
                style={{ textWrap: 'balance' }}
              >
                ¿Listo para evaluar su proyecto tecnológico, de IA Services o bioeconomía?
              </h2>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Coordine una videollamada ejecutiva de 30 minutos por Google Meet Pro o abra la página de Contacto para enviar los requerimientos bajo acuerdo de confidencialidad.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => onScheduleClick('Sesión Ejecutiva desde Bloque de Cierre Home')}
                className="px-6 py-4 text-xs sm:text-sm font-mono font-bold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Video className="w-4 h-4 text-emerald-300" />
                <span>Agendar Google Meet Pro (30m)</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigatePage('contacto')}
                className="px-6 py-4 text-xs sm:text-sm font-mono font-bold text-white bg-white/10 hover:bg-white/20 rounded-none transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Abrir Página de Contacto & Formulario</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onWhatsAppClick()}
                className="px-5 py-4 text-xs font-mono font-semibold text-neutral-300 hover:text-white underline underline-offset-4 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Directo</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modals for reading or creating Blog posts directly from the Home Blog Block */}
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
