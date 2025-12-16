import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  variant?: 'default' | 'primary' | 'warning' | 'danger';
}

export function StatsCard({ title, value, change, icon: Icon, variant = 'default' }: StatsCardProps) {
  const variantStyles = {
    default: 'border-border/50',
    primary: 'border-primary/30 bg-primary/5',
    warning: 'border-warning/30 bg-warning/5',
    danger: 'border-destructive/30 bg-destructive/5',
  };

  const iconStyles = {
    default: 'text-muted-foreground',
    primary: 'text-primary',
    warning: 'text-warning',
    danger: 'text-destructive',
  };

  return (
    <div className={cn(
      'glass-card p-4 transition-all duration-200 hover:border-primary/50',
      variantStyles[variant]
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tracking-tight">
            {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
          </p>
          {change !== undefined && (
            <p className={cn(
              'text-xs',
              change > 0 ? 'text-destructive' : 'text-success'
            )}>
              {change > 0 ? '+' : ''}{change}% dari kemarin
            </p>
          )}
        </div>
        <div className={cn(
          'p-2 rounded-lg bg-secondary/50',
          iconStyles[variant]
        )}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
