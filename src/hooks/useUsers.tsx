import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserData {
  id: string;
  email: string;
  role: 'admin' | 'viewer';
  tenant_names: string[];
  created_at: string;
  last_login?: string;
  is_2fa_enabled: boolean;
  full_name?: string;
}

export function useUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch profiles with roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Fetch tenant memberships
      const { data: memberships, error: membershipsError } = await supabase
        .from('tenant_members')
        .select('user_id, tenant_id, tenants(name)');

      if (membershipsError) throw membershipsError;

      // Combine data
      const usersData: UserData[] = (profiles || []).map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        const userTenants = memberships?.filter(m => m.user_id === profile.id) || [];
        const tenantNames = userTenants.map(t => (t.tenants as any)?.name).filter(Boolean);

        return {
          id: profile.id,
          email: profile.email,
          role: (userRole?.role as 'admin' | 'viewer') || 'viewer',
          tenant_names: tenantNames.length > 0 ? tenantNames : ['Tidak ada'],
          created_at: profile.created_at,
          is_2fa_enabled: profile.is_2fa_enabled || false,
          full_name: profile.full_name || undefined,
        };
      });

      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Gagal memuat data user');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserRole = async (userId: string, newRole: 'admin' | 'viewer') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      await supabase.from('audit_logs').insert({
        user_email: 'system',
        action: 'SETTING_CHANGED' as const,
        details: `Role user diubah menjadi ${newRole}`,
        ip_address: 'unknown'
      });

      toast.success('Role user berhasil diubah');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Gagal mengubah role user');
    }
  };

  const addUserToTenant = async (userId: string, tenantId: string) => {
    try {
      const { error } = await supabase
        .from('tenant_members')
        .insert({ user_id: userId, tenant_id: tenantId });

      if (error) throw error;

      toast.success('User berhasil ditambahkan ke tenant');
      fetchUsers();
    } catch (error) {
      console.error('Error adding user to tenant:', error);
      toast.error('Gagal menambahkan user ke tenant');
    }
  };

  const removeUserFromTenant = async (userId: string, tenantId: string) => {
    try {
      const { error } = await supabase
        .from('tenant_members')
        .delete()
        .eq('user_id', userId)
        .eq('tenant_id', tenantId);

      if (error) throw error;

      toast.success('User berhasil dihapus dari tenant');
      fetchUsers();
    } catch (error) {
      console.error('Error removing user from tenant:', error);
      toast.error('Gagal menghapus user dari tenant');
    }
  };

  return {
    users,
    isLoading,
    updateUserRole,
    addUserToTenant,
    removeUserFromTenant,
    refetch: fetchUsers
  };
}
