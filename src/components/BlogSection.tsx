import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  PlusCircle,
  Video,
  Music,
  Headphones,
  Image as ImageIcon,
  ArrowRight,
  Sparkles,
  Calendar,
  Clock,
  Edit,
  Trash2,
  Lock,
  Tag
} from 'lucide-react';
import { BlogPost, BlogCategory } from '../types/blog';
import { INITIAL_BLOG_POSTS } from '../data/blogData';
import { PostEditorModal } from './blog/PostEditorModal';
import { ArticleReaderModal } from './blog/ArticleReaderModal';
import { OSWindowFrame } from './common/OSWindowFrame';

interface BlogSectionProps {
  onScheduleClick: () => void;
  onWhatsAppClick: (customText?: string) => void;
}

const CATEGORIES: ('Todos' | BlogCategory)[] = [
  'Todos',
  'Innovación & Negocios',
  'Operaciones con IA',
  'Modern Tech Stack',
  'Infraestructura & Linux',
];

export const BlogSection: React.FC<BlogSectionProps> = ({
  onScheduleClick,
  onWhatsAppClick,
}) => {
  const [posts, setPosts] = useState<BlogPost[]>(() => {
    try {
      const saved = localStorage.getItem('gb_blog_posts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // fallback
    }
    return INITIAL_BLOG_POSTS;
  });

  const [activeCategory, setActiveCategory] = useState<'Todos' | BlogCategory>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals state
  const [selectedPostForReading, setSelectedPostForReading] = useState<BlogPost | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [postToEdit, setPostToEdit] = useState<BlogPost | null>(null);

  // Sync to localStorage
  const savePosts = (newPosts: BlogPost[]) => {
    setPosts(newPosts);
    try {
      localStorage.setItem('gb_blog_posts', JSON.stringify(newPosts));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSavePost = (newPost: BlogPost) => {
    const existingIndex = posts.findIndex((p) => p.id === newPost.id);
    let updated: BlogPost[];
    if (existingIndex >= 0) {
      updated = [...posts];
      updated[existingIndex] = newPost;
    } else {
      updated = [newPost, ...posts];
    }
    savePosts(updated);
  };

  const handleDeletePost = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Deseas eliminar este artículo permanentemente?')) {
      const updated = posts.filter((p) => p.id !== id);
      savePosts(updated);
    }
  };

  const handleOpenEdit = (post: BlogPost, e: React.MouseEvent) => {
    e.stopPropagation();
    setPostToEdit(post);
    setIsEditorOpen(true);
  };

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesCategory = activeCategory === 'Todos' || post.category === activeCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query) ||
      (post.tags && post.tags.some((t) => t.toLowerCase().includes(query)));
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="blog" className="py-24 md:py-32 bg-[#F4F4F4] relative border-b border-blue-900/10">
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-2 sm:px-4 md:px-6 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-xs text-xs font-mono font-semibold">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>PUBLICACIONES & ANÁLISIS TÉCNICOS</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-blue-950 leading-tight mt-3">
              Ingeniería, Negocios y Arquitectura Digital.
            </h2>
            <p className="text-base sm:text-lg text-slate-700 mt-2 font-normal">
              Análisis pragmáticos, podcasts en Spotify, videos de arquitectura y notas técnicas redactadas exclusivamente por Gastón Barea.
            </p>
          </div>

          {/* Author Publishing CTA Button */}
          <div className="shrink-0 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setPostToEdit(null);
                setIsEditorOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-600/25 cursor-pointer transition-all font-mono"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publicar Artículo (Autor)</span>
            </button>
          </div>
        </div>

        {/* FUNCTIONAL OS WINDOW: BLOG FEED */}
        <OSWindowFrame
          accentTheme="amber"
          processName="sys/media/multimedia-blog-feed.rss"
          windowTitle="BLOG TÉCNICO MULTIMEDIA · GASTÓN BAREA (AUTOR ÚNICO)"
          securityBadge="AUTH GASTÓN BAREA"
          statusBadge="POSTS FEED ACTIVE"
          portBadge="RSS 2.0 · SUPABASE RLS"
          className="my-0 px-0"
          footerTelemetry={[
            { label: 'TOTAL_ARTICLES', value: `${posts.length} Publicaciones`, highlight: true },
            { label: 'MEDIA_TYPES', value: 'TEXTO, YOUTUBE, SPOTIFY, FOTOS' },
            { label: 'AUTHOR', value: 'GASTÓN BAREA' },
          ]}
        >
          <div className="p-4 sm:p-6 md:p-8 bg-slate-950/98 space-y-8">

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-white/10">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30 border border-amber-400/40'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por tema o tecnología..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

        </div>

        {/* Articles Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/80 rounded-2xl border border-white/10 p-8">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white font-mono">No se encontraron artículos</h3>
            <p className="text-xs text-slate-400 mt-1">Prueba con otra palabra clave o selecciona otra categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => {
              // Detect what media types exist in this post
              const hasVideo = post.blocks.some((b) => b.type === 'youtube');
              const hasSpotify = post.blocks.some((b) => b.type === 'spotify');
              const hasAudio = post.blocks.some((b) => b.type === 'audio');
              const hasImages = post.blocks.some((b) => b.type === 'image');

              return (
                <article
                  key={post.id}
                  onClick={() => setSelectedPostForReading(post)}
                  className="rounded-2xl bg-slate-900/90 border border-white/10 shadow-lg hover:shadow-2xl hover:border-amber-400/50 hover:shadow-amber-500/5 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer group"
                >
                  {/* Card Cover */}
                  <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden">
                    {post.coverImage ? (
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-slate-950 to-amber-950/40 flex items-center justify-center text-slate-600">
                        <BookOpen className="w-12 h-12" />
                      </div>
                    )}
                    
                    {/* Category pill */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-md bg-slate-900/90 backdrop-blur-md text-[10px] font-mono font-bold text-amber-300 border border-amber-500/30 shadow-xs">
                        {post.category}
                      </span>
                    </div>

                    {/* Multimedia Badges Overlay */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                      {hasVideo && (
                        <span className="p-1 rounded bg-black/70 backdrop-blur-md text-red-400 border border-red-500/30" title="Incluye Video YouTube">
                          <Video className="w-3.5 h-3.5" />
                        </span>
                      )}
                      {hasSpotify && (
                        <span className="p-1 rounded bg-black/70 backdrop-blur-md text-emerald-400 border border-emerald-500/30" title="Incluye Podcast Spotify">
                          <Music className="w-3.5 h-3.5" />
                        </span>
                      )}
                      {hasAudio && (
                        <span className="p-1 rounded bg-black/70 backdrop-blur-md text-sky-400 border border-sky-500/30" title="Incluye Nota de Audio">
                          <Headphones className="w-3.5 h-3.5" />
                        </span>
                      )}
                      {hasImages && (
                        <span className="p-1 rounded bg-black/70 backdrop-blur-md text-violet-300 border border-violet-500/30" title="Incluye Diagramas / Fotos">
                          <ImageIcon className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    {/* Author management controls (hover) */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => handleOpenEdit(post, e)}
                        className="p-1.5 rounded-lg bg-black/80 hover:bg-blue-600 text-white border border-white/20 transition-colors cursor-pointer"
                        title="Editar post"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeletePost(post.id, e)}
                        className="p-1.5 rounded-lg bg-black/80 hover:bg-rose-600 text-white border border-white/20 transition-colors cursor-pointer"
                        title="Eliminar post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      {/* Date & read time */}
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                        <span>{post.publishedAt}</span>
                        <span>·</span>
                        <span>{post.readTime}</span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    {/* Footer strip: Author and Read CTA */}
                    <div className="pt-3.5 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-amber-600 text-white flex items-center justify-center font-bold font-mono text-[10px]">
                          GB
                        </div>
                        <span className="text-xs font-mono font-semibold text-slate-300">Gastón Barea</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Leer</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                  </div>
                </article>
              );
            })}
          </div>
        )}
          </div>
        </OSWindowFrame>

      </div>

      {/* Reader Modal */}
      <ArticleReaderModal
        post={selectedPostForReading}
        onClose={() => setSelectedPostForReading(null)}
        onScheduleClick={onScheduleClick}
        onWhatsAppClick={onWhatsAppClick}
      />

      {/* Post Editor Modal (Only Gastón) */}
      <PostEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setPostToEdit(null);
        }}
        onSavePost={handleSavePost}
        postToEdit={postToEdit}
      />
    </section>
  );
};
