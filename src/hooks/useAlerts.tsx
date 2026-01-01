import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AlertRule {
  id: string;
  tenant_id: string;
  tenant_name: string;
  name: string;
  condition: 'requests_per_minute' | 'brute_force_attempts' | 'critical_events' | 'sensitive_paths';
  threshold: number;
  webhook_type: 'discord' | 'telegram' | 'slack' | 'email';
  webhook_url: string;
  is_active: boolean;
  triggered_count: number;
  last_triggered_at?: string;
  created_at: string;
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('alert_rules')
        .select('*, tenants(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const alertsData: AlertRule[] = (data || []).map(alert => ({
        id: alert.id,
        tenant_id: alert.tenant_id,
        tenant_name: (alert.tenants as any)?.name || 'Unknown',
        name: alert.name,
        condition: alert.condition as AlertRule['condition'],
        threshold: alert.threshold,
        webhook_type: alert.webhook_type as AlertRule['webhook_type'],
        webhook_url: alert.webhook_url,
        is_active: alert.is_active,
        triggered_count: alert.triggered_count,
        last_triggered_at: alert.last_triggered_at || undefined,
        created_at: alert.created_at,
      }));

      setAlerts(alertsData);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Gagal memuat data alert');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const createAlert = async (
    tenantId: string,
    name: string,
    condition: AlertRule['condition'],
    threshold: number,
    webhookType: AlertRule['webhook_type'],
    webhookUrl: string
  ) => {
    try {
      const { error } = await supabase
        .from('alert_rules')
        .insert({
          tenant_id: tenantId,
          name,
          condition,
          threshold,
          webhook_type: webhookType,
          webhook_url: webhookUrl,
        });

      if (error) throw error;

      await supabase.from('audit_logs').insert({
        user_email: 'system',
        action: 'SETTING_CHANGED' as const,
        details: `Alert rule "${name}" dibuat`,
        ip_address: 'unknown'
      });

      toast.success(`Alert "${name}" berhasil dibuat`);
      fetchAlerts();
      return { error: null };
    } catch (error: any) {
      console.error('Error creating alert:', error);
      toast.error('Gagal membuat alert');
      return { error };
    }
  };

  const updateAlert = async (id: string, updates: Partial<AlertRule>) => {
    try {
      const { error } = await supabase
        .from('alert_rules')
        .update({
          name: updates.name,
          condition: updates.condition,
          threshold: updates.threshold,
          webhook_type: updates.webhook_type,
          webhook_url: updates.webhook_url,
          is_active: updates.is_active,
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Alert berhasil diupdate');
      fetchAlerts();
    } catch (error) {
      console.error('Error updating alert:', error);
      toast.error('Gagal mengupdate alert');
    }
  };

  const toggleAlert = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('alert_rules')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      fetchAlerts();
    } catch (error) {
      console.error('Error toggling alert:', error);
      toast.error('Gagal mengubah status alert');
    }
  };

  const deleteAlert = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('alert_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await supabase.from('audit_logs').insert({
        user_email: 'system',
        action: 'SETTING_CHANGED' as const,
        details: `Alert rule "${name}" dihapus`,
        ip_address: 'unknown'
      });

      toast.success(`Alert "${name}" berhasil dihapus`);
      fetchAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast.error('Gagal menghapus alert');
    }
  };

  const testAlert = async (alert: AlertRule) => {
    toast.success(`Test alert dikirim ke ${alert.webhook_type}`);
    // TODO: Implement actual webhook test via edge function
  };

  return {
    alerts,
    isLoading,
    createAlert,
    updateAlert,
    toggleAlert,
    deleteAlert,
    testAlert,
    refetch: fetchAlerts
  };
}
