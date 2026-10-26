import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Check,
  Linkedin,
  MessageCircle,
  Copy,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { BlogPost } from '../../types/blog';
import { MediaBlockRenderer } from './MediaBlockRenderer';

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
    const url = `${window.location.origin}/#blog`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `Te comparto este análisis técnico de Gastón Barea: "${post.title}" - ${window.location.origin}/#blog`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    const url = `${window.location.origin}/#blog`;
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-start overflow-hidden">
      {/* Top Header Sticky Bar */}
      <header className="w-full bg-white border-b border-black/[0.08] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 z-20 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#1D1D1F] hover:text-white py-2 px-4 rounded-none bg-[#F5F5F7] hover:bg-[#291B64] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Publicaciones</span>
        </button>

        <div className="hidden md:flex items-center gap-2 max-w-md truncate text-xs font-mono text-slate-500">
          <span className="font-bold text-[#291B64]">{post.category}</span>
          <span>·</span>
          <span className="truncate">{post.title}</span>
        </div>

        {/* Share & Schedule buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="p-2 rounded-none hover:bg-[#F5F5F7] text-slate-700 transition-colors cursor-pointer"
            title="Copiar enlace"
          >
            {copiedLink ? (
              <Check className="w-4 h-4 text-emerald-700" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="p-2 rounded-none hover:bg-[#F5F5F7] text-emerald-800 transition-colors cursor-pointer"
            title="Compartir en WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleShareLinkedIn}
            className="p-2 rounded-none hover:bg-[#F5F5F7] text-[#291B64] transition-colors cursor-pointer"
            title="Compartir en LinkedIn"
          >
            <Linkedin className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onScheduleClick}
            className="hidden sm:inline-flex px-4 py-2 text-xs font-mono font-bold text-white bg-[#291B64] hover:bg-[#382586] rounded-none transition-colors cursor-pointer"
          >
            Agendar Meet Pro (30m)
          </button>
        </div>
      </header>

      {/* Reading Progress Line */}
      <div className="w-full h-1 bg-slate-200">
        <div
          className="h-full bg-[#291B64] transition-all duration-75"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Scrollable Article Body */}
      <div
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto bg-[#F7F7FA] py-8 sm:py-12 px-4 sm:px-6"
      >
        <article className="max-w-3xl mx-auto bg-white rounded-none overflow-hidden text-left">
          {post.coverImage && (
            <div className="relative aspect-[21/9] w-full overflow-hidden bg-slate-900">
              <img
                src={post.coverImage}
                alt={post.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 sm:p-12 space-y-6">
            {/* Unboxed Metadata */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono text-slate-500">
              <span className="text-[#291B64] font-bold">{post.category}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {post.publishedAt}
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readTime} de lectura
              </span>
            </div>

            {/* Title */}
            <h1
              className="font-display text-2xl sm:text-4xl font-bold text-[#1D1D1F] tracking-tight leading-[1.15]"
              style={{ textWrap: 'balance' }}
            >
              {post.title}
            </h1>

            {/* Excerpt (No border-l-4, clean tonal surface) */}
            <p className="text-base sm:text-lg text-[#515154] leading-relaxed p-5 bg-[#F7F7FA]">
              {post.excerpt}
            </p>

            {/* Author Profile Strip */}
            <div className="flex items-center justify-between py-4 border-y border-black/[0.08] my-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-none bg-[#291B64] text-white flex items-center justify-center font-bold font-mono text-sm">
                  GB
                </div>
                <div>
                  <div className="text-sm font-bold text-[#1D1D1F] flex items-center gap-1.5">
                    <span>{post.author.name}</span>
                    <span className="text-[#291B64] text-xs font-mono">
                      · 30 Años Tech · 14 Años PMO
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    {post.author.role}
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

            {/* Unboxed Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="pt-6 border-t border-black/[0.08] flex flex-wrap items-center gap-3 text-xs font-mono text-slate-500">
                <span className="font-bold text-[#1D1D1F]">Temáticas:</span>
                {post.tags.map((tag, idx) => (
                  <React.Fragment key={tag}>
                    {idx > 0 && <span aria-hidden="true">·</span>}
                    <span>#{tag}</span>
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Bottom Executive CTA Block */}
            <div className="mt-10 p-6 sm:p-8 rounded-none bg-[#160E3B] text-white space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>CONSULTORÍA DIRECTA CON GASTÓN BAREA</span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white">
                ¿Quiere implementar esta arquitectura o evaluar la viabilidad de su caso?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl">
                Revisemos su operación actual, cuellos de botella y oportunidades de escala en una sesión técnica de 30 minutos por Google Meet Pro.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onScheduleClick}
                  className="px-5 py-3 rounded-none bg-[#291B64] hover:bg-[#382586] text-white font-mono font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Agendar Google Meet Pro (30m)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onWhatsAppClick(
                      `Hola Gastón, leí tu artículo "${post.title}" en el Blog y me gustaría consultarte cómo podemos aplicar este enfoque en nuestra organización.`
                    )
                  }
                  className="px-4 py-3 rounded-none bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors cursor-pointer"
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
