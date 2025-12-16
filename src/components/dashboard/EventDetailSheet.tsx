import { HoneypotEvent, EventTag } from '@/types/honeypot';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { RiskBadge } from './RiskBadge';
import { EventTagBadge } from './EventTag';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatTimestamp, sanitizeForDisplay, getCountryFlag } from '@/lib/sanitize';
import { Copy, Tag, Globe, Server, Clock, FileCode, Shield } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface EventDetailSheetProps {
  event: HoneypotEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTag: (eventId: string, tag: EventTag) => void;
  onSaveNote: (eventId: string, note: string) => void;
}

export function EventDetailSheet({ event, open, onOpenChange, onAddTag, onSaveNote }: EventDetailSheetProps) {
  const [note, setNote] = useState(event?.notes || '');

  if (!event) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} disalin ke clipboard`);
  };

  const availableTags: EventTag[] = ['scanner', 'bruteforce', 'false_positive', 'watchlist', 'suspicious'];
  const unusedTags = availableTags.filter(t => !event.tags.includes(t));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto scrollbar-thin bg-card border-border">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            Detail Event
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Risk & Tags */}
          <div className="flex flex-wrap items-center gap-2">
            <RiskBadge level={event.risk_level} score={event.risk_score} showScore />
            {event.tags.map(tag => (
              <EventTagBadge key={tag} tag={tag} />
            ))}
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-4">
            <InfoItem
              icon={Clock}
              label="Waktu"
              value={formatTimestamp(event.timestamp)}
            />
            <InfoItem
              icon={Globe}
              label="IP Sumber"
              value={
                <span className="flex items-center gap-1.5">
                  {event.country && getCountryFlag(event.country)}
                  {event.source_ip}
                </span>
              }
              copyable
              onCopy={() => copyToClipboard(event.source_ip, 'IP')}
            />
            <InfoItem
              icon={Server}
              label="Service"
              value={event.service}
            />
            <InfoItem
              icon={FileCode}
              label="Path"
              value={event.path}
              copyable
              onCopy={() => copyToClipboard(event.path, 'Path')}
            />
          </div>

          {/* Method & User Agent */}
          <div className="space-y-3">
            <div className="glass-card p-3">
              <p className="text-xs text-muted-foreground mb-1">Method</p>
              <p className="font-mono text-sm">{event.method}</p>
            </div>
            <div className="glass-card p-3">
              <p className="text-xs text-muted-foreground mb-1">User Agent</p>
              <p className="font-mono text-xs break-all">{sanitizeForDisplay(event.user_agent)}</p>
            </div>
          </div>

          {/* Headers */}
          {event.headers && (
            <div className="glass-card p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">Headers</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => copyToClipboard(JSON.stringify(event.headers, null, 2), 'Headers')}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Salin
                </Button>
              </div>
              <pre className="font-mono text-xs bg-background/50 p-2 rounded overflow-x-auto scrollbar-thin">
                {sanitizeForDisplay(event.headers)}
              </pre>
            </div>
          )}

          {/* Payload */}
          <div className="glass-card p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">Payload (Disanitasi)</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => copyToClipboard(event.payload_full || event.payload_preview, 'Payload')}
              >
                <Copy className="h-3 w-3 mr-1" />
                Salin
              </Button>
            </div>
            <pre className="font-mono text-xs bg-background/50 p-2 rounded overflow-x-auto scrollbar-thin text-warning">
              {sanitizeForDisplay(event.payload_full || event.payload_preview)}
            </pre>
          </div>

          {/* Quick Tags */}
          {unusedTags.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Tag className="h-3 w-3" />
                Tambah Tag Cepat
              </p>
              <div className="flex flex-wrap gap-2">
                {unusedTags.map(tag => (
                  <Button
                    key={tag}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => onAddTag(event.id, tag)}
                  >
                    + {tag.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Catatan</p>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tambahkan catatan untuk event ini..."
              className="min-h-[80px] bg-background/50"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onSaveNote(event.id, note);
                toast.success('Catatan disimpan');
              }}
            >
              Simpan Catatan
            </Button>
          </div>

          {/* ASN Info */}
          {event.asn && (
            <div className="text-xs text-muted-foreground">
              ASN: {event.asn}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function InfoItem({ 
  icon: Icon, 
  label, 
  value, 
  copyable, 
  onCopy 
}: { 
  icon: typeof Clock; 
  label: string; 
  value: React.ReactNode; 
  copyable?: boolean;
  onCopy?: () => void;
}) {
  return (
    <div className="glass-card p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        <Icon className="h-3 w-3" />
        <p className="text-xs">{label}</p>
      </div>
      <div className="flex items-center justify-between">
        <p className="font-mono text-sm">{value}</p>
        {copyable && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onCopy}>
            <Copy className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
