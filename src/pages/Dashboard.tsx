import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { EventsTable } from '@/components/dashboard/EventsTable';
import { EventDetailSheet } from '@/components/dashboard/EventDetailSheet';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { TopItemsList } from '@/components/dashboard/TopItemsList';
import { HourlyChart } from '@/components/dashboard/HourlyChart';
import { 
  generateMockEvents, 
  getMockStats, 
  getMockTopIPs, 
  getMockTopPaths,
  getMockSavedViews 
} from '@/lib/mockData';
import { HoneypotEvent, EventFilters, EventTag, SavedView } from '@/types/honeypot';
import { Activity, AlertTriangle, Globe, Shield, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [events, setEvents] = useState<HoneypotEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<HoneypotEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<HoneypotEvent | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filters, setFilters] = useState<EventFilters>({});
  const [savedViews, setSavedViews] = useState<SavedView[]>(getMockSavedViews());
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const stats = getMockStats();
  const topIPs = getMockTopIPs();
  const topPaths = getMockTopPaths();

  // Load initial events
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setEvents(generateMockEvents(100));
      setIsLoading(false);
    }, 500);
  }, []);

  // Real-time simulation
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const newEvent = generateMockEvents(1)[0];
      setEvents(prev => [newEvent, ...prev.slice(0, 199)]);
      
      if (newEvent.risk_level === 'critical') {
        toast.error(`Event Kritis Terdeteksi`, {
          description: `IP: ${newEvent.source_ip} → ${newEvent.path}`,
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Apply filters
  useEffect(() => {
    let result = [...events];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(e =>
        e.source_ip.includes(search) ||
        e.path.toLowerCase().includes(search) ||
        e.payload_preview.toLowerCase().includes(search) ||
        e.user_agent.toLowerCase().includes(search)
      );
    }

    if (filters.risk_level?.length) {
      result = result.filter(e => filters.risk_level!.includes(e.risk_level));
    }

    if (filters.date_from) {
      const from = new Date(filters.date_from);
      result = result.filter(e => new Date(e.timestamp) >= from);
    }

    if (filters.date_to) {
      const to = new Date(filters.date_to);
      result = result.filter(e => new Date(e.timestamp) <= to);
    }

    setFilteredEvents(result);
  }, [events, filters]);

  const handleViewDetails = (event: HoneypotEvent) => {
    setSelectedEvent(event);
    setDetailOpen(true);
  };

  const handleAddTag = (eventId: string, tag: EventTag) => {
    setEvents(prev => prev.map(e => 
      e.id === eventId ? { ...e, tags: [...e.tags, tag] } : e
    ));
    if (selectedEvent?.id === eventId) {
      setSelectedEvent(prev => prev ? { ...prev, tags: [...prev.tags, tag] } : null);
    }
    toast.success(`Tag "${tag}" ditambahkan`);
  };

  const handleSaveNote = (eventId: string, note: string) => {
    setEvents(prev => prev.map(e => 
      e.id === eventId ? { ...e, notes: note } : e
    ));
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
      created_at: new Date().toISOString(),
    };
    setSavedViews(prev => [...prev, newView]);
    toast.success(`View "${name}" disimpan`);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setEvents(generateMockEvents(100));
      setIsLoading(false);
      toast.success('Data diperbarui');
    }, 500);
  };

  const user = { email: 'admin@neypot.id', role: 'admin' };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={user} 
        onLogout={() => toast.info('Logout clicked')}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <Sidebar isOpen={sidebarOpen} userRole="admin" />

      <main className={cn(
        'transition-all duration-300 p-6',
        sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
      )}>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatsCard
            title="Event Hari Ini"
            value={stats.total_events_today}
            change={12}
            icon={Activity}
            variant="primary"
          />
          <StatsCard
            title="IP Unik"
            value={stats.unique_ips_today}
            change={-5}
            icon={Globe}
          />
          <StatsCard
            title="Risiko Tinggi"
            value={stats.high_risk_events}
            change={23}
            icon={AlertTriangle}
            variant="danger"
          />
          <StatsCard
            title="Tenant Aktif"
            value={stats.active_tenants}
            icon={Users}
          />
          <StatsCard
            title="Event Minggu Ini"
            value={stats.total_events_week}
            icon={Shield}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            <HourlyChart data={stats.events_per_hour} title="Request per Jam (24 Jam Terakhir)" />
          </div>
          <TopItemsList
            title="Top 5 IP Sumber"
            items={topIPs}
            icon={<Globe className="h-4 w-4 text-primary" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            <TopItemsList
              title="Top 5 Path Target"
              items={topPaths}
              icon={<Activity className="h-4 w-4 text-primary" />}
            />
          </div>
        </div>

        {/* Filters */}
        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          savedViews={savedViews}
          onLoadView={handleLoadView}
          onSaveView={handleSaveView}
          isPaused={isPaused}
          onTogglePause={() => setIsPaused(!isPaused)}
          onRefresh={handleRefresh}
        />

        {/* Live Indicator */}
        <div className="flex items-center gap-2 my-4">
          <div className={cn(
            'h-2 w-2 rounded-full',
            isPaused ? 'bg-warning' : 'bg-success animate-pulse'
          )} />
          <span className="text-sm text-muted-foreground">
            {isPaused ? 'Dijeda' : 'Live'} • {filteredEvents.length} event
          </span>
        </div>

        {/* Events Table */}
        <EventsTable
          events={filteredEvents}
          onViewDetails={handleViewDetails}
          isLoading={isLoading}
        />

        {/* Event Detail Sheet */}
        <EventDetailSheet
          event={selectedEvent}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onAddTag={handleAddTag}
          onSaveNote={handleSaveNote}
        />
      </main>
    </div>
  );
}
