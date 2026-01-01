import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { EventsTable } from '@/components/dashboard/EventsTable';
import { EventDetailSheet } from '@/components/dashboard/EventDetailSheet';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { OnboardingGuide } from '@/components/onboarding/OnboardingGuide';
import { ApiTestGuide } from '@/components/onboarding/ApiTestGuide';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useTenants } from '@/hooks/useTenants';
import { useApiTokens } from '@/hooks/useApiTokens';
import { HoneypotEvent, EventFilters, SavedView } from '@/types/honeypot';
import { cn } from '@/lib/utils';
import { Activity, AlertTriangle, Globe, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, role, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filters, setFilters] = useState<EventFilters>({});
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<HoneypotEvent | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  
  const { events, isLoading: eventsLoading, isPaused, setIsPaused, refetch } = useEvents({
    search: filters.search,
    risk_level: filters.risk_level,
    dateFrom: filters.date_from ? new Date(filters.date_from) : undefined,
    dateTo: filters.date_to ? new Date(filters.date_to) : undefined
  });
  const { stats, isLoading: statsLoading } = useAnalytics();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleFiltersChange = (newFilters: EventFilters) => {
    setFilters(newFilters);
  };

  const handleLoadView = (view: SavedView) => {
    setFilters(view.filters);
    toast.success(`View "${view.name}" dimuat`);
  };

  const handleSaveView = (name: string) => {
    const newView: SavedView = {
      id: `sv_${Date.now()}`,
      name,
      filters,
      created_at: new Date().toISOString()
    };
    setSavedViews(prev => [...prev, newView]);
    toast.success(`View "${name}" disimpan`);
  };

  const handleViewDetails = (event: HoneypotEvent) => {
    setSelectedEvent(event);
    setDetailOpen(true);
  };

  const handleTagUpdate = (eventId: string, tags: string[]) => {
    toast.success('Tag diupdate');
  };

  const handleNoteUpdate = (eventId: string, note: string) => {
    toast.success('Catatan disimpan');
  };

  const userInfo = {
    email: user?.email || profile?.email || 'User',
    role: role || 'viewer'
  };

  // Transform events to HoneypotEvent type
  const transformedEvents: HoneypotEvent[] = events.map(e => ({
    id: e.id,
    timestamp: e.timestamp,
    tenant_id: e.tenant_id,
    tenant_name: e.tenant_name || 'Unknown',
    source_ip: e.source_ip,
    country: e.country || undefined,
    asn: e.asn || undefined,
    service: e.service,
    path: e.path,
    method: e.method,
    user_agent: e.user_agent || '',
    payload_preview: e.body?.substring(0, 50) || '',
    payload_full: e.body || '',
    headers: e.headers || {},
    risk_score: e.risk_score,
    risk_level: e.risk_score >= 80 ? 'critical' : e.risk_score >= 60 ? 'high' : e.risk_score >= 40 ? 'medium' : e.risk_score >= 20 ? 'low' : 'info',
    tags: e.tags as any[],
    notes: e.notes || undefined
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={userInfo} 
        onLogout={handleLogout} 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
      />
      <Sidebar isOpen={sidebarOpen} userRole={role || 'viewer'} />

      <main className={cn(
        'transition-all duration-300 p-6',
        sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
      )}>
        {/* Onboarding Guide */}
        <OnboardingGuide />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Event Hari Ini"
            value={statsLoading ? '...' : (stats?.totalEventsToday || 0)}
            icon={Activity}
            change={12}
          />
          <StatsCard
            title="IP Unik"
            value={statsLoading ? '...' : (stats?.uniqueIpsToday || 0)}
            icon={Globe}
            change={-5}
          />
          <StatsCard
            title="High Risk"
            value={statsLoading ? '...' : (stats?.highRiskEvents || 0)}
            icon={AlertTriangle}
            change={8}
            variant="danger"
          />
          <StatsCard
            title="Tenant Aktif"
            value={statsLoading ? '...' : (stats?.activeTenants || 0)}
            icon={Shield}
          />
        </div>

        <FilterBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          savedViews={savedViews}
          onLoadView={handleLoadView}
          onSaveView={handleSaveView}
          isPaused={isPaused}
          onTogglePause={() => setIsPaused(!isPaused)}
          onRefresh={refetch}
        />

        <div className="mt-6">
          {eventsLoading ? (
            <div className="glass-card p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Memuat events...</p>
            </div>
          ) : transformedEvents.length === 0 ? (
            <div className="space-y-6">
              <div className="glass-card p-12 text-center">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Belum ada events</h3>
                <p className="text-muted-foreground mb-4">
                  Events akan muncul saat honeypot menerima request.
                </p>
              </div>
              <ApiTestGuide />
            </div>
          ) : (
            <EventsTable
              events={transformedEvents} 
              onViewDetails={handleViewDetails}
            />
          )}
        </div>
      </main>

      <EventDetailSheet
        event={selectedEvent}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onAddTag={(eventId, tag) => toast.success('Tag ditambahkan')}
        onSaveNote={(eventId, note) => toast.success('Catatan disimpan')}
      />
    </div>
  );
}
