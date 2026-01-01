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
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Plus, Search, MoreHorizontal, Trash2, Key, Copy, RefreshCw, Clock, AlertTriangle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ApiTestGuide } from '@/components/onboarding/ApiTestGuide';
import { useAuth } from '@/hooks/useAuth';
import { useApiTokens } from '@/hooks/useApiTokens';
import { useTenants } from '@/hooks/useTenants';

export default function Tokens() {
  const { user, profile, role, signOut } = useAuth();
  const { tokens, isLoading, createToken, revokeToken, rotateToken, deleteToken } = useApiTokens();
  const { tenants } = useTenants();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTokenDialog, setNewTokenDialog] = useState(false);
  const [generatedToken, setGeneratedToken] = useState('');
  const [selectedTenantName, setSelectedTenantName] = useState('');
  const [newToken, setNewToken] = useState({ tenant_id: '', name: '', expires: '' });
  const [isCreating, setIsCreating] = useState(false);

  const filteredTokens = tokens.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.tenant_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!newToken.tenant_id || !newToken.name) {
      toast.error('Tenant dan nama token wajib diisi');
      return;
    }
    
    setIsCreating(true);
    const { error, token } = await createToken(
      newToken.tenant_id, 
      newToken.name, 
      newToken.expires || undefined
    );
    setIsCreating(false);

    if (!error && token) {
      const tenant = tenants.find(t => t.id === newToken.tenant_id);
      setSelectedTenantName(tenant?.name || '');
      setGeneratedToken(token);
      setNewToken({ tenant_id: '', name: '', expires: '' });
      setDialogOpen(false);
      setNewTokenDialog(true);
    }
  };

  const handleRevoke = async (id: string, name: string) => {
    await revokeToken(id, name);
  };

  const handleRotate = async (id: string, name: string) => {
    const { token } = await rotateToken(id, name);
    if (token) {
      setGeneratedToken(token);
      setNewTokenDialog(true);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    await deleteToken(id, name);
  };

  const copyToken = () => {
    navigator.clipboard.writeText(generatedToken);
    toast.success('Token disalin ke clipboard');
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
              <Key className="h-6 w-6 text-primary" />
              Token API
            </h1>
            <p className="text-muted-foreground">Kelola token ingest untuk honeypot</p>
          </div>
          {isAdmin && (
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
                    <Select value={newToken.tenant_id} onValueChange={(v) => setNewToken({ ...newToken, tenant_id: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tenant" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenants.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {tenants.length === 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Belum ada tenant. Buat tenant terlebih dahulu.
                      </p>
                    )}
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
                  <Button onClick={handleCreate} className="w-full" disabled={isCreating || tenants.length === 0}>
                    {isCreating ? 'Membuat...' : 'Buat Token'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* New Token Display Dialog */}
        <Dialog open={newTokenDialog} onOpenChange={setNewTokenDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Token Berhasil Dibuat</DialogTitle>
              <DialogDescription>Salin token ini sekarang. Token tidak akan ditampilkan lagi.</DialogDescription>
            </DialogHeader>
            <Alert className="mt-4 border-yellow-500/50 bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-600 dark:text-yellow-400">
                Token ini hanya ditampilkan sekali. Simpan di tempat aman!
              </AlertDescription>
            </Alert>
            <div className="mt-4 p-4 bg-secondary rounded-lg font-mono text-sm break-all">
              {generatedToken}
            </div>
            <Button onClick={copyToken} className="w-full mt-4">
              <Copy className="h-4 w-4 mr-2" />Salin Token
            </Button>
            
            {/* Show API Test Guide */}
            <div className="mt-6">
              <ApiTestGuide token={generatedToken} tenantName={selectedTenantName} />
            </div>
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
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : filteredTokens.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    {tokens.length === 0 
                      ? 'Belum ada token. Buat token pertama untuk mulai.' 
                      : 'Tidak ada token yang cocok dengan pencarian'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTokens.map((token) => (
                  <TableRow key={token.id}>
                    <TableCell className="font-medium">{token.name}</TableCell>
                    <TableCell className="text-muted-foreground">{token.tenant_name || '-'}</TableCell>
                    <TableCell className="font-mono text-sm">{token.token_preview}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(token.created_at).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {token.last_used_at ? new Date(token.last_used_at).toLocaleString('id-ID') : '-'}
                    </TableCell>
                    <TableCell>
                      {token.grace_period_until ? (
                        <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600">
                          <Clock className="h-3 w-3" />Grace Period
                        </Badge>
                      ) : token.is_active ? (
                        <Badge variant="default" className="bg-green-500/20 text-green-600 border-green-500/30">Aktif</Badge>
                      ) : (
                        <Badge variant="secondary">Revoked</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {isAdmin && (
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
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
