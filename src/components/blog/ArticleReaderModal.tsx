import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Bookmark,
  Check,
  Linkedin,
  Twitter,
  MessageCircle,
  Copy,
  Sparkles,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { BlogPost } from '../../types/blog';
import { MediaBlockRenderer } from './MediaBlockRenderer';
import { SITE_CONFIG } from '../../data/siteConfig';

interface ArticleReaderModalProps {
  post: BlogPost | null;
  onClose: () => void;
  onScheduleClick: () => void;
  onWhatsAppClick: (customText?: string) => void;
}

export const ArticleReaderModal: React.FC<ArticleReaderModalProps> = ({
  post,
  onClose,
  onScheduleClick,
  onWhatsAppClick,
}) => {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    if (!post) return;

    // Prevent body scrolling when reader is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [post]);

  if (!post) return null;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
    setScrollProgress(Math.min(100, Math.max(0, progress)));
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/#blog/${post.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `Te comparto este análisis técnico de Gastón Barea: "${post.title}" - ${window.location.origin}/#blog/${post.slug}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    const url = `${window.location.origin}/#blog/${post.slug}`;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };

  const handleShareTwitter = () => {
    const text = `Leyendo "${post.title}" por @gastonbarea`;
    const url = `${window.location.origin}/#blog/${post.slug}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col justify-start overflow-hidden animate-in fade-in duration-200">
      
      {/* Top Header Sticky Bar */}
      <header className="w-full bg-white/95 backdrop-blur-xl border-b border-blue-900/10 px-4 sm:px-8 py-3 flex items-center justify-between gap-4 z-20 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-blue-950 hover:text-blue-600 transition-colors py-1 px-3 rounded-full bg-slate-100 hover:bg-blue-50 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Blog</span>
        </button>

        <div className="hidden md:flex items-center gap-2 max-w-md truncate text-xs font-mono text-slate-500">
          <span className="font-bold text-blue-700">{post.category}</span>
          <span>·</span>
          <span className="truncate">{post.title}</span>
        </div>

        {/* Share buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Copiar enlace"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="p-2 rounded-full hover:bg-emerald-50 text-emerald-600 transition-colors cursor-pointer"
            title="Compartir en WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleShareLinkedIn}
            className="p-2 rounded-full hover:bg-blue-50 text-blue-700 transition-colors cursor-pointer"
            title="Compartir en LinkedIn"
          >
            <Linkedin className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onScheduleClick}
            className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-all shadow-xs cursor-pointer"
          >
            Agendar Reunión (30m)
          </button>
        </div>
      </header>

      {/* Reading Progress Line */}
      <div className="w-full h-1 bg-slate-200">
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-400 transition-all duration-75"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Scrollable Article Body */}
      <div
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6"
      >
        <article className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 overflow-hidden">
          
          {/* Cover Image if present */}
          {post.coverImage && (
            <div className="relative aspect-[21/9] w-full overflow-hidden bg-slate-900">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          )}

          <div className="p-6 sm:p-12 space-y-6">
            
            {/* Metadata Badge */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold border border-blue-200">
                {post.category}
              </span>
              <span className="text-slate-400">·</span>
              <span className="flex items-center gap-1 text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                {post.publishedAt}
              </span>
              <span className="text-slate-400">·</span>
              <span className="flex items-center gap-1 text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                {post.readTime} de lectura
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-blue-950 tracking-tight leading-[1.15] [text-wrap:balance]">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed border-l-4 border-blue-500 pl-4 py-1 italic">
              {post.excerpt}
            </p>

            {/* Author Profile Strip */}
            <div className="flex items-center justify-between py-4 border-y border-slate-100 my-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-700 to-blue-900 text-white flex items-center justify-center font-bold font-mono text-sm shadow-xs">
                  GB
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{post.author.name}</span>
                    <span className="text-blue-600 text-xs font-normal">· Autor Único</span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    {post.author.role} · Patagonia Argentina
                  </div>
                </div>
              </div>
            </div>

            {/* Multimedia Content Stream */}
            <div className="pt-2">
              {post.blocks.map((block) => (
                <MediaBlockRenderer key={block.id} block={block} />
              ))}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="pt-8 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-slate-400 mr-2 font-bold">TAGS:</span>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-mono font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Bottom Executive CTA Box */}
            <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-sky-400 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>CONSULTORÍA DIRECTA CON GASTÓN BAREA</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                ¿Quieres implementar esta arquitectura o evaluar la viabilidad de tu caso?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Revisemos tu infraestructura actual, cuellos de botella y oportunidades de nuevos ingresos en una llamada técnica de 30 minutos sin cargo.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onScheduleClick}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <span>Agendar Consulta de 30 min</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onWhatsAppClick(
                      `Hola Gastón, leí tu artículo "${post.title}" y me gustaría consultarte cómo podemos aplicar este enfoque en nuestra organización.`
                    )
                  }
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  WhatsApp Directo
                </button>
              </div>
            </div>

          </div>
        </article>
      </div>

    </div>
  );
};
