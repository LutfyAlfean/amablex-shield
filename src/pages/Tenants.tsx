import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useTenants } from '@/hooks/useTenants';
import { cn } from '@/lib/utils';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Server, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function Tenants() {
  const navigate = useNavigate();
  const { user, profile, role, signOut } = useAuth();
  const { tenants, isLoading, createTenant, updateTenant, deleteTenant } = useTenants();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTenant, setNewTenant] = useState({ name: '', retention_days: '30' });

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!newTenant.name) return;
    await createTenant(newTenant.name, parseInt(newTenant.retention_days));
    setNewTenant({ name: '', retention_days: '30' });
    setDialogOpen(false);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    await updateTenant(id, { is_active: !currentStatus });
  };

  const handleDelete = async (id: string, name: string) => {
    await deleteTenant(id, name);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const userInfo = { email: user?.email || profile?.email || 'User', role: role || 'viewer' };

  return (
    <div className="min-h-screen bg-background">
      <Header user={userInfo} onLogout={handleLogout} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} userRole={role || 'viewer'} />

      <main className={cn('transition-all duration-300 p-6', sidebarOpen ? 'lg:ml-64' : 'lg:ml-16')}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Server className="h-6 w-6 text-primary" />
              Manajemen Tenant
            </h1>
            <p className="text-muted-foreground">Kelola workspace/customer yang terdaftar</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Tambah Tenant</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Buat Tenant Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Nama Tenant</Label>
                  <Input 
                    placeholder="PT Example Corp" 
                    value={newTenant.name}
                    onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Retensi Data</Label>
                  <Select value={newTenant.retention_days} onValueChange={(v) => setNewTenant({ ...newTenant, retention_days: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 hari</SelectItem>
                      <SelectItem value="30">30 hari</SelectItem>
                      <SelectItem value="90">90 hari</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreate} className="w-full">Buat Tenant</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="glass-card p-4 mb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari tenant..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Tenant</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead>Retensi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      {tenants.length === 0 
                        ? 'Belum ada tenant. Buat tenant pertama untuk mulai.' 
                        : 'Tidak ada tenant yang cocok dengan pencarian'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">{tenant.name}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(tenant.created_at).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell>{tenant.retention_days} hari</TableCell>
                      <TableCell>
                        <Badge 
                          variant={tenant.is_active ? 'default' : 'secondary'} 
                          className={cn(
                            "cursor-pointer",
                            tenant.is_active && "bg-green-500/20 text-green-600 border-green-500/30 hover:bg-green-500/30"
                          )}
                          onClick={() => role === 'admin' && handleToggleActive(tenant.id, tenant.is_active)}
                        >
                          {tenant.is_active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {role === 'admin' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(tenant.id, tenant.name)}>
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
          )}
        </div>
      </main>
    </div>
  );
}
