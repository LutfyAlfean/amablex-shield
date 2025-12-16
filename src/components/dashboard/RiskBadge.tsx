import { Badge } from '@/components/ui/badge';
import { RiskLevel } from '@/types/honeypot';
import { cn } from '@/lib/utils';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  showScore?: boolean;
  className?: string;
}

const riskLabels: Record<RiskLevel, string> = {
  critical: 'Kritis',
  high: 'Tinggi',
  medium: 'Sedang',
  low: 'Rendah',
  info: 'Info',
};

export function RiskBadge({ level, score, showScore = false, className }: RiskBadgeProps) {
  return (
    <Badge variant={level} className={cn('gap-1', className)}>
      {showScore && score !== undefined && (
        <span className="font-mono">{score}</span>
      )}
      {riskLabels[level]}
    </Badge>
  );
}
