export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type EventTag = 'scanner' | 'bruteforce' | 'false_positive' | 'watchlist' | 'suspicious';

export interface HoneypotEvent {
  id: string;
  timestamp: string;
  tenant_id: string;
  tenant_name: string;
  source_ip: string;
  country?: string;
  asn?: string;
  service: string;
  path: string;
  method: string;
  user_agent: string;
  payload_preview: string;
  payload_full?: string;
  headers?: Record<string, string>;
  risk_score: number;
  risk_level: RiskLevel;
  tags: EventTag[];
  notes?: string;
}

export interface Tenant {
  id: string;
  name: string;
  created_at: string;
  retention_days: number;
  is_active: boolean;
  token_count: number;
}

export interface ApiToken {
  id: string;
  tenant_id: string;
  name: string;
  token_preview: string;
  created_at: string;
  expires_at?: string;
  last_used_at?: string;
  is_active: boolean;
  grace_period_until?: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'viewer';
  tenant_ids: string[];
  created_at: string;
  last_login?: string;
  is_2fa_enabled: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user_id: string;
  user_email: string;
  action: string;
  details: string;
  ip_address: string;
}

export interface DashboardStats {
  total_events_today: number;
  total_events_week: number;
  unique_ips_today: number;
  high_risk_events: number;
  active_tenants: number;
  events_per_hour: number[];
}

export interface TopItem {
  label: string;
  count: number;
  percentage: number;
}

export interface AlertRule {
  id: string;
  tenant_id: string;
  name: string;
  condition: string;
  threshold: number;
  webhook_url?: string;
  is_active: boolean;
}

export interface SavedView {
  id: string;
  name: string;
  filters: EventFilters;
  created_at: string;
}

export interface EventFilters {
  search?: string;
  tenant_id?: string;
  risk_level?: RiskLevel[];
  tags?: EventTag[];
  date_from?: string;
  date_to?: string;
  source_ip?: string;
  path?: string;
}
