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
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Plus, Search, MoreHorizontal, Trash2, Bell, Pencil, Webhook, MessageSquare, Mail } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface AlertRule {
  id: string;
  tenant_name: string;
  name: string;
  condition: string;
  threshold: number;
  webhook_type: 'discord' | 'telegram' | 'slack' | 'email';
  webhook_url: string;
  is_active: boolean;
  triggered_count: number;
}

const mockAlerts: AlertRule[] = [
  { id: 'al1', tenant_name: 'PT Secure Corp', name: 'High Rate Alert', condition: 'requests_per_minute', threshold: 100, webhook_type: 'discord', webhook_url: 'https://discord.com/api/webhooks/...', is_active: true, triggered_count: 5 },
  { id: 'al2', tenant_name: 'PT Secure Corp', name: 'Brute Force Detection', condition: 'brute_force_attempts', threshold: 10, webhook_type: 'telegram', webhook_url: 'https://api.telegram.org/bot.../sendMessage', is_active: true, triggered_count: 12 },
  { id: 'al3', tenant_name: 'CV Digital Prima', name: 'Critical Risk Alert', condition: 'critical_events', threshold: 5, webhook_type: 'slack', webhook_url: 'https://hooks.slack.com/services/...', is_active: false, triggered_count: 3 },
];

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [alerts, setAlerts] = useState<AlertRule[]>(mockAlerts);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({ 
    tenant: '', 
    name: '', 
    condition: 'requests_per_minute',
    threshold: 100,
    webhook_type: 'discord' as const,
    webhook_url: ''
  });

  const filteredAlerts = alerts.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.tenant_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (!newAlert.tenant || !newAlert.name || !newAlert.webhook_url) {
      toast.error('Semua field wajib diisi');
      return;
    }
    const alert: AlertRule = {
      id: `al${Date.now()}`,
      tenant_name: newAlert.tenant,
      name: newAlert.name,
      condition: newAlert.condition,
      threshold: newAlert.threshold,
      webhook_type: newAlert.webhook_type,
      webhook_url: newAlert.webhook_url,
      is_active: true,
      triggered_count: 0
    };
    setAlerts([...alerts, alert]);
    setNewAlert({ tenant: '', name: '', condition: 'requests_per_minute', threshold: 100, webhook_type: 'discord', webhook_url: '' });
    setDialogOpen(false);
    toast.success(`Alert "${alert.name}" berhasil dibuat`);
  };

  const handleToggle = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, is_active: !a.is_active } : a));
  };

  const handleDelete = (id: string, name: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
    toast.success(`Alert "${name}" berhasil dihapus`);
  };

  const handleTest = (alert: AlertRule) => {
    toast.success(`Test alert dikirim ke ${alert.webhook_type}`);
  };

  const user = { email: 'admin@neypot.id', role: 'admin' };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={() => {}} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} userRole="admin" />

      <main className={cn('transition-all duration-300 p-6', sidebarOpen ? 'lg:ml-64' : 'lg:ml-16')}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6 text-primary" />
              Alert Rules
            </h1>
            <p className="text-muted-foreground">Konfigurasi notifikasi webhook</p>
          </div>
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
                  <Select value={newAlert.tenant} onValueChange={(v) => setNewAlert({ ...newAlert, tenant: v })}>
                    <SelectTrigger><SelectValue placeholder="Pilih tenant" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PT Secure Corp">PT Secure Corp</SelectItem>
                      <SelectItem value="CV Digital Prima">CV Digital Prima</SelectItem>
                      <SelectItem value="Startup Inovasi">Startup Inovasi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Nama Alert</Label>
                  <Input placeholder="High Traffic Alert" value={newAlert.name} onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })} />
                </div>
                <div>
                  <Label>Kondisi</Label>
                  <Select value={newAlert.condition} onValueChange={(v) => setNewAlert({ ...newAlert, condition: v })}>
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
                  <Input type="number" value={newAlert.threshold} onChange={(e) => setNewAlert({ ...newAlert, threshold: parseInt(e.target.value) })} />
                </div>
                <div>
                  <Label>Webhook Type</Label>
                  <Select value={newAlert.webhook_type} onValueChange={(v: any) => setNewAlert({ ...newAlert, webhook_type: v })}>
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
              {filteredAlerts.map((alert) => {
                const WebhookIcon = webhookIcons[alert.webhook_type];
                return (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">{alert.name}</TableCell>
                    <TableCell className="text-muted-foreground">{alert.tenant_name}</TableCell>
                    <TableCell>{conditionLabels[alert.condition]}</TableCell>
                    <TableCell className="font-mono">{alert.threshold}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="gap-1">
                        <WebhookIcon className="h-3 w-3" />
                        {alert.webhook_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{alert.triggered_count}x</TableCell>
                    <TableCell>
                      <Switch checked={alert.is_active} onCheckedChange={() => handleToggle(alert.id)} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleTest(alert)}>
                            <Bell className="h-4 w-4 mr-2" />Test Alert
                          </DropdownMenuItem>
                          <DropdownMenuItem><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(alert.id, alert.name)}>
                            <Trash2 className="h-4 w-4 mr-2" />Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
