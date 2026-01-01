import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Tenant {
  id: string;
  name: string;
  retention_days: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useTenants() {
  const { user, isAdmin } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTenants = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tenants:', error);
      toast.error('Gagal memuat data tenant');
    } else {
      setTenants(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTenants();
  }, [user]);

  const createTenant = async (name: string, retentionDays: number) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('tenants')
      .insert({
        name,
        retention_days: retentionDays,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      toast.error('Gagal membuat tenant: ' + error.message);
      return { error };
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      user_email: user.email || '',
      action: 'TENANT_CREATED' as const,
      details: `Tenant "${name}" dibuat`,
      ip_address: 'unknown'
    });

    setTenants(prev => [data, ...prev]);
    toast.success(`Tenant "${name}" berhasil dibuat`);
    return { error: null, data };
  };

  const updateTenant = async (id: string, updates: Partial<Tenant>) => {
    const { error } = await supabase
      .from('tenants')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast.error('Gagal update tenant');
      return { error };
    }

    setTenants(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    toast.success('Tenant berhasil diupdate');
    return { error: null };
  };

  const deleteTenant = async (id: string, name: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('tenants')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Gagal menghapus tenant');
      return { error };
    }

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      user_email: user.email || '',
      action: 'TENANT_DELETED' as const,
      details: `Tenant "${name}" dihapus`,
      ip_address: 'unknown'
    });

    setTenants(prev => prev.filter(t => t.id !== id));
    toast.success(`Tenant "${name}" berhasil dihapus`);
    return { error: null };
  };

  return {
    tenants,
    isLoading,
    createTenant,
    updateTenant,
    deleteTenant,
    refetch: fetchTenants
  };
}
