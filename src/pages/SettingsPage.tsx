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
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Shield, Database, Bell, Download, Upload, Trash2, Key, Globe } from 'lucide-react';

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settings, setSettings] = useState({
    retention_days: '30',
    auto_cleanup: true,
    email_notifications: false,
    ip_enrichment: true,
    rate_limit: '100',
    session_timeout: '30',
    require_2fa: false,
  });

  const handleSave = () => {
    toast.success('Pengaturan berhasil disimpan');
  };

  const handleBackup = () => {
    toast.success('Backup database dimulai...');
    setTimeout(() => toast.success('Backup selesai! File: backup_2024-12-16.sql'), 2000);
  };

  const handleRestore = () => {
    toast.info('Pilih file backup untuk restore');
  };

  const handleCleanup = () => {
    toast.success('Pembersihan data lama berhasil. 1,234 events dihapus.');
  };

  const user = { email: 'admin@neypot.id', role: 'admin' };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={() => {}} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} userRole="admin" />

      <main className={cn('transition-all duration-300 p-6', sidebarOpen ? 'lg:ml-64' : 'lg:ml-16')}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-primary" />
            Pengaturan
          </h1>
          <p className="text-muted-foreground">Konfigurasi sistem dan keamanan</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="general">Umum</TabsTrigger>
            <TabsTrigger value="security">Keamanan</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
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
                  <Select value={settings.retention_days} onValueChange={(v) => setSettings({ ...settings, retention_days: v })}>
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
                  <Switch checked={settings.auto_cleanup} onCheckedChange={(v) => setSettings({ ...settings, auto_cleanup: v })} />
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
                  <Switch checked={settings.ip_enrichment} onCheckedChange={(v) => setSettings({ ...settings, ip_enrichment: v })} />
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
                    onChange={(e) => setSettings({ ...settings, rate_limit: e.target.value })}
                    className="w-[100px]"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Session Timeout (menit)</Label>
                  <Input 
                    type="number" 
                    value={settings.session_timeout}
                    onChange={(e) => setSettings({ ...settings, session_timeout: e.target.value })}
                    className="w-[100px]"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Wajib 2FA untuk Admin</Label>
                    <p className="text-sm text-muted-foreground">Paksa semua admin mengaktifkan 2FA</p>
                  </div>
                  <Switch checked={settings.require_2fa} onCheckedChange={(v) => setSettings({ ...settings, require_2fa: v })} />
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
                <Button variant="outline">
                  <Key className="h-4 w-4 mr-2" />
                  Setup 2FA untuk Akun Anda
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Backup & Restore
                </CardTitle>
                <CardDescription>Kelola backup database</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleBackup}>
                    <Download className="h-4 w-4 mr-2" />
                    Backup Sekarang
                  </Button>
                  <Button variant="outline" onClick={handleRestore}>
                    <Upload className="h-4 w-4 mr-2" />
                    Restore dari File
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Backup terakhir: 2024-12-15 03:00 (otomatis)
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/50 border-destructive/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Trash2 className="h-5 w-5" />
                  Pembersihan Manual
                </CardTitle>
                <CardDescription>Hapus data lama secara manual</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={handleCleanup}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Bersihkan Data Lama
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="mb-2 block">Rentang Tanggal</Label>
                    <div className="flex gap-2">
                      <Input type="date" className="flex-1" />
                      <Input type="date" className="flex-1" />
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">Tenant</Label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Tenant</SelectItem>
                        <SelectItem value="t1">PT Secure Corp</SelectItem>
                        <SelectItem value="t2">CV Digital Prima</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => toast.success('Export CSV dimulai...')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="outline" onClick={() => toast.success('Export JSON dimulai...')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export JSON
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <Button onClick={handleSave} size="lg">Simpan Semua Pengaturan</Button>
        </div>
      </main>
    </div>
  );
}
