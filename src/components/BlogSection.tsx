import React, { useState } from 'react';
import {
  Search,
  PlusCircle,
  ArrowRight,
  Edit,
  Trash2,
  Play,
  BookOpen,
} from 'lucide-react';
import { BlogPost, BlogCategory } from '../types/blog';
import { INITIAL_BLOG_POSTS } from '../data/blogData';
import { PostEditorModal } from './blog/PostEditorModal';
import { ArticleReaderModal } from './blog/ArticleReaderModal';

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

  const [activeCategory, setActiveCategory] = useState<'Todos' | BlogCategory>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPostForReading, setSelectedPostForReading] = useState<BlogPost | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [postToEdit, setPostToEdit] = useState<BlogPost | null>(null);

  const savePosts = (newPosts: BlogPost[]) => {
    setPosts(newPosts);
    try {
      localStorage.setItem('gb_blog_posts_v2', JSON.stringify(newPosts));
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
    const updated = posts.filter((p) => p.id !== id);
    savePosts(updated);
  };

  const handleOpenEdit = (post: BlogPost, e: React.MouseEvent) => {
    e.stopPropagation();
    setPostToEdit(post);
    setIsEditorOpen(true);
  };

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

  const featuredArticle =
    activeCategory === 'Todos' && !searchQuery.trim()
      ? filteredPosts.find((p) => p.featured) || filteredPosts[0]
      : null;

  return (
    <section id="blog" className="w-full bg-white scroll-mt-16">
      {/* Top Editorial Banner Block (Frameless) */}
      <div className="w-full py-16 md:py-20 bg-[#130D33] text-white">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8 text-left">
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold">
              <BookOpen className="w-4 h-4" />
              <span>BLOG & PUBLICACIONES EJECUTIVAS · GASTÓN BAREA</span>
            </div>
            <h1
              className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.08]"
              style={{ textWrap: 'balance' }}
            >
              Perspectivas sobre tecnología productiva, IA Services, bioeconomía y dirección de proyectos.
            </h1>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-2xl">
              Análisis técnico, casos reales y aprendizajes acumulados en 30 años dentro del sector tecnológico-productivo y 14 años dirigiendo proyectos con clientes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setPostToEdit(null);
              setIsEditorOpen(true);
            }}
            className="px-6 py-3.5 rounded-none bg-[#291B64] hover:bg-[#382586] text-white font-mono font-bold text-xs inline-flex items-center gap-2 cursor-pointer transition-colors self-start lg:self-auto whitespace-nowrap shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-emerald-300" />
            <span>Crear Nueva Publicación</span>
          </button>
        </div>
      </div>

      {/* Main Blog Content Area */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-14 md:py-20 space-y-14 text-left">
        {/* Featured Lead Article Block (When showing all posts) */}
        {featuredArticle && (
          <div
            onClick={() => setSelectedPostForReading(featuredArticle)}
            className="group p-8 sm:p-12 bg-[#F6F6F9] hover:bg-[#18103C] transition-colors cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#291B64] group-hover:text-emerald-400">
                <span className="font-bold">PUBLICACIÓN DESTACADA</span>
                <span aria-hidden="true">·</span>
                <span>{featuredArticle.category}</span>
                <span aria-hidden="true">·</span>
                <span>{featuredArticle.publishedAt}</span>
                <span aria-hidden="true">·</span>
                <span>{featuredArticle.readTime} de lectura</span>
              </div>

              <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#1D1D1F] group-hover:text-white leading-tight transition-colors">
                {featuredArticle.title}
              </h2>

              <p className="text-sm sm:text-base text-[#515154] group-hover:text-neutral-300 leading-relaxed max-w-3xl">
                {featuredArticle.excerpt}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-[#515154] group-hover:text-neutral-400">
                {featuredArticle.tags?.map((t) => (
                  <span key={t}>#{t}</span>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col justify-between lg:items-end space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#291B64] group-hover:text-emerald-300">
                <Play className="w-4 h-4" />
                <span>Incluye Video YouTube embebido</span>
              </div>

              <span className="px-6 py-3.5 text-xs font-mono font-bold text-white bg-[#291B64] group-hover:bg-white group-hover:text-[#18103C] transition-colors inline-flex items-center gap-2 self-start lg:self-end">
                <span>Leer Artículo Completo</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        )}

        {/* Filter & Search Bar (Clean, no nested boxes) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-black/[0.08]">
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-none text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-[#291B64] text-white'
                    : 'bg-[#F5F5F7] text-[#515154] hover:text-[#1D1D1F]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar artículo, tag o temática..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#F5F5F7] rounded-none text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#291B64]"
            />
          </div>
        </div>

        {/* Posts Grid (Frameless Tonal Cards & Hairlines) */}
        {filteredPosts.length === 0 ? (
          <div className="py-16 text-center space-y-4 bg-[#F7F7FA]">
            <p className="text-sm text-slate-600">
              No se encontraron artículos para el criterio seleccionado.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('Todos');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 rounded-none bg-[#291B64] hover:bg-[#382586] text-white text-xs font-semibold cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
            {filteredPosts.map((post, idx) => (
              <article
                key={post.id}
                onClick={() => setSelectedPostForReading(post)}
                className="group pt-6 border-t border-black/[0.1] hover:border-[#291B64] flex flex-col justify-between transition-colors cursor-pointer space-y-6"
              >
                <div className="space-y-3.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500">
                    <span className="text-[#291B64] font-semibold">{post.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.publishedAt}</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.readTime}</span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-[#1D1D1F] group-hover:text-[#291B64] transition-colors leading-snug">
                    0{idx + 1}. {post.title}
                  </h3>

                  <p className="text-sm text-[#515154] leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between gap-2">
                  <div className="text-xs font-mono text-slate-400 truncate">
                    {post.tags?.slice(0, 3).join(' · ')}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEdit(post, e)}
                      className="p-1.5 text-slate-400 hover:text-[#291B64] rounded-none transition-colors"
                      title="Editar publicación"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeletePost(post.id, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-none transition-colors"
                      title="Eliminar publicación"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-mono font-bold text-[#291B64] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                      <span>Leer</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

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
        postToEdit={postToEdit}
      />
    </section>
  );
};
