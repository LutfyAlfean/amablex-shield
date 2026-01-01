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
import { Search, MoreHorizontal, Pencil, Users, Shield, ShieldCheck } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/hooks/useUsers';
import { useTenants } from '@/hooks/useTenants';

export default function UsersPage() {
  const { user, profile, role, signOut } = useAuth();
  const { users, isLoading, updateUserRole, addUserToTenant, refetch } = useUsers();
  const { tenants } = useTenants();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'viewer'>('viewer');
  const [selectedTenant, setSelectedTenant] = useState<string>('');

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEditRole = (userId: string, currentRole: 'admin' | 'viewer') => {
    setSelectedUser(userId);
    setSelectedRole(currentRole);
    setEditDialogOpen(true);
  };

  const handleSaveRole = async () => {
    if (selectedUser) {
      await updateUserRole(selectedUser, selectedRole);
      setEditDialogOpen(false);
    }
  };

  const handleAddToTenant = async () => {
    if (selectedUser && selectedTenant) {
      await addUserToTenant(selectedUser, selectedTenant);
      setSelectedTenant('');
    }
  };

  const userInfo = { email: profile?.email || user?.email || '', role: role || 'viewer' };

  return (
    <div className="min-h-screen bg-background">
      <Header user={userInfo} onLogout={signOut} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} userRole={role || 'viewer'} />

      <main className={cn('transition-all duration-300 p-6', sidebarOpen ? 'lg:ml-64' : 'lg:ml-16')}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Manajemen Pengguna
            </h1>
            <p className="text-muted-foreground">Kelola admin dan viewer dengan RBAC</p>
          </div>
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
                <TableHead>Nama</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>2FA</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Tidak ada user ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.email}</TableCell>
                    <TableCell className="text-muted-foreground">{u.full_name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                        {u.role === 'admin' ? <Shield className="h-3 w-3 mr-1" /> : null}
                        {u.role === 'admin' ? 'Admin' : 'Viewer'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.tenant_names.join(', ')}</TableCell>
                    <TableCell>
                      {u.is_2fa_enabled ? (
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {role === 'admin' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditRole(u.id, u.role)}>
                              <Pencil className="h-4 w-4 mr-2" />Edit Role
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

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>Ubah role dan tenant akses user</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Role</Label>
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as 'admin' | 'viewer')}>
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
              <Label>Tambah ke Tenant</Label>
              <div className="flex gap-2">
                <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Pilih tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleAddToTenant} disabled={!selectedTenant}>
                  Tambah
                </Button>
              </div>
            </div>
            <Button onClick={handleSaveRole} className="w-full">Simpan Role</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
