import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AuditLog {
  id: string;
  user_id?: string;
  user_email: string;
  action: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

interface AuditLogFilters {
  search?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useAuditLogs(filters?: AuditLogFilters) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      // Apply action filter
      if (filters?.action && filters.action !== 'all') {
        query = query.eq('action', filters.action as any);
      }

      // Apply date filters
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Apply search filter client-side (for flexibility)
      let logsData: AuditLog[] = (data || []).map(log => ({
        id: log.id,
        user_id: log.user_id || undefined,
        user_email: log.user_email,
        action: log.action,
        details: log.details || undefined,
        ip_address: log.ip_address || undefined,
        created_at: log.created_at,
      }));

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        logsData = logsData.filter(log => 
          log.user_email.toLowerCase().includes(searchLower) ||
          (log.details?.toLowerCase().includes(searchLower)) ||
          (log.ip_address?.includes(filters.search || ''))
        );
      }

      setLogs(logsData);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Gagal memuat audit log');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters?.action, filters?.dateFrom, filters?.dateTo]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 300);
    return () => clearTimeout(timer);
  }, [filters?.search]);

  return {
    logs,
    isLoading,
    refetch: fetchLogs
  };
}
