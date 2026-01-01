import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Plus, Search, MoreHorizontal, Trash2, Bell, Pencil, Webhook, MessageSquare, Mail } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useAlerts, AlertRule } from '@/hooks/useAlerts';
import { useTenants } from '@/hooks/useTenants';

const conditionLabels: Record<string, string> = {
  requests_per_minute: 'Request/menit tinggi',
  brute_force_attempts: 'Percobaan brute force',
  critical_events: 'Event risiko kritis',
  sensitive_paths: 'Akses path sensitif',
};

const webhookIcons: Record<string, typeof MessageSquare> = {
  discord: MessageSquare,
  telegram: MessageSquare,
  slack: Webhook,
  email: Mail,
};

export default function Alerts() {
  const { user, profile, role, signOut } = useAuth();
  const { alerts, isLoading, createAlert, toggleAlert, deleteAlert, testAlert } = useAlerts();
  const { tenants } = useTenants();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({ 
    tenant_id: '', 
    name: '', 
    condition: 'requests_per_minute' as AlertRule['condition'],
    threshold: 100,
    webhook_type: 'discord' as AlertRule['webhook_type'],
    webhook_url: ''
  });

  const filteredAlerts = alerts.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.tenant_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!newAlert.tenant_id || !newAlert.name || !newAlert.webhook_url) {
      return;
    }
    
    const { error } = await createAlert(
      newAlert.tenant_id,
      newAlert.name,
      newAlert.condition,
      newAlert.threshold,
      newAlert.webhook_type,
      newAlert.webhook_url
    );

    if (!error) {
      setNewAlert({ 
        tenant_id: '', 
        name: '', 
        condition: 'requests_per_minute', 
        threshold: 100, 
        webhook_type: 'discord', 
        webhook_url: '' 
      });
      setDialogOpen(false);
    }
  };

  const userInfo = { email: profile?.email || user?.email || '', role: role || 'viewer' };
  const isAdmin = role === 'admin';

  return (
    <div className="min-h-screen bg-background">
      <Header user={userInfo} onLogout={signOut} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} userRole={role || 'viewer'} />

      <main className={cn('transition-all duration-300 p-6', sidebarOpen ? 'lg:ml-64' : 'lg:ml-16')}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6 text-primary" />
              Alert Rules
            </h1>
            <p className="text-muted-foreground">Konfigurasi notifikasi webhook</p>
          </div>
          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Buat Alert</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Buat Alert Baru</DialogTitle>
                  <DialogDescription>Kirim notifikasi saat threshold tercapai</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Tenant</Label>
                    <Select value={newAlert.tenant_id} onValueChange={(v) => setNewAlert({ ...newAlert, tenant_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Pilih tenant" /></SelectTrigger>
                      <SelectContent>
                        {tenants.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Nama Alert</Label>
                    <Input placeholder="High Traffic Alert" value={newAlert.name} onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })} />
                  </div>
                  <div>
                    <Label>Kondisi</Label>
                    <Select value={newAlert.condition} onValueChange={(v) => setNewAlert({ ...newAlert, condition: v as AlertRule['condition'] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="requests_per_minute">Request/menit tinggi</SelectItem>
                        <SelectItem value="brute_force_attempts">Percobaan brute force</SelectItem>
                        <SelectItem value="critical_events">Event risiko kritis</SelectItem>
                        <SelectItem value="sensitive_paths">Akses path sensitif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Threshold</Label>
                    <Input type="number" value={newAlert.threshold} onChange={(e) => setNewAlert({ ...newAlert, threshold: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <Label>Webhook Type</Label>
                    <Select value={newAlert.webhook_type} onValueChange={(v) => setNewAlert({ ...newAlert, webhook_type: v as AlertRule['webhook_type'] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discord">Discord</SelectItem>
                        <SelectItem value="telegram">Telegram</SelectItem>
                        <SelectItem value="slack">Slack</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Webhook URL</Label>
                    <Input placeholder="https://..." value={newAlert.webhook_url} onChange={(e) => setNewAlert({ ...newAlert, webhook_url: e.target.value })} />
                  </div>
                  <Button onClick={handleCreate} className="w-full">Buat Alert</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="glass-card p-4 mb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari alert..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Kondisi</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Triggered</TableHead>
                <TableHead>Aktif</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-10" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : filteredAlerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Tidak ada alert rule ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                filteredAlerts.map((alert) => {
                  const WebhookIcon = webhookIcons[alert.webhook_type] || Webhook;
                  return (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">{alert.name}</TableCell>
                      <TableCell className="text-muted-foreground">{alert.tenant_name}</TableCell>
                      <TableCell>{conditionLabels[alert.condition] || alert.condition}</TableCell>
                      <TableCell className="font-mono">{alert.threshold}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1">
                          <WebhookIcon className="h-3 w-3" />
                          {alert.webhook_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{alert.triggered_count}x</TableCell>
                      <TableCell>
                        <Switch 
                          checked={alert.is_active} 
                          onCheckedChange={(v) => toggleAlert(alert.id, v)}
                          disabled={!isAdmin}
                        />
                      </TableCell>
                      <TableCell>
                        {isAdmin && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => testAlert(alert)}>
                                <Bell className="h-4 w-4 mr-2" />Test Alert
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => deleteAlert(alert.id, alert.name)}>
                                <Trash2 className="h-4 w-4 mr-2" />Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
