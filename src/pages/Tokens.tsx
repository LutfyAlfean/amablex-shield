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
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Plus, Search, MoreHorizontal, Trash2, Key, Copy, RefreshCw, Clock, AlertTriangle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ApiToken {
  id: string;
  tenant_name: string;
  name: string;
  token_preview: string;
  created_at: string;
  expires_at?: string;
  last_used_at?: string;
  is_active: boolean;
  grace_period_until?: string;
}

const mockTokens: ApiToken[] = [
  { id: 'tk1', tenant_name: 'PT Secure Corp', name: 'Production', token_preview: 'npt_***abc123', created_at: '2024-01-15', last_used_at: '2024-12-16 10:30', is_active: true },
  { id: 'tk2', tenant_name: 'PT Secure Corp', name: 'Staging', token_preview: 'npt_***def456', created_at: '2024-02-20', last_used_at: '2024-12-15 14:22', is_active: true },
  { id: 'tk3', tenant_name: 'CV Digital Prima', name: 'Main', token_preview: 'npt_***ghi789', created_at: '2024-03-10', expires_at: '2025-03-10', last_used_at: '2024-12-14', is_active: true },
  { id: 'tk4', tenant_name: 'Startup Inovasi', name: 'Dev', token_preview: 'npt_***jkl012', created_at: '2024-04-01', is_active: false },
];

export default function Tokens() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tokens, setTokens] = useState<ApiToken[]>(mockTokens);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTokenDialog, setNewTokenDialog] = useState(false);
  const [generatedToken, setGeneratedToken] = useState('');
  const [newToken, setNewToken] = useState({ tenant: '', name: '', expires: '' });

  const filteredTokens = tokens.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.tenant_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (!newToken.tenant || !newToken.name) {
      toast.error('Tenant dan nama token wajib diisi');
      return;
    }
    const fullToken = `npt_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    const token: ApiToken = {
      id: `tk${Date.now()}`,
      tenant_name: newToken.tenant,
      name: newToken.name,
      token_preview: `npt_***${fullToken.slice(-6)}`,
      created_at: new Date().toISOString().split('T')[0],
      expires_at: newToken.expires || undefined,
      is_active: true
    };
    setTokens([...tokens, token]);
    setGeneratedToken(fullToken);
    setNewToken({ tenant: '', name: '', expires: '' });
    setDialogOpen(false);
    setNewTokenDialog(true);
  };

  const handleRevoke = (id: string, name: string) => {
    setTokens(tokens.map(t => t.id === id ? { ...t, is_active: false } : t));
    toast.success(`Token "${name}" berhasil direvoke`);
  };

  const handleRotate = (id: string, name: string) => {
    const graceDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    setTokens(tokens.map(t => t.id === id ? { ...t, grace_period_until: graceDate } : t));
    toast.success(`Token "${name}" akan dirotasi. Grace period 24 jam dimulai.`);
  };

  const handleDelete = (id: string, name: string) => {
    setTokens(tokens.filter(t => t.id !== id));
    toast.success(`Token "${name}" berhasil dihapus`);
  };

  const copyToken = () => {
    navigator.clipboard.writeText(generatedToken);
    toast.success('Token disalin ke clipboard');
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
              <Key className="h-6 w-6 text-primary" />
              Token API
            </h1>
            <p className="text-muted-foreground">Kelola token ingest untuk honeypot</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Buat Token</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Buat Token Baru</DialogTitle>
                <DialogDescription>Token akan ditampilkan sekali saja. Pastikan untuk menyimpannya.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Tenant</Label>
                  <Select value={newToken.tenant} onValueChange={(v) => setNewToken({ ...newToken, tenant: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PT Secure Corp">PT Secure Corp</SelectItem>
                      <SelectItem value="CV Digital Prima">CV Digital Prima</SelectItem>
                      <SelectItem value="Startup Inovasi">Startup Inovasi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Nama Token</Label>
                  <Input 
                    placeholder="Production, Staging, etc" 
                    value={newToken.name}
                    onChange={(e) => setNewToken({ ...newToken, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Expiry (opsional)</Label>
                  <Input 
                    type="date"
                    value={newToken.expires}
                    onChange={(e) => setNewToken({ ...newToken, expires: e.target.value })}
                  />
                </div>
                <Button onClick={handleCreate} className="w-full">Buat Token</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* New Token Display Dialog */}
        <Dialog open={newTokenDialog} onOpenChange={setNewTokenDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Token Berhasil Dibuat</DialogTitle>
              <DialogDescription>Salin token ini sekarang. Token tidak akan ditampilkan lagi.</DialogDescription>
            </DialogHeader>
            <Alert className="mt-4 border-warning/50 bg-warning/10">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <AlertDescription className="text-warning">
                Token ini hanya ditampilkan sekali. Simpan di tempat aman!
              </AlertDescription>
            </Alert>
            <div className="mt-4 p-4 bg-secondary rounded-lg font-mono text-sm break-all">
              {generatedToken}
            </div>
            <Button onClick={copyToken} className="w-full mt-4">
              <Copy className="h-4 w-4 mr-2" />Salin Token
            </Button>
          </DialogContent>
        </Dialog>

        <div className="glass-card p-4 mb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari token..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead>Terakhir Digunakan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTokens.map((token) => (
                <TableRow key={token.id}>
                  <TableCell className="font-medium">{token.name}</TableCell>
                  <TableCell className="text-muted-foreground">{token.tenant_name}</TableCell>
                  <TableCell className="font-mono text-sm">{token.token_preview}</TableCell>
                  <TableCell className="text-muted-foreground">{token.created_at}</TableCell>
                  <TableCell className="text-muted-foreground">{token.last_used_at || '-'}</TableCell>
                  <TableCell>
                    {token.grace_period_until ? (
                      <Badge variant="medium" className="gap-1">
                        <Clock className="h-3 w-3" />Grace Period
                      </Badge>
                    ) : token.is_active ? (
                      <Badge variant="low">Aktif</Badge>
                    ) : (
                      <Badge variant="secondary">Revoked</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRotate(token.id, token.name)} disabled={!token.is_active}>
                          <RefreshCw className="h-4 w-4 mr-2" />Rotate (24h Grace)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRevoke(token.id, token.name)} disabled={!token.is_active}>
                          <Key className="h-4 w-4 mr-2" />Revoke
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(token.id, token.name)}>
                          <Trash2 className="h-4 w-4 mr-2" />Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
