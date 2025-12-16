import { useState } from 'react';
import { HoneypotEvent } from '@/types/honeypot';
import { RiskBadge } from './RiskBadge';
import { EventTagBadge } from './EventTag';
import { formatRelativeTime, sanitizeForDisplay, getCountryFlag } from '@/lib/sanitize';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventsTableProps {
  events: HoneypotEvent[];
  onViewDetails: (event: HoneypotEvent) => void;
  isLoading?: boolean;
}

export function EventsTable({ events, onViewDetails, isLoading }: EventsTableProps) {
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const totalPages = Math.ceil(events.length / pageSize);
  
  const paginatedEvents = events.slice((page - 1) * pageSize, page * pageSize);

  if (isLoading) {
    return (
      <div className="glass-card p-8 flex items-center justify-center">
        <div className="animate-pulse-glow h-4 w-4 rounded-full bg-primary" />
        <span className="ml-3 text-muted-foreground">Memuat data...</span>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Waktu</TableHead>
              <TableHead className="text-muted-foreground font-medium">Tenant</TableHead>
              <TableHead className="text-muted-foreground font-medium">IP Sumber</TableHead>
              <TableHead className="text-muted-foreground font-medium">Path</TableHead>
              <TableHead className="text-muted-foreground font-medium">Method</TableHead>
              <TableHead className="text-muted-foreground font-medium">Payload</TableHead>
              <TableHead className="text-muted-foreground font-medium">Risiko</TableHead>
              <TableHead className="text-muted-foreground font-medium">Tag</TableHead>
              <TableHead className="text-muted-foreground font-medium w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEvents.map((event, index) => (
              <TableRow 
                key={event.id}
                className={cn(
                  'border-border/30 hover:bg-secondary/30 transition-colors cursor-pointer animate-fade-in',
                  event.risk_level === 'critical' && 'bg-destructive/5'
                )}
                style={{ animationDelay: `${index * 30}ms` }}
                onClick={() => onViewDetails(event)}
              >
                <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                  {formatRelativeTime(event.timestamp)}
                </TableCell>
                <TableCell className="text-sm max-w-[120px] truncate">
                  {event.tenant_name}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  <div className="flex items-center gap-1.5">
                    {event.country && (
                      <span title={event.country}>{getCountryFlag(event.country)}</span>
                    )}
                    {event.source_ip}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm text-primary max-w-[150px] truncate">
                  {event.path}
                </TableCell>
                <TableCell>
                  <span className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium',
                    event.method === 'POST' && 'bg-warning/20 text-warning',
                    event.method === 'GET' && 'bg-primary/20 text-primary',
                    event.method === 'DELETE' && 'bg-destructive/20 text-destructive',
                    !['POST', 'GET', 'DELETE'].includes(event.method) && 'bg-muted text-muted-foreground'
                  )}>
                    {event.method}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground max-w-[200px] truncate">
                  {sanitizeForDisplay(event.payload_preview)}
                </TableCell>
                <TableCell>
                  <RiskBadge level={event.risk_level} score={event.risk_score} showScore />
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {event.tags.slice(0, 2).map(tag => (
                      <EventTagBadge key={tag} tag={tag} />
                    ))}
                    {event.tags.length > 2 && (
                      <span className="text-xs text-muted-foreground">+{event.tags.length - 2}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(event);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            Menampilkan {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, events.length)} dari {events.length} event
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
