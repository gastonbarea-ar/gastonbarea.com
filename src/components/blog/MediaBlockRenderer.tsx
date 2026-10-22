import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ExternalLink,
  Copy,
  Check,
  Maximize2,
  Info,
  Sparkles,
  AlertTriangle,
  Quote as QuoteIcon,
  Headphones,
  Music
} from 'lucide-react';
import { MediaBlock } from '../../types/blog';

interface MediaBlockRendererProps {
  block: MediaBlock;
}

export const MediaBlockRenderer: React.FC<MediaBlockRendererProps> = ({ block }) => {
  switch (block.type) {
    case 'heading': {
      if (block.level === 3) {
        return (
          <h3 className="text-xl sm:text-2xl font-bold text-blue-950 mt-8 mb-4 tracking-tight">
            {block.text}
          </h3>
        );
      }
      return (
        <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-950 mt-10 mb-4 tracking-tight pb-2 border-b border-blue-900/10">
          {block.text}
        </h2>
      );
    }

    case 'paragraph': {
      return (
        <p className="text-base sm:text-lg text-slate-800 leading-relaxed my-4 font-normal [text-wrap:pretty]">
          {block.content}
        </p>
      );
    }

    case 'youtube': {
      // Extract video ID from URL or accept raw 11-char ID
      const extractVideoId = (input: string): string => {
        const trimmed = (input || '').trim();
        const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/;
        const match = trimmed.match(regExp);
        if (match && match[1]) return match[1];
        if (trimmed.length === 11 && !trimmed.includes('/')) return trimmed;
        return trimmed || 'L_LUpnjgPso';
      };

      const videoId = extractVideoId(block.videoIdOrUrl);

      return (
        <figure className="my-8 rounded-2xl overflow-hidden border border-blue-900/15 bg-slate-950 shadow-lg shadow-blue-950/5">
          <div className="relative aspect-video w-full bg-slate-900">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
              title={block.caption || 'Video de presentación de arquitectura'}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          {block.caption && (
            <figcaption className="px-4 py-2.5 bg-slate-900 text-xs text-slate-300 font-mono flex items-center justify-between border-t border-slate-800">
              <span>{block.caption}</span>
              <span className="text-[10px] text-sky-400">YouTube Video</span>
            </figcaption>
          )}
        </figure>
      );
    }

    case 'spotify': {
      // Convert Spotify standard URL to embed URL
      // E.g.: https://open.spotify.com/episode/7G5M12jG2E49o8Rk1K9f3G -> https://open.spotify.com/embed/episode/7G5M12jG2E49o8Rk1K9f3G
      const getSpotifyEmbedUrl = (input: string): string => {
        let trimmed = (input || '').trim();
        if (trimmed.includes('spotify.com/embed/')) return trimmed;
        if (trimmed.includes('spotify.com/')) {
          return trimmed.replace('spotify.com/', 'spotify.com/embed/');
        }
        if (trimmed.startsWith('spotify:')) {
          const parts = trimmed.split(':');
          if (parts.length >= 3) {
            return `https://open.spotify.com/embed/${parts[1]}/${parts[2]}`;
          }
        }
        return `https://open.spotify.com/embed/episode/7G5M12jG2E49o8Rk1K9f3G`;
      };

      const embedUrl = getSpotifyEmbedUrl(block.spotifyUrlOrUri);

      return (
        <div className="my-8 p-1.5 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-blue-950 border border-emerald-500/30 shadow-md">
          <div className="flex items-center justify-between px-3 py-2 text-white text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Music className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-emerald-300">Spotify Audio Player</span>
            </div>
            {block.caption && <span className="text-slate-400 text-[11px] truncate">{block.caption}</span>}
          </div>
          <iframe
            src={embedUrl}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-xl shadow-xs"
            title="Spotify Embed Player"
          />
        </div>
      );
    }

    case 'audio': {
      return <CustomAudioBlock block={block} />;
    }

    case 'image': {
      return <ImageZoomBlock block={block} />;
    }

    case 'callout': {
      const toneStyles = {
        info: 'bg-blue-50/80 border-blue-400 text-blue-950',
        highlight: 'bg-indigo-50/80 border-indigo-500 text-indigo-950',
        warning: 'bg-amber-50/80 border-amber-400 text-amber-950',
      };

      const Icon =
        block.tone === 'warning'
          ? AlertTriangle
          : block.tone === 'highlight'
          ? Sparkles
          : Info;

      return (
        <div
          className={`my-6 p-5 sm:p-6 rounded-2xl border-l-4 border shadow-2xs space-y-2 ${
            toneStyles[block.tone || 'info']
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider">
            <Icon className="w-4 h-4 shrink-0" />
            <span>{block.title}</span>
          </div>
          <div className="text-sm sm:text-base leading-relaxed opacity-90">
            {block.content}
          </div>
        </div>
      );
    }

    case 'quote': {
      return (
        <blockquote className="my-8 relative pl-6 sm:pl-8 border-l-4 border-blue-600 italic text-slate-800 text-lg sm:text-xl font-medium leading-relaxed bg-blue-50/40 py-4 pr-6 rounded-r-2xl">
          <QuoteIcon className="w-6 h-6 text-blue-400/60 mb-2 not-italic" />
          <p className="not-italic font-serif">{block.quote}</p>
          {block.author && (
            <footer className="mt-3 text-xs sm:text-sm font-mono not-italic font-bold text-blue-900 flex items-center gap-2">
              <span className="w-4 h-0.5 bg-blue-600" />
              <span>{block.author}</span>
            </footer>
          )}
        </blockquote>
      );
    }

    case 'code': {
      return <CodeBlockView block={block} />;
    }

    default:
      return null;
  }
};

/**
 * Custom Native Audio Player with Scrubbing, Time Tracking, and Volume Toggle
 */
const CustomAudioBlock: React.FC<{ block: any }> = ({ block }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((e) => console.error(e));
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  return (
    <div className="my-8 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-5 sm:p-6 border border-blue-800/40 shadow-lg shadow-blue-950/10">
      <audio
        ref={audioRef}
        src={block.audioUrl}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-sky-400 shrink-0">
            <Headphones className="w-5 h-5" />
          </span>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold">
              AUDIO TÉCNICO EXCLUSIVO
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
              {block.title || 'Nota de voz explicativa'}
            </h4>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.muted = !isMuted;
              setIsMuted(!isMuted);
            }
          }}
          className="text-slate-400 hover:text-white p-1.5 self-end sm:self-auto cursor-pointer"
          title="Silenciar / Activar sonido"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Scrubber and Controls */}
      <div className="space-y-2">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none"
        />

        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-white" />
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Reproducir Audio</span>
                </>
              )}
            </button>
          </div>
          <span>{block.duration || formatTime(duration)}</span>
        </div>
      </div>

      {block.caption && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
          {block.caption}
        </div>
      )}
    </div>
  );
};

/**
 * Image Block with Lightbox Zoom
 */
const ImageZoomBlock: React.FC<{ block: any }> = ({ block }) => {
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  return (
    <>
      <figure className="my-8 group">
        <div
          className="relative rounded-2xl overflow-hidden border border-blue-900/10 shadow-md bg-slate-100 cursor-zoom-in"
          onClick={() => setIsZoomed(true)}
        >
          <img
            src={block.imageUrl}
            alt={block.alt || block.caption || 'Foto del artículo'}
            className="w-full h-auto object-cover max-h-[500px] group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute bottom-3 right-3 p-2 rounded-lg bg-black/60 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <Maximize2 className="w-4 h-4" />
          </div>
        </div>
        {block.caption && (
          <figcaption className="mt-2.5 text-center text-xs text-slate-500 font-mono">
            {block.caption}
          </figcaption>
        )}
      </figure>

      {/* Lightbox Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200 cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <div className="max-w-5xl max-h-[90vh] flex flex-col items-center">
            <img
              src={block.imageUrl}
              alt={block.alt || 'Vista ampliada'}
              className="max-w-full max-h-[80vh] rounded-xl object-contain shadow-2xl"
            />
            {block.caption && (
              <p className="text-white text-xs sm:text-sm font-mono mt-4 text-center">
                {block.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

/**
 * Code Block with One-Click Copy
 */
const CodeBlockView: React.FC<{ block: any }> = ({ block }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(block.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-200 font-mono text-xs sm:text-sm shadow-md">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-slate-400">
        <span className="uppercase text-[11px] font-bold text-sky-400">{block.language || 'typescript'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copiado' : 'Copiar'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sky-300 leading-relaxed">
        <code>{block.code}</code>
      </pre>
    </div>
  );
};
