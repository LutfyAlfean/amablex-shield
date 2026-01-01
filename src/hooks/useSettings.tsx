import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export interface Settings {
  retention_days: string;
  auto_cleanup: boolean;
  email_notifications: boolean;
  ip_enrichment: boolean;
  rate_limit: string;
  session_timeout: string;
  require_2fa: boolean;
}

const defaultSettings: Settings = {
  retention_days: '30',
  auto_cleanup: true,
  email_notifications: false,
  ip_enrichment: true,
  rate_limit: '100',
  session_timeout: '30',
  require_2fa: false,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .is('tenant_id', null);

      if (error) throw error;

      if (data && data.length > 0) {
        const settingsObj: Record<string, any> = {};
        data.forEach(item => {
          settingsObj[item.key] = item.value;
        });

        setSettings({
          retention_days: settingsObj.retention_days?.toString() || defaultSettings.retention_days,
          auto_cleanup: settingsObj.auto_cleanup ?? defaultSettings.auto_cleanup,
          email_notifications: settingsObj.email_notifications ?? defaultSettings.email_notifications,
          ip_enrichment: settingsObj.ip_enrichment ?? defaultSettings.ip_enrichment,
          rate_limit: settingsObj.rate_limit?.toString() || defaultSettings.rate_limit,
          session_timeout: settingsObj.session_timeout?.toString() || defaultSettings.session_timeout,
          require_2fa: settingsObj.require_2fa ?? defaultSettings.require_2fa,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const saveSetting = async (key: string, value: any) => {
    try {
      // Check if setting exists
      const { data: existing } = await supabase
        .from('settings')
        .select('id')
        .eq('key', key)
        .is('tenant_id', null)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('settings')
          .update({ value, updated_by: user?.id })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('settings')
          .insert({ key, value, updated_by: user?.id });

        if (error) throw error;
      }

      return { error: null };
    } catch (error: any) {
      console.error('Error saving setting:', error);
      return { error };
    }
  };

  const saveAllSettings = async (newSettings: Settings) => {
    try {
      const promises = Object.entries(newSettings).map(([key, value]) => 
        saveSetting(key, value)
      );

      await Promise.all(promises);

      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        user_email: user?.email || 'unknown',
        action: 'SETTING_CHANGED' as const,
        details: 'Pengaturan sistem diubah',
        ip_address: 'unknown'
      });

      setSettings(newSettings);
      toast.success('Pengaturan berhasil disimpan');
      return { error: null };
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error('Gagal menyimpan pengaturan');
      return { error };
    }
  };

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  return {
    settings,
    isLoading,
    updateSettings,
    saveAllSettings,
    refetch: fetchSettings
  };
}
