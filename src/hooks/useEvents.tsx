import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface HoneypotEvent {
  id: string;
  tenant_id: string;
  timestamp: string;
  source_ip: string;
  service: string;
  path: string;
  method: string;
  user_agent: string | null;
  headers: Record<string, string> | null;
  body: string | null;
  payload_size: number;
  risk_score: number;
  tags: string[];
  notes: string | null;
  country: string | null;
  asn: string | null;
  org: string | null;
  created_at: string;
  // Joined data
  tenant_name?: string;
}

interface EventFilters {
  tenant_id?: string;
  risk_level?: string[];
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export function useEvents(filters?: EventFilters) {
  const { user } = useAuth();
  const [events, setEvents] = useState<HoneypotEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const fetchEvents = async () => {
    if (!user || isPaused) return;
    
    setIsLoading(true);
    
    let query = supabase
      .from('events')
      .select(`
        *,
        tenants!inner(name)
      `)
      .order('timestamp', { ascending: false })
      .limit(100);

    if (filters?.tenant_id) {
      query = query.eq('tenant_id', filters.tenant_id);
    }

    if (filters?.risk_level && filters.risk_level.length > 0) {
      const minScore = filters.risk_level.includes('critical') ? 80 :
                       filters.risk_level.includes('high') ? 60 :
                       filters.risk_level.includes('medium') ? 40 : 0;
      query = query.gte('risk_score', minScore);
    }

    if (filters?.search) {
      query = query.or(`source_ip.ilike.%${filters.search}%,path.ilike.%${filters.search}%`);
    }

    if (filters?.dateFrom) {
      query = query.gte('timestamp', filters.dateFrom.toISOString());
    }

    if (filters?.dateTo) {
      query = query.lte('timestamp', filters.dateTo.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching events:', error);
    } else {
      const eventsWithTenant = (data || []).map((event: any) => ({
        ...event,
        tenant_name: event.tenants?.name || 'Unknown'
      }));
      setEvents(eventsWithTenant);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEvents();

    // Set up realtime subscription
    const channel = supabase
      .channel('events-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'events'
        },
        (payload) => {
          if (!isPaused) {
            setEvents(prev => [payload.new as HoneypotEvent, ...prev.slice(0, 99)]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isPaused, filters?.tenant_id, filters?.search]);

  const updateEventTags = async (eventId: string, tags: string[]) => {
    const { error } = await supabase
      .from('events')
      .update({ tags: tags as any })
      .eq('id', eventId);

    if (!error) {
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, tags } : e));
    }
    return { error };
  };

  const updateEventNotes = async (eventId: string, notes: string) => {
    const { error } = await supabase
      .from('events')
      .update({ notes })
      .eq('id', eventId);

    if (!error) {
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, notes } : e));
    }
    return { error };
  };

  return {
    events,
    isLoading,
    isPaused,
    setIsPaused,
    refetch: fetchEvents,
    updateEventTags,
    updateEventNotes
  };
}
