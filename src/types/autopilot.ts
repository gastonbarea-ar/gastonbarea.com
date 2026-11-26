export type AutonomyMode = 'autonomous' | 'draft_only' | 'paused';

export type AutopilotChannel =
  | 'whatsapp'
  | 'portal_support'
  | 'followup_n8n'
  | 'self_healing';

export interface AutopilotConfig {
  channels: Record<AutopilotChannel, AutonomyMode>;
  dailyDigestTime: string; // e.g. '08:30' (GMT-3)
  dailyDigestEmail: string;
  vipNotificationPhone: string;
  maxAutoQuoteAmountUsd: number;
  selfHealingGraceMinutes: number;
  autoTranscribeWhatsAppAudio: boolean;
  antiNoShowRemindersEnabled: boolean;
  updatedAt: string;
}

export type ConversationStage =
  | 'new'
  | 'qualifying'
  | 'quoted'
  | 'followup'
  | 'booked'
  | 'support_l1'
  | 'vip_escalated'
  | 'cold';

export interface AgentMessageEntry {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  mediaType?: 'text' | 'audio' | 'pdf';
  transcript?: string;
  timestamp: string;
}

export interface AgentConversation {
  id: string;
  channel: 'whatsapp' | 'portal' | 'web';
  externalId: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  companyName?: string;
  stage: ConversationStage;
  employeeCount?: number;
  matchedStockCode?: string;
  matchedStockName?: string;
  quoteId?: string;
  messages: AgentMessageEntry[];
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export type VipEscalationReason =
  | 'meet_confirmed'
  | 'kickoff_payment_40'
  | 'custom_enterprise_scope'
  | 'critical_sla_unresolved'
  | 'draft_approval_needed';

export interface VipEscalationItem {
  id: string;
  severity: 'vip' | 'critical' | 'draft';
  reason: VipEscalationReason;
  channel: AutopilotChannel;
  title: string;
  summary: string;
  suggestedAction: string;
  draftReply?: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  conversationId?: string;
  status: 'open' | 'approved' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
}

export interface AgentActivityLog {
  id: string;
  channel: AutopilotChannel;
  actionType: string;
  targetLabel: string;
  outcome:
    | 'resolved_silently'
    | 'draft_queued'
    | 'vip_escalated'
    | 'self_healed'
    | 'paused_noop'
    | 'failed';
  noiseSuppressed: boolean;
  estimatedMinutesSaved: number;
  detail: string;
  createdAt: string;
}

export interface AutopilotOverviewMetrics {
  totalConversations: number;
  resolvedSilentlyCount: number;
  selfHealedAlertsCount: number;
  openVipEscalationsCount: number;
  openDraftsCount: number;
  quotesIssuedAutonomously: number;
  estimatedHoursSaved: number;
  noiseSuppressionRate: number;
}

export interface FollowUpCandidate {
  type: 'quote_followup_48h' | 'quote_followup_7d' | 'meet_reminder_24h' | 'meet_reminder_2h' | 'mark_cold_21d';
  targetId: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  company?: string;
  referenceCode: string;
  suggestedMessage: string;
  dueSinceHours: number;
}

export const DEFAULT_AUTOPILOT_CONFIG: AutopilotConfig = {
  channels: {
    whatsapp: 'autonomous',
    portal_support: 'autonomous',
    followup_n8n: 'autonomous',
    self_healing: 'autonomous',
  },
  dailyDigestTime: '08:30',
  dailyDigestEmail: 'notificaciones@gastonbarea.com',
  vipNotificationPhone: '',
  maxAutoQuoteAmountUsd: 15000,
  selfHealingGraceMinutes: 15,
  autoTranscribeWhatsAppAudio: true,
  antiNoShowRemindersEnabled: true,
  updatedAt: new Date().toISOString(),
};
