import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Shield, Database, Download, Key, Globe, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { useTenants } from '@/hooks/useTenants';
import { supabase } from '@/integrations/supabase/client';

export default function SettingsPage() {
  const { user, profile, role, signOut } = useAuth();
  const { settings, isLoading, updateSettings, saveAllSettings } = useSettings();
  const { tenants } = useTenants();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [exportTenant, setExportTenant] = useState('all');
  const [exportDateFrom, setExportDateFrom] = useState('');
  const [exportDateTo, setExportDateTo] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    await saveAllSettings(settings);
    setIsSaving(false);
  };

  const handleExportCSV = async () => {
    try {
      let query = supabase
        .from('events')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10000);

      if (exportTenant !== 'all') {
        query = query.eq('tenant_id', exportTenant);
      }
      if (exportDateFrom) {
        query = query.gte('timestamp', exportDateFrom);
      }
      if (exportDateTo) {
        query = query.lte('timestamp', exportDateTo);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.info('Tidak ada data untuk diexport');
        return;
      }

      // Convert to CSV
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(row => 
        Object.values(row).map(v => 
          typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v
        ).join(',')
      );
      const csv = [headers, ...rows].join('\n');

      // Download file
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `events_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      // Log audit
      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        user_email: user?.email || 'unknown',
        action: 'EXPORT_DATA' as const,
        details: `Export ${data.length} events ke CSV`,
        ip_address: 'unknown'
      });

      toast.success(`Export ${data.length} events berhasil`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Gagal export data');
    }
  };

  const handleExportJSON = async () => {
    try {
      let query = supabase
        .from('events')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10000);

      if (exportTenant !== 'all') {
        query = query.eq('tenant_id', exportTenant);
      }
      if (exportDateFrom) {
        query = query.gte('timestamp', exportDateFrom);
      }
      if (exportDateTo) {
        query = query.lte('timestamp', exportDateTo);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.info('Tidak ada data untuk diexport');
        return;
      }

      // Download file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `events_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      // Log audit
      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        user_email: user?.email || 'unknown',
        action: 'EXPORT_DATA' as const,
        details: `Export ${data.length} events ke JSON`,
        ip_address: 'unknown'
      });

      toast.success(`Export ${data.length} events berhasil`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Gagal export data');
    }
  };

  const userInfo = { email: profile?.email || user?.email || '', role: role || 'viewer' };
  const isAdmin = role === 'admin';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={userInfo} onLogout={signOut} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar isOpen={sidebarOpen} userRole={role || 'viewer'} />
        <main className={cn('transition-all duration-300 p-6', sidebarOpen ? 'lg:ml-64' : 'lg:ml-16')}>
          <div className="text-center py-12 text-muted-foreground">
            Halaman ini hanya dapat diakses oleh Admin
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={userInfo} onLogout={signOut} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} userRole={role || 'viewer'} />

      <main className={cn('transition-all duration-300 p-6', sidebarOpen ? 'lg:ml-64' : 'lg:ml-16')}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-primary" />
            Pengaturan
          </h1>
          <p className="text-muted-foreground">Konfigurasi sistem dan keamanan</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="general">Umum</TabsTrigger>
              <TabsTrigger value="security">Keamanan</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Retensi Data
                  </CardTitle>
                  <CardDescription>Atur berapa lama data event disimpan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Periode Retensi</Label>
                    <Select value={settings.retention_days} onValueChange={(v) => updateSettings({ retention_days: v })}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 hari</SelectItem>
                        <SelectItem value="30">30 hari</SelectItem>
                        <SelectItem value="90">90 hari</SelectItem>
                        <SelectItem value="365">365 hari</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Pembersihan Otomatis</Label>
                      <p className="text-sm text-muted-foreground">Hapus data lama secara otomatis</p>
                    </div>
                    <Switch checked={settings.auto_cleanup} onCheckedChange={(v) => updateSettings({ auto_cleanup: v })} />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    IP Enrichment
                  </CardTitle>
                  <CardDescription>Lookup informasi negara/ASN untuk IP</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Aktifkan Enrichment</Label>
                      <p className="text-sm text-muted-foreground">Lookup geo/ASN saat online</p>
                    </div>
                    <Switch checked={settings.ip_enrichment} onCheckedChange={(v) => updateSettings({ ip_enrichment: v })} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Keamanan Akses
                  </CardTitle>
                  <CardDescription>Konfigurasi keamanan login dan session</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Rate Limit (req/menit)</Label>
                    <Input 
                      type="number" 
                      value={settings.rate_limit}
                      onChange={(e) => updateSettings({ rate_limit: e.target.value })}
                      className="w-[100px]"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Session Timeout (menit)</Label>
                    <Input 
                      type="number" 
                      value={settings.session_timeout}
                      onChange={(e) => updateSettings({ session_timeout: e.target.value })}
                      className="w-[100px]"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Wajib 2FA untuk Admin</Label>
                      <p className="text-sm text-muted-foreground">Paksa semua admin mengaktifkan 2FA</p>
                    </div>
                    <Switch checked={settings.require_2fa} onCheckedChange={(v) => updateSettings({ require_2fa: v })} />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    2FA TOTP
                  </CardTitle>
                  <CardDescription>Konfigurasi autentikasi dua faktor</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" disabled>
                    <Key className="h-4 w-4 mr-2" />
                    Setup 2FA untuk Akun Anda (Coming Soon)
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="export" className="space-y-4">
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-primary" />
                    Export Data
                  </CardTitle>
                  <CardDescription>Export events ke CSV atau JSON (khusus admin)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block">Rentang Tanggal</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="date" 
                          className="flex-1" 
                          value={exportDateFrom}
                          onChange={(e) => setExportDateFrom(e.target.value)}
                        />
                        <Input 
                          type="date" 
                          className="flex-1" 
                          value={exportDateTo}
                          onChange={(e) => setExportDateTo(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="mb-2 block">Tenant</Label>
                      <Select value={exportTenant} onValueChange={setExportTenant}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Tenant</SelectItem>
                          {tenants.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleExportCSV}>
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button variant="outline" onClick={handleExportJSON}>
                      <Download className="h-4 w-4 mr-2" />
                      Export JSON
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        <div className="mt-6">
          <Button onClick={handleSave} size="lg" disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Simpan Semua Pengaturan
          </Button>
        </div>
      </main>
    </div>
  );
}
