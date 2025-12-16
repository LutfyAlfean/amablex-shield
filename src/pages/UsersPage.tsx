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
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Users, Shield, ShieldCheck } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface UserData {
  id: string;
  email: string;
  role: 'admin' | 'viewer';
  tenant_names: string[];
  created_at: string;
  last_login?: string;
  is_2fa_enabled: boolean;
}

const mockUsers: UserData[] = [
  { id: 'u1', email: 'admin@neypot.id', role: 'admin', tenant_names: ['Semua'], created_at: '2024-01-01', last_login: '2024-12-16', is_2fa_enabled: true },
  { id: 'u2', email: 'viewer@securecorp.id', role: 'viewer', tenant_names: ['PT Secure Corp'], created_at: '2024-02-15', last_login: '2024-12-15', is_2fa_enabled: false },
  { id: 'u3', email: 'analyst@digital.id', role: 'viewer', tenant_names: ['CV Digital Prima'], created_at: '2024-03-20', last_login: '2024-12-10', is_2fa_enabled: true },
];

export default function UsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState<UserData[]>(mockUsers);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<{ email: string; role: 'admin' | 'viewer'; tenant: string }>({ email: '', role: 'viewer', tenant: '' });

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (!newUser.email) {
      toast.error('Email wajib diisi');
      return;
    }
    const user: UserData = {
      id: `u${Date.now()}`,
      email: newUser.email,
      role: newUser.role,
      tenant_names: newUser.tenant ? [newUser.tenant] : ['Semua'],
      created_at: new Date().toISOString().split('T')[0],
      is_2fa_enabled: false
    };
    setUsers([...users, user]);
    setNewUser({ email: '', role: 'viewer', tenant: '' });
    setDialogOpen(false);
    toast.success(`User "${user.email}" berhasil dibuat`);
  };

  const handleDelete = (id: string, email: string) => {
    setUsers(users.filter(u => u.id !== id));
    toast.success(`User "${email}" berhasil dihapus`);
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
              <Users className="h-6 w-6 text-primary" />
              Manajemen Pengguna
            </h1>
            <p className="text-muted-foreground">Kelola admin dan viewer dengan RBAC</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Tambah User</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Buat User Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    placeholder="user@example.com" 
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v as 'admin' | 'viewer' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin (Full Access)</SelectItem>
                      <SelectItem value="viewer">Viewer (Read Only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tenant (kosongkan untuk semua)</Label>
                  <Select value={newUser.tenant} onValueChange={(v) => setNewUser({ ...newUser, tenant: v })}>
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
                <Button onClick={handleCreate} className="w-full">Buat User</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="glass-card p-4 mb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari user..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>2FA</TableHead>
                <TableHead>Login Terakhir</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                      {u.role === 'admin' ? <Shield className="h-3 w-3 mr-1" /> : null}
                      {u.role === 'admin' ? 'Admin' : 'Viewer'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.tenant_names.join(', ')}</TableCell>
                  <TableCell>
                    {u.is_2fa_enabled ? (
                      <ShieldCheck className="h-4 w-4 text-success" />
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.last_login || '-'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                        <DropdownMenuItem><Shield className="h-4 w-4 mr-2" />Reset Password</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(u.id, u.email)}>
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
