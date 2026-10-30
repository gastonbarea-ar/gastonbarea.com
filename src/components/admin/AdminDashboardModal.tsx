import React, { useState, useEffect } from 'react';
import {
  X,
  LayoutDashboard,
  BookOpen,
  Settings,
  Users,
  Video,
  Share2,
  Calendar,
  MessageSquare,
  Lock,
  Unlock,
  Plus,
  Edit,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Phone,
  Mail,
  Globe,
  TrendingUp,
  FolderGit2,
  ShieldCheck,
  HelpCircle,
  Send,
  Youtube,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Image as ImageIcon,
} from 'lucide-react';
import { BlogPost } from '../../types/blog';
import { SiteConfig, SITE_CONFIG } from '../../data/siteConfig';
import { PostEditorModal } from '../blog/PostEditorModal';
import { CrmDashboard } from './crm/CrmDashboard';
import { VerifiedLoginPanel } from './VerifiedLoginPanel';

interface AdminDashboardModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSiteConfigUpdated?: (newConfig: SiteConfig) => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen = true,
  onClose,
  onSiteConfigUpdated,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('gb_blog_auth') === 'true';
  });
  const [sessionToken, setSessionToken] = useState<string>(() => localStorage.getItem('gb_admin_token') || '');
  const [verifiedUser, setVerifiedUser] = useState<any>(() => {
    try {
      const raw = localStorage.getItem('gb_verified_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [passkeyInput, setPasskeyInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // Active Tab: 'crm' | 'client_portal' | 'settings' | 'blog' | 'leads'
  const [activeTab, setActiveTab] = useState<'crm' | 'client_portal' | 'settings' | 'blog' | 'leads'>('crm');

  // Client Portal Admin State
  const [clientPortalData, setClientPortalData] = useState<{
    projects: any[];
    inquiries: any[];
    tickets: any[];
    bookings: any[];
  }>({ projects: [], inquiries: [], tickets: [], bookings: [] });
  const [adminReplyTexts, setAdminReplyTexts] = useState<Record<string, string>>({});
  const [isReplyingInquiry, setIsReplyingInquiry] = useState<string | null>(null);

  // Site Config state
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(SITE_CONFIG);
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string>('');

  // Blog posts state
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isPostEditorOpen, setIsPostEditorOpen] = useState<boolean>(false);
  const [postToEdit, setPostToEdit] = useState<BlogPost | null>(null);

  // Leads state
  const [leads, setLeads] = useState<{ proposals: any[]; contactInquiries: any[] }>({
    proposals: [],
    contactInquiries: [],
  });
  const [isLoadingLeads, setIsLoadingLeads] = useState<boolean>(false);

  // Load current site config, blog posts, and verify session on mount/open
  useEffect(() => {
    if (!isOpen) return;

    // 0. Verify active session if token exists
    const storedToken = localStorage.getItem('gb_admin_token');
    if (storedToken) {
      fetch('/api/admin/auth/verify-session', {
        headers: { 'x-admin-token': storedToken },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.authenticated && data.user) {
            setIsAuthenticated(true);
            setVerifiedUser(data.user);
          } else {
            setIsAuthenticated(false);
            localStorage.removeItem('gb_blog_auth');
            localStorage.removeItem('gb_admin_token');
          }
        })
        .catch(() => {});
    }

    // 1. Fetch site config
    fetch('/api/site-config')
      .then((res) => res.json())
      .then((data) => {
        if (data?.config) {
          setSiteConfig(data.config);
        }
      })
      .catch((e) => console.warn('Could not fetch site config:', e));

    // 2. Fetch blog posts
    fetch('/api/blog/posts')
      .then((res) => res.json())
      .then((data) => {
        if (data?.posts && Array.isArray(data.posts)) {
          setBlogPosts(data.posts);
        }
      })
      .catch((e) => console.warn('Could not fetch blog posts:', e));
  }, [isOpen]);

  // Load leads or client portal when switching tabs
  useEffect(() => {
    if (activeTab === 'leads' && isAuthenticated) {
      loadLeads();
    } else if (activeTab === 'client_portal' && isAuthenticated) {
      loadClientPortalData();
    }
  }, [activeTab, isAuthenticated]);

  const loadClientPortalData = () => {
    const token = localStorage.getItem('gb_admin_token') || sessionToken;
    const passkey = localStorage.getItem('gb_master_passkey') || 'gaston2026';
    fetch('/api/admin/client-portal/overview', {
      headers: {
        'x-admin-token': token,
        'x-admin-passkey': passkey,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setClientPortalData({
            projects: data.projects || [],
            inquiries: data.inquiries || [],
            tickets: data.tickets || [],
            bookings: data.bookings || [],
          });
        }
      })
      .catch((e) => console.error('Error fetching client portal data:', e));
  };

  const handleReplyToInquiry = async (inquiryId: string) => {
    const replyText = adminReplyTexts[inquiryId];
    if (!replyText || !replyText.trim()) return;

    setIsReplyingInquiry(inquiryId);
    const token = localStorage.getItem('gb_admin_token') || sessionToken;
    const passkey = localStorage.getItem('gb_master_passkey') || 'gaston2026';

    try {
      const res = await fetch(`/api/admin/client-portal/inquiries/${inquiryId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
          'x-admin-passkey': passkey,
        },
        body: JSON.stringify({ replyText }),
      });
      const data = await res.json();
      if (data.success && data.inquiry) {
        setClientPortalData((prev) => ({
          ...prev,
          inquiries: prev.inquiries.map((inq) => (inq.id === inquiryId ? data.inquiry : inq)),
        }));
        setAdminReplyTexts((prev) => ({ ...prev, [inquiryId]: '' }));
      }
    } catch (err) {
      console.error('Error replying to inquiry:', err);
    } finally {
      setIsReplyingInquiry(null);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: string, notes?: string) => {
    const token = localStorage.getItem('gb_admin_token') || sessionToken;
    const passkey = localStorage.getItem('gb_master_passkey') || 'gaston2026';

    try {
      const res = await fetch(`/api/admin/client-portal/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
          'x-admin-passkey': passkey,
        },
        body: JSON.stringify({ status, resolutionNotes: notes }),
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        setClientPortalData((prev) => ({
          ...prev,
          tickets: prev.tickets.map((t) => (t.id === ticketId ? data.ticket : t)),
        }));
      }
    } catch (err) {
      console.error('Error updating ticket status:', err);
    }
  };

  const loadLeads = () => {
    setIsLoadingLeads(true);
    const passkey = localStorage.getItem('gb_master_passkey') || 'gaston2026';
    const token = localStorage.getItem('gb_admin_token') || '';
    fetch('/api/admin/leads', {
      headers: {
        'x-admin-passkey': passkey,
        'x-admin-token': token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLeads({
            proposals: data.proposals || [],
            contactInquiries: data.contactInquiries || [],
          });
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setIsLoadingLeads(false));
  };

  const handleVerifiedLogin = (token: string, user: any) => {
    setSessionToken(token);
    setVerifiedUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    const token = sessionToken || localStorage.getItem('gb_admin_token');
    if (token) {
      try {
        await fetch('/api/admin/auth/logout', {
          method: 'POST',
          headers: { 'x-admin-token': token },
        });
      } catch (e) {
        console.warn(e);
      }
    }
    localStorage.removeItem('gb_blog_auth');
    localStorage.removeItem('gb_admin_token');
    localStorage.removeItem('gb_verified_user');
    setIsAuthenticated(false);
    setVerifiedUser(null);
    setSessionToken('');
  };

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const passkey = passkeyInput.trim();
    fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passkey }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setIsAuthenticated(true);
          localStorage.setItem('gb_blog_auth', 'true');
          localStorage.setItem('gb_master_passkey', passkey);
          setAuthError('');
        } else {
          setAuthError('Clave incorrecta. Prueba con gaston2026');
        }
      })
      .catch(() => {
        if (passkey === 'gaston2026' || passkey === 'admin') {
          setIsAuthenticated(true);
          localStorage.setItem('gb_blog_auth', 'true');
        } else {
          setAuthError('Clave incorrecta');
        }
      });
  };

  const handleSaveSiteConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    setSaveSuccessMessage('');
    const passkey = localStorage.getItem('gb_master_passkey') || 'gaston2026';

    try {
      const response = await fetch('/api/admin/site-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passkey': passkey,
        },
        body: JSON.stringify({ config: siteConfig }),
      });

      if (response.ok) {
        setSaveSuccessMessage('¡Configuración del sitio web actualizada y guardada con éxito!');
        if (onSiteConfigUpdated) {
          onSiteConfigUpdated(siteConfig);
        }
        setTimeout(() => setSaveSuccessMessage(''), 3500);
      }
    } catch (err) {
      console.error('Error saving site config:', err);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este artículo permanentemente?')) return;
    const passkey = localStorage.getItem('gb_master_passkey') || 'gaston2026';

    try {
      await fetch(`/api/admin/blog/posts/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-passkey': passkey },
      });
      setBlogPosts(blogPosts.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostSaved = (post: BlogPost) => {
    const existingIndex = blogPosts.findIndex((p) => p.id === post.id);
    let updated: BlogPost[];
    if (existingIndex >= 0) {
      updated = [...blogPosts];
      updated[existingIndex] = post;
    } else {
      updated = [post, ...blogPosts];
    }
    setBlogPosts(updated);
  };

  return (
    <section
      id="admin"
      className="w-full min-h-[calc(100vh-4rem)] bg-[#F5F5F7] text-[#1D1D1F] flex flex-col"
    >
      {!isAuthenticated ? (
        <VerifiedLoginPanel
          onAuthenticated={handleVerifiedLogin}
          onBackToSite={onClose}
        />
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
          {/* LEFT WORKSPACE SIDEBAR */}
          <aside className="w-full lg:w-72 bg-[#0A0A0F] text-white border-b lg:border-b-0 lg:border-r border-white/10 p-5 sm:p-6 flex flex-col justify-between shrink-0">
            <div className="space-y-6">
              {/* Admin Session Profile Card */}
              <div className="p-4 bg-white/[0.04] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                    Sesión Verificada
                  </span>
                  <span className="text-[11px] font-mono text-sky-400">
                    Super Admin
                  </span>
                </div>
                <div>
                  <div className="font-display text-sm font-bold text-white">
                    {verifiedUser?.name || 'Gastón Barea'}
                  </div>
                  <div className="text-xs text-sky-400 font-medium">
                    {verifiedUser?.role || 'Super Admin & PMO Director'}
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400 truncate mt-0.5">
                    {verifiedUser?.email || 'gastonbarea.com@gmail.com'}
                  </div>
                </div>
              </div>

              {/* Sidebar Navigation */}
              <nav className="space-y-1.5" aria-label="Menú del Panel de Control">
                <div className="text-[11px] font-sans font-semibold uppercase tracking-wider text-neutral-400 px-2 pb-1">
                  Módulos del Sistema
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('crm')}
                  className={`w-full px-3.5 py-2.5 text-xs font-sans font-semibold transition-all flex items-center gap-2.5 cursor-pointer ${
                    activeTab === 'crm'
                      ? 'bg-[#291B64] text-white border-l-2 border-sky-400'
                      : 'text-neutral-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>CRM & Oportunidades</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('client_portal')}
                  className={`w-full px-3.5 py-2.5 text-xs font-sans font-semibold transition-all flex items-center gap-2.5 cursor-pointer ${
                    activeTab === 'client_portal'
                      ? 'bg-[#291B64] text-white border-l-2 border-sky-400'
                      : 'text-neutral-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <FolderGit2 className="w-4 h-4 text-sky-400" />
                  <span>Portal Clientes & Soporte</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('blog')}
                  className={`w-full px-3.5 py-2.5 text-xs font-sans font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    activeTab === 'blog'
                      ? 'bg-[#291B64] text-white border-l-2 border-sky-400'
                      : 'text-neutral-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <span className="inline-flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>Gestión de Blog</span>
                  </span>
                  <span className="text-[11px] font-mono px-1.5 py-0.5 bg-white/10 text-white">
                    {blogPosts.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('leads')}
                  className={`w-full px-3.5 py-2.5 text-xs font-sans font-semibold transition-all flex items-center gap-2.5 cursor-pointer ${
                    activeTab === 'leads'
                      ? 'bg-[#291B64] text-white border-l-2 border-sky-400'
                      : 'text-neutral-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>Bandeja de Leads</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className={`w-full px-3.5 py-2.5 text-xs font-sans font-semibold transition-all flex items-center gap-2.5 cursor-pointer ${
                    activeTab === 'settings'
                      ? 'bg-[#291B64] text-white border-l-2 border-sky-400'
                      : 'text-neutral-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <Settings className="w-4 h-4 text-emerald-400" />
                  <span>Configuración del Sitio</span>
                </button>
              </nav>
            </div>

            {/* Sidebar Footer Actions */}
            <div className="pt-6 mt-6 border-t border-white/10 space-y-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full px-3.5 py-2.5 text-xs font-sans font-medium text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Globe className="w-4 h-4 text-sky-400" />
                <span>Volver al Sitio Web</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-3.5 py-2.5 text-xs font-sans font-semibold text-rose-300 hover:text-white hover:bg-rose-600/30 border border-rose-500/20 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Cerrar Sesión Segura</span>
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className={`flex-1 min-w-0 ${activeTab === 'crm' ? 'p-0' : 'p-6 sm:p-8 lg:p-10'} bg-white flex flex-col`}>
            {/* TAB 0: CRM OPERATIVO */}
            {activeTab === 'crm' && (
              <div className="flex-1 h-full">
                <CrmDashboard passkey={passkeyInput || 'gaston2026'} onClose={onClose} />
              </div>
            )}

              {/* TAB 1: SITE CONFIGURATION */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveSiteConfig} className="space-y-6 max-w-2xl">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      Configuración Global del Sitio Web
                    </h4>
                    <p className="text-xs text-slate-500">
                      Actualiza en tiempo real los enlaces de contacto, agenda, WhatsApp y el video de presentación de YouTube.
                    </p>
                  </div>

                  {saveSuccessMessage && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{saveSuccessMessage}</span>
                    </div>
                  )}

                  {/* Section 1: Control del Slider & Showcase Principal (Video / Frame 2) */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-blue-700">
                        <Video className="w-4 h-4" />
                        <span>Control del Slider & Showcase Principal (Video & Frame 2)</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                        Backend Central
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Administra desde aquí el contenido del showcase principal, la reproducción automática al entrar y el avance automático entre frames sin botones en el front.
                    </p>

                    {/* Frame 1: Video de Fondo */}
                    <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Youtube className="w-3.5 h-3.5 text-rose-600" />
                        <span>Frame 1 · Video YouTube de Portada</span>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          URL o ID de YouTube
                        </label>
                        <input
                          type="text"
                          value={siteConfig.presentationVideo?.youtubeId || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const match = val.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                            const extractedId = match && match[1] ? match[1] : val;
                            setSiteConfig({
                              ...siteConfig,
                              presentationVideo: {
                                ...siteConfig.presentationVideo,
                                youtubeId: extractedId,
                              },
                            });
                          }}
                          placeholder="Ej: https://www.youtube.com/watch?v=L_LUpnjgPso o L_LUpnjgPso"
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Título del Video
                          </label>
                          <input
                            type="text"
                            value={siteConfig.presentationVideo?.title || ''}
                            onChange={(e) =>
                              setSiteConfig({
                                ...siteConfig,
                                presentationVideo: {
                                  ...siteConfig.presentationVideo,
                                  title: e.target.value,
                                },
                              })
                            }
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Duración Mostrada
                          </label>
                          <input
                            type="text"
                            value={siteConfig.presentationVideo?.duration || ''}
                            onChange={(e) =>
                              setSiteConfig({
                                ...siteConfig,
                                presentationVideo: {
                                  ...siteConfig.presentationVideo,
                                  duration: e.target.value,
                                },
                              })
                            }
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                          />
                        </div>
                      </div>

                      {/* Autoplay & Auto-advance controls */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                        <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors">
                          <input
                            type="checkbox"
                            checked={siteConfig.presentationVideo?.autoplay ?? true}
                            onChange={(e) =>
                              setSiteConfig({
                                ...siteConfig,
                                presentationVideo: {
                                  ...siteConfig.presentationVideo,
                                  autoplay: e.target.checked,
                                },
                              })
                            }
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span>Arrancar video automáticamente al ingresar</span>
                        </label>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Segundos antes de pasar automáticamente al Frame 2
                          </label>
                          <input
                            type="number"
                            min="3"
                            max="120"
                            value={siteConfig.presentationVideo?.autoAdvanceSeconds ?? 15}
                            onChange={(e) =>
                              setSiteConfig({
                                ...siteConfig,
                                presentationVideo: {
                                  ...siteConfig.presentationVideo,
                                  autoAdvanceSeconds: parseInt(e.target.value, 10) || 15,
                                },
                              })
                            }
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Frame 2: Ecosistema & Arquitectura */}
                    <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                        <span>Frame 2 · Showcase (Ecosistema / Arquitectura)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Badge Superior
                          </label>
                          <input
                            type="text"
                            value={siteConfig.presentationVideo?.frame2?.badge || ''}
                            onChange={(e) =>
                              setSiteConfig({
                                ...siteConfig,
                                presentationVideo: {
                                  ...siteConfig.presentationVideo,
                                  frame2: {
                                    ...(siteConfig.presentationVideo?.frame2 || ({} as any)),
                                    badge: e.target.value,
                                  },
                                },
                              })
                            }
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            URL de Imagen o Medios
                          </label>
                          <input
                            type="text"
                            value={siteConfig.presentationVideo?.frame2?.mediaUrl || ''}
                            onChange={(e) =>
                              setSiteConfig({
                                ...siteConfig,
                                presentationVideo: {
                                  ...siteConfig.presentationVideo,
                                  frame2: {
                                    ...(siteConfig.presentationVideo?.frame2 || ({} as any)),
                                    mediaUrl: e.target.value,
                                  },
                                },
                              })
                            }
                            placeholder="https://..."
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Título Frame 2
                        </label>
                        <input
                          type="text"
                          value={siteConfig.presentationVideo?.frame2?.title || ''}
                          onChange={(e) =>
                            setSiteConfig({
                              ...siteConfig,
                              presentationVideo: {
                                ...siteConfig.presentationVideo,
                                frame2: {
                                  ...(siteConfig.presentationVideo?.frame2 || ({} as any)),
                                  title: e.target.value,
                                },
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Descripción Frame 2
                        </label>
                        <textarea
                          rows={2}
                          value={siteConfig.presentationVideo?.frame2?.description || ''}
                          onChange={(e) =>
                            setSiteConfig({
                              ...siteConfig,
                              presentationVideo: {
                                ...siteConfig.presentationVideo,
                                frame2: {
                                  ...(siteConfig.presentationVideo?.frame2 || ({} as any)),
                                  description: e.target.value,
                                },
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Texto del Botón de Acción
                        </label>
                        <input
                          type="text"
                          value={siteConfig.presentationVideo?.frame2?.buttonText || ''}
                          onChange={(e) =>
                            setSiteConfig({
                              ...siteConfig,
                              presentationVideo: {
                                ...siteConfig.presentationVideo,
                                frame2: {
                                  ...(siteConfig.presentationVideo?.frame2 || ({} as any)),
                                  buttonText: e.target.value,
                                },
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Redes Sociales & Canales Oficiales */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-blue-700">
                        <Globe className="w-4 h-4" />
                        <span>Redes Sociales & Canales Oficiales</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        Sincronizado con Footer y Navegación
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                          <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                          <span>LinkedIn</span>
                        </label>
                        <input
                          type="url"
                          value={siteConfig.social.linkedin}
                          onChange={(e) =>
                            setSiteConfig({
                              ...siteConfig,
                              social: { ...siteConfig.social, linkedin: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                          <Github className="w-3.5 h-3.5 text-slate-800" />
                          <span>GitHub</span>
                        </label>
                        <input
                          type="url"
                          value={siteConfig.social.github}
                          onChange={(e) =>
                            setSiteConfig({
                              ...siteConfig,
                              social: { ...siteConfig.social, github: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                          <Youtube className="w-3.5 h-3.5 text-rose-600" />
                          <span>Canal de YouTube</span>
                        </label>
                        <input
                          type="url"
                          value={siteConfig.social.youtube || ''}
                          onChange={(e) =>
                            setSiteConfig({
                              ...siteConfig,
                              social: { ...siteConfig.social, youtube: e.target.value },
                            })
                          }
                          placeholder="https://www.youtube.com/@gastonbarea"
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                          <Twitter className="w-3.5 h-3.5 text-slate-700" />
                          <span>Twitter / X</span>
                        </label>
                        <input
                          type="url"
                          value={siteConfig.social.twitter || ''}
                          onChange={(e) =>
                            setSiteConfig({
                              ...siteConfig,
                              social: { ...siteConfig.social, twitter: e.target.value },
                            })
                          }
                          placeholder="https://x.com/gastonbarea"
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                          <Instagram className="w-3.5 h-3.5 text-pink-600" />
                          <span>Instagram</span>
                        </label>
                        <input
                          type="url"
                          value={siteConfig.social.instagram || ''}
                          onChange={(e) =>
                            setSiteConfig({
                              ...siteConfig,
                              social: { ...siteConfig.social, instagram: e.target.value },
                            })
                          }
                          placeholder="https://instagram.com/gastonbarea"
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-blue-600" />
                          <span>Email Oficial</span>
                        </label>
                        <input
                          type="email"
                          value={siteConfig.email}
                          onChange={(e) => setSiteConfig({ ...siteConfig, email: e.target.value })}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Google Meet Pro & Agenda Técnica */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-blue-700">
                        <Video className="w-4 h-4 text-blue-600" />
                        <span>Google Meet Pro & Canales de Agenda</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                        Google Meet Pro
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        URL de Google Meet Pro (Sala Directa o Enlace de Reunión)
                      </label>
                      <input
                        type="url"
                        value={siteConfig.booking.googleMeetUrl || ''}
                        onChange={(e) =>
                          setSiteConfig({
                            ...siteConfig,
                            booking: { ...siteConfig.booking, googleMeetUrl: e.target.value },
                          })
                        }
                        placeholder="https://meet.google.com/..."
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Título de Reunión Google Meet Pro
                        </label>
                        <input
                          type="text"
                          value={siteConfig.booking.meetingTitle || ''}
                          onChange={(e) =>
                            setSiteConfig({
                              ...siteConfig,
                              booking: { ...siteConfig.booking, meetingTitle: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Duración de la Consulta
                        </label>
                        <input
                          type="text"
                          value={siteConfig.booking.defaultDuration || ''}
                          onChange={(e) =>
                            setSiteConfig({
                              ...siteConfig,
                              booking: { ...siteConfig.booking, defaultDuration: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          URL de Calendly (Sincronizado)
                        </label>
                        <input
                          type="url"
                          value={siteConfig.booking.calendlyUrl}
                          onChange={(e) =>
                            setSiteConfig({
                              ...siteConfig,
                              booking: { ...siteConfig.booking, calendlyUrl: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          URL de Cal.com (Alternativa)
                        </label>
                        <input
                          type="url"
                          value={siteConfig.booking.calComUrl}
                          onChange={(e) =>
                            setSiteConfig({
                              ...siteConfig,
                              booking: { ...siteConfig.booking, calComUrl: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 4: WhatsApp Directo */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-blue-700">
                      <Phone className="w-4 h-4" />
                      <span>WhatsApp Directo</span>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Número de Teléfono (Formato internacional, ej: 5492804xxxxxx)
                      </label>
                      <input
                        type="text"
                        value={siteConfig.whatsapp.phoneNumber}
                        onChange={(e) =>
                          setSiteConfig({
                            ...siteConfig,
                            whatsapp: { ...siteConfig.whatsapp, phoneNumber: e.target.value },
                          })
                        }
                        placeholder="5492804000000"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Mensaje Predeterminado
                      </label>
                      <textarea
                        rows={2}
                        value={siteConfig.whatsapp.defaultMessage}
                        onChange={(e) =>
                          setSiteConfig({
                            ...siteConfig,
                            whatsapp: { ...siteConfig.whatsapp, defaultMessage: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSavingConfig}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSavingConfig ? 'Guardando...' : 'Guardar Configuración del Sitio'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: BLOG MANAGEMENT */}
              {activeTab === 'blog' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        Publicaciones del Blog ({blogPosts.length})
                      </h4>
                      <p className="text-xs text-slate-500">
                        Crea, edita o elimina artículos multimedia.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPostToEdit(null);
                        setIsPostEditorOpen(true);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Nuevo Artículo</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {blogPosts.map((post) => (
                      <div
                        key={post.id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold">
                              {post.category}
                            </span>
                            <span className="text-xs text-slate-500">{post.publishedAt}</span>
                          </div>
                          <h5 className="text-sm font-bold text-slate-900 line-clamp-1">
                            {post.title}
                          </h5>
                          <p className="text-xs text-slate-600 line-clamp-1">{post.excerpt}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setPostToEdit(post);
                              setIsPostEditorOpen(true);
                            }}
                            className="p-2 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 transition-colors cursor-pointer"
                            title="Editar post"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePost(post.id)}
                            className="p-2 rounded-lg bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                            title="Eliminar post"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: LEADS & INQUIRIES */}
              {activeTab === 'leads' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        Bandeja de Leads y Consultas
                      </h4>
                      <p className="text-xs text-slate-500">
                        Prospectos calificados generados por el simulador de arquitectura y formulario de contacto.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={loadLeads}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLeads ? 'animate-spin' : ''}`} />
                      <span>Actualizar</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700">
                      Propuestas de Arquitectura Generadas ({leads.proposals.length})
                    </h5>
                    {leads.proposals.length === 0 ? (
                      <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl">
                        Aún no se han recibido diagnósticos en la base de datos de producción.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {leads.proposals.map((lead: any) => (
                          <div
                            key={lead.id}
                            className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between font-mono">
                              <span className="font-bold text-slate-900">
                                {lead.company_name || lead.organization_type}
                              </span>
                              <span className="text-slate-500">{lead.created_at?.split('T')[0]}</span>
                            </div>
                            <div className="text-slate-800 font-semibold">{lead.architecture_title}</div>
                            <div className="text-slate-600 line-clamp-2">{lead.diagnostic_summary}</div>
                            <div className="text-slate-500 font-mono text-[11px]">
                              Stack actual: {(lead.current_stack || []).join(', ')} · Urgencia:{' '}
                              {lead.urgency}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700 pt-4">
                      Mensajes de Contacto Directo ({leads.contactInquiries.length})
                    </h5>
                    {leads.contactInquiries.length === 0 ? (
                      <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl">
                        Sin mensajes pendientes en la bandeja de contacto.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {leads.contactInquiries.map((inq: any) => (
                          <div
                            key={inq.id}
                            className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between font-mono">
                              <span className="font-bold text-slate-900">
                                {inq.name} ({inq.email})
                              </span>
                              <span className="text-slate-500">{inq.created_at?.split('T')[0]}</span>
                            </div>
                            <div className="text-blue-700 font-semibold">Área: {inq.service_area}</div>
                            <div className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 whitespace-pre-wrap">
                              {inq.requirements}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: CLIENT PORTAL ADMIN MANAGEMENT */}
              {activeTab === 'client_portal' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">Portal de Clientes, Proyectos & Soporte SLA</h4>
                      <p className="text-xs text-slate-500">
                        Supervisa el avance de los proyectos en curso, responde consultas de asesoramiento y gestiona incidencias
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={loadClientPortalData}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 self-start cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                      <span>Actualizar Datos</span>
                    </button>
                  </div>

                  {/* 1. Proyectos de Clientes en Curso */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                      <FolderGit2 className="w-4 h-4" />
                      <span>Proyectos Activos ({clientPortalData.projects.length})</span>
                    </h5>

                    <div className="grid grid-cols-1 gap-4">
                      {clientPortalData.projects.map((proj: any) => (
                        <div
                          key={proj.id}
                          className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
                                  {proj.serviceCategory}
                                </span>
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                                  {proj.status}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-slate-900 mt-1">{proj.projectName}</h4>
                              <div className="text-xs text-slate-600">
                                <strong>{proj.clientName}</strong> ({proj.clientEmail}) · {proj.company}
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-blue-700">{proj.progressPercent}% Completado</span>
                              <div className="w-32 h-2.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                                <div
                                  className="h-full bg-blue-600 rounded-full"
                                  style={{ width: `${proj.progressPercent}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <span className="font-bold text-slate-700">Sprint Activo: </span>
                              <span className="text-slate-900">{proj.activeSprint}</span>
                            </div>
                            {proj.stagingUrl && (
                              <a
                                href={proj.stagingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                              >
                                <span>Ver Staging UAT</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Consultas de Asesoramiento Técnico */}
                  <div className="space-y-3 pt-2">
                    <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4" />
                      <span>Consultas de Asesoramiento de Clientes ({clientPortalData.inquiries.length})</span>
                    </h5>

                    {clientPortalData.inquiries.length === 0 ? (
                      <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl">
                        Sin consultas pendientes de respuesta.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {clientPortalData.inquiries.map((inq: any) => (
                          <div
                            key={inq.id}
                            className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-200 space-y-3 text-xs"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-mono uppercase font-bold text-indigo-700 px-2 py-0.5 rounded-full bg-indigo-100 mr-2">
                                  {inq.category}
                                </span>
                                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                  inq.status === 'answered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {inq.status === 'answered' ? '✓ Respondida' : 'Pendiente de Respuesta'}
                                </span>
                              </div>
                              <span className="text-[11px] font-mono text-slate-500">
                                {inq.clientName} ({inq.clientEmail}) · {inq.company}
                              </span>
                            </div>

                            <div className="font-bold text-sm text-slate-900">{inq.topic}</div>

                            {/* Thread messages */}
                            <div className="space-y-2 bg-white p-3 rounded-xl border border-indigo-100">
                              {inq.messages?.map((msg: any) => (
                                <div key={msg.id} className="p-2 rounded-lg bg-slate-50 text-[11px]">
                                  <div className="flex items-center justify-between text-slate-500 font-mono text-[10px] mb-0.5">
                                    <strong className="text-slate-800">{msg.senderName}</strong>
                                    <span>{new Date(msg.createdAt).toLocaleString()}</span>
                                  </div>
                                  <div className="text-slate-700 whitespace-pre-wrap">{msg.text}</div>
                                </div>
                              ))}
                            </div>

                            {/* Reply box */}
                            <div className="flex items-center gap-2 pt-1">
                              <input
                                type="text"
                                value={adminReplyTexts[inq.id] || ''}
                                onChange={(e) =>
                                  setAdminReplyTexts((prev) => ({ ...prev, [inq.id]: e.target.value }))
                                }
                                onKeyDown={(e) => e.key === 'Enter' && handleReplyToInquiry(inq.id)}
                                placeholder="Escribe tu asesoramiento técnico para el cliente..."
                                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <button
                                type="button"
                                onClick={() => handleReplyToInquiry(inq.id)}
                                disabled={isReplyingInquiry === inq.id || !adminReplyTexts[inq.id]?.trim()}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                              >
                                {isReplyingInquiry === inq.id ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Send className="w-3.5 h-3.5" />
                                )}
                                <span>Responder</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 3. Tickets de Soporte Técnico Especializado */}
                  <div className="space-y-3 pt-2">
                    <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Incidencias de Soporte Técnico ({clientPortalData.tickets.length})</span>
                    </h5>

                    {clientPortalData.tickets.length === 0 ? (
                      <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl">
                        Sin incidencias activas.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {clientPortalData.tickets.map((t: any) => (
                          <div
                            key={t.id}
                            className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-900">{t.ticketNumber}</span>
                                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                  t.severity === 'critical' ? 'bg-rose-100 text-rose-800' :
                                  t.severity === 'high' ? 'bg-amber-100 text-amber-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {t.severity.toUpperCase()} (SLA {t.slaHours}h)
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-slate-200">
                                  {t.systemArea}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateTicketStatus(t.id, 'investigating')}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                                    t.status === 'investigating'
                                      ? 'bg-amber-600 text-white'
                                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                  }`}
                                >
                                  Investigando
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateTicketStatus(
                                      t.id,
                                      'fix_deployed',
                                      'Parche desplegado en el servidor y verificado con el cliente.'
                                    )
                                  }
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                                    t.status === 'fix_deployed'
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  }`}
                                >
                                  Solución Desplegada
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateTicketStatus(t.id, 'closed')}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                                    t.status === 'closed'
                                      ? 'bg-slate-700 text-white'
                                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                  }`}
                                >
                                  Cerrar
                                </button>
                              </div>
                            </div>

                            <div className="font-bold text-slate-900">{t.subject}</div>
                            <p className="text-slate-600">{t.description}</p>
                            <div className="text-[11px] text-slate-400 font-mono">
                              Cliente: {t.clientName} ({t.clientEmail}) · {t.company}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      {/* Embedded Post Editor Modal */}
      <PostEditorModal
        isOpen={isPostEditorOpen}
        onClose={() => setIsPostEditorOpen(false)}
        onSavePost={handlePostSaved}
        postToEdit={postToEdit}
      />
    </section>
  );
};
