import { Badge } from '@/components/ui/badge';
import { EventTag as EventTagType } from '@/types/honeypot';
import { cn } from '@/lib/utils';
import { Scan, KeyRound, AlertTriangle, Eye, XCircle } from 'lucide-react';

interface EventTagProps {
  tag: EventTagType;
  className?: string;
}

const tagConfig: Record<EventTagType, { label: string; icon: typeof Scan }> = {
  scanner: { label: 'Scanner', icon: Scan },
  bruteforce: { label: 'Brute Force', icon: KeyRound },
  suspicious: { label: 'Mencurigakan', icon: AlertTriangle },
  watchlist: { label: 'Watchlist', icon: Eye },
  false_positive: { label: 'False Positive', icon: XCircle },
};

export function EventTagBadge({ tag, className }: EventTagProps) {
  const config = tagConfig[tag];
  const Icon = config.icon;

  return (
    <Badge variant={tag} className={cn('gap-1', className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
