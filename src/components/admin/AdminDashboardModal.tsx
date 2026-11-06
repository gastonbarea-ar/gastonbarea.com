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
  // Active Tab: 'crm' | 'client_portal' | 'settings' | 'blog' | 'infrastructure'
  const [activeTab, setActiveTab] = useState<'crm' | 'client_portal' | 'settings' | 'blog' | 'infrastructure'>('crm');
  const [infraStatus, setInfraStatus] = useState<any>(null);
  const [isLoadingInfra, setIsLoadingInfra] = useState<boolean>(false);
  const [testEmailTarget, setTestEmailTarget] = useState<string>('notificaciones@gastonbarea.com');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState<boolean>(false);
  const [testEmailFeedback, setTestEmailFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  // Client Portal Admin State
  const [clientPortalData, setClientPortalData] = useState<{
    projects: any[];
    inquiries: any[];
    tickets: any[];
    bookings: any[];
  }>({ projects: [], inquiries: [], tickets: [], bookings: [] });
  const [adminReplyTexts, setAdminReplyTexts] = useState<Record<string, string>>({});
  const [isReplyingInquiry, setIsReplyingInquiry] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectDrafts, setProjectDrafts] = useState<Record<string, { activeSprint: string; stagingUrl: string; progressPercent: number; status: string }>>({});
  const [newUpdateDrafts, setNewUpdateDrafts] = useState<Record<string, { title: string; summary: string }>>({});
  const [isSavingProject, setIsSavingProject] = useState<string | null>(null);
  const [portalAdminFeedback, setPortalAdminFeedback] = useState<string>('');

  // Site Config state
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(SITE_CONFIG);
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string>('');

  // Blog posts state
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isPostEditorOpen, setIsPostEditorOpen] = useState<boolean>(false);
  const [postToEdit, setPostToEdit] = useState<BlogPost | null>(null);
  const [confirmDeletePostId, setConfirmDeletePostId] = useState<string | null>(null);

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

  // Load client portal or infrastructure status when switching tabs
  useEffect(() => {
    if (activeTab === 'client_portal' && isAuthenticated) {
      loadClientPortalData();
    } else if (activeTab === 'infrastructure' && isAuthenticated) {
      loadInfraStatus();
    }
  }, [activeTab, isAuthenticated]);

  const loadInfraStatus = () => {
    setIsLoadingInfra(true);
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setInfraStatus(data);
      })
      .catch((e) => console.error('Error fetching /api/health:', e))
      .finally(() => setIsLoadingInfra(false));
  };

  const handleSendTestEmail = async () => {
    setIsSendingTestEmail(true);
    setTestEmailFeedback(null);
    const token = localStorage.getItem('gb_admin_token') || sessionToken;
    const passkey = localStorage.getItem('gb_master_passkey') || 'gaston2026';

    try {
      const res = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
          'x-admin-passkey': passkey,
        },
        body: JSON.stringify({ to: testEmailTarget }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestEmailFeedback({
          ok: true,
          msg: `¡Correo enviado con éxito desde ${data.fromEmail} hacia ${data.targetEmail} vía ${data.provider}!`,
        });
        loadInfraStatus();
      } else {
        setTestEmailFeedback({
          ok: false,
          msg: data.error || 'No se pudo despachar el correo de prueba.',
        });
      }
    } catch (err: any) {
      setTestEmailFeedback({
        ok: false,
        msg: err?.message || 'Error de red al probar el envío de correo.',
      });
    } finally {
      setIsSendingTestEmail(false);
    }
  };

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

  const handlePatchClientProject = async (projectId: string, patchPayload: any, feedbackText?: string) => {
    setIsSavingProject(projectId);
    const token = localStorage.getItem('gb_admin_token') || sessionToken;
    const passkey = localStorage.getItem('gb_master_passkey') || 'gaston2026';

    try {
      const res = await fetch(`/api/admin/client-portal/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
          'x-admin-passkey': passkey,
        },
        body: JSON.stringify(patchPayload),
      });
      const data = await res.json();
      if (data.success && data.project) {
        setClientPortalData((prev) => ({
          ...prev,
          projects: prev.projects.map((p) => (p.id === projectId ? data.project : p)),
        }));
        if (feedbackText) {
          setPortalAdminFeedback(feedbackText);
          setTimeout(() => setPortalAdminFeedback(''), 3500);
        }
      }
    } catch (err) {
      console.error('Error patching client project:', err);
    } finally {
      setIsSavingProject(null);
    }
  };

  const handlePatchBooking = async (bookingId: string, patchPayload: { status?: string; releaseSlot?: boolean; meetingUrl?: string }) => {
    const token = localStorage.getItem('gb_admin_token') || sessionToken;
    const passkey = localStorage.getItem('gb_master_passkey') || 'gaston2026';

    try {
      const res = await fetch(`/api/admin/client-portal/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
          'x-admin-passkey': passkey,
        },
        body: JSON.stringify(patchPayload),
      });
      const data = await res.json();
      if (data.success) {
        if (patchPayload.releaseSlot) {
          setClientPortalData((prev) => ({
            ...prev,
            bookings: prev.bookings.filter((b) => b.id !== bookingId),
          }));
          setPortalAdminFeedback('Turno liberado en el calendario y removido de reservas activas.');
        } else if (data.booking) {
          setClientPortalData((prev) => ({
            ...prev,
            bookings: prev.bookings.map((b) => (b.id === bookingId ? data.booking : b)),
          }));
          setPortalAdminFeedback(`Estado de sesión actualizado a ${data.booking.status.toUpperCase()}.`);
        }
        setTimeout(() => setPortalAdminFeedback(''), 3500);
      }
    } catch (err) {
      console.error('Error updating booking:', err);
    }
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
    if (confirmDeletePostId !== id) {
      setConfirmDeletePostId(id);
      setTimeout(() => setConfirmDeletePostId((prev) => (prev === id ? null : prev)), 4000);
      return;
    }
    setConfirmDeletePostId(null);
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

                <button
                  type="button"
                  onClick={() => setActiveTab('infrastructure')}
                  className={`w-full px-3.5 py-2.5 text-xs font-sans font-semibold transition-all flex items-center gap-2.5 cursor-pointer ${
                    activeTab === 'infrastructure'
                      ? 'bg-[#291B64] text-white border-l-2 border-sky-400'
                      : 'text-neutral-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>DNS, Correo & Stack</span>
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
                <CrmDashboard passkey={localStorage.getItem('gb_master_passkey') || 'gaston2026'} onClose={onClose} />
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

                    {/* Frame 1: Video de Portada (Híbrido: Cloudflare R2 / CDN .mp4 o YouTube) */}
                    <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Youtube className="w-3.5 h-3.5 text-rose-600" />
                        <span>Frame 1 · Video de Portada (YouTube o Stream Directo CDN / Cloudflare R2)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                            placeholder="Ej: XVYUP8Pz-hE"
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Modo de Ajuste al Frame
                          </label>
                          <select
                            value={siteConfig.presentationVideo?.videoFitMode || 'cover'}
                            onChange={(e) =>
                              setSiteConfig({
                                ...siteConfig,
                                presentationVideo: {
                                  ...siteConfig.presentationVideo,
                                  videoFitMode: e.target.value as 'cover' | 'contain',
                                },
                              })
                            }
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                          >
                            <option value="cover">Cover 100% (Llenar todo el Frame sin bordes negros)</option>
                            <option value="contain">16:9 Nativo (Encaje proporcional completo)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          URL Pública de Video Directo .mp4 / .webm (Cloudflare R2 / CDN - Opcional)
                        </label>
                        <input
                          type="url"
                          value={siteConfig.presentationVideo?.directVideoUrl || ''}
                          onChange={(e) =>
                            setSiteConfig({
                              ...siteConfig,
                              presentationVideo: {
                                ...siteConfig.presentationVideo,
                                directVideoUrl: e.target.value,
                              },
                            })
                          }
                          placeholder="Ej: https://pub-xxxx.r2.dev/presentacion.mp4 o https://cdn.gastonbarea.com/presentacion.mp4"
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                        />
                        {siteConfig.presentationVideo?.directVideoUrl?.includes('r2.cloudflarestorage.com') ? (
                          <div className="mt-2 p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-[11px] text-amber-900 leading-relaxed">
                            <strong>⚠️ Atención:</strong> La URL <code>*.r2.cloudflarestorage.com</code> es el <strong>endpoint privado de la API S3</strong> (bloquea el acceso desde navegadores) y además apunta solo al bucket <code>/media-gaston</code> sin el archivo <code>.mp4</code>.<br />
                            <strong>Cómo obtener el link público en 3 clics:</strong> En Cloudflare R2 → Bucket <code>media-gaston</code> → pestaña <strong>Settings</strong> → en <strong>Public Development URL (r2.dev)</strong> hacé clic en <em>Enable</em> (o conectá <code>cdn.gastonbarea.com</code> en Custom Domains) y agregá al final el nombre de tu archivo: <code>https://pub-xxxx.r2.dev/tu-video.mp4</code>.
                          </div>
                        ) : siteConfig.presentationVideo?.directVideoUrl &&
                          !/\.(mp4|webm|m3u8|mov)(\?.*)?$/i.test(
                            siteConfig.presentationVideo.directVideoUrl.trim()
                          ) ? (
                          <div className="mt-2 p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-[11px] text-amber-900 leading-relaxed">
                            <strong>⚠️ Falta el nombre del archivo de video:</strong> Asegurate de que la URL termine con el nombre del archivo subido al bucket (por ejemplo: <code>/presentacion.mp4</code>).
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500 mt-1">
                            Al pegar un link público de Cloudflare R2 (<code>https://pub-xxxx.r2.dev/archivo.mp4</code> o <code>https://cdn.gastonbarea.com/archivo.mp4</code>), el reproductor cambia automáticamente a HTML5 nativo con object-fit: cover.
                          </p>
                        )}
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
                            className={`p-2 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold ${
                              confirmDeletePostId === post.id
                                ? 'bg-rose-600 text-white border-rose-700'
                                : 'bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border-slate-200'
                            }`}
                            title="Eliminar post"
                          >
                            <Trash2 className="w-4 h-4" />
                            {confirmDeletePostId === post.id && <span>Confirmar</span>}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: CLIENT PORTAL ADMIN MANAGEMENT */}
              {activeTab === 'client_portal' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">Portal de Clientes, Proyectos 40/40/20 & Soporte SLA</h4>
                      <p className="text-xs text-slate-500">
                        Editá en vivo el avance de sprints, hitos de entrega, sesiones Google Meet, consultas técnicas e incidencias
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

                  {portalAdminFeedback && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{portalAdminFeedback}</span>
                    </div>
                  )}

                  {/* 1. Proyectos de Clientes en Curso (con Editor Live de Sprints, Hitos y Bitácora) */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                      <FolderGit2 className="w-4 h-4" />
                      <span>1. Proyectos Activos & Editor de Sprints 40/40/20 ({clientPortalData.projects.length})</span>
                    </h5>

                    <div className="grid grid-cols-1 gap-4">
                      {clientPortalData.projects.map((proj: any) => {
                        const isEditing = editingProjectId === proj.id;
                        const draft = projectDrafts[proj.id] || {
                          activeSprint: proj.activeSprint || '',
                          stagingUrl: proj.stagingUrl || '',
                          progressPercent: Number(proj.progressPercent ?? 15),
                          status: proj.status || 'in_progress',
                        };
                        const updDraft = newUpdateDrafts[proj.id] || { title: '', summary: '' };

                        return (
                          <div
                            key={proj.id}
                            className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
                                    {proj.serviceCategory}
                                  </span>
                                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                                    {proj.status}
                                  </span>
                                  {proj.quoteNumber && (
                                    <span className="text-[10px] font-mono text-slate-500">
                                      Ref: {proj.quoteNumber}
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-sm font-bold text-slate-900 mt-1">{proj.projectName}</h4>
                                <div className="text-xs text-slate-600">
                                  <strong>{proj.clientName}</strong> ({proj.clientEmail}) · {proj.company}
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <span className="text-xs font-mono font-bold text-blue-700">
                                    {proj.progressPercent}% Completado
                                  </span>
                                  <div className="w-32 h-2.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                                    <div
                                      className="h-full bg-blue-600 rounded-full transition-all"
                                      style={{ width: `${proj.progressPercent}%` }}
                                    />
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isEditing) {
                                      setEditingProjectId(null);
                                    } else {
                                      setProjectDrafts((prev) => ({
                                        ...prev,
                                        [proj.id]: {
                                          activeSprint: proj.activeSprint || '',
                                          stagingUrl: proj.stagingUrl || '',
                                          progressPercent: Number(proj.progressPercent ?? 15),
                                          status: proj.status || 'in_progress',
                                        },
                                      }));
                                      setEditingProjectId(proj.id);
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                  <span>{isEditing ? 'Cerrar Editor' : 'Gestionar Proyecto'}</span>
                                </button>
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

                            {/* Hitos 40/40/20 Rápidos */}
                            {Array.isArray(proj.milestones) && proj.milestones.length > 0 && (
                              <div className="space-y-2">
                                <div className="text-[11px] font-mono font-bold uppercase text-slate-500">
                                  Hitos 40/40/20 (Clic para alternar avance técnico o estado de cobro):
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                                  {proj.milestones.map((ms: any) => (
                                    <div
                                      key={ms.id}
                                      className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-2 flex flex-col justify-between"
                                    >
                                      <div>
                                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                                          <span>{ms.percentage}% · {ms.currency} ${Number(ms.amount || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="font-bold text-slate-900 mt-0.5 line-clamp-2">{ms.title}</div>
                                      </div>

                                      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
                                        <button
                                          type="button"
                                          disabled={isSavingProject === proj.id}
                                          onClick={() => {
                                            const nextStatus =
                                              ms.status === 'pending'
                                                ? 'in_progress'
                                                : ms.status === 'in_progress'
                                                ? 'completed'
                                                : 'pending';
                                            const updatedMilestones = proj.milestones.map((m: any) =>
                                              m.id === ms.id ? { ...m, status: nextStatus } : m
                                            );
                                            handlePatchClientProject(
                                              proj.id,
                                              { milestones: updatedMilestones },
                                              `Hito "${ms.title}" actualizado a ${nextStatus.toUpperCase()}.`
                                            );
                                          }}
                                          className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer ${
                                            ms.status === 'completed'
                                              ? 'bg-emerald-100 text-emerald-800'
                                              : ms.status === 'in_progress'
                                              ? 'bg-blue-100 text-blue-800'
                                              : 'bg-slate-100 text-slate-700'
                                          }`}
                                        >
                                          {ms.status === 'completed'
                                            ? '✓ Completado'
                                            : ms.status === 'in_progress'
                                            ? '⏳ En Curso'
                                            : 'Pendiente'}
                                        </button>

                                        <button
                                          type="button"
                                          disabled={isSavingProject === proj.id}
                                          onClick={() => {
                                            const nextPay = ms.paymentStatus === 'paid' ? 'pending' : 'paid';
                                            const updatedMilestones = proj.milestones.map((m: any) =>
                                              m.id === ms.id ? { ...m, paymentStatus: nextPay } : m
                                            );
                                            handlePatchClientProject(
                                              proj.id,
                                              { milestones: updatedMilestones },
                                              `Estado financiero de "${ms.title}" marcado como ${
                                                nextPay === 'paid' ? 'ABONADO' : 'PENDIENTE'
                                              }.`
                                            );
                                          }}
                                          className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer ${
                                            ms.paymentStatus === 'paid'
                                              ? 'bg-emerald-600 text-white'
                                              : 'bg-amber-100 text-amber-800'
                                          }`}
                                        >
                                          {ms.paymentStatus === 'paid' ? '✓ Abonado' : '$ Pago Pendiente'}
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Live Project & Sprint Editor Drawer */}
                            {isEditing && (
                              <div className="p-4 rounded-xl bg-white border-2 border-blue-200 space-y-4 text-xs">
                                <div className="font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-2">
                                  <span>Editor en Vivo · Sincronización Instantánea con Portal Cliente (#portal)</span>
                                  <span className="text-[10px] font-mono text-blue-700">ID: {proj.id}</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                      Estado del Proyecto
                                    </label>
                                    <select
                                      value={draft.status}
                                      onChange={(e) =>
                                        setProjectDrafts((prev) => ({
                                          ...prev,
                                          [proj.id]: { ...draft, status: e.target.value },
                                        }))
                                      }
                                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                                    >
                                      <option value="onboarding">Onboarding & Kickoff</option>
                                      <option value="in_progress">En Desarrollo Activo</option>
                                      <option value="staging">En Staging / Homologación UAT</option>
                                      <option value="completed">Completado en Producción</option>
                                      <option value="maintenance">Mantenimiento & SLA Activo</option>
                                    </select>
                                  </div>

                                  <div className="sm:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                      Porcentaje de Avance ({draft.progressPercent}%)
                                    </label>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="range"
                                        min={0}
                                        max={100}
                                        step={5}
                                        value={draft.progressPercent}
                                        onChange={(e) =>
                                          setProjectDrafts((prev) => ({
                                            ...prev,
                                            [proj.id]: { ...draft, progressPercent: Number(e.target.value) },
                                          }))
                                        }
                                        className="flex-1"
                                      />
                                      {[15, 40, 65, 85, 100].map((pct) => (
                                        <button
                                          key={pct}
                                          type="button"
                                          onClick={() =>
                                            setProjectDrafts((prev) => ({
                                              ...prev,
                                              [proj.id]: { ...draft, progressPercent: pct },
                                            }))
                                          }
                                          className={`px-2 py-1 rounded-lg font-mono text-[10px] font-bold cursor-pointer ${
                                            draft.progressPercent === pct
                                              ? 'bg-blue-600 text-white'
                                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                          }`}
                                        >
                                          {pct}%
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                      Sprint Activo Visible por el Cliente
                                    </label>
                                    <input
                                      type="text"
                                      value={draft.activeSprint}
                                      onChange={(e) =>
                                        setProjectDrafts((prev) => ({
                                          ...prev,
                                          [proj.id]: { ...draft, activeSprint: e.target.value },
                                        }))
                                      }
                                      placeholder="Ej: Sprint 2 · Integración API & Staging UAT"
                                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                      URL de Entorno Staging / Demo UAT
                                    </label>
                                    <input
                                      type="url"
                                      value={draft.stagingUrl}
                                      onChange={(e) =>
                                        setProjectDrafts((prev) => ({
                                          ...prev,
                                          [proj.id]: { ...draft, stagingUrl: e.target.value },
                                        }))
                                      }
                                      placeholder="https://staging.cliente.gastonbarea.com"
                                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                                    />
                                  </div>
                                </div>

                                <div className="flex justify-end">
                                  <button
                                    type="button"
                                    disabled={isSavingProject === proj.id}
                                    onClick={() =>
                                      handlePatchClientProject(
                                        proj.id,
                                        {
                                          status: draft.status,
                                          progressPercent: draft.progressPercent,
                                          activeSprint: draft.activeSprint,
                                          stagingUrl: draft.stagingUrl,
                                        },
                                        `Avance y Sprint de "${proj.projectName}" actualizados en el Portal Cliente.`
                                      )
                                    }
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                  >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>Guardar Cambios de Proyecto</span>
                                  </button>
                                </div>

                                {/* Publicar en Bitácora de Actualizaciones */}
                                <div className="pt-3 border-t border-slate-200 space-y-2">
                                  <div className="font-bold text-slate-800">
                                    Publicar Novedad en Bitácora Técnica del Cliente
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <input
                                      type="text"
                                      value={updDraft.title}
                                      onChange={(e) =>
                                        setNewUpdateDrafts((prev) => ({
                                          ...prev,
                                          [proj.id]: { ...updDraft, title: e.target.value },
                                        }))
                                      }
                                      placeholder="Título (ej: Despliegue en Staging completado)"
                                      className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                                    />
                                    <input
                                      type="text"
                                      value={updDraft.summary}
                                      onChange={(e) =>
                                        setNewUpdateDrafts((prev) => ({
                                          ...prev,
                                          [proj.id]: { ...updDraft, summary: e.target.value },
                                        }))
                                      }
                                      placeholder="Resumen técnico de los avances verificables por el cliente..."
                                      className="sm:col-span-2 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                                    />
                                  </div>
                                  <div className="flex justify-end">
                                    <button
                                      type="button"
                                      disabled={
                                        isSavingProject === proj.id ||
                                        !updDraft.title.trim() ||
                                        !updDraft.summary.trim()
                                      }
                                      onClick={() => {
                                        handlePatchClientProject(
                                          proj.id,
                                          {
                                            newUpdate: {
                                              title: updDraft.title.trim(),
                                              summary: updDraft.summary.trim(),
                                              author: 'Gastón Barea',
                                            },
                                          },
                                          'Nueva entrada publicada en la Bitácora Técnica del cliente.'
                                        );
                                        setNewUpdateDrafts((prev) => ({
                                          ...prev,
                                          [proj.id]: { title: '', summary: '' },
                                        }));
                                      }}
                                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>Publicar en Bitácora</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Sesiones Google Meet Agendadas */}
                  <div className="space-y-3 pt-2">
                    <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>2. Sesiones Google Meet & Consultoría Agendadas ({clientPortalData.bookings.length})</span>
                    </h5>

                    {clientPortalData.bookings.length === 0 ? (
                      <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl">
                        Sin sesiones agendadas actualmente.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {clientPortalData.bookings.map((bk: any) => (
                          <div
                            key={bk.id}
                            className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200 text-xs space-y-2.5 flex flex-col justify-between"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md text-[10px]">
                                  {bk.date} · {bk.timeSlot}
                                </span>
                                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white border border-emerald-200 text-emerald-800 font-bold">
                                  {bk.status || 'confirmed'}
                                </span>
                              </div>
                              <div className="font-bold text-slate-900 text-sm">{bk.agendaTopic}</div>
                              <div className="text-slate-600">
                                <strong>{bk.clientName}</strong> ({bk.clientEmail}) · {bk.company}
                              </div>
                              {bk.meetingUrl && (
                                <a
                                  href={bk.meetingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-blue-600 hover:underline font-mono text-[11px]"
                                >
                                  <Video className="w-3.5 h-3.5" />
                                  <span>{bk.meetingUrl}</span>
                                </a>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-1.5 pt-2 border-t border-emerald-200/60">
                              <button
                                type="button"
                                onClick={() => handlePatchBooking(bk.id, { status: 'completed' })}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                                  bk.status === 'completed'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                                }`}
                              >
                                ✓ Marcar Realizada
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePatchBooking(bk.id, { releaseSlot: true })}
                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 cursor-pointer"
                              >
                                Liberar Turno
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 3. Consultas de Asesoramiento Técnico */}
                  <div className="space-y-3 pt-2">
                    <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4" />
                      <span>3. Consultas de Asesoramiento de Clientes ({clientPortalData.inquiries.length})</span>
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

                  {/* 4. Tickets de Soporte Técnico Especializado */}
                  <div className="space-y-3 pt-2">
                    <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>4. Incidencias de Soporte Técnico ({clientPortalData.tickets.length})</span>
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

              {/* TAB 5: INFRASTRUCTURE, DNS, CYBERPANEL & RESEND.COM */}
              {activeTab === 'infrastructure' && (
                <div className="space-y-6 max-w-4xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                          gastonbarea.com · Producción Activa
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          Cloudflare + Vercel + Supabase + CyberPanel (138.219.41.106) + Resend.com
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-900">
                        Estado de Infraestructura, Correo Oficial & Variables de Entorno
                      </h4>
                      <p className="text-xs text-slate-500">
                        Diagnóstico en vivo de la base de datos PostgreSQL, servidor de correo CyberPanel (notificaciones@gastonbarea.com), envíos por Resend.com y motor Gemini IA.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={loadInfraStatus}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 self-start cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isLoadingInfra ? 'animate-spin' : ''}`} />
                      <span>Verificar Stack</span>
                    </button>
                  </div>

                  {/* Live Status Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-500">
                          Base de Datos PostgreSQL
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            infraStatus?.infrastructure?.supabase?.persistenceMode === 'postgresql_live'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {infraStatus?.infrastructure?.supabase?.persistenceMode === 'postgresql_live'
                            ? '✓ ACTIVO (LIVE)'
                            : 'EN VERIFICACIÓN'}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">Supabase PostgreSQL</div>
                      <div className="text-[11px] font-mono text-slate-600 truncate">
                        Host: {infraStatus?.infrastructure?.supabase?.projectHost || 'fovrtxiqtfcsrrtbqeoc.supabase.co'}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-500">
                          Correo Transaccional
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            infraStatus?.infrastructure?.emailService?.configured
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {infraStatus?.infrastructure?.emailService?.configured
                            ? '✓ API KEY ACTIVA'
                            : 'FALTA API KEY EN VERCEL'}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        Resend.com + CyberPanel
                      </div>
                      <div className="text-[11px] font-mono text-slate-600">
                        Cuenta: {infraStatus?.infrastructure?.emailService?.fromEmail || 'notificaciones@gastonbarea.com'} · IP: 138.219.41.106
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-500">
                          Motor Generativo IA
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            infraStatus?.infrastructure?.geminiAi?.configured
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {infraStatus?.infrastructure?.geminiAi?.configured
                            ? '✓ GEMINI EN VIVO'
                            : 'MODO DETERMINÍSTICO'}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">Google AI Studio (Gemini)</div>
                      <div className="text-[11px] font-mono text-slate-600">
                        Variable: GEMINI_API_KEY
                      </div>
                    </div>
                  </div>

                  {/* Live Email Test Box */}
                  <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h5 className="text-xs font-mono font-bold uppercase text-blue-800 flex items-center gap-1.5">
                          <Mail className="w-4 h-4" />
                          <span>Prueba de Envío en Vivo (notificaciones@gastonbarea.com vía Resend.com)</span>
                        </h5>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Verifica que el dominio gastonbarea.com en Resend.com despache correos hacia tu casilla de CyberPanel o correo personal.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="email"
                        value={testEmailTarget}
                        onChange={(e) => setTestEmailTarget(e.target.value)}
                        placeholder="notificaciones@gastonbarea.com"
                        className="flex-1 px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={handleSendTestEmail}
                        disabled={isSendingTestEmail || !testEmailTarget.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isSendingTestEmail ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>Enviar Correo de Prueba</span>
                      </button>
                    </div>

                    {testEmailFeedback && (
                      <div
                        className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                          testEmailFeedback.ok
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-rose-100 text-rose-900 border border-rose-300'
                        }`}
                      >
                        {testEmailFeedback.ok ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
                        ) : (
                          <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />
                        )}
                        <span>{testEmailFeedback.msg}</span>
                      </div>
                    )}
                  </div>

                  {/* Vercel Environment Variables Reference */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h5 className="text-xs font-mono font-bold uppercase text-slate-800">
                      1. Variables para agregar en Vercel → Project Settings → Environment Variables
                    </h5>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 font-mono text-[11px]">
                            <th className="py-2 pr-3">Nombre de Variable (Key)</th>
                            <th className="py-2 pr-3">Valor a Pegar (Value)</th>
                            <th className="py-2">Función en gastonbarea.com</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/70 font-mono text-[11px]">
                          <tr>
                            <td className="py-2.5 pr-3 font-bold text-blue-700">RESEND_API_KEY</td>
                            <td className="py-2.5 pr-3 text-slate-700">re_xxxxxxxxx (tu API Key de Resend.com)</td>
                            <td className="py-2.5 font-sans text-slate-600">
                              Envío automático desde notificaciones@gastonbarea.com (también compatible si la cargás como SENDER_API_KEY).
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 pr-3 font-bold text-blue-700">GEMINI_API_KEY</td>
                            <td className="py-2.5 pr-3 text-slate-700">AIzaSyxxxxxxx (tu clave de Google AI Studio)</td>
                            <td className="py-2.5 font-sans text-slate-600">
                              Activa la generación en vivo del Estructurador de Proyectos y el Gemelo Digital.
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 pr-3 font-bold text-slate-800">FROM_EMAIL</td>
                            <td className="py-2.5 pr-3 text-emerald-700 font-bold">notificaciones@gastonbarea.com</td>
                            <td className="py-2.5 font-sans text-slate-600">
                              Ya preconfigurado por defecto en el código (casilla activa en CyberPanel).
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 pr-3 font-bold text-slate-800">NOTIFICATION_EMAIL</td>
                            <td className="py-2.5 pr-3 text-emerald-700 font-bold">notificaciones@gastonbarea.com</td>
                            <td className="py-2.5 font-sans text-slate-600">
                              Recibe alertas inmediatas de nuevos diagnósticos y contactos (con copia de respaldo).
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Cloudflare DNS Architecture Table (CyberPanel + Resend Coexistence) */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h5 className="text-xs font-mono font-bold uppercase text-slate-800">
                      2. Registros DNS en Cloudflare (Coexistencia CyberPanel 138.219.41.106 + Resend.com)
                    </h5>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 font-mono text-[11px]">
                            <th className="py-2 pr-3">Tipo</th>
                            <th className="py-2 pr-3">Nombre</th>
                            <th className="py-2 pr-3">Contenido / Destino</th>
                            <th className="py-2">Proxy / Notas</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/70 font-mono text-[11px]">
                          <tr>
                            <td className="py-2 pr-3 font-bold text-slate-900">A</td>
                            <td className="py-2 pr-3 text-blue-700">mail</td>
                            <td className="py-2 pr-3 text-slate-800">138.219.41.106</td>
                            <td className="py-2 font-sans text-slate-600">DNS Only (Nube Gris) · Servidor CyberPanel</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-3 font-bold text-slate-900">MX</td>
                            <td className="py-2 pr-3 text-blue-700">@</td>
                            <td className="py-2 pr-3 text-slate-800">mail.gastonbarea.com (Prioridad 10)</td>
                            <td className="py-2 font-sans text-slate-600">Recibe correos entrantes en notificaciones@gastonbarea.com</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-3 font-bold text-slate-900">TXT (SPF)</td>
                            <td className="py-2 pr-3 text-blue-700">@</td>
                            <td className="py-2 pr-3 text-emerald-800 font-bold">v=spf1 a mx ip4:138.219.41.106 include:amazonses.com ~all</td>
                            <td className="py-2 font-sans text-slate-600">Unifica CyberPanel + Resend.com sin conflictos</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-3 font-bold text-slate-900">TXT (DKIM)</td>
                            <td className="py-2 pr-3 text-blue-700">resend._domainkey</td>
                            <td className="py-2 pr-3 text-slate-700">(Clave pública DKIM verificada en Resend)</td>
                            <td className="py-2 font-sans text-slate-600">Firma criptográfica saliente de Resend.com</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
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
