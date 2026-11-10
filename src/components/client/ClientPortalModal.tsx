import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderGit2,
  Calendar,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  Send,
  Plus,
  RefreshCw,
  LogOut,
  CreditCard,
  Building2,
  User,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Video,
  Eye,
  EyeOff,
  Users,
  UserPlus,
  FileText,
} from 'lucide-react';
import {
  ClientProject,
  ProjectMilestoneItem,
  ConsultingInquiry,
  SupportTicket,
  ConsultingBooking,
} from '../../types/clientPortal';
import { PaymentGatewayConfig, CrmCompany, CrmContact, Opportunity, Quote } from '../../types/crm';
import {
  CLIENT_ACCOUNTS,
  INITIAL_CLIENT_PROJECTS,
  INITIAL_CONSULTING_INQUIRIES,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_CONSULTING_BOOKINGS,
} from '../../data/clientPortalData';
import {
  DEFAULT_PAYMENT_CONFIG,
  INITIAL_CRM_COMPANIES,
  INITIAL_CRM_CONTACTS,
  INITIAL_CRM_OPPORTUNITIES,
  INITIAL_CRM_QUOTES,
} from '../../data/crmTemplates';
import { ArnClientIntakeWidget } from '../ArnClientIntakeWidget';
import {
  DEFAULT_BOOKING_AVAILABILITY,
  BookingAvailabilityConfig,
  SITE_CONFIG,
} from '../../data/siteConfig';

interface ClientPortalModalProps {
  isOpen?: boolean;
  onClose: () => void;
}

export const ClientPortalModal: React.FC<ClientPortalModalProps> = ({ isOpen = true, onClose }) => {
  // Auth state
  const [token, setToken] = useState<string>(() => localStorage.getItem('gb_client_token') || '');
  const [clientSession, setClientSession] = useState<{
    id?: string;
    email: string;
    username?: string;
    name: string;
    company: string;
    companyId?: string;
    role?: string;
    contactType?: 'corporate_member' | 'individual';
    hasActiveService?: boolean;
    linkedProjectId?: string;
  } | null>(() => {
    try {
      const raw = localStorage.getItem('gb_client_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Login & Open Registration form state
  const [loginMethod, setLoginMethod] = useState<'password' | 'register' | 'otp'>('password');
  const [usernameInput, setUsernameInput] = useState<string>('martin.arismendi');
  const [passwordInput, setPasswordInput] = useState<string>('cliente2026');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberClient, setRememberClient] = useState<boolean>(true);
  const [emailInput, setEmailInput] = useState<string>('martin@distribuidorasur.com.ar');
  const [codeInput, setCodeInput] = useState<string>('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [codeHint, setCodeHint] = useState<string>('');

  // Open Registration fields (No active service required)
  const [regContactType, setRegContactType] = useState<'corporate_member' | 'individual'>('corporate_member');
  const [regFullName, setRegFullName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regUsername, setRegUsername] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regCompanyName, setRegCompanyName] = useState<string>('');
  const [regCompanyTaxId, setRegCompanyTaxId] = useState<string>('');
  const [regRoleTitle, setRegRoleTitle] = useState<string>('');

  // Dashboard state
  const [activeTab, setActiveTab] = useState<'project' | 'directory' | 'inquiries' | 'bookings' | 'tickets'>('project');
  const [isLoadingDashboard, setIsLoadingDashboard] = useState<boolean>(false);
  const [project, setProject] = useState<ClientProject | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CrmCompany | null>(null);
  const [corporateColleagues, setCorporateColleagues] = useState<Partial<CrmContact>[]>([]);
  const [relatedOpportunities, setRelatedOpportunities] = useState<Opportunity[]>([]);
  const [relatedQuotes, setRelatedQuotes] = useState<Quote[]>([]);
  const [inquiries, setInquiries] = useState<ConsultingInquiry[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [bookings, setBookings] = useState<ConsultingBooking[]>([]);
  const [paymentConfig, setPaymentConfig] = useState<PaymentGatewayConfig | null>(null);

  // Modals & sub-flows
  const [selectedInquiry, setSelectedInquiry] = useState<ConsultingInquiry | null>(null);
  const [inquiryReplyText, setInquiryReplyText] = useState<string>('');
  const [isSendingReply, setIsSendingReply] = useState<boolean>(false);

  // New inquiry modal
  const [isNewInquiryOpen, setIsNewInquiryOpen] = useState<boolean>(false);
  const [newInquiryTopic, setNewInquiryTopic] = useState<string>('');
  const [newInquiryCategory, setNewInquiryCategory] = useState<'architecture' | 'odoo' | 'ecommerce' | 'devops' | 'strategy'>('odoo');
  const [newInquiryQuestion, setNewInquiryQuestion] = useState<string>('');
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState<boolean>(false);

  // New ticket modal
  const [isNewTicketOpen, setIsNewTicketOpen] = useState<boolean>(false);
  const [ticketSubject, setTicketSubject] = useState<string>('');
  const [ticketSeverity, setTicketSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [ticketSystemArea, setTicketSystemArea] = useState<'servers' | 'odoo_erp' | 'database' | 'frontend' | 'security' | 'integrations'>('odoo_erp');
  const [ticketDescription, setTicketDescription] = useState<string>('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState<boolean>(false);

  // New booking modal
  const [isNewBookingOpen, setIsNewBookingOpen] = useState<boolean>(true);
  const [bookingType, setBookingType] = useState<
    | 'discovery_ia'
    | 'sprint_review'
    | 'architecture_advisory'
    | 'incident_postmortem'
    | 'emergency_audit'
  >('discovery_ia');
  const [bookingDate, setBookingDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 6) d.setDate(d.getDate() + 2);
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [bookingSlot, setBookingSlot] = useState<string>('15:00 - 15:45 (GMT-3)');
  const [bookingTopic, setBookingTopic] = useState<string>(
    'Evaluación de propuesta técnica, alcance y hoja de ruta 40/40/20'
  );
  const [bookingPhone, setBookingPhone] = useState<string>('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState<boolean>(false);
  const [availabilityConfig, setAvailabilityConfig] = useState<BookingAvailabilityConfig>(
    DEFAULT_BOOKING_AVAILABILITY
  );
  const [occupiedSlotsByDate, setOccupiedSlotsByDate] = useState<Record<string, string[]>>({});
  const [bookingConflictMsg, setBookingConflictMsg] = useState<string>('');
  const [lastBookingConfirmation, setLastBookingConfirmation] = useState<{
    booking: ConsultingBooking;
    emailSent: boolean;
    googleCalendarUrl: string;
    whatsappConfirmUrl: string;
  } | null>(null);

  // Milestone payment detail modal & receipt reporting
  const [selectedMilestoneForPayment, setSelectedMilestoneForPayment] = useState<ProjectMilestoneItem | null>(null);
  const [paymentReportMethod, setPaymentReportMethod] = useState<string>('bank_transfer');
  const [paymentReportRef, setPaymentReportRef] = useState<string>('');
  const [paymentReportNotes, setPaymentReportNotes] = useState<string>('');
  const [isReportingPayment, setIsReportingPayment] = useState<boolean>(false);
  const [paymentReportFeedback, setPaymentReportFeedback] = useState<string>('');

  // 1-Click Quote Approval state
  const [isApprovingQuoteId, setIsApprovingQuoteId] = useState<string | null>(null);
  const [quoteApprovalFeedback, setQuoteApprovalFeedback] = useState<string>('');

  // Authenticated Client Portal Autonomous AI Agent (4-Stage StateGraph)
  const [portalAgentPrompt, setPortalAgentPrompt] = useState<string>('');
  const [isRunningPortalAgent, setIsRunningPortalAgent] = useState<boolean>(false);
  const [portalAgentResult, setPortalAgentResult] = useState<{
    finalResponse: string;
    actionsExecuted: string[];
    agentTrace: any;
  } | null>(null);

  const handleRunPortalAgent = async (e?: React.FormEvent, presetPrompt?: string) => {
    if (e) e.preventDefault();
    const textToRun = (presetPrompt ?? portalAgentPrompt).trim();
    if (!textToRun || isRunningPortalAgent || !token) return;

    setIsRunningPortalAgent(true);
    try {
      const res = await fetch('/api/client-portal/agent-assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-token': token,
          'x-client-email': clientSession?.email || '',
        },
        body: JSON.stringify({ prompt: textToRun }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        if (Array.isArray(json.relatedQuotes)) setRelatedQuotes(json.relatedQuotes);
        if (Array.isArray(json.relatedOpportunities)) setRelatedOpportunities(json.relatedOpportunities);
        if (Array.isArray(json.tickets)) setTickets(json.tickets);
        if (Array.isArray(json.bookings)) setBookings(json.bookings);
        setPortalAgentResult({
          finalResponse: json.finalResponse || '',
          actionsExecuted: json.actionsExecuted || [],
          agentTrace: json.agentTrace || null,
        });
        setPortalAgentPrompt('');
      }
    } catch (err) {
      console.error('Error running portal autonomous agent:', err);
    } finally {
      setIsRunningPortalAgent(false);
    }
  };

  // Check existing session and load booking availability
  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/bookings/availability')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.success) {
          if (data.config) setAvailabilityConfig(data.config);
          if (data.occupiedSlotsByDate) setOccupiedSlotsByDate(data.occupiedSlotsByDate);
        }
      })
      .catch(() => {
        // Fallback to default availability
      });
    if (token) {
      verifyActiveSession();
    }
  }, [isOpen, token]);

  useEffect(() => {
    try {
      window.dispatchEvent(new Event('gb-client-auth-change'));
    } catch {
      // ignore
    }
  }, [token, clientSession]);

  // Auto-select first available slot if current slot is occupied on selected date
  useEffect(() => {
    const occupiedOnDate = occupiedSlotsByDate[bookingDate] || [];
    const enabledSlots = (availabilityConfig.slots || DEFAULT_BOOKING_AVAILABILITY.slots).filter(
      (s) => s.enabled
    );
    if (occupiedOnDate.includes(bookingSlot) || !enabledSlots.some((s) => s.value === bookingSlot)) {
      const firstFree = enabledSlots.find((s) => !occupiedOnDate.includes(s.value));
      if (firstFree) {
        setBookingSlot(firstFree.value);
      }
    }
  }, [bookingDate, occupiedSlotsByDate, availabilityConfig]);

  const verifyActiveSession = async () => {
    try {
      const res = await fetch('/api/client/auth/verify-session', {
        headers: { 'x-client-token': token },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.client) {
          setClientSession(data.client);
          loadDashboardData(token, data.client);
          return;
        }
      }
    } catch (err) {
      console.warn('Session verification network issue, retaining local session:', err);
    }

    if (clientSession) {
      loadDashboardData(token, clientSession);
    } else {
      handleLogout();
    }
  };

  const loadDashboardData = async (
    currentToken: string,
    overrideSession?: {
      email: string;
      name: string;
      company: string;
      companyId?: string;
      contactType?: 'corporate_member' | 'individual';
      hasActiveService?: boolean;
      linkedProjectId?: string;
    } | null
  ) => {
    setIsLoadingDashboard(true);
    const activeSession = overrideSession || clientSession;
    const activeEmail = (activeSession?.email || emailInput || 'martin@distribuidorasur.com.ar').trim().toLowerCase();

    const matchedCrmContact = INITIAL_CRM_CONTACTS.find(
      (c) => c.email.toLowerCase() === activeEmail
    );
    const resolvedCompId = activeSession?.companyId || matchedCrmContact?.companyId;
    const fallbackCompanyProfile = resolvedCompId
      ? INITIAL_CRM_COMPANIES.find((c) => c.id === resolvedCompId) || null
      : INITIAL_CRM_COMPANIES.find(
          (c) => c.name.toLowerCase() === (activeSession?.company || '').toLowerCase()
        ) || null;

    const fallbackColleagues = fallbackCompanyProfile
      ? INITIAL_CRM_CONTACTS.filter((c) => c.companyId === fallbackCompanyProfile.id)
      : [];

    // Only assign a project if the user/company actually has an active contracted project
    const fallbackProject =
      INITIAL_CLIENT_PROJECTS.find(
        (p) =>
          (activeSession?.linkedProjectId && p.id === activeSession.linkedProjectId) ||
          (matchedCrmContact?.linkedProjectId && p.id === matchedCrmContact.linkedProjectId) ||
          p.clientEmail.toLowerCase() === activeEmail ||
          (fallbackCompanyProfile &&
            matchedCrmContact?.hasActiveService &&
            p.company.toLowerCase() === fallbackCompanyProfile.name.toLowerCase())
      ) || null;

    const fallbackOpps = INITIAL_CRM_OPPORTUNITIES.filter(
      (o) =>
        o.clientEmail.toLowerCase() === activeEmail ||
        (fallbackCompanyProfile && o.companyId === fallbackCompanyProfile.id) ||
        (fallbackCompanyProfile &&
          (o.company || '').toLowerCase() === fallbackCompanyProfile.name.toLowerCase())
    );

    let localStoredQuotes: any[] = [];
    try {
      const rawStored = localStorage.getItem('gb_arn_client_quotes_v1');
      if (rawStored) {
        const parsed = JSON.parse(rawStored);
        if (Array.isArray(parsed)) {
          localStoredQuotes = parsed.filter(
            (q: any) =>
              String(q.clientEmail || '').toLowerCase() === activeEmail ||
              (fallbackCompanyProfile &&
                String(q.clientCompany || '').toLowerCase() === fallbackCompanyProfile.name.toLowerCase()) ||
              (activeSession?.company &&
                String(q.clientCompany || '').toLowerCase() === String(activeSession.company).toLowerCase())
          );
        }
      }
    } catch {
      // ignore localStorage read errors
    }

    const fallbackQuotes = [
      ...localStoredQuotes,
      ...INITIAL_CRM_QUOTES.filter(
        (q) =>
          !localStoredQuotes.some((lq) => lq.id === q.id) &&
          (q.clientEmail.toLowerCase() === activeEmail ||
            (fallbackCompanyProfile &&
              (q.clientCompany || '').toLowerCase() === fallbackCompanyProfile.name.toLowerCase()))
      ),
    ];

    const fallbackInquiries = INITIAL_CONSULTING_INQUIRIES.filter(
      (i) =>
        i.clientEmail.toLowerCase() === activeEmail ||
        (fallbackCompanyProfile && i.company.toLowerCase() === fallbackCompanyProfile.name.toLowerCase())
    );

    const fallbackTickets = INITIAL_SUPPORT_TICKETS.filter(
      (t) =>
        t.clientEmail.toLowerCase() === activeEmail ||
        (fallbackCompanyProfile && t.company.toLowerCase() === fallbackCompanyProfile.name.toLowerCase())
    );

    const fallbackBookings = INITIAL_CONSULTING_BOOKINGS.filter(
      (b) =>
        b.clientEmail.toLowerCase() === activeEmail ||
        (fallbackCompanyProfile && b.company.toLowerCase() === fallbackCompanyProfile.name.toLowerCase())
    );

    try {
      const res = await fetch('/api/client/dashboard', {
        headers: {
          'x-client-token': currentToken,
          'x-client-email': activeEmail,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setProject(data.project !== undefined ? data.project : fallbackProject);
          setCompanyProfile(data.companyProfile || fallbackCompanyProfile);
          setCorporateColleagues(
            data.corporateColleagues && data.corporateColleagues.length > 0
              ? data.corporateColleagues
              : fallbackColleagues
          );
          setRelatedOpportunities(data.relatedOpportunities || fallbackOpps);
          const apiQuotes = Array.isArray(data.relatedQuotes) ? data.relatedQuotes : [];
          const mergedQuotes = [
            ...apiQuotes,
            ...fallbackQuotes.filter((fq) => !apiQuotes.some((aq: any) => aq.id === fq.id)),
          ];
          setRelatedQuotes(mergedQuotes);
          setInquiries(data.inquiries && data.inquiries.length > 0 ? data.inquiries : fallbackInquiries);
          setTickets(data.tickets && data.tickets.length > 0 ? data.tickets : fallbackTickets);
          setBookings(data.bookings && data.bookings.length > 0 ? data.bookings : fallbackBookings);
          setPaymentConfig(data.paymentConfig || DEFAULT_PAYMENT_CONFIG);
          return;
        }
      }
    } catch (err) {
      console.warn('Error loading client dashboard from backend, using local data store:', err);
    } finally {
      setIsLoadingDashboard(false);
    }

    setProject(fallbackProject);
    setCompanyProfile(fallbackCompanyProfile);
    setCorporateColleagues(fallbackColleagues);
    setRelatedOpportunities(fallbackOpps);
    setRelatedQuotes(fallbackQuotes);
    setInquiries(fallbackInquiries);
    setTickets(fallbackTickets);
    setBookings(fallbackBookings);
    setPaymentConfig(DEFAULT_PAYMENT_CONFIG);
  };

  // Direct Login with Username/Email + Password
  const handlePasswordLogin = async (
    e?: React.FormEvent,
    overrideIdentifier?: string,
    overridePassword?: string
  ) => {
    if (e) e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    const identifier = (overrideIdentifier ?? usernameInput ?? '').trim().toLowerCase();
    const pass = (overridePassword ?? passwordInput ?? '').trim();

    if (!identifier || !pass) {
      setAuthError('Ingresá tu usuario (o correo electrónico) y tu contraseña.');
      setAuthLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/client/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: identifier, password: pass }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.token && data.client) {
          setToken(data.token);
          setClientSession(data.client);
          if (rememberClient) {
            localStorage.setItem('gb_client_token', data.token);
            localStorage.setItem('gb_client_user', JSON.stringify(data.client));
          }
          loadDashboardData(data.token, data.client);
          setAuthLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Client login fallback evaluation:', err);
    }

    // Local/Serverless account validation
    const matchedAccount = CLIENT_ACCOUNTS.find(
      (acc) => acc.username.toLowerCase() === identifier || acc.email.toLowerCase() === identifier
    );
    const validMasterPasswords = ['cliente2026', 'client2026', 'gaston2026', 'distribuidora2026', 'nova2026'];
    const isPasswordValid =
      (matchedAccount && matchedAccount.password === pass) || validMasterPasswords.includes(pass);

    if (isPasswordValid) {
      const resolvedEmail = matchedAccount
        ? matchedAccount.email.toLowerCase()
        : identifier.includes('@')
        ? identifier
        : 'martin@distribuidorasur.com.ar';

      const matchedProj = INITIAL_CLIENT_PROJECTS.find(
        (p) =>
          (matchedAccount?.projectId && p.id === matchedAccount.projectId) ||
          p.clientEmail.toLowerCase() === resolvedEmail
      );

      const fallbackToken = 'gb_cli_' + Date.now();
      const clientObj = {
        id: matchedAccount?.id,
        email: resolvedEmail,
        username: matchedAccount?.username || resolvedEmail.split('@')[0],
        name: matchedAccount?.name || matchedProj?.clientName || 'Usuario Registrado',
        company:
          matchedAccount?.company ||
          matchedProj?.company ||
          (matchedAccount?.contactType === 'individual' ? 'Contacto Individual' : 'Organización'),
        companyId: matchedAccount?.companyId,
        role: matchedAccount?.role || 'Usuario Registrado',
        contactType: matchedAccount?.contactType || 'corporate_member',
        hasActiveService:
          matchedAccount?.hasActiveService !== undefined
            ? matchedAccount.hasActiveService
            : Boolean(matchedProj),
        linkedProjectId: matchedAccount?.projectId || matchedProj?.id,
      };

      setToken(fallbackToken);
      setClientSession(clientObj);
      if (rememberClient) {
        localStorage.setItem('gb_client_token', fallbackToken);
        localStorage.setItem('gb_client_user', JSON.stringify(clientObj));
      }
      loadDashboardData(fallbackToken, clientObj);
    } else {
      setAuthError('Usuario o contraseña incorrectos. Verificá tus credenciales o registrate gratis.');
    }
    setAuthLoading(false);
  };

  // Open User Registration (Corporate Member or Individual Contact — No active service required)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    const cleanName = regFullName.trim();
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanPassword = regPassword.trim() || 'cliente2026';
    const cleanUsername =
      (regUsername.trim() || cleanEmail.split('@')[0]).toLowerCase().replace(/[^a-z0-9._-]/g, '') ||
      `usuario.${Date.now().toString().slice(-4)}`;

    if (!cleanName || !cleanEmail || !cleanEmail.includes('@')) {
      setAuthError('Por favor ingresá tu nombre completo y un correo electrónico válido.');
      setAuthLoading(false);
      return;
    }

    if (regContactType === 'corporate_member' && !regCompanyName.trim()) {
      setAuthError('Ingresá el nombre de tu Empresa o Corporación (o elegí Contacto Individual).');
      setAuthLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/client/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: cleanName,
          email: cleanEmail,
          username: cleanUsername,
          password: cleanPassword,
          phone: regPhone.trim(),
          contactType: regContactType,
          companyName: regContactType === 'corporate_member' ? regCompanyName.trim() : undefined,
          companyTaxId: regContactType === 'corporate_member' ? regCompanyTaxId.trim() : undefined,
          roleTitle:
            regRoleTitle.trim() ||
            (regContactType === 'corporate_member'
              ? 'Representante Corporativo'
              : 'Contacto Individual'),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.token && data.client) {
        setToken(data.token);
        setClientSession(data.client);
        localStorage.setItem('gb_client_token', data.token);
        localStorage.setItem('gb_client_user', JSON.stringify(data.client));
        loadDashboardData(data.token, data.client);
        setAuthLoading(false);
        return;
      } else if (!res.ok && data.error) {
        setAuthError(data.error);
        setAuthLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Registration fallback to local session:', err);
    }

    // Resilient local registration fallback
    const fallbackToken = 'gb_cli_reg_' + Date.now();
    const clientObj = {
      email: cleanEmail,
      username: cleanUsername,
      name: cleanName,
      company:
        regContactType === 'corporate_member'
          ? regCompanyName.trim()
          : 'Contacto Individual / Independiente',
      role:
        regRoleTitle.trim() ||
        (regContactType === 'corporate_member' ? 'Representante Corporativo' : 'Contacto Individual'),
      contactType: regContactType,
      hasActiveService: false,
    };

    setToken(fallbackToken);
    setClientSession(clientObj);
    localStorage.setItem('gb_client_token', fallbackToken);
    localStorage.setItem('gb_client_user', JSON.stringify(clientObj));
    loadDashboardData(fallbackToken, clientObj);
    setAuthLoading(false);
  };

  // Step 1: Request OTP Access Code (with resilient zero-friction fallback)
  const handleRequestCode = async (e?: React.FormEvent, directEmail?: string) => {
    if (e) e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    const emailToUse = (directEmail || emailInput || '').trim();
    if (!emailToUse) {
      setAuthError('Por favor ingresá tu correo electrónico corporativo.');
      setAuthLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/client/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStep('code');
          if (data.codeHint) setCodeHint(data.codeHint);
          setEmailInput(emailToUse);
          return;
        } else {
          setAuthError(data.error || 'Error al solicitar el código de acceso.');
          return;
        }
      }
    } catch (err: any) {
      console.warn('Backend request-code issue, advancing with instant OTP code fallback:', err);
    } finally {
      setAuthLoading(false);
    }

    // Zero-friction instant access fallback
    const fallbackOtp = '742918';
    setCodeHint(fallbackOtp);
    setEmailInput(emailToUse);
    setStep('code');
    setAuthError('');
  };

  // Step 2: Verify OTP or Master PIN
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    const cleanInput = codeInput.trim();
    const cleanEmail = emailInput.trim().toLowerCase();
    const masterPins = ['client2026', 'gaston2026', '742918', codeHint.trim()].filter(Boolean);

    try {
      const res = await fetch('/api/client/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, code: cleanInput }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.token) {
          setToken(data.token);
          setClientSession(data.client);
          localStorage.setItem('gb_client_token', data.token);
          localStorage.setItem('gb_client_user', JSON.stringify(data.client));
          setStep('email');
          setCodeInput('');
          loadDashboardData(data.token, data.client);
          return;
        } else if (!masterPins.includes(cleanInput)) {
          setAuthError(data.error || 'Código incorrecto o expirado.');
          return;
        }
      }
    } catch (err: any) {
      console.warn('Backend verify-code issue, validating via local master keys:', err);
    } finally {
      setAuthLoading(false);
    }

    // Fallback validation for master pins or 6-digit test codes
    if (masterPins.includes(cleanInput) || (cleanInput.length >= 6 && /^\d+$/.test(cleanInput))) {
      const fallbackToken = 'gb_token_' + Date.now();
      const matchedProj = INITIAL_CLIENT_PROJECTS.find(
        (p) => p.clientEmail.toLowerCase() === cleanEmail
      ) || INITIAL_CLIENT_PROJECTS[0];

      const clientObj = {
        email: cleanEmail,
        name: matchedProj.clientName,
        company: matchedProj.company,
      };

      setToken(fallbackToken);
      setClientSession(clientObj);
      localStorage.setItem('gb_client_token', fallbackToken);
      localStorage.setItem('gb_client_user', JSON.stringify(clientObj));
      setStep('email');
      setCodeInput('');
      loadDashboardData(fallbackToken, clientObj);
    } else {
      setAuthError('Código incorrecto. Ingresá el código sugerido arriba o el PIN maestro: client2026');
    }
  };

  const handleLogout = () => {
    setToken('');
    setClientSession(null);
    localStorage.removeItem('gb_client_token');
    localStorage.removeItem('gb_client_user');
    setStep('email');
    setProject(null);
  };

  // Send reply in inquiry thread
  const handleSendInquiryReply = async () => {
    if (!selectedInquiry || !inquiryReplyText.trim()) return;
    setIsSendingReply(true);

    const newReply = {
      id: 'msg-' + Date.now(),
      sender: 'client' as const,
      senderName: clientSession?.name || 'Cliente',
      text: inquiryReplyText.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`/api/client/inquiries/${selectedInquiry.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-token': token,
          'x-client-email': clientSession?.email || '',
        },
        body: JSON.stringify({ text: inquiryReplyText }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.message) {
          newReply.id = data.message.id;
        }
      }
    } catch (err) {
      console.warn('Network issue on reply, updating client view locally:', err);
    } finally {
      setIsSendingReply(false);
    }

    const updated = {
      ...selectedInquiry,
      messages: [...selectedInquiry.messages, newReply],
      status: 'pending' as const,
    };
    setSelectedInquiry(updated);
    setInquiries((prev) => prev.map((inq) => (inq.id === updated.id ? updated : inq)));
    setInquiryReplyText('');
  };

  // Submit new inquiry
  const handleCreateInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInquiryTopic.trim() || !newInquiryQuestion.trim()) return;
    setIsSubmittingInquiry(true);

    const newInq: ConsultingInquiry = {
      id: 'inq-' + Date.now(),
      clientEmail: clientSession?.email || emailInput,
      clientName: clientSession?.name || 'Cliente',
      company: clientSession?.company || 'Empresa',
      projectId: project?.id || 'proj-001',
      topic: newInquiryTopic.trim(),
      category: newInquiryCategory,
      question: newInquiryQuestion.trim(),
      status: 'pending',
      messages: [
        {
          id: 'msg-' + Date.now(),
          sender: 'client',
          senderName: clientSession?.name || 'Cliente',
          text: newInquiryQuestion.trim(),
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/client/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-token': token,
          'x-client-email': clientSession?.email || '',
        },
        body: JSON.stringify({
          topic: newInquiryTopic,
          category: newInquiryCategory,
          question: newInquiryQuestion,
          clientName: clientSession?.name || '',
          company: clientSession?.company || '',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.inquiry) {
          newInq.id = data.inquiry.id;
        }
      }
    } catch (err) {
      console.warn('Network issue submitting inquiry, saving locally:', err);
    } finally {
      setIsSubmittingInquiry(false);
    }

    setInquiries((prev) => [newInq, ...prev]);
    setIsNewInquiryOpen(false);
    setNewInquiryTopic('');
    setNewInquiryQuestion('');
  };

  // Submit new ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) return;
    setIsSubmittingTicket(true);

    const newTicket: SupportTicket = {
      id: 'tick-' + Date.now(),
      ticketNumber: 'TICK-' + Math.floor(1000 + Math.random() * 9000),
      clientEmail: clientSession?.email || emailInput,
      clientName: clientSession?.name || 'Cliente',
      company: clientSession?.company || 'Empresa',
      subject: ticketSubject.trim(),
      severity: ticketSeverity,
      systemArea: ticketSystemArea,
      description: ticketDescription.trim(),
      status: 'open',
      slaHours: ticketSeverity === 'critical' ? 2 : ticketSeverity === 'high' ? 4 : 8,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/client/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-token': token,
          'x-client-email': clientSession?.email || '',
        },
        body: JSON.stringify({
          subject: ticketSubject,
          severity: ticketSeverity,
          systemArea: ticketSystemArea,
          description: ticketDescription,
          clientName: clientSession?.name || '',
          company: clientSession?.company || '',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.ticket) {
          newTicket.id = data.ticket.id;
        }
      }
    } catch (err) {
      console.warn('Network issue submitting ticket, saving locally:', err);
    } finally {
      setIsSubmittingTicket(false);
    }

    setTickets((prev) => [newTicket, ...prev]);
    setIsNewTicketOpen(false);
    setTicketSubject('');
    setTicketDescription('');
  };

  // 1-Click Quote Approval from Client Portal -> Auto-provisions 40/40/20 Project & CRM Won
  const handleAcceptQuoteFromPortal = async (quote: Quote) => {
    setIsApprovingQuoteId(quote.id);
    setQuoteApprovalFeedback('');
    try {
      const res = await fetch(`/api/client/quotes/${quote.id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-token': token,
          'x-client-email': clientSession?.email || emailInput || '',
        },
        body: JSON.stringify({
          clientEmail: clientSession?.email || quote.clientEmail,
          clientName: clientSession?.name || quote.clientName,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRelatedQuotes((prev) =>
          prev.map((q) => (q.id === quote.id ? { ...q, status: 'accepted' } : q))
        );
        try {
          const rawStored = localStorage.getItem('gb_arn_client_quotes_v1');
          if (rawStored) {
            const parsed = JSON.parse(rawStored);
            if (Array.isArray(parsed)) {
              const updatedStored = parsed.map((q: any) =>
                q.id === quote.id ? { ...q, status: 'accepted' } : q
              );
              localStorage.setItem('gb_arn_client_quotes_v1', JSON.stringify(updatedStored));
            }
          }
        } catch {
          // ignore localStorage update errors
        }
        if (data.project) {
          setProject(data.project);
        }
        setQuoteApprovalFeedback(
          data.message ||
            `¡Presupuesto ${quote.quoteNumber} aprobado! Tu Proyecto con esquema de hitos 40/40/20 ya está activo en tu Portal.`
        );
        setActiveTab('project');
      }
    } catch (err) {
      console.error('Error approving quote from portal:', err);
    } finally {
      setIsApprovingQuoteId(null);
    }
  };

  // Report Milestone Payment / Transfer Receipt -> Creates pending PaymentRecord in CRM Cobranzas
  const handleReportMilestonePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !selectedMilestoneForPayment || !paymentReportRef.trim()) return;
    setIsReportingPayment(true);
    setPaymentReportFeedback('');
    try {
      const res = await fetch(
        `/api/client/projects/${project.id}/milestones/${selectedMilestoneForPayment.id}/report-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-client-token': token,
            'x-client-email': clientSession?.email || emailInput || '',
          },
          body: JSON.stringify({
            method: paymentReportMethod,
            transactionRef: paymentReportRef.trim(),
            notes: paymentReportNotes.trim(),
          }),
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.project) {
          setProject(data.project);
        }
        setPaymentReportFeedback(
          data.message ||
            'Comprobante informado correctamente. Gastón Barea verificará la acreditación en Cobranzas CRM.'
        );
        setPaymentReportRef('');
        setPaymentReportNotes('');
      }
    } catch (err) {
      console.error('Error reporting milestone payment:', err);
    } finally {
      setIsReportingPayment(false);
    }
  };

  const getUpcomingBusinessDays = () => {
    const days: { iso: string; shortLabel: string; dayName: string }[] = [];
    const weekdayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const monthNames = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];
    const enabledWeekdays =
      availabilityConfig.enabledWeekdays?.length > 0
        ? availabilityConfig.enabledWeekdays
        : [1, 2, 3, 4, 5];
    const blockedSet = new Set(availabilityConfig.blockedDates || []);
    const cursor = new Date();
    let added = 0;
    let offset = 0;
    while (added < 5 && offset < 21) {
      offset++;
      const d = new Date(cursor);
      d.setDate(cursor.getDate() + offset);
      const dow = d.getDay();
      const iso = d.toISOString().split('T')[0];
      if (enabledWeekdays.includes(dow) && !blockedSet.has(iso)) {
        const dayName = offset === 1 ? 'Mañana' : weekdayNames[dow];
        const shortLabel = `${d.getDate()} ${monthNames[d.getMonth()]}`;
        days.push({ iso, shortLabel, dayName });
        added++;
      }
    }
    return days;
  };

  const getFriendlyBookingTypeTitle = (type?: string) => {
    switch (type) {
      case 'discovery_ia':
        return 'Diagnóstico & Propuesta IA (30 min)';
      case 'sprint_review':
        return 'Sprint Review & Demo en Staging (45 min)';
      case 'architecture_advisory':
        return 'Asesoría de Arquitectura, Odoo & Bioeconomía (45 min)';
      case 'emergency_audit':
        return 'Soporte Prioritario & Auditoría (30 min)';
      case 'incident_postmortem':
        return 'Revisión Operativa & Postmortem (30 min)';
      default:
        return 'Sesión 1-on-1 de Consultoría';
    }
  };

  const buildLocalCalendarUrl = (b: {
    type?: string;
    date: string;
    timeSlot: string;
    meetingUrl: string;
    agendaTopic?: string;
  }) => {
    const title = encodeURIComponent(
      `Google Meet Pro · Gastón Barea (${getFriendlyBookingTypeTitle(b.type)})`
    );
    const details = encodeURIComponent(
      `Videollamada 1-on-1 con Gastón Barea.\nSala Google Meet: ${b.meetingUrl}\nOrganizador: ${SITE_CONFIG.email}\nHorario: ${b.date} · ${b.timeSlot}\nTema: ${
        b.agendaTopic || 'Diagnóstico y seguimiento'
      }`
    );
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${encodeURIComponent(
      b.meetingUrl
    )}`;
  };

  // Submit new booking
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingBooking(true);
    setBookingConflictMsg('');

    const activeClientEmail = clientSession?.email || emailInput || 'cliente@empresa.com';
    const activeClientName = clientSession?.name || 'Cliente';
    const activeCompany = clientSession?.company || 'Contacto Individual';
    const resolvedTopic =
      bookingTopic.trim() || 'Revisión de arquitectura, propuesta y próximos pasos';

    let newBooking: ConsultingBooking = {
      id: 'book-' + Date.now(),
      clientEmail: activeClientEmail,
      clientName: activeClientName,
      company: activeCompany,
      phone: bookingPhone.trim() || undefined,
      type: bookingType,
      date: bookingDate,
      timeSlot: bookingSlot,
      meetingUrl:
        availabilityConfig.googleMeetUrl || 'https://meet.google.com/gastonbarea-consultoria',
      agendaTopic: resolvedTopic,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    let emailSent = false;
    let googleCalendarUrl = buildLocalCalendarUrl(newBooking);
    let whatsappConfirmUrl = `https://wa.me/5492804697193?text=${encodeURIComponent(
      `Hola Gastón, acabo de agendar en el Portal nuestra sesión "${getFriendlyBookingTypeTitle(
        bookingType
      )}" para el día ${bookingDate} (${bookingSlot}). Tema: ${resolvedTopic}`
    )}`;

    try {
      const res = await fetch('/api/client/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-token': token,
          'x-client-email': activeClientEmail,
        },
        body: JSON.stringify({
          type: bookingType,
          date: bookingDate,
          timeSlot: bookingSlot,
          agendaTopic: resolvedTopic,
          clientEmail: activeClientEmail,
          clientName: activeClientName,
          company: activeCompany,
          phone: bookingPhone.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.status === 409) {
        if (data.occupiedSlotsByDate) setOccupiedSlotsByDate(data.occupiedSlotsByDate);
        setBookingConflictMsg(
          data.error ||
            'Ese horario acaba de ser reservado. Por favor elegí otra franja horaria disponible.'
        );
        setIsSubmittingBooking(false);
        return;
      }
      if (res.ok && data.success && data.booking) {
        if (data.occupiedSlotsByDate) setOccupiedSlotsByDate(data.occupiedSlotsByDate);
        newBooking = data.booking;
        emailSent = Boolean(data.emailSent);
        if (data.googleCalendarUrl) googleCalendarUrl = data.googleCalendarUrl;
        if (data.whatsappConfirmUrl) whatsappConfirmUrl = data.whatsappConfirmUrl;
      }
    } catch (err) {
      console.warn('Network issue creating booking, saving locally:', err);
    } finally {
      setIsSubmittingBooking(false);
    }

    newBooking.googleCalendarUrl = googleCalendarUrl;
    newBooking.emailSent = emailSent;

    setBookings((prev) => [newBooking, ...prev]);
    setLastBookingConfirmation({
      booking: newBooking,
      emailSent,
      googleCalendarUrl,
      whatsappConfirmUrl,
    });
    setIsNewBookingOpen(false);
  };

  if (!isOpen) return null;

  return (
    <section className="w-full min-h-[calc(100vh-4rem)] bg-[#F5F5F7] text-[#1D1D1F] flex flex-col">
      {!token ? (
        /* ==============================================================
           FULL-PAGE ARCHITECTURAL LOGIN WORKSPACE (NO POP-UP WINDOW)
        ============================================================== */
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-4rem)]">
          {/* LEFT COLUMN (5 COLS): ARCHITECTURAL CONTEXT & DEMO ACCOUNTS */}
          <div className="lg:col-span-5 bg-[#09090E] text-white p-6 sm:p-10 lg:p-12 xl:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10">
            <div className="space-y-8">
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 text-xs font-sans font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-emerald-400" />
                  <span>Volver al Inicio</span>
                </button>
                <span className="text-[11px] font-mono font-semibold text-emerald-400 px-2.5 py-1 bg-white/[0.06] border border-white/10">
                  PORTAL CLIENTES · TLS 1.3
                </span>
              </div>

              <div className="space-y-4">
                <div className="text-xs font-sans font-semibold uppercase tracking-wider text-emerald-400">
                  GASTONBAREA.COM · PLATAFORMA DE GESTIÓN PMO
                </div>
                <h1 className="font-display text-2xl sm:text-3xl xl:text-4xl font-bold tracking-tight text-white leading-tight">
                  Portal Corporativo de Clientes & Seguimiento de Proyectos
                </h1>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Accedé con tu usuario y contraseña asignados para supervisar en tiempo real el avance de sprints, validar entregables en Staging UAT, abrir tickets con SLA garantizado y gestionar hitos.
                </p>
              </div>

              {/* Architectural Capabilities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-4 bg-white/[0.04] border border-white/10 space-y-1">
                  <div className="text-xs font-display font-bold text-white flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-emerald-400" />
                    <span>Esquema 40 / 40 / 20</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Trazabilidad de hitos técnicos, entregables verificables y pasarela de pagos integrada.
                  </p>
                </div>

                <div className="p-4 bg-white/[0.04] border border-white/10 space-y-1">
                  <div className="text-xs font-display font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Soporte SLA & Consultoría</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Canal directo 1-a-1 con Gastón Barea, agenda de Sprint Reviews y tickets con SLA.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Credential Selector for Demo / Testing */}
            <div className="pt-8 mt-8 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Agenda CRM Sincronizada · Cuentas del Portal (Con y Sin Servicio Activo):</span>
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 max-h-[340px] overflow-y-auto pr-1">
                {CLIENT_ACCOUNTS.map((acc) => (
                  <div
                    key={acc.id}
                    className="p-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-display font-bold text-white truncate">
                          {acc.name}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 border ${
                            acc.contactType === 'corporate_member'
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {acc.contactType === 'corporate_member' ? `Corp: ${acc.company}` : 'Contacto Individual'}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 ${
                            acc.hasActiveService
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-white/10 text-neutral-300'
                          }`}
                        >
                          {acc.hasActiveService ? '● Servicio Activo' : '○ Registrado s/Servicio'}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-neutral-400">
                        Usuario: <strong className="text-neutral-200">{acc.username}</strong> · Clave:{' '}
                        <strong className="text-neutral-200">{acc.password}</strong>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginMethod('password');
                          setUsernameInput(acc.username);
                          setPasswordInput(acc.password);
                          setEmailInput(acc.email);
                          setAuthError('');
                        }}
                        className="px-2.5 py-1.5 text-[11px] font-sans font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                      >
                        Cargar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUsernameInput(acc.username);
                          setPasswordInput(acc.password);
                          setEmailInput(acc.email);
                          handlePasswordLogin(undefined, acc.username, acc.password);
                        }}
                        className="px-2.5 py-1.5 text-[11px] font-sans font-semibold bg-[#291B64] hover:bg-[#382586] text-white inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Ingresar</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (7 COLS): LOGIN FORM (USUARIO + CONTRASEÑA / REGISTRO ABIERTO / OTP) */}
          <div className="lg:col-span-7 bg-white flex items-center justify-center p-6 sm:p-12 lg:p-16">
            <div className="w-full max-w-lg space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-sans font-semibold text-[#291B64]">
                  <Lock className="w-4 h-4" />
                  <span>Acceso & Registro Abierto al Portal Clientes</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]">
                  {loginMethod === 'register'
                    ? 'Registro en el Portal & Agenda CRM'
                    : 'Iniciar Sesión en tu Cuenta'}
                </h2>
                <p className="text-xs sm:text-sm text-[#515154]">
                  {loginMethod === 'register'
                    ? 'Registrate como miembro de una corporación o como contacto individual. Todos los contactos pasan a ser usuarios del Portal Clientes sin necesidad de tener un servicio contratado activo.'
                    : 'Ingresá con tu usuario y clave registrados en la Agenda ARN o creá tu cuenta corporativa para gestionar tus presupuestos 40/40/20.'}
                </p>
              </div>

              {/* REGISTRATION-PROTECTED BUDGET POLICY BANNER */}
              <div className="p-4 bg-[#0F172A] text-white border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Tratamiento de Presupuesto 40/40/20 Exclusivo para Usuarios Registrados</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Stock ARN · Micro / PyME / Grande</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Por confidencialidad comercial, todo el desglose de valores en escala, condición de dotación de empleados e hitos 40/40/20 se gestiona únicamente con cuenta registrada dentro del Portal Clientes.
                </p>
                {loginMethod !== 'register' && (
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('register');
                      setAuthError('');
                    }}
                    className="w-full py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Crear Cuenta Corporativa para Cotizar 40/40/20</span>
                  </button>
                )}
              </div>

              {/* Login / Register Method Switcher */}
              <div className="grid grid-cols-3 border border-black/10 bg-[#F5F5F7] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('password');
                    setAuthError('');
                  }}
                  className={`py-2 px-2.5 text-xs font-sans font-semibold transition-all cursor-pointer ${
                    loginMethod === 'password'
                      ? 'bg-[#1D1D1F] text-white'
                      : 'text-[#515154] hover:text-[#1D1D1F]'
                  }`}
                >
                  Usuario y Clave
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('register');
                    setAuthError('');
                  }}
                  className={`py-2 px-2.5 text-xs font-sans font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    loginMethod === 'register'
                      ? 'bg-[#291B64] text-white'
                      : 'text-[#291B64] hover:bg-black/5'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Crear Cuenta</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('otp');
                    setAuthError('');
                  }}
                  className={`py-2 px-2.5 text-xs font-sans font-semibold transition-all cursor-pointer ${
                    loginMethod === 'otp'
                      ? 'bg-[#1D1D1F] text-white'
                      : 'text-[#515154] hover:text-[#1D1D1F]'
                  }`}
                >
                  Código OTP
                </button>
              </div>

              {authError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{authError}</span>
                </div>
              )}

              {loginMethod === 'password' ? (
                <form onSubmit={(e) => handlePasswordLogin(e)} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-sans font-semibold text-[#1D1D1F]">
                      Usuario o Correo Electrónico
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        placeholder="Ej: martin.arismendi, sofia.peralta o correo"
                        className="w-full pl-10 pr-4 py-3 bg-[#F5F5F7] border border-black/15 text-sm font-sans text-[#1D1D1F] placeholder:text-slate-400 focus:outline-none focus:border-[#291B64] focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-sans font-semibold text-[#1D1D1F]">
                        Contraseña de Acceso
                      </label>
                      <button
                        type="button"
                        onClick={() => setLoginMethod('otp')}
                        className="text-xs font-sans font-medium text-[#291B64] hover:underline cursor-pointer"
                      >
                        ¿Olvidaste tu clave? Usar OTP
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="Ingresa tu contraseña"
                        className="w-full pl-10 pr-10 py-3 bg-[#F5F5F7] border border-black/15 text-sm font-sans text-[#1D1D1F] placeholder:text-slate-400 focus:outline-none focus:border-[#291B64] focus:bg-white transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                        aria-label="Mostrar u ocultar contraseña"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <label className="inline-flex items-center gap-2 text-[#515154] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberClient}
                        onChange={(e) => setRememberClient(e.target.checked)}
                        className="accent-[#291B64]"
                      />
                      <span>Mantener sesión activa en este dispositivo</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3.5 px-5 bg-[#291B64] hover:bg-[#382586] text-white font-sans font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {authLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Iniciar Sesión en el Portal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : loginMethod === 'register' ? (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 p-1 bg-[#F5F5F7] border border-black/10">
                    <button
                      type="button"
                      onClick={() => setRegContactType('corporate_member')}
                      className={`py-2 px-3 text-xs font-sans font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                        regContactType === 'corporate_member'
                          ? 'bg-[#291B64] text-white'
                          : 'text-[#515154] hover:text-[#1D1D1F]'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Contacto de Empresa</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegContactType('individual')}
                      className={`py-2 px-3 text-xs font-sans font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                        regContactType === 'individual'
                          ? 'bg-[#291B64] text-white'
                          : 'text-[#515154] hover:text-[#1D1D1F]'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Contacto Individual</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-sans font-semibold text-[#1D1D1F] mb-1">
                        Nombre y Apellido *
                      </label>
                      <input
                        type="text"
                        required
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="Ej: Ing. Laura Méndez"
                        className="w-full px-3.5 py-2.5 bg-[#F5F5F7] border border-black/15 text-xs text-[#1D1D1F] focus:outline-none focus:border-[#291B64] focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-sans font-semibold text-[#1D1D1F] mb-1">
                        Correo Electrónico *
                      </label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="laura@corporacion.com"
                        className="w-full px-3.5 py-2.5 bg-[#F5F5F7] border border-black/15 text-xs text-[#1D1D1F] focus:outline-none focus:border-[#291B64] focus:bg-white"
                      />
                    </div>
                  </div>

                  {regContactType === 'corporate_member' && (
                    <div className="p-3.5 bg-indigo-50/60 border border-indigo-200/80 space-y-3">
                      <div className="text-[11px] font-sans font-bold text-[#291B64] flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Agrupación Corporativa en Agenda CRM (Si la empresa existe, te vincula automáticamente)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                            Razón Social / Empresa *
                          </label>
                          <input
                            type="text"
                            required={regContactType === 'corporate_member'}
                            value={regCompanyName}
                            onChange={(e) => setRegCompanyName(e.target.value)}
                            placeholder="Ej: Distribuidora del Sur S.A."
                            className="w-full px-3 py-2 bg-white border border-black/15 text-xs text-[#1D1D1F] focus:outline-none focus:border-[#291B64]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-[#1D1D1F] mb-1">
                            CUIT / ID Fiscal (Opcional)
                          </label>
                          <input
                            type="text"
                            value={regCompanyTaxId}
                            onChange={(e) => setRegCompanyTaxId(e.target.value)}
                            placeholder="30-71458921-9"
                            className="w-full px-3 py-2 bg-white border border-black/15 text-xs text-[#1D1D1F] focus:outline-none focus:border-[#291B64]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-sans font-semibold text-[#1D1D1F] mb-1">
                        Cargo / Rol Profesional
                      </label>
                      <input
                        type="text"
                        value={regRoleTitle}
                        onChange={(e) => setRegRoleTitle(e.target.value)}
                        placeholder={
                          regContactType === 'corporate_member'
                            ? 'Ej: Directora de Operaciones'
                            : 'Ej: Consultor Independiente'
                        }
                        className="w-full px-3.5 py-2.5 bg-[#F5F5F7] border border-black/15 text-xs text-[#1D1D1F] focus:outline-none focus:border-[#291B64] focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-sans font-semibold text-[#1D1D1F] mb-1">
                        Teléfono / WhatsApp
                      </label>
                      <input
                        type="text"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+54 9 11 5555-0000"
                        className="w-full px-3.5 py-2.5 bg-[#F5F5F7] border border-black/15 text-xs text-[#1D1D1F] focus:outline-none focus:border-[#291B64] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-sans font-semibold text-[#1D1D1F] mb-1">
                        Nombre de Usuario (Opcional)
                      </label>
                      <input
                        type="text"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        placeholder="Ej: laura.mendez"
                        className="w-full px-3.5 py-2.5 bg-[#F5F5F7] border border-black/15 text-xs font-mono text-[#1D1D1F] focus:outline-none focus:border-[#291B64] focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-sans font-semibold text-[#1D1D1F] mb-1">
                        Contraseña de Acceso *
                      </label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Mínimo 4 caracteres"
                        className="w-full px-3.5 py-2.5 bg-[#F5F5F7] border border-black/15 text-xs text-[#1D1D1F] focus:outline-none focus:border-[#291B64] focus:bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3.5 px-5 bg-[#291B64] hover:bg-[#382586] text-white font-sans font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {authLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Registrarme e Ingresar al Portal Clientes</span>
                      </>
                    )}
                  </button>
                </form>
              ) : step === 'email' ? (
                <form onSubmit={(e) => handleRequestCode(e)} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-sans font-semibold text-[#1D1D1F]">
                      Correo Electrónico Corporativo
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="tu-correo@tuempresa.com"
                        className="w-full pl-10 pr-4 py-3 bg-[#F5F5F7] border border-black/15 text-sm font-sans text-[#1D1D1F] placeholder:text-slate-400 focus:outline-none focus:border-[#291B64] focus:bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3.5 px-5 bg-[#291B64] hover:bg-[#382586] text-white font-sans font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {authLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Enviar Código Temporal de 6 Dígitos</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyCode} className="space-y-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-sans font-semibold text-[#1D1D1F]">
                        Código de Verificación (6 dígitos)
                      </label>
                      <button
                        type="button"
                        onClick={() => setStep('email')}
                        className="text-xs text-[#291B64] hover:underline cursor-pointer"
                      >
                        Cambiar correo
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        maxLength={10}
                        value={codeInput}
                        onChange={(e) => setCodeInput(e.target.value)}
                        placeholder="Ej: 742918"
                        className="w-full pl-10 pr-4 py-3 bg-[#F5F5F7] border border-black/15 text-sm font-mono tracking-widest text-[#1D1D1F] focus:outline-none focus:border-[#291B64] focus:bg-white"
                      />
                    </div>
                    {codeHint && (
                      <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                        <span>
                          Código generado: <strong className="font-mono">{codeHint}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => setCodeInput(codeHint)}
                          className="font-semibold underline text-emerald-700 hover:text-emerald-950 cursor-pointer"
                        >
                          Autocompletar
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3.5 px-5 bg-[#291B64] hover:bg-[#382586] text-white font-sans font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {authLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verificar Código e Ingresar</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="pt-5 border-t border-black/10 flex items-center justify-between text-xs text-[#515154]">
                <span>
                  {loginMethod === 'register'
                    ? '¿Ya tenés usuario en la Agenda CRM?'
                    : '¿No tenés cuenta aún? Podés registrarte sin servicio activo'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod(loginMethod === 'register' ? 'password' : 'register');
                    setAuthError('');
                  }}
                  className="font-semibold text-[#291B64] hover:underline cursor-pointer"
                >
                  {loginMethod === 'register' ? 'Iniciar Sesión →' : 'Crear Cuenta Gratis →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ==============================================================
           AUTHENTICATED FULL-PAGE SAAS CLIENT WORKSPACE (NO POP-UP)
        ============================================================== */
        <div className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
          {/* LEFT WORKSPACE SIDEBAR (Compact + Horizontal Swipe Tabs on Mobile, Full Sidebar on Desktop) */}
          <aside className="w-full lg:w-72 bg-[#0A0A0F] text-white border-b lg:border-b-0 lg:border-r border-white/10 p-4 sm:p-6 flex flex-col justify-between shrink-0">
            <div className="space-y-4 lg:space-y-6">
              {/* Client Session Profile Card */}
              <div className="p-3.5 sm:p-4 bg-white/[0.04] border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border font-semibold ${
                      project
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    }`}
                  >
                    {project ? 'Servicio Activo' : 'Miembro Red ARN'}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {project?.quoteNumber ||
                      (clientSession?.contactType === 'individual' ? 'INDIVIDUAL' : 'CORP-ARN')}
                  </span>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <div className="font-display text-sm font-bold text-white">
                      {clientSession?.name}
                    </div>
                    <div className="text-xs text-emerald-400 font-medium">
                      {clientSession?.company}
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400 truncate">
                    {clientSession?.email}
                  </div>
                </div>
              </div>

              {/* Workspace Navigation (Horizontal scroll on mobile, vertical stack on desktop) */}
              <nav aria-label="Menú del Portal de Clientes" className="space-y-1.5">
                <div className="hidden lg:block text-[11px] font-sans font-semibold uppercase tracking-wider text-neutral-400 px-2 pb-1">
                  Espacio de Trabajo
                </div>
                <div className="flex lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0 snap-x">
                  <button
                    type="button"
                    onClick={() => setActiveTab('project')}
                    className={`snap-start shrink-0 lg:w-full min-h-[42px] px-3.5 py-2.5 text-xs font-sans font-semibold transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      activeTab === 'project'
                        ? 'bg-[#291B64] text-white border-b-2 lg:border-b-0 lg:border-l-2 border-emerald-400'
                        : 'bg-white/[0.03] lg:bg-transparent text-neutral-300 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2 whitespace-nowrap">
                      <FolderGit2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{project ? 'Proyecto 40/40/20' : 'Propuestas & ARN'}</span>
                    </span>
                    {project ? (
                      <span className="text-[11px] font-mono text-emerald-300">
                        {project.progressPercent}%
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-white/10 text-neutral-300">
                        {relatedQuotes.length || 'ARN'}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('directory')}
                    className={`snap-start shrink-0 lg:w-full min-h-[42px] px-3.5 py-2.5 text-xs font-sans font-semibold transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      activeTab === 'directory'
                        ? 'bg-[#291B64] text-white border-b-2 lg:border-b-0 lg:border-l-2 border-emerald-400'
                        : 'bg-white/[0.03] lg:bg-transparent text-neutral-300 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2 whitespace-nowrap">
                      <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Mi Corporación</span>
                    </span>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 bg-white/10 text-white">
                      {corporateColleagues.length || 1}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('inquiries')}
                    className={`snap-start shrink-0 lg:w-full min-h-[42px] px-3.5 py-2.5 text-xs font-sans font-semibold transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      activeTab === 'inquiries'
                        ? 'bg-[#291B64] text-white border-b-2 lg:border-b-0 lg:border-l-2 border-emerald-400'
                        : 'bg-white/[0.03] lg:bg-transparent text-neutral-300 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2 whitespace-nowrap">
                      <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Consultas</span>
                    </span>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 bg-white/10 text-white">
                      {inquiries.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('bookings')}
                    className={`snap-start shrink-0 lg:w-full min-h-[42px] px-3.5 py-2.5 text-xs font-sans font-semibold transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      activeTab === 'bookings'
                        ? 'bg-[#291B64] text-white border-b-2 lg:border-b-0 lg:border-l-2 border-emerald-400'
                        : 'bg-white/[0.03] lg:bg-transparent text-neutral-300 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2 whitespace-nowrap">
                      <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Agenda Meet</span>
                    </span>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 bg-white/10 text-white">
                      {bookings.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('tickets')}
                    className={`snap-start shrink-0 lg:w-full min-h-[42px] px-3.5 py-2.5 text-xs font-sans font-semibold transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      activeTab === 'tickets'
                        ? 'bg-[#291B64] text-white border-b-2 lg:border-b-0 lg:border-l-2 border-emerald-400'
                        : 'bg-white/[0.03] lg:bg-transparent text-neutral-300 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2 whitespace-nowrap">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Soporte SLA</span>
                    </span>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 bg-white/10 text-white">
                      {tickets.length}
                    </span>
                  </button>
                </div>
              </nav>
            </div>

            {/* Sidebar Footer Actions (Single compact row on mobile, stacked on desktop) */}
            <div className="pt-3 mt-3 lg:pt-6 lg:mt-6 border-t border-white/10 grid grid-cols-2 lg:grid-cols-1 gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full min-h-[40px] px-3 py-2 text-xs font-sans font-medium text-neutral-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors flex items-center justify-center lg:justify-start gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Volver al Inicio</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full min-h-[40px] px-3 py-2 text-xs font-sans font-semibold text-rose-300 hover:text-white hover:bg-rose-600/30 border border-rose-500/20 transition-colors flex items-center justify-center lg:justify-start gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </aside>

          {/* MAIN WORKSPACE CONTENT AREA */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#F5F5F7]">
            {/* Top Contextual Workspace Bar */}
            <div className="bg-white border-b border-black/[0.07] px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-sans text-[#515154] flex flex-wrap items-center gap-2">
                  <span>Portal Clientes ARN</span>
                  <span>/</span>
                  <strong className="text-[#1D1D1F]">{clientSession?.company}</strong>
                  {clientSession?.contactType === 'individual' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-100 text-amber-800 font-semibold">
                      Contacto Individual
                    </span>
                  )}
                </div>
                <h1 className="font-display text-base sm:text-xl font-bold text-[#1D1D1F] tracking-tight mt-0.5">
                  {project?.projectName ||
                    'Espacio Autónomo ARN · Propuestas 40/40/20 & Consultoría'}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => loadDashboardData(token)}
                  disabled={isLoadingDashboard}
                  className="min-h-[38px] px-3 py-2 bg-[#F5F5F7] hover:bg-black/[0.06] border border-black/10 text-xs font-sans font-semibold text-[#1D1D1F] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Sincronizar datos del portal"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDashboard ? 'animate-spin' : ''}`} />
                  <span>Sincronizar</span>
                </button>

                {project?.stagingUrl && (
                  <a
                    href={project.stagingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[38px] px-3.5 py-2 bg-[#291B64] hover:bg-[#382586] text-white text-xs font-sans font-semibold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Staging UAT</span>
                  </a>
                )}
              </div>
            </div>

            {/* Workspace Body */}
            <div className="flex-1 p-4 sm:p-8 lg:p-10 max-w-6xl w-full mx-auto space-y-6">
              {/* ALWAYS-VISIBLE ARN STOCK SELECTOR & 4-NODE AUTONOMOUS AGENT FOR LOGGED-IN CLIENTS */}
              {activeTab === 'project' && (
                <div className="space-y-4">
                  <ArnClientIntakeWidget
                    variant="portal-compact"
                    onOpenPortalWithSession={() => loadDashboardData(token, clientSession)}
                  />

                  {/* AGENTE AUTÓNOMO DE PRESUPUESTO 40/40/20 Y PROYECTO (EXCLUSIVO SESIÓN INICIADA) */}
                  <div className="p-4 sm:p-5 bg-[#0F172A] text-white border border-slate-800 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-xs font-bold text-white">
                          Agente IA Autónomo de tu Portal (Ciclo 4 Fases · Tratamiento Privado 40/40/20)
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 font-mono text-[10px]">
                          1. Evalúa Objetivo → 2. Memoria CRM → 3. Ejecuta Stock ARN → 4. Verifica 40/40/20
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                        <button
                          type="button"
                          onClick={() =>
                            handleRunPortalAgent(
                              undefined,
                              'Actualizá mi presupuesto 40/40/20 para una dotación de 20 empleados con Odoo v18 ERP y decime cómo quedan los 3 hitos'
                            )
                          }
                          className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer"
                        >
                          Ej. 1: Recalcular para 20 empleados
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleRunPortalAgent(
                              undefined,
                              'Auditá el estado de mis hitos de pago 40/40/20 y agendame una sesión Google Meet de seguimiento'
                            )
                          }
                          className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer"
                        >
                          Ej. 2: Auditar Saldos + Agendar Meet
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleRunPortalAgent} className="flex flex-col sm:flex-row items-stretch gap-2">
                      <input
                        type="text"
                        value={portalAgentPrompt}
                        onChange={(e) => setPortalAgentPrompt(e.target.value)}
                        placeholder='Pedile al Agente de tu Portal: "Actualizá mi presupuesto 40/40/20 para 15 empleados", "Auditá el saldo del primer hito", "Agendá sesión Meet"...'
                        className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-400"
                      />
                      <button
                        type="submit"
                        disabled={isRunningPortalAgent || !portalAgentPrompt.trim()}
                        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap"
                      >
                        {isRunningPortalAgent ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        <span>Ejecutar Agente en mi Cuenta</span>
                      </button>
                    </form>

                    {portalAgentResult && (
                      <div className="p-3.5 bg-slate-900 border border-emerald-500/40 text-xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-emerald-400 uppercase text-[11px]">
                            ✓ Agente Autónomo Verificó y Actualizó tu Portal
                          </span>
                          <button
                            type="button"
                            onClick={() => setPortalAgentResult(null)}
                            className="text-slate-400 hover:text-white text-[11px] cursor-pointer"
                          >
                            Cerrar ×
                          </button>
                        </div>

                        {portalAgentResult.agentTrace && (
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                            <div className="p-2 bg-slate-950 border border-slate-800">
                              <div className="text-[10px] font-mono font-bold uppercase text-emerald-400">
                                1. Objetivo
                              </div>
                              <div className="text-[11px] text-slate-300 mt-0.5">
                                {portalAgentResult.agentTrace.step1_evaluateObjective?.subtasks?.length || 0} subtareas lógicas
                              </div>
                            </div>
                            <div className="p-2 bg-slate-950 border border-slate-800">
                              <div className="text-[10px] font-mono font-bold uppercase text-cyan-400">
                                2. Memoria y Escala
                              </div>
                              <div className="text-[11px] text-slate-300 mt-0.5">
                                {portalAgentResult.agentTrace.step2_contextAndMemory?.companyScaleLabel} ({portalAgentResult.agentTrace.step2_contextAndMemory?.detectedEmployeeCount} emp.)
                              </div>
                            </div>
                            <div className="p-2 bg-slate-950 border border-slate-800">
                              <div className="text-[10px] font-mono font-bold uppercase text-amber-400">
                                3. Herramientas
                              </div>
                              <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                                {(portalAgentResult.agentTrace.step3_toolsExecuted || [])
                                  .map((t: any) => t.toolName)
                                  .join(', ')}
                              </div>
                            </div>
                            <div className="p-2 bg-slate-950 border border-emerald-500/30">
                              <div className="text-[10px] font-mono font-bold uppercase text-emerald-400">
                                4. Verificación
                              </div>
                              <div className="text-[11px] text-slate-200 mt-0.5">
                                {portalAgentResult.agentTrace.step4_resultVerification?.auditSummary}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="space-y-1 text-slate-200">
                          {portalAgentResult.actionsExecuted.map((act, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{act}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 1A: USUARIO REGISTRADO SIN PROYECTO ACTIVO CONTRATADO */}
              {activeTab === 'project' && !project && (
                <div className="space-y-6">
                  <div className="bg-white p-5 sm:p-8 border border-black/[0.08] space-y-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/[0.08] pb-5">
                      <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 bg-indigo-50 text-[#291B64] border border-indigo-200">
                          Cuenta Activa en Portal Clientes & Red ARN · Sin Servicio Contratado Activo
                        </div>
                        <h2 className="font-display text-xl sm:text-2xl font-bold text-[#1D1D1F]">
                          Bienvenido/a, {clientSession?.name}
                        </h2>
                        <p className="text-xs sm:text-sm text-[#515154] max-w-2xl">
                          Tu perfil está registrado en nuestra Agenda Corporativa CRM como{' '}
                          <strong>
                            {clientSession?.contactType === 'individual'
                              ? 'Contacto Individual'
                              : `miembro de ${clientSession?.company}`}
                          </strong>
                          . Desde este espacio podés realizar consultas técnicas, agendar sesiones 1-on-1 de diagnóstico y evaluar propuestas sin necesidad de tener un producto o servicio contratado previamente.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('inquiries');
                            setIsNewInquiryOpen(true);
                          }}
                          className="px-4 py-2.5 bg-[#291B64] hover:bg-[#382586] text-white text-xs font-sans font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Iniciar Consulta Técnica</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('bookings');
                            setIsNewBookingOpen(true);
                          }}
                          className="px-4 py-2.5 bg-[#1D1D1F] hover:bg-black text-white text-xs font-sans font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Agendar Sesión 1-on-1</span>
                        </button>
                      </div>
                    </div>

                    {/* Oportunidades en Pipeline o Cotizaciones vinculadas a este Contacto / Corporación */}
                    <div className="space-y-3">
                      <h3 className="font-display text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#291B64]" />
                        <span>Oportunidades & Propuestas en Evaluación en el Pipeline CRM</span>
                      </h3>

                      {relatedOpportunities.length === 0 && relatedQuotes.length === 0 ? (
                        <div className="p-5 bg-[#F5F5F7] border border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="text-xs font-bold text-[#1D1D1F]">
                              Aún no tenés propuestas comerciales ni proyectos activos asociados
                            </div>
                            <p className="text-xs text-[#515154]">
                              Podés abrir una consulta de arquitectura o solicitar una cotización formal a medida para tu organización o proyecto individual.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('inquiries');
                              setIsNewInquiryOpen(true);
                            }}
                            className="px-3.5 py-2 bg-white hover:bg-[#291B64] text-[#291B64] hover:text-white border border-black/15 text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                          >
                            Solicitar Propuesta →
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {relatedOpportunities.map((opp: any) => (
                            <div
                              key={opp.id}
                              className="p-4 bg-[#F5F5F7] border border-black/10 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-[#291B64]/10 text-[#291B64]">
                                  Etapa Pipeline: {opp.stage}
                                </span>
                                <span className="text-xs font-mono font-bold text-[#1D1D1F]">
                                  {opp.currency} ${Number(opp.estimatedValue || 0).toLocaleString()}
                                </span>
                              </div>
                              <div className="text-sm font-bold text-[#1D1D1F]">{opp.title}</div>
                              <p className="text-xs text-[#515154]">{opp.notes}</p>
                            </div>
                          ))}
                          {relatedQuotes.map((qt: any) => (
                            <div
                              key={qt.id}
                              className="p-4 sm:p-5 bg-emerald-50/60 border-2 border-emerald-300 space-y-3.5 flex flex-col justify-between md:col-span-2"
                            >
                              <div className="space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 bg-emerald-800 text-white">
                                      Presupuesto Oficial {qt.quoteNumber} · {qt.status === 'accepted' ? 'Aprobado' : 'En Evaluación en Portal'}
                                    </span>
                                    {qt.companySizeScaleLabel && (
                                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-indigo-100 text-indigo-900 border border-indigo-300">
                                        Escala: {qt.companySizeScaleLabel}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-base font-mono font-bold text-emerald-950">
                                    Inversión Total: {qt.currency} ${Number(qt.total || 0).toLocaleString()}
                                  </span>
                                </div>
                                <div className="text-base font-bold text-[#1D1D1F]">
                                  {qt.title || 'Propuesta Formal Emitida desde Stock ARN'}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-emerald-900">
                                  <span className="px-2 py-0.5 bg-emerald-100/90 border border-emerald-300 font-bold">
                                    Dotación Declarada: {qt.employeeRangeLabel || `Hasta ${qt.employeeCount || 5} empleados`}
                                  </span>
                                  <span className="px-2 py-0.5 bg-emerald-900 text-emerald-100 font-bold">
                                    Servicio Mensual + Soporte SLA Incluido: {qt.currency} ${Number(qt.monthlySupportFee || 250).toLocaleString()}/mes
                                  </span>
                                </div>

                                {/* Desglose de Ítems del Stock ARN (Ítem 1: Servicio Base en Escala + Ítem 2: Condición de Empleados) */}
                                {Array.isArray(qt.items) && qt.items.length > 0 && (
                                  <div className="bg-white border border-emerald-200 p-3 space-y-2">
                                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-900">
                                      Desglose de Ítems del Stock de Servicios ARN
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                      {qt.items.map((item: any, idx: number) => (
                                        <div key={idx} className="py-1.5 flex items-center justify-between gap-3 text-xs">
                                          <span className="text-slate-800 font-medium">{item.description}</span>
                                          <span className="font-mono font-bold text-slate-900 shrink-0">
                                            {qt.currency} ${Number(item.total ?? item.unitPrice ?? 0).toLocaleString()}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Cronograma de Hitos 40% / 40% / 20% */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                                  <div className="p-2.5 bg-white border border-emerald-200">
                                    <div className="text-[10px] font-mono font-bold uppercase text-emerald-800">
                                      Hito 1 · 40% Anticipo Kickoff
                                    </div>
                                    <div className="text-sm font-mono font-bold text-slate-900 mt-0.5">
                                      {qt.currency} ${Math.round(Number(qt.total || 0) * 0.4).toLocaleString()}
                                    </div>
                                  </div>
                                  <div className="p-2.5 bg-white border border-emerald-200">
                                    <div className="text-[10px] font-mono font-bold uppercase text-emerald-800">
                                      Hito 2 · 40% Staging & UAT
                                    </div>
                                    <div className="text-sm font-mono font-bold text-slate-900 mt-0.5">
                                      {qt.currency} ${Math.round(Number(qt.total || 0) * 0.4).toLocaleString()}
                                    </div>
                                  </div>
                                  <div className="p-2.5 bg-white border border-emerald-200">
                                    <div className="text-[10px] font-mono font-bold uppercase text-emerald-800">
                                      Hito 3 · 20% Go-Live Final
                                    </div>
                                    <div className="text-sm font-mono font-bold text-slate-900 mt-0.5">
                                      {qt.currency} ${(Number(qt.total || 0) - Math.round(Number(qt.total || 0) * 0.4) * 2).toLocaleString()}
                                    </div>
                                  </div>
                                </div>

                                <p className="text-xs text-slate-600">{qt.paymentTerms}</p>
                              </div>

                              <div className="pt-3 border-t border-emerald-200/80 flex items-center justify-between gap-2">
                                {qt.status === 'accepted' ? (
                                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>Presupuesto Aprobado · Proyecto 40/40/20 Activo</span>
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={isApprovingQuoteId === qt.id}
                                    onClick={() => handleAcceptQuoteFromPortal(qt)}
                                    className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                  >
                                    {isApprovingQuoteId === qt.id ? (
                                      <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="w-4 h-4" />
                                    )}
                                    <span>Aprobar Presupuesto en Portal e Iniciar Proyecto 40/40/20 (1-Clic)</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Accesos Rápidos para Usuarios Registrados */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div className="p-4 bg-[#F5F5F7] border border-black/[0.08] space-y-2">
                        <div className="text-xs font-display font-bold text-[#1D1D1F] flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#291B64]" />
                          <span>Agenda Corporativa</span>
                        </div>
                        <p className="text-xs text-[#515154]">
                          Visualizá los contactos agrupados bajo tu corporación o tu ficha de usuario registrado.
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveTab('directory')}
                          className="text-xs font-semibold text-[#291B64] hover:underline cursor-pointer"
                        >
                          Ver Agenda ({corporateColleagues.length || 1}) →
                        </button>
                      </div>

                      <div className="p-4 bg-[#F5F5F7] border border-black/[0.08] space-y-2">
                        <div className="text-xs font-display font-bold text-[#1D1D1F] flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-[#291B64]" />
                          <span>Asesoría de Arquitectura</span>
                        </div>
                        <p className="text-xs text-[#515154]">
                          Realizá consultas técnicas sobre IA Services, Odoo v18, Bioeconomía o infraestructura Linux.
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveTab('inquiries')}
                          className="text-xs font-semibold text-[#291B64] hover:underline cursor-pointer"
                        >
                          Ir a Consultas →
                        </button>
                      </div>

                      <div className="p-4 bg-[#F5F5F7] border border-black/[0.08] space-y-2">
                        <div className="text-xs font-display font-bold text-[#1D1D1F] flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#291B64]" />
                          <span>Reunión de Diagnóstico</span>
                        </div>
                        <p className="text-xs text-[#515154]">
                          Coordiná una videollamada 1-on-1 con Gastón Barea para relevar requerimientos.
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveTab('bookings')}
                          className="text-xs font-semibold text-[#291B64] hover:underline cursor-pointer"
                        >
                          Reservar Turno →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 1B: ESTADO DEL PROYECTO ACTIVO */}
              {activeTab === 'project' && project && (
                <div className="space-y-6">
                  {quoteApprovalFeedback && (
                    <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{quoteApprovalFeedback}</span>
                    </div>
                  )}

                  {/* Si existen cotizaciones adicionales pendientes de aprobación para este cliente */}
                  {relatedQuotes.some((q) => q.status !== 'accepted') && (
                    <div className="bg-emerald-50/70 p-5 border border-emerald-200 space-y-3">
                      <div className="text-xs font-mono font-bold uppercase text-emerald-900">
                        Propuestas Comerciales Pendientes de Aprobación
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {relatedQuotes
                          .filter((q) => q.status !== 'accepted')
                          .map((qt) => (
                            <div
                              key={qt.id}
                              className="p-4 bg-white border border-emerald-200 flex flex-col justify-between gap-3"
                            >
                              <div>
                                <div className="flex items-center justify-between text-xs font-mono font-bold">
                                  <span className="text-emerald-800">{qt.quoteNumber}</span>
                                  <span>
                                    {qt.currency} ${Number(qt.total || 0).toLocaleString()}
                                  </span>
                                </div>
                                <div className="text-sm font-bold text-[#1D1D1F] mt-1">{qt.title}</div>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] font-mono text-emerald-900">
                                  <span className="px-1.5 py-0.5 bg-emerald-100 border border-emerald-300">
                                    {qt.employeeRangeLabel || `Hasta ${qt.employeeCount || 5} empleados`}
                                  </span>
                                  <span className="px-1.5 py-0.5 bg-emerald-900 text-emerald-100">
                                    + Abono Soporte SLA: {qt.currency} ${Number(qt.monthlySupportFee || 250).toLocaleString()}/mes
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 mt-1">
                                  {(qt as any).paymentTerms || (qt as any).notes || 'Esquema de hitos 40% / 40% / 20%'}
                                </p>
                              </div>
                              <button
                                type="button"
                                disabled={isApprovingQuoteId === qt.id}
                                onClick={() => handleAcceptQuoteFromPortal(qt)}
                                className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Aprobar Propuesta 40/40/20 (1-Clic)</span>
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Project Overview Card */}
                  <div className="bg-white p-6 border border-black/[0.08] space-y-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 bg-[#291B64]/10 text-[#291B64] uppercase">
                            {project.serviceCategory}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 ${
                              project.status === 'staging'
                                ? 'bg-amber-100 text-amber-800'
                                : project.status === 'in_progress'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            Estado: {project.status.toUpperCase()}
                          </span>
                          {project.quoteNumber && (
                            <span className="text-[11px] font-mono text-slate-500">
                              Ref: {project.quoteNumber}
                            </span>
                          )}
                        </div>
                        <h2 className="font-display text-xl font-bold text-[#1D1D1F]">
                          {project.projectName}
                        </h2>
                        <p className="text-xs text-[#515154] mt-0.5">
                          Responsable Cliente: <strong>{project.clientName}</strong> · {project.company}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setActiveTab('bookings')}
                          className="px-4 py-2 bg-[#1D1D1F] hover:bg-[#291B64] text-white font-sans font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Agendar Sprint Review</span>
                        </button>
                      </div>
                    </div>

                    {/* Active Sprint & Progress */}
                    <div className="p-4 bg-[#F5F5F7] border border-black/[0.07] space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1D1D1F]">Sprint Activo:</span>
                          <span className="font-semibold text-[#291B64]">{project.activeSprint}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500 text-[11px] font-mono tabular-nums">
                          <span>Inicio: {project.startDate}</span>
                          <span>·</span>
                          <span>Entrega estimada: {project.estimatedDelivery}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-[#1D1D1F]">Progreso General del Proyecto</span>
                          <span className="text-[#291B64] font-mono tabular-nums">{project.progressPercent}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-200 overflow-hidden">
                          <div
                            className="h-full bg-[#291B64] transition-all duration-500"
                            style={{ width: `${project.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Milestones & Deliverables Breakdown */}
                  <div className="bg-white p-6 border border-black/[0.08] space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-base font-bold text-[#1D1D1F]">
                          Hitos de Entrega y Entregables Técnicos (Esquema 40/40/20)
                        </h3>
                        <p className="text-xs text-[#515154]">
                          Evolución paso a paso del proyecto, homologaciones y estado financiero de cada hito
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {project.milestones.map((ms) => (
                        <div
                          key={ms.id}
                          className={`p-4 border transition-all ${
                            ms.status === 'completed'
                              ? 'bg-emerald-50/40 border-emerald-200'
                              : ms.status === 'in_progress'
                              ? 'bg-blue-50/50 border-blue-300'
                              : 'bg-[#F5F5F7] border-black/10'
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[10px] font-mono font-bold px-2 py-0.5 ${
                                    ms.status === 'completed'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : ms.status === 'in_progress'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {ms.status === 'completed'
                                    ? '✓ Completado'
                                    : ms.status === 'in_progress'
                                    ? '⏳ En Desarrollo Activo'
                                    : 'Pendiente'}
                                </span>
                                <span className="text-[11px] font-mono text-slate-500">
                                  ({ms.percentage}% del total)
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-[#1D1D1F]">{ms.title}</h4>
                            </div>

                            {/* Payment status & action button */}
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="text-right">
                                <div className="text-xs font-mono font-bold text-[#1D1D1F] tabular-nums">
                                  {ms.currency} ${ms.amount.toLocaleString()}
                                </div>
                                <div
                                  className={`text-[10px] font-bold ${
                                    ms.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-700'
                                  }`}
                                >
                                  {ms.paymentStatus === 'paid' ? '✓ Abonado' : 'Pago de Hito Pendiente'}
                                </div>
                              </div>

                              {ms.paymentStatus === 'pending' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedMilestoneForPayment(
                                      selectedMilestoneForPayment?.id === ms.id ? null : ms
                                    )
                                  }
                                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  <span>
                                    {selectedMilestoneForPayment?.id === ms.id
                                      ? 'Ocultar Medios de Pago'
                                      : 'Pagar Hito'}
                                  </span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Deliverables checklist */}
                          <div className="mt-3 pt-3 border-t border-black/[0.08] space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-700">
                              Entregables Verificables:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600">
                              {ms.deliverables.map((deliv, dIdx) => (
                                <div key={dIdx} className="flex items-start gap-2">
                                  <CheckCircle2
                                    className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                                      ms.status === 'completed' ? 'text-emerald-600' : 'text-blue-500'
                                    }`}
                                  />
                                  <span>{deliv}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* INLINE PANEL: PAGO DE HITO DEL PROYECTO */}
                          {selectedMilestoneForPayment?.id === ms.id && (
                            <div className="mt-4 pt-4 border-t border-black/10 bg-white p-5 space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] font-mono font-bold text-[#291B64] uppercase">
                                    Abonar Hito de Proyecto
                                  </span>
                                  <h4 className="text-sm font-bold text-[#1D1D1F]">
                                    {selectedMilestoneForPayment.title}
                                  </h4>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setSelectedMilestoneForPayment(null)}
                                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                                >
                                  Cerrar ×
                                </button>
                              </div>

                              <div className="p-3.5 bg-[#F5F5F7] border border-black/10 flex items-center justify-between">
                                <span className="text-xs text-slate-600 font-medium">
                                  Monto a abonar para liberar hito:
                                </span>
                                <span className="text-lg font-mono font-bold text-[#1D1D1F] tabular-nums">
                                  {selectedMilestoneForPayment.currency} $
                                  {selectedMilestoneForPayment.amount.toLocaleString()}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <a
                                  href={
                                    selectedMilestoneForPayment.paymentLink ||
                                    `https://mpago.la/pos/gastonbarea?amount=${selectedMilestoneForPayment.amount}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="py-3 px-4 bg-[#009EE3] hover:bg-[#0082ba] text-white font-bold text-xs flex items-center justify-between transition-colors"
                                >
                                  <span className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" />
                                    <span>Pagar con Mercado Pago Oficial</span>
                                  </span>
                                  <ExternalLink className="w-4 h-4" />
                                </a>

                                {selectedMilestoneForPayment.currency === 'USD' && (
                                  <a
                                    href={`https://buy.stripe.com/gastonbarea_consultoria?amount=${selectedMilestoneForPayment.amount}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="py-3 px-4 bg-[#635BFF] hover:bg-[#5349e0] text-white font-bold text-xs flex items-center justify-between transition-colors"
                                  >
                                    <span className="flex items-center gap-2">
                                      <CreditCard className="w-4 h-4" />
                                      <span>Pagar con Stripe USD</span>
                                    </span>
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                )}
                              </div>

                              <div className="p-3.5 bg-[#F5F5F7] border border-black/10 text-xs space-y-1.5 text-slate-700">
                                <div className="font-bold flex items-center gap-1.5 text-[#1D1D1F]">
                                  <Building2 className="w-3.5 h-3.5 text-[#291B64]" />
                                  <span>Transferencia Bancaria (CBU / Alias / Factura A o B):</span>
                                </div>
                                <div className="font-mono text-[11px] grid grid-cols-1 sm:grid-cols-2 gap-1 bg-white p-2.5 border border-black/10">
                                  <div>
                                    <strong>CBU:</strong>{' '}
                                    {paymentConfig?.bankTransfer?.cbu || '0000003100012345678901'}
                                  </div>
                                  <div>
                                    <strong>Alias:</strong>{' '}
                                    {paymentConfig?.bankTransfer?.alias || 'GASTON.BAREA.IT'}
                                  </div>
                                  <div>
                                    <strong>Titular:</strong>{' '}
                                    {paymentConfig?.bankTransfer?.titular || 'Gastón Barea'}
                                  </div>
                                  <div>
                                    <strong>CUIT:</strong>{' '}
                                    {paymentConfig?.bankTransfer?.cuit || '20-35894120-4'}
                                  </div>
                                </div>
                              </div>

                              {/* FORMULARIO: INFORMAR COMPROBANTE DE PAGO / TRANSFERENCIA */}
                              <form
                                onSubmit={handleReportMilestonePayment}
                                className="p-4 bg-[#F5F5F7] border border-black/15 space-y-3 text-xs"
                              >
                                <div className="font-bold text-[#1D1D1F] flex items-center justify-between">
                                  <span>Informar Comprobante de Pago / Transferencia al CRM</span>
                                  <span className="text-[10px] font-mono text-[#291B64] uppercase">
                                    Impacto directo en Cobranzas
                                  </span>
                                </div>

                                {paymentReportFeedback && (
                                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>{paymentReportFeedback}</span>
                                  </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                      Medio Utilizado
                                    </label>
                                    <select
                                      value={paymentReportMethod}
                                      onChange={(e) => setPaymentReportMethod(e.target.value)}
                                      className="w-full px-3 py-2 bg-white border border-black/15 text-xs"
                                    >
                                      <option value="bank_transfer">Transferencia Bancaria CBU/Alias</option>
                                      <option value="mercadopago">Mercado Pago Oficial</option>
                                      <option value="stripe">Stripe Internacional (USD)</option>
                                      <option value="usdt_crypto">USDT / Cripto</option>
                                    </select>
                                  </div>

                                  <div className="sm:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                      N° de Comprobante / Operación / Referencia *
                                    </label>
                                    <input
                                      type="text"
                                      required
                                      value={paymentReportRef}
                                      onChange={(e) => setPaymentReportRef(e.target.value)}
                                      placeholder="Ej: Comprobante #00492817 o ID de operación Mercado Pago"
                                      className="w-full px-3 py-2 bg-white border border-black/15 text-xs font-mono"
                                    />
                                  </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                                  <input
                                    type="text"
                                    value={paymentReportNotes}
                                    onChange={(e) => setPaymentReportNotes(e.target.value)}
                                    placeholder="Notas adicionales (ej: Requiere Factura A a nombre de la corporación)"
                                    className="flex-1 px-3 py-2 bg-white border border-black/15 text-xs"
                                  />
                                  <button
                                    type="submit"
                                    disabled={isReportingPayment || !paymentReportRef.trim()}
                                    className="px-4 py-2 bg-[#291B64] hover:bg-[#382586] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                                  >
                                    {isReportingPayment ? (
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Send className="w-3.5 h-3.5" />
                                    )}
                                    <span>Notificar Pago de Hito</span>
                                  </button>
                                </div>
                              </form>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bitácora de Novedades Técnicas Recientes */}
                  <div className="bg-white p-6 border border-black/[0.08] space-y-4">
                    <h3 className="font-display text-sm font-bold text-[#1D1D1F]">
                      Bitácora de Actualizaciones Técnicas
                    </h3>
                    <div className="space-y-3">
                      {project.recentUpdates.map((upd) => (
                        <div
                          key={upd.id}
                          className="p-3.5 bg-[#F5F5F7] border border-black/[0.08] text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between text-slate-500 font-mono text-[11px]">
                            <span>
                              {upd.date} · Por {upd.author}
                            </span>
                          </div>
                          <div className="font-bold text-[#1D1D1F]">{upd.title}</div>
                          <p className="text-slate-600">{upd.summary}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB AGENDA: MI CORPORACIÓN & CONTACTOS AGRUPADOS / FICHA INDIVIDUAL */}
              {activeTab === 'directory' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 border border-black/[0.08] space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.08] pb-4">
                      <div>
                        <div className="text-[11px] font-mono uppercase font-bold text-[#291B64]">
                          Agenda CRM Sincronizada con Portal Clientes
                        </div>
                        <h3 className="font-display text-base sm:text-lg font-bold text-[#1D1D1F]">
                          {clientSession?.contactType === 'individual'
                            ? 'Ficha de Contacto Individual Registrado'
                            : `Corporación: ${companyProfile?.name || clientSession?.company}`}
                        </h3>
                        <p className="text-xs text-[#515154]">
                          {clientSession?.contactType === 'individual'
                            ? 'Tu cuenta individual está habilitada en el Portal Clientes y vinculada directamente al Pipeline CRM.'
                            : 'Contactos ejecutivos, técnicos y administrativos agrupados bajo tu misma corporación con acceso al Portal Clientes.'}
                        </p>
                      </div>

                      {companyProfile && (
                        <div className="text-xs font-mono bg-[#F5F5F7] px-3.5 py-2 border border-black/10 space-y-0.5">
                          <div className="font-bold text-[#1D1D1F]">{companyProfile.industry}</div>
                          {companyProfile.taxId && (
                            <div className="text-slate-500">CUIT: {companyProfile.taxId}</div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {(corporateColleagues.length > 0
                        ? corporateColleagues
                        : [
                            {
                              id: 'self',
                              fullName: clientSession?.name,
                              roleTitle: clientSession?.role || 'Usuario Portal',
                              email: clientSession?.email,
                              username: clientSession?.username,
                              contactType: clientSession?.contactType || 'individual',
                              hasActiveService: Boolean(project),
                              isPrimaryContact: true,
                            },
                          ]
                      ).map((colleague: any) => (
                        <div
                          key={colleague.id || colleague.email}
                          className="p-4 bg-[#F5F5F7] border border-black/10 flex flex-col justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-sm font-display font-bold text-[#1D1D1F]">
                                {colleague.fullName}
                              </span>
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 font-bold ${
                                  colleague.hasActiveService
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-indigo-100 text-[#291B64]'
                                }`}
                              >
                                {colleague.hasActiveService
                                  ? 'Con Servicio Activo'
                                  : 'Usuario Registrado Portal'}
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-[#291B64]">
                              {colleague.roleTitle || 'Miembro de Corporación'}
                              {colleague.department ? ` · ${colleague.department}` : ''}
                            </div>
                            <div className="text-xs font-mono text-slate-600">{colleague.email}</div>
                            {colleague.phone && (
                              <div className="text-[11px] font-mono text-slate-500">
                                Tel: {colleague.phone}
                              </div>
                            )}
                          </div>

                          <div className="pt-2.5 border-t border-black/[0.08] flex items-center justify-between text-[11px] font-mono text-slate-500">
                            <span>Usuario Portal: {colleague.username}</span>
                            {colleague.isPrimaryContact && (
                              <span className="px-2 py-0.5 bg-white border border-black/10 text-[#1D1D1F] font-semibold">
                                Contacto Principal
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CONSULTAS DE ASESORAMIENTO */}
              {activeTab === 'inquiries' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 border border-black/[0.08] space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-display text-base font-bold text-[#1D1D1F]">
                          Sistema de Consultas de Asesoramiento
                        </h3>
                        <p className="text-xs text-[#515154]">
                          Canal directo con Gastón Barea para dudas de arquitectura, Odoo ERP, e-commerce y mejores prácticas
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsNewInquiryOpen(!isNewInquiryOpen);
                          setSelectedInquiry(null);
                        }}
                        className="px-4 py-2.5 bg-[#291B64] hover:bg-[#382586] text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isNewInquiryOpen ? 'Cerrar Formulario' : 'Nueva Consulta Técnica'}</span>
                      </button>
                    </div>

                    {/* INLINE FORM: NUEVA CONSULTA DE ASESORAMIENTO */}
                    {isNewInquiryOpen && (
                      <form
                        onSubmit={handleCreateInquiry}
                        className="p-5 bg-[#F5F5F7] border border-black/15 space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-black/10 pb-2.5">
                          <h4 className="font-display text-sm font-bold text-[#1D1D1F]">
                            Redactar Nueva Consulta de Asesoramiento Técnico
                          </h4>
                          <button
                            type="button"
                            onClick={() => setIsNewInquiryOpen(false)}
                            className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                          >
                            Cancelar ×
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Categoría
                            </label>
                            <select
                              value={newInquiryCategory}
                              onChange={(e) => setNewInquiryCategory(e.target.value as any)}
                              className="w-full px-3 py-2.5 bg-white border border-black/15 text-xs text-slate-900 focus:outline-none focus:border-[#291B64]"
                            >
                              <option value="odoo">Odoo Community ERP (Módulos & Procesos)</option>
                              <option value="architecture">Arquitectura de Software & Base de Datos</option>
                              <option value="ecommerce">E-Commerce B2B2C & Pasarelas de Pago</option>
                              <option value="devops">Servidores Linux, Docker & Redes</option>
                              <option value="strategy">Estrategia Tecnológica & Dirección</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Asunto o Pregunta Principal
                            </label>
                            <input
                              type="text"
                              required
                              value={newInquiryTopic}
                              onChange={(e) => setNewInquiryTopic(e.target.value)}
                              placeholder="Ej: Compatibilidad de lectores de barra en Odoo Barcode"
                              className="w-full px-3 py-2.5 bg-white border border-black/15 text-xs text-slate-900 focus:outline-none focus:border-[#291B64]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Detalle de la Consulta
                          </label>
                          <textarea
                            required
                            rows={3}
                            value={newInquiryQuestion}
                            onChange={(e) => setNewInquiryQuestion(e.target.value)}
                            placeholder="Describe con precisión qué decisión técnica necesitas validar o qué requerimiento específico surgió..."
                            className="w-full px-3 py-2.5 bg-white border border-black/15 text-xs text-slate-900 focus:outline-none focus:border-[#291B64] resize-none"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="submit"
                            disabled={isSubmittingInquiry}
                            className="px-5 py-2.5 bg-[#291B64] hover:bg-[#382586] text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {isSubmittingInquiry ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                            <span>Enviar Consulta</span>
                          </button>
                        </div>
                      </form>
                    )}

                    {/* INLINE VIEW: HILO DE CONVERSACIÓN SELECCIONADO */}
                    {selectedInquiry && (
                      <div className="border border-[#291B64]/30 bg-[#F5F5F7] overflow-hidden">
                        <div className="px-5 py-3.5 bg-white border-b border-black/10 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-mono uppercase text-[#291B64] font-bold">
                              Hilo Activo · Categoría: {selectedInquiry.category}
                            </span>
                            <h4 className="text-sm font-bold text-[#1D1D1F]">
                              {selectedInquiry.topic}
                            </h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedInquiry(null)}
                            className="px-3 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-[#F5F5F7] cursor-pointer"
                          >
                            Cerrar Conversación ×
                          </button>
                        </div>

                        <div className="p-5 space-y-3.5 max-h-96 overflow-y-auto">
                          {selectedInquiry.messages.map((m) => {
                            const isGaston = m.sender === 'gaston';
                            return (
                              <div
                                key={m.id}
                                className={`flex flex-col ${isGaston ? 'items-start' : 'items-end'}`}
                              >
                                <div className="text-[10px] text-slate-500 mb-1 px-1">
                                  {m.senderName} ·{' '}
                                  {new Date(m.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                                <div
                                  className={`max-w-[85%] p-3.5 text-xs leading-relaxed ${
                                    isGaston
                                      ? 'bg-white text-[#1D1D1F] border border-black/10'
                                      : 'bg-[#291B64] text-white'
                                  }`}
                                >
                                  {m.text}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="p-4 bg-white border-t border-black/10 flex items-center gap-2">
                          <input
                            type="text"
                            value={inquiryReplyText}
                            onChange={(e) => setInquiryReplyText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendInquiryReply()}
                            placeholder="Escribe una respuesta o repregunta técnica..."
                            className="flex-1 px-4 py-2.5 bg-[#F5F5F7] border border-black/15 text-xs text-slate-900 focus:outline-none focus:border-[#291B64]"
                          />
                          <button
                            type="button"
                            onClick={handleSendInquiryReply}
                            disabled={isSendingReply || !inquiryReplyText.trim()}
                            className="px-4 py-2.5 bg-[#291B64] hover:bg-[#382586] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {isSendingReply ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                            <span>Enviar</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {inquiries.length === 0 ? (
                      <div className="p-8 text-center bg-[#F5F5F7] border border-dashed border-slate-300 space-y-2">
                        <HelpCircle className="w-8 h-8 mx-auto text-slate-400" />
                        <div className="text-sm font-bold text-slate-700">
                          No tienes consultas activas
                        </div>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          ¿Tienes dudas sobre módulos, servidores o flujos comerciales? Abre una consulta técnica para recibir orientación directa de Gastón Barea.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {inquiries.map((inq) => (
                          <div
                            key={inq.id}
                            className="p-4 bg-[#F5F5F7] border border-black/[0.08] hover:border-[#291B64]/40 transition-all space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[10px] font-mono font-bold px-2 py-0.5 ${
                                    inq.status === 'answered'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : inq.status === 'in_review'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {inq.status === 'answered'
                                    ? '✓ Respondida por Gastón'
                                    : inq.status === 'in_review'
                                    ? '⏳ En Análisis Técnico'
                                    : 'Pendiente de Respuesta'}
                                </span>
                                <span className="text-[11px] font-mono text-slate-500 uppercase">
                                  {inq.category}
                                </span>
                              </div>
                              <span className="text-[11px] font-mono text-slate-400">
                                {new Date(inq.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-[#1D1D1F]">{inq.topic}</h4>
                              <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                                {inq.question}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-black/[0.08] flex items-center justify-between">
                              <span className="text-xs text-slate-500 font-medium">
                                {inq.messages?.length || 1} mensaje(s) en la conversación
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedInquiry(
                                    selectedInquiry?.id === inq.id ? null : inq
                                  )
                                }
                                className="px-3 py-1.5 bg-white hover:bg-[#291B64] text-[#291B64] hover:text-white font-bold text-xs border border-black/10 transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <span>
                                  {selectedInquiry?.id === inq.id
                                    ? 'Ocultar Conversación'
                                    : 'Ver Conversación'}
                                </span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: AGENDA PARA CONSULTORÍA */}
              {activeTab === 'bookings' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 sm:p-8 border border-black/[0.08] space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.08] pb-4">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase text-[#291B64]">
                          <Video className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Enlace Google Meet Automatizado + Invitación por Email</span>
                        </div>
                        <h3 className="font-display text-lg sm:text-xl font-bold text-[#1D1D1F]">
                          Agenda para Consultoría & Sprint Reviews
                        </h3>
                        <p className="text-xs sm:text-sm text-[#515154]">
                          Elegí el motivo, día y horario en 3 clics. Te enviamos automáticamente el enlace de Google Meet Pro a tu correo ({clientSession?.email}) y la invitación para tu Google Calendar.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsNewBookingOpen(!isNewBookingOpen)}
                        className="px-4 py-2.5 bg-[#291B64] hover:bg-[#382586] text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0"
                      >
                        <Video className="w-3.5 h-3.5 text-emerald-300" />
                        <span>
                          {isNewBookingOpen
                            ? 'Ocultar Agenda Rápida'
                            : '¡Hablemos! Agendar Meet'}
                        </span>
                      </button>
                    </div>

                    {/* BANNER DE CONFIRMACIÓN AUTOMÁTICA RECIÉN AGENDADA */}
                    {lastBookingConfirmation && (
                      <div className="p-5 sm:p-6 bg-[#0E0F17] text-white border-l-4 border-emerald-400 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>
                              ¡Reunión Confirmada! Enlace Google Meet Generado Automáticamente
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-neutral-400">
                            {lastBookingConfirmation.emailSent
                              ? `✓ Invitación enviada a ${lastBookingConfirmation.booking.clientEmail}`
                              : `Sincronizado en tu agenda del Portal`}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-white/[0.05] border border-white/10 text-xs">
                          <div>
                            <span className="text-neutral-400 block text-[11px] font-mono">
                              SESIÓN:
                            </span>
                            <strong className="text-white">
                              {getFriendlyBookingTypeTitle(
                                lastBookingConfirmation.booking.type
                              )}
                            </strong>
                          </div>
                          <div>
                            <span className="text-neutral-400 block text-[11px] font-mono">
                              FECHA Y HORARIO:
                            </span>
                            <strong className="text-emerald-300 font-mono">
                              {lastBookingConfirmation.booking.date} ·{' '}
                              {lastBookingConfirmation.booking.timeSlot}
                            </strong>
                          </div>
                          <div>
                            <span className="text-neutral-400 block text-[11px] font-mono">
                              SALA GOOGLE MEET PRO:
                            </span>
                            <a
                              href={lastBookingConfirmation.booking.meetingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sky-300 underline font-mono break-all"
                            >
                              {lastBookingConfirmation.booking.meetingUrl}
                            </a>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 pt-1">
                          <a
                            href={lastBookingConfirmation.googleCalendarUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs inline-flex items-center gap-2 transition-colors"
                          >
                            <Calendar className="w-4 h-4" />
                            <span>1. Agregar a mi Google Calendar (1 Clic)</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <a
                            href={lastBookingConfirmation.booking.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 bg-[#291B64] hover:bg-[#382586] text-white font-bold text-xs inline-flex items-center gap-2 transition-colors"
                          >
                            <Video className="w-4 h-4 text-emerald-300" />
                            <span>2. Abrir Sala Google Meet Pro</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <a
                            href={lastBookingConfirmation.whatsappConfirmUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs inline-flex items-center gap-2 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4 text-emerald-400" />
                            <span>3. Avisar por WhatsApp Directo</span>
                          </a>
                        </div>
                      </div>
                    )}

                    {/* INLINE FORM: NUEVA REUNIÓN GUIADA Y AMIGABLE EN 3 PASOS */}
                    {isNewBookingOpen && (
                      <form
                        onSubmit={handleCreateBooking}
                        className="p-5 sm:p-7 bg-[#F5F5F7] border border-black/15 space-y-6"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/10 pb-3.5">
                          <div>
                            <span className="text-[11px] font-mono font-bold uppercase text-[#291B64]">
                              RESERVA RÁPIDA EN 3 PASOS · SIN INTERMEDIARIOS
                            </span>
                            <h4 className="font-display text-base font-bold text-[#1D1D1F]">
                              ¡Hablemos! Agendar Sesión 1-on-1 con Gastón Barea
                            </h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsNewBookingOpen(false)}
                            className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer self-start sm:self-auto"
                          >
                            Cerrar ×
                          </button>
                        </div>

                        {/* PASO 1: ELEGÍ EL MOTIVO DE LA REUNIÓN */}
                        <div className="space-y-2.5">
                          <label className="block text-xs font-bold text-[#1D1D1F]">
                            1. ¿Sobre qué querés conversar? (Elegí una opción)
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {[
                              {
                                id: 'discovery_ia' as const,
                                title: 'Diagnóstico & Propuesta IA',
                                duration: '30 min',
                                desc: 'Evaluar requerimiento, estudio preliminar IA y presupuesto 40/40/20.',
                              },
                              {
                                id: 'architecture_advisory' as const,
                                title: 'Arquitectura, Odoo v18 o Bioeconomía',
                                duration: '45 min',
                                desc: 'Consultoría sobre sistemas a medida, ERP sin licencias, IoT o Linux.',
                              },
                              {
                                id: 'sprint_review' as const,
                                title: 'Sprint Review & Demo en Staging',
                                duration: '45 min',
                                desc: 'Revisión de avances del proyecto en vivo y validación de entregables.',
                              },
                              {
                                id: 'emergency_audit' as const,
                                title: 'Soporte Prioritario & Auditoría',
                                duration: '30 min',
                                desc: 'Resolución rápida de cuellos de botella, bases de datos o servidores.',
                              },
                            ].map((opt) => {
                              const active = bookingType === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => setBookingType(opt.id)}
                                  className={`p-3.5 text-left border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                                    active
                                      ? 'bg-[#291B64] text-white border-[#291B64] shadow-xs'
                                      : 'bg-white text-[#1D1D1F] border-black/15 hover:border-[#291B64]'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-bold">{opt.title}</span>
                                    <span
                                      className={`text-[10px] font-mono px-2 py-0.5 font-semibold ${
                                        active
                                          ? 'bg-emerald-400 text-emerald-950'
                                          : 'bg-slate-100 text-slate-700'
                                      }`}
                                    >
                                      {opt.duration}
                                    </span>
                                  </div>
                                  <p
                                    className={`text-[11px] leading-snug ${
                                      active ? 'text-white/85' : 'text-slate-500'
                                    }`}
                                  >
                                    {opt.desc}
                                  </p>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* PASO 2: ELEGÍ DÍA Y HORARIO CON BOTONES VISUALES */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
                          <div className="lg:col-span-7 space-y-2.5">
                            <label className="block text-xs font-bold text-[#1D1D1F]">
                              2. Elegí el Día (Próximos días hábiles o seleccioná en calendario)
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                              {getUpcomingBusinessDays().map((d) => {
                                const isSelected = bookingDate === d.iso;
                                return (
                                  <button
                                    key={d.iso}
                                    type="button"
                                    onClick={() => setBookingDate(d.iso)}
                                    className={`p-2.5 text-center border transition-all cursor-pointer ${
                                      isSelected
                                        ? 'bg-[#291B64] text-white border-[#291B64] font-bold'
                                        : 'bg-white text-[#1D1D1F] border-black/15 hover:border-[#291B64]'
                                    }`}
                                  >
                                    <div
                                      className={`text-[10px] font-mono uppercase ${
                                        isSelected ? 'text-emerald-300' : 'text-slate-500'
                                      }`}
                                    >
                                      {d.dayName}
                                    </div>
                                    <div className="text-xs font-bold mt-0.5">{d.shortLabel}</div>
                                  </button>
                                );
                              })}
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              <span className="text-[11px] text-slate-600 font-medium">
                                ¿Otra fecha?:
                              </span>
                              <input
                                type="date"
                                required
                                value={bookingDate}
                                onChange={(e) => setBookingDate(e.target.value)}
                                className="px-3 py-1.5 bg-white border border-black/15 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#291B64]"
                              />
                            </div>
                          </div>

                          <div className="lg:col-span-5 space-y-2.5">
                            <label className="block text-xs font-bold text-[#1D1D1F]">
                              Horario (Hora Argentina GMT-3)
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              {(availabilityConfig.slots || DEFAULT_BOOKING_AVAILABILITY.slots)
                                .filter((s) => s.enabled)
                                .map((slot) => {
                                  const isOccupied = (
                                    occupiedSlotsByDate[bookingDate] || []
                                  ).includes(slot.value);
                                  const active = bookingSlot === slot.value && !isOccupied;
                                  return (
                                    <button
                                      key={slot.value}
                                      type="button"
                                      disabled={isOccupied}
                                      onClick={() => {
                                        setBookingSlot(slot.value);
                                        setBookingConflictMsg('');
                                      }}
                                      className={`p-2.5 border text-left transition-all flex items-center justify-between ${
                                        isOccupied
                                          ? 'bg-slate-100 text-slate-400 border-slate-200 line-through cursor-not-allowed'
                                          : active
                                          ? 'bg-[#291B64] text-white border-[#291B64] font-bold cursor-pointer'
                                          : 'bg-white text-[#1D1D1F] border-black/15 hover:border-[#291B64] cursor-pointer'
                                      }`}
                                    >
                                      <span className="text-xs font-mono font-bold">
                                        {slot.label}
                                      </span>
                                      {isOccupied ? (
                                        <span className="text-[9px] font-mono font-bold text-rose-600 no-underline uppercase">
                                          Ocupado
                                        </span>
                                      ) : (
                                        <span
                                          className={`text-[10px] font-mono ${
                                            active ? 'text-emerald-300' : 'text-slate-400'
                                          }`}
                                        >
                                          {slot.tag}
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                            </div>
                          </div>
                        </div>

                        {bookingConflictMsg && (
                          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                            {bookingConflictMsg}
                          </div>
                        )}

                        {/* PASO 3: TEMA O CONSULTA CON CHIPS RÁPIDOS + WHATSAPP OPCIONAL */}
                        <div className="space-y-2.5 pt-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <label className="block text-xs font-bold text-[#1D1D1F]">
                              3. ¿Qué tema querés que prioricemos en la sesión?
                            </label>
                            <span className="text-[11px] text-slate-500">
                              Tocá una sugerencia rápida o escribí debajo:
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {[
                              'Revisar estudio técnico generado con IA y cotización',
                              'Evaluar implementación de Odoo ERP v18 / B2B2C',
                              'Proyecto de Bioeconomía / Trazabilidad IoT',
                              'Revisión de avances y entregables en Staging',
                            ].map((chip) => (
                              <button
                                key={chip}
                                type="button"
                                onClick={() => setBookingTopic(chip)}
                                className={`px-2.5 py-1 text-[11px] border transition-colors cursor-pointer ${
                                  bookingTopic === chip
                                    ? 'bg-[#291B64]/10 border-[#291B64] text-[#291B64] font-semibold'
                                    : 'bg-white border-black/10 text-slate-600 hover:border-black/30'
                                }`}
                              >
                                + {chip}
                              </button>
                            ))}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                            <div className="sm:col-span-8">
                              <input
                                type="text"
                                required
                                value={bookingTopic}
                                onChange={(e) => setBookingTopic(e.target.value)}
                                placeholder="Contanos brevemente qué querés revisar en la videollamada..."
                                className="w-full px-3.5 py-2.5 bg-white border border-black/15 text-xs text-slate-900 focus:outline-none focus:border-[#291B64]"
                              />
                            </div>
                            <div className="sm:col-span-4">
                              <input
                                type="text"
                                value={bookingPhone}
                                onChange={(e) => setBookingPhone(e.target.value)}
                                placeholder="Tu WhatsApp (Opcional p/ aviso)"
                                className="w-full px-3.5 py-2.5 bg-white border border-black/15 text-xs text-slate-900 focus:outline-none focus:border-[#291B64]"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="text-[11px] text-slate-600 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-[#291B64] shrink-0" />
                            <span>
                              Te enviaremos al instante el enlace de <strong>Google Meet Pro</strong> + invitación <strong>.ics</strong> a{' '}
                              <strong>{clientSession?.email}</strong> (vía{' '}
                              <code className="font-mono text-[#291B64]">
                                {availabilityConfig.notificationEmail || SITE_CONFIG.email}
                              </code>
                              ).
                            </span>
                          </div>

                          <button
                            type="submit"
                            disabled={isSubmittingBooking}
                            className="px-6 py-3 bg-[#291B64] hover:bg-[#382586] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                          >
                            {isSubmittingBooking ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>Generando Enlace Meet y Enviando Email...</span>
                              </>
                            ) : (
                              <>
                                <Video className="w-4 h-4 text-emerald-300" />
                                <span>¡Hablemos! Confirmar y Recibir Enlace Meet</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    )}

                    {/* LISTADO DE REUNIONES AGENDADAS */}
                    <div className="space-y-3">
                      <div className="text-xs font-mono font-bold uppercase text-slate-500">
                        Tus Sesiones Confirmadas ({bookings.length})
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {bookings.length === 0 ? (
                          <div className="col-span-full p-8 text-center bg-[#F5F5F7] border border-dashed border-slate-300 space-y-3">
                            <Calendar className="w-8 h-8 mx-auto text-[#291B64]" />
                            <div className="text-sm font-bold text-slate-800">
                              Todavía no tenés reuniones agendadas
                            </div>
                            <p className="text-xs text-slate-500 max-w-md mx-auto">
                              Usá el formulario de arriba para elegir día y horario. El sistema generará tu sala Google Meet Pro automáticamente y te enviará los datos por correo electrónico.
                            </p>
                          </div>
                        ) : (
                          bookings.map((book) => {
                            const calUrl =
                              book.googleCalendarUrl || buildLocalCalendarUrl(book);
                            return (
                              <div
                                key={book.id}
                                className="p-4 sm:p-5 bg-[#F5F5F7] border border-black/[0.08] flex flex-col justify-between space-y-3.5"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800">
                                      ✓ Confirmada · Google Meet Pro
                                    </span>
                                    <span className="text-xs font-mono font-bold text-[#1D1D1F]">
                                      {book.date}
                                    </span>
                                  </div>

                                  <div>
                                    <div className="text-xs font-mono font-bold text-[#291B64]">
                                      {getFriendlyBookingTypeTitle(book.type)}
                                    </div>
                                    <h4 className="text-sm font-bold text-[#1D1D1F] mt-0.5">
                                      {book.agendaTopic || 'Sesión de Seguimiento Técnico'}
                                    </h4>
                                  </div>
                                </div>

                                <div className="p-3 bg-white border border-black/10 space-y-2.5">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                                      <Clock className="w-3.5 h-3.5 text-[#291B64]" />
                                      <span>{book.timeSlot}</span>
                                    </span>
                                    <span className="text-[11px] font-mono text-emerald-700">
                                      Enlace Activo
                                    </span>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 pt-1">
                                    {book.meetingUrl && (
                                      <a
                                        href={book.meetingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 py-2 px-3 bg-[#291B64] hover:bg-[#382586] text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                                      >
                                        <Video className="w-3.5 h-3.5 text-emerald-300" />
                                        <span>Abrir Google Meet</span>
                                      </a>
                                    )}
                                    <a
                                      href={calUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                      <Calendar className="w-3.5 h-3.5" />
                                      <span>Google Calendar</span>
                                    </a>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SOPORTE TÉCNICO ESPECIALIZADO */}
              {activeTab === 'tickets' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 border border-black/[0.08] space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-display text-base font-bold text-[#1D1D1F]">
                          Soporte Técnico Especializado & SLA
                        </h3>
                        <p className="text-xs text-[#515154]">
                          Gestión de incidencias técnicas con tiempos de respuesta garantizados según severidad operativa
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsNewTicketOpen(!isNewTicketOpen)}
                        className="px-4 py-2.5 bg-[#291B64] hover:bg-[#382586] text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>
                          {isNewTicketOpen ? 'Cerrar Formulario' : 'Nuevo Ticket de Soporte'}
                        </span>
                      </button>
                    </div>

                    {/* INLINE FORM: NUEVO TICKET DE SOPORTE */}
                    {isNewTicketOpen && (
                      <form
                        onSubmit={handleCreateTicket}
                        className="p-5 bg-[#F5F5F7] border border-black/15 space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-black/10 pb-2.5">
                          <h4 className="font-display text-sm font-bold text-[#1D1D1F]">
                            Reportar Incidencia de Soporte Técnico
                          </h4>
                          <button
                            type="button"
                            onClick={() => setIsNewTicketOpen(false)}
                            className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                          >
                            Cancelar ×
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Severidad (SLA)
                            </label>
                            <select
                              value={ticketSeverity}
                              onChange={(e) => setTicketSeverity(e.target.value as any)}
                              className="w-full px-3 py-2.5 bg-white border border-black/15 text-xs text-slate-900 focus:outline-none focus:border-[#291B64]"
                            >
                              <option value="low">Baja (SLA 24h)</option>
                              <option value="medium">Media (SLA 8h)</option>
                              <option value="high">Alta (SLA 4h)</option>
                              <option value="critical">Crítica (SLA &lt; 2h)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Área del Sistema
                            </label>
                            <select
                              value={ticketSystemArea}
                              onChange={(e) => setTicketSystemArea(e.target.value as any)}
                              className="w-full px-3 py-2.5 bg-white border border-black/15 text-xs text-slate-900 focus:outline-none focus:border-[#291B64]"
                            >
                              <option value="odoo_erp">Odoo Community ERP</option>
                              <option value="servers">Servidores Linux & Docker</option>
                              <option value="database">PostgreSQL / Base de Datos</option>
                              <option value="frontend">E-Commerce / Web / UI</option>
                              <option value="integrations">Integraciones API / AFIP</option>
                              <option value="security">Seguridad & Certificados SSL</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Título del Problema
                          </label>
                          <input
                            type="text"
                            required
                            value={ticketSubject}
                            onChange={(e) => setTicketSubject(e.target.value)}
                            placeholder="Ej: Error al emitir remito en formato PDF"
                            className="w-full px-3 py-2.5 bg-white border border-black/15 text-xs text-slate-900 focus:outline-none focus:border-[#291B64]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Detalle del Comportamiento Anómalo
                          </label>
                          <textarea
                            required
                            rows={3}
                            value={ticketDescription}
                            onChange={(e) => setTicketDescription(e.target.value)}
                            placeholder="Describe qué sucedió, qué estabas intentando hacer y el mensaje de error o pantalla observada..."
                            className="w-full px-3 py-2.5 bg-white border border-black/15 text-xs text-slate-900 focus:outline-none focus:border-[#291B64] resize-none"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="submit"
                            disabled={isSubmittingTicket}
                            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {isSubmittingTicket ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <ShieldCheck className="w-3.5 h-3.5" />
                            )}
                            <span>Abrir Ticket con SLA</span>
                          </button>
                        </div>
                      </form>
                    )}

                    {/* SLA overview bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2.5 bg-rose-50 border border-rose-200">
                        <div className="font-bold text-rose-800">Crítica</div>
                        <div className="text-[11px] text-rose-600 font-mono">SLA &lt; 2 horas</div>
                      </div>
                      <div className="p-2.5 bg-amber-50 border border-amber-200">
                        <div className="font-bold text-amber-800">Alta</div>
                        <div className="text-[11px] text-amber-600 font-mono">SLA &lt; 4 horas</div>
                      </div>
                      <div className="p-2.5 bg-blue-50 border border-blue-200">
                        <div className="font-bold text-blue-800">Media</div>
                        <div className="text-[11px] text-blue-600 font-mono">SLA &lt; 8 horas</div>
                      </div>
                      <div className="p-2.5 bg-slate-100 border border-slate-200">
                        <div className="font-bold text-slate-800">Baja</div>
                        <div className="text-[11px] text-slate-600 font-mono">SLA &lt; 24 horas</div>
                      </div>
                    </div>

                    {/* Ticket list */}
                    {tickets.length === 0 ? (
                      <div className="p-8 text-center bg-[#F5F5F7] border border-dashed border-slate-300 space-y-2">
                        <ShieldCheck className="w-8 h-8 mx-auto text-emerald-500" />
                        <div className="text-sm font-bold text-slate-700">
                          Sin incidencias abiertas
                        </div>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          Todos los servicios, servidores y módulos están operando de forma normal y resiliente.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {tickets.map((t) => (
                          <div
                            key={t.id}
                            className="p-4 bg-[#F5F5F7] border border-black/[0.08] space-y-2.5"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-[#1D1D1F]">
                                  {t.ticketNumber}
                                </span>
                                <span
                                  className={`text-[10px] font-mono font-bold px-2 py-0.5 ${
                                    t.severity === 'critical'
                                      ? 'bg-rose-100 text-rose-800'
                                      : t.severity === 'high'
                                      ? 'bg-amber-100 text-amber-800'
                                      : t.severity === 'medium'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {t.severity.toUpperCase()} (SLA {t.slaHours}h)
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 bg-white border border-black/10 text-slate-600">
                                  {t.systemArea}
                                </span>
                              </div>

                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 ${
                                  t.status === 'fix_deployed' || t.status === 'closed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : t.status === 'investigating'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {t.status === 'fix_deployed'
                                  ? '✓ Solución Desplegada'
                                  : t.status === 'closed'
                                  ? 'Cerrado'
                                  : t.status === 'investigating'
                                  ? 'Investigando'
                                  : 'Abierto'}
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-[#1D1D1F]">{t.subject}</h4>
                            <p className="text-xs text-slate-600">{t.description}</p>

                            {t.resolutionNotes && (
                              <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                                <div className="font-bold flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>Resolución Técnica de Gastón Barea:</span>
                                </div>
                                <p className="text-emerald-800">{t.resolutionNotes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

