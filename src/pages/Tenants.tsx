import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getMockTenants } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Server, Users, Key } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function Tenants() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tenants, setTenants] = useState(getMockTenants());
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTenant, setNewTenant] = useState({ name: '', retention_days: '30' });

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (!newTenant.name) {
      toast.error('Nama tenant wajib diisi');
      return;
    }
    const tenant = {
      id: `t${Date.now()}`,
      name: newTenant.name,
      created_at: new Date().toISOString().split('T')[0],
      retention_days: parseInt(newTenant.retention_days),
      is_active: true,
      token_count: 0
    };
    setTenants([...tenants, tenant]);
    setNewTenant({ name: '', retention_days: '30' });
    setDialogOpen(false);
    toast.success(`Tenant "${tenant.name}" berhasil dibuat`);
  };

  const handleDelete = (id: string, name: string) => {
    setTenants(tenants.filter(t => t.id !== id));
    toast.success(`Tenant "${name}" berhasil dihapus`);
  };

  const handleToggleActive = (id: string) => {
    setTenants(tenants.map(t => 
      t.id === id ? { ...t, is_active: !t.is_active } : t
    ));
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
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Tenant</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead>Retensi</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">{tenant.name}</TableCell>
                  <TableCell className="text-muted-foreground">{tenant.created_at}</TableCell>
                  <TableCell>{tenant.retention_days} hari</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Key className="h-3 w-3 text-muted-foreground" />
                      {tenant.token_count}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tenant.is_active ? 'low' : 'secondary'} className="cursor-pointer" onClick={() => handleToggleActive(tenant.id)}>
                      {tenant.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                        <DropdownMenuItem><Key className="h-4 w-4 mr-2" />Kelola Token</DropdownMenuItem>
                        <DropdownMenuItem><Users className="h-4 w-4 mr-2" />Kelola User</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(tenant.id, tenant.name)}>
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
