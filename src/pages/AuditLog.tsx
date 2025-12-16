import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getMockAuditLogs } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { Search, FileText, LogIn, LogOut, Key, Download, Settings, UserPlus, AlertTriangle } from 'lucide-react';
import { formatTimestamp } from '@/lib/sanitize';

const actionIcons: Record<string, typeof LogIn> = {
  LOGIN_SUCCESS: LogIn,
  LOGIN_FAILED: AlertTriangle,
  LOGOUT: LogOut,
  TOKEN_CREATED: Key,
  TOKEN_REVOKED: Key,
  TOKEN_ROTATED: Key,
  EXPORT_DATA: Download,
  SETTING_CHANGED: Settings,
  USER_CREATED: UserPlus,
};

const actionLabels: Record<string, string> = {
  LOGIN_SUCCESS: 'Login Berhasil',
  LOGIN_FAILED: 'Login Gagal',
  LOGOUT: 'Logout',
  TOKEN_CREATED: 'Token Dibuat',
  TOKEN_REVOKED: 'Token Direvoke',
  TOKEN_ROTATED: 'Token Dirotasi',
  EXPORT_DATA: 'Export Data',
  SETTING_CHANGED: 'Setting Diubah',
  USER_CREATED: 'User Dibuat',
};

const actionVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'low' | 'medium'> = {
  LOGIN_SUCCESS: 'low',
  LOGIN_FAILED: 'destructive',
  LOGOUT: 'secondary',
  TOKEN_CREATED: 'default',
  TOKEN_REVOKED: 'medium',
  TOKEN_ROTATED: 'default',
  EXPORT_DATA: 'secondary',
  SETTING_CHANGED: 'secondary',
  USER_CREATED: 'default',
};

// Extended mock data
const extendedAuditLogs = [
  ...getMockAuditLogs(),
  { id: 'al4', timestamp: new Date(Date.now() - 10800000).toISOString(), user_id: 'u1', user_email: 'admin@example.com', action: 'LOGIN_FAILED', details: 'Login gagal - password salah', ip_address: '203.45.67.89' },
  { id: 'al5', timestamp: new Date(Date.now() - 14400000).toISOString(), user_id: 'u1', user_email: 'admin@example.com', action: 'TOKEN_REVOKED', details: 'Token "Old Production" direvoke', ip_address: '192.168.1.1' },
  { id: 'al6', timestamp: new Date(Date.now() - 18000000).toISOString(), user_id: 'u2', user_email: 'viewer@example.com', action: 'LOGIN_SUCCESS', details: 'Login berhasil dari IP 10.0.0.5', ip_address: '10.0.0.5' },
  { id: 'al7', timestamp: new Date(Date.now() - 21600000).toISOString(), user_id: 'u1', user_email: 'admin@example.com', action: 'SETTING_CHANGED', details: 'Retensi data diubah dari 30 ke 90 hari', ip_address: '192.168.1.1' },
  { id: 'al8', timestamp: new Date(Date.now() - 25200000).toISOString(), user_id: 'u1', user_email: 'admin@example.com', action: 'USER_CREATED', details: 'User analyst@digital.id dibuat dengan role viewer', ip_address: '192.168.1.1' },
];

export default function AuditLog() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [logs] = useState(extendedAuditLogs);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user_email.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.ip_address.includes(search);
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const user = { email: 'admin@neypot.id', role: 'admin' };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={() => {}} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} userRole="admin" />

      <main className={cn('transition-all duration-300 p-6', sidebarOpen ? 'lg:ml-64' : 'lg:ml-16')}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Audit Log
          </h1>
          <p className="text-muted-foreground">Catatan semua aktivitas penting dalam sistem</p>
        </div>

        <div className="glass-card p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari user, detail, IP..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter aksi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Aksi</SelectItem>
                <SelectItem value="LOGIN_SUCCESS">Login Berhasil</SelectItem>
                <SelectItem value="LOGIN_FAILED">Login Gagal</SelectItem>
                <SelectItem value="TOKEN_CREATED">Token Dibuat</SelectItem>
                <SelectItem value="TOKEN_REVOKED">Token Direvoke</SelectItem>
                <SelectItem value="EXPORT_DATA">Export Data</SelectItem>
                <SelectItem value="SETTING_CHANGED">Setting Diubah</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Aksi</TableHead>
                <TableHead>Detail</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => {
                const Icon = actionIcons[log.action] || FileText;
                const variant = actionVariants[log.action] || 'secondary';
                return (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm text-muted-foreground whitespace-nowrap">
                      {formatTimestamp(log.timestamp)}
                    </TableCell>
                    <TableCell className="font-medium">{log.user_email}</TableCell>
                    <TableCell>
                      <Badge variant={variant} className="gap-1">
                        <Icon className="h-3 w-3" />
                        {actionLabels[log.action] || log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-muted-foreground">{log.details}</TableCell>
                    <TableCell className="font-mono text-sm">{log.ip_address}</TableCell>
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
