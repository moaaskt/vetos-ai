import { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '../../lib/utils';

export type FilterType = 'ALL' | 'VACCINE' | 'APPOINTMENT' | 'PRESCRIPTION' | 'EXAM';

interface FilterChipsProps {
  activeFilter: FilterType;
  onChange: (filter: FilterType) => void;
  counts: Record<FilterType, number>;
}

// ─── Immutable constant — outside component to avoid re-creation ─────────────
const filters: { type: FilterType; label: string; icon: string }[] = [
  { type: 'ALL', label: 'Tudo', icon: '📋' },
  { type: 'VACCINE', label: 'Vacinas', icon: '💉' },
  { type: 'APPOINTMENT', label: 'Consultas', icon: '🩺' },
  { type: 'PRESCRIPTION', label: 'Receitas', icon: '💊' },
  { type: 'EXAM', label: 'Exames', icon: '🧪' },
];

export function FilterChips({ activeFilter, onChange, counts }: FilterChipsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      ro.disconnect();
    };
  }, [checkScroll]);

  return (
    <div className="relative" role="tablist" aria-label="Filtrar eventos por categoria">
      {/* Left scroll fade indicator */}
      {canScrollLeft && (
        <div
          className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/90 to-transparent z-10 pointer-events-none rounded-l-xl transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      <div
        ref={scrollRef}
        className="flex gap-2 pb-2 overflow-x-auto scrollbar-none -mx-1 px-1"
      >
        {filters.map((f) => {
          const isSelected = activeFilter === f.type;
          return (
            <button
              key={f.type}
              role="tab"
              aria-selected={isSelected}
              aria-label={`${f.label}: ${counts[f.type]} eventos`}
              onClick={() => onChange(f.type)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium shrink-0',
                'transition-all duration-300 ease-out',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/15'
                  : 'bg-white border border-border text-foreground hover:bg-accent hover:border-border/80 hover:shadow-sm',
              )}
            >
              <span aria-hidden="true">{f.icon}</span>
              <span>{f.label}</span>
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full ml-0.5 font-semibold tabular-nums',
                  isSelected
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {counts[f.type]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right scroll fade indicator */}
      {canScrollRight && (
        <div
          className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/90 to-transparent z-10 pointer-events-none rounded-r-xl transition-opacity duration-300"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
