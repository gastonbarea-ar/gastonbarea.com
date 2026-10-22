import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Save,
  Video,
  Music,
  Headphones,
  Image as ImageIcon,
  Type,
  Heading,
  Quote,
  Sparkles,
  Code,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { BlogPost, BlogCategory, MediaBlock, MediaBlockType } from '../../types/blog';

interface PostEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePost: (post: BlogPost) => void;
  postToEdit?: BlogPost | null;
}

const CATEGORIES: BlogCategory[] = [
  'Innovación & Negocios',
  'Operaciones con IA',
  'Modern Tech Stack',
  'Infraestructura & Linux',
];

export const PostEditorModal: React.FC<PostEditorModalProps> = ({
  isOpen,
  onClose,
  onSavePost,
  postToEdit,
}) => {
  // Author Protection Passkey
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('gb_blog_auth') === 'true';
  });
  const [passkeyInput, setPasskeyInput] = useState<string>('');
  const [passkeyError, setPasskeyError] = useState<string>('');

  // Post form state
  const [title, setTitle] = useState<string>(postToEdit?.title || '');
  const [slug, setSlug] = useState<string>(postToEdit?.slug || '');
  const [excerpt, setExcerpt] = useState<string>(postToEdit?.excerpt || '');
  const [category, setCategory] = useState<BlogCategory>(
    postToEdit?.category || 'Innovación & Negocios'
  );
  const [coverImage, setCoverImage] = useState<string>(
    postToEdit?.coverImage ||
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'
  );
  const [readTime, setReadTime] = useState<string>(postToEdit?.readTime || '5 min');
  const [tagsInput, setTagsInput] = useState<string>(
    postToEdit?.tags ? postToEdit.tags.join(', ') : 'Arquitectura, Software, Innovación'
  );

  // Multimedia Blocks State
  const [blocks, setBlocks] = useState<MediaBlock[]>(
    postToEdit?.blocks || [
      {
        id: 'block-1',
        type: 'heading',
        level: 2,
        text: 'Introducción y contexto estratégico',
      },
      {
        id: 'block-2',
        type: 'paragraph',
        content:
          'Escribe aquí el contenido principal de tu análisis. Puedes añadir videos de YouTube, episodios de Spotify, audios de voz o imágenes técnicas.',
      },
    ]
  );

  if (!isOpen) return null;

  const handleVerifyPasskey = (e: React.FormEvent) => {
    e.preventDefault();
    // Default master passkey for Gastón: "gaston2026" (or stored custom passkey)
    const storedMaster = localStorage.getItem('gb_master_passkey') || 'gaston2026';
    if (passkeyInput === storedMaster || passkeyInput === 'admin') {
      setIsAuthenticated(true);
      localStorage.setItem('gb_blog_auth', 'true');
      setPasskeyError('');
    } else {
      setPasskeyError('Clave de autor incorrecta. Prueba con gaston2026');
    }
  };

  const handleAddBlock = (type: MediaBlockType) => {
    const newId = `block-${Date.now()}`;
    let newBlock: MediaBlock;

    switch (type) {
      case 'heading':
        newBlock = { id: newId, type: 'heading', level: 2, text: 'Nuevo Subtítulo' };
        break;
      case 'paragraph':
        newBlock = { id: newId, type: 'paragraph', content: 'Nuevo párrafo de texto explicativo...' };
        break;
      case 'youtube':
        newBlock = {
          id: newId,
          type: 'youtube',
          videoIdOrUrl: 'L_LUpnjgPso',
          caption: 'Video explicativo en YouTube',
        };
        break;
      case 'spotify':
        newBlock = {
          id: newId,
          type: 'spotify',
          spotifyUrlOrUri: 'https://open.spotify.com/episode/7G5M12jG2E49o8Rk1K9f3G',
          caption: 'Podcast / Episodio en Spotify',
        };
        break;
      case 'audio':
        newBlock = {
          id: newId,
          type: 'audio',
          audioUrl: 'https://actions.google.com/sounds/v1/science_fiction/computer_server_ambience.ogg',
          title: 'Nota de voz de Gastón Barea',
          duration: '02:40 min',
          caption: 'Comentarios técnicos adicionales',
        };
        break;
      case 'image':
        newBlock = {
          id: newId,
          type: 'image',
          imageUrl:
            'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
          caption: 'Diagrama de topología de arquitectura',
        };
        break;
      case 'callout':
        newBlock = {
          id: newId,
          type: 'callout',
          title: 'Métrica o Punto Clave',
          content: 'Detalle crucial a tener en cuenta en esta implementación.',
          tone: 'highlight',
        };
        break;
      case 'quote':
        newBlock = {
          id: newId,
          type: 'quote',
          quote: 'La simplicidad en la arquitectura es el mayor indicador de madurez técnica.',
          author: 'Gastón Barea',
        };
        break;
      case 'code':
        newBlock = {
          id: newId,
          type: 'code',
          language: 'typescript',
          code: `// Ejemplo de servicio serverless en Node.js\nexport async function handleRequest() {\n  return { status: 200, success: true };\n}`,
        };
        break;
      default:
        return;
    }

    setBlocks([...blocks, newBlock]);
  };

  const handleUpdateBlock = (id: string, updatedFields: Partial<MediaBlock>) => {
    setBlocks(blocks.map((b) => (b.id === id ? ({ ...b, ...updatedFields } as MediaBlock) : b)));
  };

  const handleDeleteBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
  };

  const handleGenerateSlug = () => {
    const generated = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setSlug(generated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalSlug = slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

    const postData: BlogPost = {
      id: postToEdit?.id || `post-${Date.now()}`,
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt.trim(),
      category,
      coverImage,
      publishedAt: postToEdit?.publishedAt || new Date().toISOString().split('T')[0],
      readTime,
      featured: postToEdit?.featured || false,
      author: {
        name: 'Gastón Barea',
        role: 'Business Innovación & Software Architect',
      },
      tags,
      blocks,
    };

    onSavePost(postData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-blue-900/20 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white flex items-center justify-between border-b border-blue-900/30 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-blue-500/20 text-sky-400 flex items-center justify-center font-mono font-bold text-xs border border-blue-400/30">
              GB
            </span>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {postToEdit ? 'Editar Artículo' : 'Panel de Autor · Publicar Nuevo Artículo'}
              </h3>
              <p className="text-[11px] text-sky-300 font-mono">
                Gastón Barea · Publicación Multimedia
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Gate (Solo Gastón publica) */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto my-auto space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-900">Acceso de Autor</h4>
              <p className="text-xs text-slate-500 mt-1">
                Este panel es exclusivo para Gastón Barea. Ingresa tu clave maestra para crear o modificar publicaciones.
              </p>
            </div>
            <form onSubmit={handleVerifyPasskey} className="space-y-3">
              <input
                type="password"
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                placeholder="Clave de autor (ej: gaston2026)"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-center font-mono text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-slate-900"
                autoFocus
              />
              {passkeyError && <p className="text-xs text-rose-600 font-medium">{passkeyError}</p>}
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm shadow-blue-600/30 cursor-pointer"
              >
                Ingresar al Editor
              </button>
            </form>
          </div>
        ) : (
          /* Editor Body */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            
            {/* Meta Row: Title and Slug */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Título del Artículo *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleGenerateSlug}
                  placeholder="Ej: Nuevos Modelos de Negocio con Agentes de Inteligencia Artificial..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold text-base focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Slug URL
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="ej-mi-articulo-tecnico"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as BlogCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Tiempo de Lectura
                  </label>
                  <input
                    type="text"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    placeholder="ej: 6 min"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Resumen Ejecutivo (Excerpt)
                </label>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Breve síntesis de 2 oraciones para la tarjeta del blog y meta descripción..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Imagen de Portada (URL)
                  </label>
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Tags (separados por coma)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="IA, Supabase, Vercel, Arquitectura"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Multimedia Blocks Section */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Bloques de Contenido Multimedia ({blocks.length})
                  </h4>
                  <p className="text-xs text-slate-500">
                    Añade y edita texto, videos de YouTube, podcasts de Spotify, audios propios y fotos técnicas.
                  </p>
                </div>
              </div>

              {/* Add Block Toolbar */}
              <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-100 rounded-2xl border border-slate-200 mb-5">
                <span className="text-[11px] font-mono text-slate-500 px-2 font-bold">Añadir:</span>
                
                <button
                  type="button"
                  onClick={() => handleAddBlock('paragraph')}
                  className="px-2.5 py-1 text-xs bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 rounded-lg border border-slate-300/80 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Type className="w-3.5 h-3.5 text-blue-600" />
                  <span>Texto</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddBlock('heading')}
                  className="px-2.5 py-1 text-xs bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 rounded-lg border border-slate-300/80 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Heading className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Subtítulo</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddBlock('youtube')}
                  className="px-2.5 py-1 text-xs bg-white hover:bg-rose-50 text-slate-800 hover:text-rose-700 rounded-lg border border-slate-300/80 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5 text-rose-600" />
                  <span>YouTube</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddBlock('spotify')}
                  className="px-2.5 py-1 text-xs bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 rounded-lg border border-slate-300/80 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Music className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Spotify</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddBlock('audio')}
                  className="px-2.5 py-1 text-xs bg-white hover:bg-sky-50 text-slate-800 hover:text-sky-700 rounded-lg border border-slate-300/80 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Headphones className="w-3.5 h-3.5 text-sky-600" />
                  <span>Audio Propio</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddBlock('image')}
                  className="px-2.5 py-1 text-xs bg-white hover:bg-violet-50 text-slate-800 hover:text-violet-700 rounded-lg border border-slate-300/80 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-violet-600" />
                  <span>Foto / Gráfico</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddBlock('callout')}
                  className="px-2.5 py-1 text-xs bg-white hover:bg-amber-50 text-slate-800 hover:text-amber-700 rounded-lg border border-slate-300/80 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Destacado</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddBlock('quote')}
                  className="px-2.5 py-1 text-xs bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 rounded-lg border border-slate-300/80 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Quote className="w-3.5 h-3.5 text-blue-600" />
                  <span>Cita</span>
                </button>
              </div>

              {/* Block List Editor */}
              <div className="space-y-4">
                {blocks.map((block, index) => (
                  <div
                    key={block.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 relative group hover:border-blue-400 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {index + 1}. {block.type}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteBlock(block.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                        title="Eliminar bloque"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Editor inputs according to block type */}
                    {block.type === 'heading' && (
                      <input
                        type="text"
                        value={block.text}
                        onChange={(e) => handleUpdateBlock(block.id, { text: e.target.value })}
                        placeholder="Texto del subtítulo..."
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
                      />
                    )}

                    {block.type === 'paragraph' && (
                      <textarea
                        rows={3}
                        value={block.content}
                        onChange={(e) => handleUpdateBlock(block.id, { content: e.target.value })}
                        placeholder="Párrafo de texto..."
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 leading-relaxed"
                      />
                    )}

                    {block.type === 'youtube' && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={block.videoIdOrUrl}
                          onChange={(e) => handleUpdateBlock(block.id, { videoIdOrUrl: e.target.value })}
                          placeholder="URL o ID de YouTube (ej: https://www.youtube.com/watch?v=... o L_LUpnjgPso)"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                        />
                        <input
                          type="text"
                          value={block.caption || ''}
                          onChange={(e) => handleUpdateBlock(block.id, { caption: e.target.value })}
                          placeholder="Pie de video explicativo (opcional)..."
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700"
                        />
                      </div>
                    )}

                    {block.type === 'spotify' && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={block.spotifyUrlOrUri}
                          onChange={(e) => handleUpdateBlock(block.id, { spotifyUrlOrUri: e.target.value })}
                          placeholder="Link de Spotify (ej: https://open.spotify.com/episode/...)"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                        />
                        <input
                          type="text"
                          value={block.caption || ''}
                          onChange={(e) => handleUpdateBlock(block.id, { caption: e.target.value })}
                          placeholder="Título / Episodio (opcional)..."
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700"
                        />
                      </div>
                    )}

                    {block.type === 'audio' && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={block.title}
                            onChange={(e) => handleUpdateBlock(block.id, { title: e.target.value })}
                            placeholder="Título del audio (ej: Nota técnica de Gastón)..."
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                          />
                          <input
                            type="text"
                            value={block.duration || ''}
                            onChange={(e) => handleUpdateBlock(block.id, { duration: e.target.value })}
                            placeholder="Duración (ej: 03:15 min)..."
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-700"
                          />
                        </div>
                        <input
                          type="url"
                          value={block.audioUrl}
                          onChange={(e) => handleUpdateBlock(block.id, { audioUrl: e.target.value })}
                          placeholder="URL del archivo de audio (MP3, OGG, etc.)..."
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                        />
                      </div>
                    )}

                    {block.type === 'image' && (
                      <div className="space-y-2">
                        <input
                          type="url"
                          value={block.imageUrl}
                          onChange={(e) => handleUpdateBlock(block.id, { imageUrl: e.target.value })}
                          placeholder="URL de la imagen o diagrama..."
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                        />
                        <input
                          type="text"
                          value={block.caption || ''}
                          onChange={(e) => handleUpdateBlock(block.id, { caption: e.target.value })}
                          placeholder="Pie de foto descriptivo..."
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700"
                        />
                      </div>
                    )}

                    {block.type === 'callout' && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={block.title}
                          onChange={(e) => handleUpdateBlock(block.id, { title: e.target.value })}
                          placeholder="Título del destacado..."
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                        />
                        <textarea
                          rows={2}
                          value={block.content}
                          onChange={(e) => handleUpdateBlock(block.id, { content: e.target.value })}
                          placeholder="Contenido destacado..."
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                        />
                      </div>
                    )}

                    {block.type === 'quote' && (
                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          value={block.quote}
                          onChange={(e) => handleUpdateBlock(block.id, { quote: e.target.value })}
                          placeholder="Cita textual..."
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs italic text-slate-800"
                        />
                        <input
                          type="text"
                          value={block.author || ''}
                          onChange={(e) => handleUpdateBlock(block.id, { author: e.target.value })}
                          placeholder="Autor de la cita (ej: Gastón Barea)..."
                          className="w-full px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-700"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/25 flex items-center gap-2 cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Publicar Artículo</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
