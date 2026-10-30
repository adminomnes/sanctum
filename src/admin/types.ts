export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'commercial';
}

export interface SiteContentItem {
  key: string;
  value: string;
  section: string;
  label: string;
  type: 'text' | 'textarea' | 'image' | 'json';
}

export interface Service {
  id: string;
  title: string;
  tagline: string;
  description: string;
  servicesList: string[];
  ctaText: string;
  theme: 'dark' | 'soft-pink' | 'warm-white' | 'seasonal-coral';
  accentColor: string;
  image: string;
  imageAlt: string;
  badge?: string;
  active: boolean;
  sort_order: number;
  basePrice?: number;
  unit?: string;
}

export interface RateItem {
  id: number;
  service_id?: string;
  category: string;
  name: string;
  description?: string;
  unit: string;
  price: number;
  iva_applicable: boolean | number;
  active: boolean | number;
}

export interface QuoteItem {
  id?: number;
  quote_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Quote {
  id: string;
  client_id?: number;
  client_name: string;
  company?: string;
  email: string;
  phone?: string;
  city: string;
  service_type: string;
  event_date?: string;
  budget_reference?: string;
  description?: string;
  status: 'pendiente' | 'en_revision' | 'enviada' | 'aprobada' | 'rechazada';
  subtotal: number;
  iva_rate: number;
  iva_amount: number;
  total: number;
  notes?: string;
  created_at: string;
  items?: QuoteItem[];
}

export interface Client {
  id: number;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  city?: string;
  notes?: string;
  quotes_count?: number;
  total_quoted?: number;
  created_at: string;
}

export interface CampaignEvent {
  id: number;
  title: string;
  type: 'campaña' | 'evento_corporativo' | 'evento_privado' | 'activacion';
  client_name?: string;
  city: string;
  venue?: string;
  start_date: string;
  end_date?: string;
  status: 'planificacion' | 'confirmado' | 'en_progreso' | 'finalizado' | 'cancelado';
  budget: number;
  staffAssigned: string[];
  requirements?: string;
  notes?: string;
}

