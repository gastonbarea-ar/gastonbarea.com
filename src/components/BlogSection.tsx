import React, { useState } from 'react';
import {
  Search,
  PlusCircle,
  ArrowRight,
  Edit,
  Trash2,
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

  return (
    <section
      id="blog"
      className="py-16 md:py-24 bg-white border-b border-slate-200/80 scroll-mt-16"
    >
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 space-y-10 text-left">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="text-xs font-mono text-emerald-900 font-semibold">
              Publicaciones & Notas Ejecutivas · Autor: Gastón Barea
            </div>
            <h2
              className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-slate-900"
              style={{ textWrap: 'balance' }}
            >
              Perspectivas sobre tecnología productiva, bioeconomía y dirección de proyectos.
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              setPostToEdit(null);
              setIsEditorOpen(true);
            }}
            className="px-4 py-2.5 rounded-none bg-[#291B64] hover:bg-[#382586] text-white font-semibold text-xs inline-flex items-center gap-2 cursor-pointer transition-colors self-start md:self-auto whitespace-nowrap shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nueva Publicación</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          {/* Interactive Category Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-white rounded-none border border-slate-200/90">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-none text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-[#291B64] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar artículo o temática..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-none text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#291B64]"
            />
          </div>
        </div>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="p-12 rounded-none bg-white border border-slate-200 text-center space-y-3">
            <p className="text-sm text-slate-600">
              No se encontraron artículos para el criterio seleccionado.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('Todos');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-none bg-[#291B64] hover:bg-[#382586] text-white text-xs font-semibold cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredPosts.map((post, idx) => (
              <article
                key={post.id}
                onClick={() => setSelectedPostForReading(post)}
                className="group rounded-none bg-white border border-slate-200/90 hover:border-slate-400 p-6 flex flex-col justify-between transition-colors cursor-pointer space-y-6"
              >
                <div className="space-y-3">
                  {/* Quiet Unboxed Metadata */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500">
                    <span className="text-emerald-900 font-semibold">{post.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.publishedAt}</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.readTime}</span>
                  </div>

                  <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-emerald-900 transition-colors leading-snug">
                    0{idx + 1}. {post.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-xs font-mono text-slate-500 truncate">
                    {post.tags?.slice(0, 3).join(' · ')}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEdit(post, e)}
                      className="p-1.5 text-slate-400 hover:text-slate-900 rounded-none transition-colors"
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
                    <span className="text-xs font-semibold text-slate-900 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
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
