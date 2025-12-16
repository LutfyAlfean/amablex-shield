import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Shield, User, Settings, LogOut, Bell, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  user?: { email: string; role: string };
  onLogout: () => void;
  onToggleSidebar?: () => void;
}

export function Header({ user, onLogout, onToggleSidebar }: HeaderProps) {
  const [hasNotifications] = useState(true);

  return (
    <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-lg leading-none">
                <span className="text-gradient">NeyPotAmablex</span>
              </h1>
              <p className="text-[10px] text-muted-foreground">Honeypot Monitoring</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {hasNotifications && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full animate-pulse" />
            )}
          </Button>

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium leading-none">{user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Pengaturan
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
