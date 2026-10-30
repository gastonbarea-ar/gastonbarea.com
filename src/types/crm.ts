export type OpportunityStage =
  | 'lead'
  | 'contacted'
  | 'proposal_draft'
  | 'proposal_sent'
  | 'negotiation'
  | 'won'
  | 'lost';

export type ServiceCategory =
  | 'software_architecture'
  | 'odoo_erp'
  | 'ecommerce_b2b2c'
  | 'fractional_cto'
  | 'linux_docker'
  | 'bi_analytics'
  | 'custom';

export interface CrmCompany {
  id: string;
  name: string;
  taxId?: string; // CUIT / RUT / Tax ID
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  location?: string;
  tier: 'enterprise' | 'pyme' | 'startup' | 'institution' | 'prospect';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CrmContact {
  id: string;
  fullName: string;
  email: string;
  username: string;
  password: string;
  phone?: string;
  roleTitle: string;
  contactType: 'corporate_member' | 'individual';
  companyId?: string;
  companyName?: string;
  portalAccessStatus: 'active' | 'invited' | 'pending';
  hasActiveService: boolean; // False when user is registered in Portal without a contracted product/service
  linkedProjectId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Opportunity {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  company?: string;
  companyId?: string;
  contactId?: string;
  serviceCategory: ServiceCategory;
  stage: OpportunityStage;
  value: number;
  currency: 'USD' | 'ARS';
  probability: number; // 0 to 100
  expectedCloseDate?: string;
  notes?: string;
  source: 'web_diagnostic' | 'contact_form' | 'whatsapp' | 'manual' | 'referral' | 'portal_registration';
  createdAt: string;
  updatedAt: string;
  lastActivity?: string;
  linkedQuoteId?: string;
}


export interface QuoteItem {
  id: string;
  description: string;
  deliverable: string;
  hours?: number;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface PaymentMilestone {
  id: string;
  name: string;
  percentage: number;
  amount: number;
  condition: string;
  status: 'pending' | 'paid' | 'overdue';
  paidAt?: string;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  opportunityId?: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  clientTaxId?: string; // CUIT / RFC / Tax ID
  serviceCategory: ServiceCategory;
  title: string;
  currency: 'USD' | 'ARS';
  items: QuoteItem[];
  subtotal: number;
  taxPercent: number; // e.g. 0% or 21%
  total: number;
  timeline: string;
  milestones: PaymentMilestone[];
  termsAndConditions: string[];
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'invoiced';
  validUntil: string;
  createdAt: string;
  updatedAt: string;
  preferredPaymentMethod?: 'mercadopago' | 'stripe' | 'transfer' | 'crypto';
  paymentLink?: string;
}

export interface QuoteTemplate {
  id: string;
  serviceCategory: ServiceCategory;
  name: string;
  suggestedTitle: string;
  defaultCurrency: 'USD' | 'ARS';
  suggestedTimeline: string;
  items: {
    description: string;
    deliverable: string;
    hours?: number;
    unitPrice: number;
    quantity: number;
  }[];
  milestones: {
    name: string;
    percentage: number;
    condition: string;
  }[];
  terms: string[];
  fastReplyTemplates: {
    whatsapp: string;
    emailSubject: string;
    emailBody: string;
  };
}

export interface PaymentGatewayConfig {
  mercadopago: {
    enabled: boolean;
    aliasOrCvu: string;
    titular: string;
    cuit: string;
    defaultCheckoutUrl: string;
    qrImagePlaceholder?: string;
    notes: string;
  };
  stripe: {
    enabled: boolean;
    paymentLinkUrl: string;
    accountEmail: string;
    acceptedCurrencies: string[];
    notes: string;
  };
  bankTransfer: {
    enabled: boolean;
    banco: string;
    titular: string;
    cuit: string;
    cbu: string;
    alias: string;
    tipoCuenta: string;
    swift?: string;
    facturaTipo: 'A' | 'B' | 'E';
    notes: string;
  };
  crypto: {
    enabled: boolean;
    usdtTrc20Address: string;
    usdcErc20Address: string;
    binancePayId?: string;
    notes: string;
  };
}

export interface PaymentRecord {
  id: string;
  quoteId?: string;
  opportunityId?: string;
  clientName: string;
  amount: number;
  currency: 'USD' | 'ARS';
  method: 'mercadopago' | 'stripe' | 'transfer' | 'crypto';
  status: 'pending' | 'confirmed' | 'refunded';
  transactionRef?: string;
  notes?: string;
  createdAt: string;
  confirmedAt?: string;
}
