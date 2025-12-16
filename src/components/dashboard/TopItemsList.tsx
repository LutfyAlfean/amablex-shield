import { TopItem } from '@/types/honeypot';
import { cn } from '@/lib/utils';

interface TopItemsListProps {
  title: string;
  items: TopItem[];
  icon: React.ReactNode;
}

export function TopItemsList({ title, items, icon }: TopItemsListProps) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="font-medium">{title}</h3>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-mono truncate max-w-[180px]" title={item.label}>
                <span className="text-muted-foreground mr-2">#{index + 1}</span>
                {item.label}
              </span>
              <span className="text-muted-foreground">{item.count.toLocaleString('id-ID')}</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  index === 0 ? 'bg-primary' : 'bg-primary/60'
                )}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
