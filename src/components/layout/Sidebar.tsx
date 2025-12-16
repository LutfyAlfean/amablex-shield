import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Activity, 
  Users, 
  Key, 
  Settings, 
  FileText, 
  Bell,
  Server,
  Shield
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  userRole: 'admin' | 'viewer';
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'viewer'] },
  { to: '/analytics', icon: Activity, label: 'Analitik', roles: ['admin', 'viewer'] },
  { to: '/tenants', icon: Server, label: 'Tenant', roles: ['admin'] },
  { to: '/users', icon: Users, label: 'Pengguna', roles: ['admin'] },
  { to: '/tokens', icon: Key, label: 'Token API', roles: ['admin'] },
  { to: '/alerts', icon: Bell, label: 'Alert', roles: ['admin'] },
  { to: '/audit', icon: FileText, label: 'Audit Log', roles: ['admin'] },
  { to: '/settings', icon: Settings, label: 'Pengaturan', roles: ['admin'] },
];

export function Sidebar({ isOpen, userRole }: SidebarProps) {
  const location = useLocation();

  const filteredItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 h-[calc(100vh-4rem)] bg-sidebar border-r border-sidebar-border transition-all duration-300 z-40',
        isOpen ? 'w-64' : 'w-0 lg:w-16',
        !isOpen && 'overflow-hidden'
      )}
    >
      <nav className="p-3 space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                'hover:bg-sidebar-accent group',
                isActive && 'bg-sidebar-accent text-sidebar-primary'
              )}
            >
              <Icon className={cn(
                'h-5 w-5 flex-shrink-0 transition-colors',
                isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/70 group-hover:text-sidebar-foreground'
              )} />
              <span className={cn(
                'text-sm font-medium whitespace-nowrap transition-opacity',
                isOpen ? 'opacity-100' : 'lg:opacity-0',
                isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/70 group-hover:text-sidebar-foreground'
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary animate-pulse" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn(
        'absolute bottom-4 left-0 right-0 px-3',
        !isOpen && 'lg:px-2'
      )}>
        <div className={cn(
          'glass-card p-3 text-center',
          !isOpen && 'lg:p-2'
        )}>
          <Shield className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className={cn(
            'text-[10px] text-muted-foreground',
            !isOpen && 'lg:hidden'
          )}>
            v1.0.0 • Secure
          </p>
        </div>
      </div>
    </aside>
  );
}
