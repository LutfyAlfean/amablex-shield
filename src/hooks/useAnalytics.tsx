import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface DashboardStats {
  totalEventsToday: number;
  totalEventsWeek: number;
  uniqueIpsToday: number;
  highRiskEvents: number;
  activeTenants: number;
}

export interface TopItem {
  label: string;
  count: number;
  percentage: number;
}

export interface HourlyData {
  hour: number;
  count: number;
}

export function useAnalytics(tenantId?: string) {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topIPs, setTopIPs] = useState<TopItem[]>([]);
  const [topPaths, setTopPaths] = useState<TopItem[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    try {
      // Total events today
      let todayQuery = supabase
        .from('events')
        .select('id', { count: 'exact', head: true })
        .gte('timestamp', todayStart);
      
      if (tenantId) todayQuery = todayQuery.eq('tenant_id', tenantId);
      const { count: todayCount } = await todayQuery;

      // Total events this week
      let weekQuery = supabase
        .from('events')
        .select('id', { count: 'exact', head: true })
        .gte('timestamp', weekStart);
      
      if (tenantId) weekQuery = weekQuery.eq('tenant_id', tenantId);
      const { count: weekCount } = await weekQuery;

      // High risk events
      let highRiskQuery = supabase
        .from('events')
        .select('id', { count: 'exact', head: true })
        .gte('risk_score', 60)
        .gte('timestamp', todayStart);
      
      if (tenantId) highRiskQuery = highRiskQuery.eq('tenant_id', tenantId);
      const { count: highRiskCount } = await highRiskQuery;

      // Unique IPs today
      let ipsQuery = supabase
        .from('events')
        .select('source_ip')
        .gte('timestamp', todayStart);
      
      if (tenantId) ipsQuery = ipsQuery.eq('tenant_id', tenantId);
      const { data: ipsData } = await ipsQuery;
      const uniqueIPs = new Set(ipsData?.map(e => e.source_ip) || []).size;

      // Active tenants
      const { count: tenantsCount } = await supabase
        .from('tenants')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);

      setStats({
        totalEventsToday: todayCount || 0,
        totalEventsWeek: weekCount || 0,
        uniqueIpsToday: uniqueIPs,
        highRiskEvents: highRiskCount || 0,
        activeTenants: tenantsCount || 0
      });

      // Top IPs
      let eventsQuery = supabase
        .from('events')
        .select('source_ip')
        .gte('timestamp', weekStart);
      
      if (tenantId) eventsQuery = eventsQuery.eq('tenant_id', tenantId);
      const { data: allEvents } = await eventsQuery;

      if (allEvents) {
        const ipCounts: Record<string, number> = {};
        allEvents.forEach(e => {
          ipCounts[e.source_ip] = (ipCounts[e.source_ip] || 0) + 1;
        });

        const total = allEvents.length;
        const topIPsList = Object.entries(ipCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([ip, count]) => ({
            label: ip,
            count,
            percentage: Math.round((count / total) * 100)
          }));
        setTopIPs(topIPsList);
      }

      // Top Paths
      let pathsQuery = supabase
        .from('events')
        .select('path')
        .gte('timestamp', weekStart);
      
      if (tenantId) pathsQuery = pathsQuery.eq('tenant_id', tenantId);
      const { data: pathsData } = await pathsQuery;

      if (pathsData) {
        const pathCounts: Record<string, number> = {};
        pathsData.forEach(e => {
          pathCounts[e.path] = (pathCounts[e.path] || 0) + 1;
        });

        const total = pathsData.length;
        const topPathsList = Object.entries(pathCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([path, count]) => ({
            label: path,
            count,
            percentage: Math.round((count / total) * 100)
          }));
        setTopPaths(topPathsList);
      }

      // Hourly distribution
      let hourlyQuery = supabase
        .from('events')
        .select('timestamp')
        .gte('timestamp', todayStart);
      
      if (tenantId) hourlyQuery = hourlyQuery.eq('tenant_id', tenantId);
      const { data: hourlyEvents } = await hourlyQuery;

      if (hourlyEvents) {
        const hourCounts: Record<number, number> = {};
        for (let i = 0; i < 24; i++) hourCounts[i] = 0;
        
        hourlyEvents.forEach(e => {
          const hour = new Date(e.timestamp).getHours();
          hourCounts[hour]++;
        });

        setHourlyData(
          Object.entries(hourCounts).map(([hour, count]) => ({
            hour: parseInt(hour),
            count
          }))
        );
      }

    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user, tenantId]);

  return {
    stats,
    topIPs,
    topPaths,
    hourlyData,
    isLoading,
    refetch: fetchAnalytics
  };
}
