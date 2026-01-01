import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ApiToken {
  id: string;
  tenant_id: string;
  name: string;
  token_hash: string;
  token_preview: string;
  expires_at: string | null;
  grace_period_until: string | null;
  last_used_at: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  // Joined data
  tenant_name?: string;
}

// Simple hash function for tokens (in production use bcrypt on backend)
function hashToken(token: string): string {
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'npt_';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function useApiTokens() {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTokens = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('api_tokens')
      .select(`
        *,
        tenants!inner(name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tokens:', error);
    } else {
      const tokensWithTenant = (data || []).map((token: any) => ({
        ...token,
        tenant_name: token.tenants?.name || 'Unknown'
      }));
      setTokens(tokensWithTenant);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTokens();
  }, [user]);

  const createToken = async (tenantId: string, name: string, expiresAt?: string) => {
    if (!user) return { error: new Error('Not authenticated'), token: null };

    const fullToken = generateToken();
    const tokenHash = hashToken(fullToken);
    const tokenPreview = `npt_***${fullToken.slice(-6)}`;

    const { data, error } = await supabase
      .from('api_tokens')
      .insert({
        tenant_id: tenantId,
        name,
        token_hash: tokenHash,
        token_preview: tokenPreview,
        expires_at: expiresAt || null,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      toast.error('Gagal membuat token');
      return { error, token: null };
    }

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      user_email: user.email || '',
      action: 'TOKEN_CREATED' as const,
      details: `Token "${name}" dibuat`,
      ip_address: 'unknown'
    });

    fetchTokens();
    toast.success('Token berhasil dibuat');
    return { error: null, token: fullToken, data };
  };

  const revokeToken = async (id: string, name: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('api_tokens')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      toast.error('Gagal revoke token');
      return { error };
    }

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      user_email: user.email || '',
      action: 'TOKEN_REVOKED' as const,
      details: `Token "${name}" direvoke`,
      ip_address: 'unknown'
    });

    setTokens(prev => prev.map(t => t.id === id ? { ...t, is_active: false } : t));
    toast.success('Token berhasil direvoke');
    return { error: null };
  };

  const rotateToken = async (id: string, name: string) => {
    if (!user) return { error: new Error('Not authenticated'), token: null };

    // Set grace period 24 hours from now
    const gracePeriodUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from('api_tokens')
      .update({ grace_period_until: gracePeriodUntil })
      .eq('id', id);

    if (error) {
      toast.error('Gagal rotate token');
      return { error, token: null };
    }

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      user_email: user.email || '',
      action: 'TOKEN_ROTATED' as const,
      details: `Token "${name}" dirotasi dengan grace period 24 jam`,
      ip_address: 'unknown'
    });

    setTokens(prev => prev.map(t => t.id === id ? { ...t, grace_period_until: gracePeriodUntil } : t));
    toast.success('Token akan dirotasi. Grace period 24 jam dimulai.');
    return { error: null };
  };

  const deleteToken = async (id: string, name: string) => {
    const { error } = await supabase
      .from('api_tokens')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Gagal menghapus token');
      return { error };
    }

    setTokens(prev => prev.filter(t => t.id !== id));
    toast.success(`Token "${name}" berhasil dihapus`);
    return { error: null };
  };

  return {
    tokens,
    isLoading,
    createToken,
    revokeToken,
    rotateToken,
    deleteToken,
    refetch: fetchTokens
  };
}
