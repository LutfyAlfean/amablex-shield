import { useState } from 'react';
import { EventFilters, RiskLevel, SavedView } from '@/types/honeypot';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Search, Filter, Calendar as CalendarIcon, Pause, Play, Bookmark, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  savedViews: SavedView[];
  onLoadView: (view: SavedView) => void;
  onSaveView: (name: string) => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onRefresh: () => void;
}

export function FilterBar({
  filters,
  onFiltersChange,
  savedViews,
  onLoadView,
  onSaveView,
  isPaused,
  onTogglePause,
  onRefresh,
}: FilterBarProps) {
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [viewName, setViewName] = useState('');

  const riskLevels: { value: RiskLevel; label: string }[] = [
    { value: 'critical', label: 'Kritis' },
    { value: 'high', label: 'Tinggi' },
    { value: 'medium', label: 'Sedang' },
    { value: 'low', label: 'Rendah' },
    { value: 'info', label: 'Info' },
  ];

  const handleSearch = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleRiskFilter = (value: string) => {
    if (value === 'all') {
      onFiltersChange({ ...filters, risk_level: undefined });
    } else {
      onFiltersChange({ ...filters, risk_level: [value as RiskLevel] });
    }
  };

  const handleDateChange = (from?: Date, to?: Date) => {
    setDateFrom(from);
    setDateTo(to);
    onFiltersChange({
      ...filters,
      date_from: from?.toISOString(),
      date_to: to?.toISOString(),
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const hasActiveFilters = filters.search || filters.risk_level || filters.date_from;

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari IP, path, payload..."
            value={filters.search || ''}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 bg-background/50"
          />
        </div>

        {/* Risk Level Filter */}
        <Select
          value={filters.risk_level?.[0] || 'all'}
          onValueChange={handleRiskFilter}
        >
          <SelectTrigger className="w-[140px] bg-background/50">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Level Risiko" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Level</SelectItem>
            {riskLevels.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="bg-background/50">
              <CalendarIcon className="h-4 w-4 mr-2" />
              {dateFrom ? (
                dateTo ? (
                  `${format(dateFrom, 'dd/MM', { locale: id })} - ${format(dateTo, 'dd/MM', { locale: id })}`
                ) : (
                  format(dateFrom, 'dd/MM/yyyy', { locale: id })
                )
              ) : (
                'Rentang Tanggal'
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{ from: dateFrom, to: dateTo }}
              onSelect={(range) => handleDateChange(range?.from, range?.to)}
              locale={id}
            />
          </PopoverContent>
        </Popover>

        {/* Saved Views */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="bg-background/50">
              <Bookmark className="h-4 w-4 mr-2" />
              Saved Views
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-2" align="end">
            <div className="space-y-1">
              {savedViews.map((view) => (
                <Button
                  key={view.id}
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={() => onLoadView(view)}
                >
                  {view.name}
                </Button>
              ))}
              {savedViews.length === 0 && (
                <p className="text-xs text-muted-foreground p-2">Belum ada view tersimpan</p>
              )}
              <hr className="my-2 border-border" />
              {showSaveInput ? (
                <div className="flex gap-1">
                  <Input
                    value={viewName}
                    onChange={(e) => setViewName(e.target.value)}
                    placeholder="Nama view"
                    className="h-8 text-sm"
                  />
                  <Button
                    size="sm"
                    className="h-8"
                    onClick={() => {
                      if (viewName) {
                        onSaveView(viewName);
                        setViewName('');
                        setShowSaveInput(false);
                      }
                    }}
                  >
                    Simpan
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm text-primary"
                  onClick={() => setShowSaveInput(true)}
                >
                  + Simpan View Saat Ini
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Hapus Filter
          </Button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {/* Refresh */}
          <Button variant="outline" size="icon" onClick={onRefresh} className="bg-background/50">
            <RefreshCw className="h-4 w-4" />
          </Button>

          {/* Pause/Resume */}
          <Button
            variant={isPaused ? 'default' : 'outline'}
            onClick={onTogglePause}
            className={cn(!isPaused && 'bg-background/50')}
          >
            {isPaused ? (
              <>
                <Play className="h-4 w-4 mr-2" />
                Resume
              </>
            ) : (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
