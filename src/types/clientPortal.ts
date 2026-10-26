import type { ServiceCategory } from './crm.ts';

export type ProjectStatus =
  | 'kickoff'
  | 'in_progress'
  | 'staging'
  | 'uat_testing'
  | 'delivered'
  | 'maintenance';

export type MilestoneStatus = 'completed' | 'in_progress' | 'pending';
export type MilestonePaymentStatus = 'paid' | 'pending';

export interface ProjectMilestoneItem {
  id: string;
  title: string;
  percentage: number;
  deliverables: string[];
  status: MilestoneStatus;
  completedAt?: string;
  paymentStatus: MilestonePaymentStatus;
  amount: number;
  currency: 'USD' | 'ARS';
  paymentLink?: string;
}

export interface ClientProject {
  id: string;
  clientEmail: string;
  clientName: string;
  company: string;
  projectName: string;
  serviceCategory: ServiceCategory;
  status: ProjectStatus;
  progressPercent: number; // 0 to 100
  startDate: string;
  estimatedDelivery: string;
  stagingUrl?: string;
  repositoryUrl?: string;
  activeSprint: string;
  quoteNumber?: string;
  milestones: ProjectMilestoneItem[];
  recentUpdates: {
    id: string;
    date: string;
    title: string;
    summary: string;
    author: string;
  }[];
}

export interface InquiryMessage {
  id: string;
  sender: 'client' | 'gaston';
  senderName: string;
  text: string;
  createdAt: string;
}

export interface ConsultingInquiry {
  id: string;
  clientEmail: string;
  clientName: string;
  company: string;
  projectId?: string;
  topic: string;
  category: 'architecture' | 'odoo' | 'ecommerce' | 'devops' | 'strategy';
  question: string;
  status: 'pending' | 'in_review' | 'answered';
  messages: InquiryMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  clientEmail: string;
  clientName: string;
  company: string;
  subject: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  systemArea: 'servers' | 'odoo_erp' | 'database' | 'frontend' | 'security' | 'integrations';
  description: string;
  status: 'open' | 'investigating' | 'fix_deployed' | 'closed';
  slaHours: number;
  createdAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface ConsultingBooking {
  id: string;
  clientEmail: string;
  clientName: string;
  company: string;
  type: 'sprint_review' | 'architecture_advisory' | 'incident_postmortem' | 'emergency_audit';
  date: string;
  timeSlot: string;
  meetingUrl: string;
  agendaTopic?: string;
  status: 'confirmed' | 'rescheduled' | 'completed';
  createdAt: string;
}
