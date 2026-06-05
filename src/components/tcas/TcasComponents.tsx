// Reusable TCAS UI components

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { MaterialSymbol } from '@/components/tabby/TabbyPrimitives';
import { cn } from '@/lib/utils';
import { TCAS_ROUND_COLORS } from '@/types/tcas';

// ============================================================================
// Loading Skeleton
// ============================================================================

export function TcasListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse border-b border-border/20 px-4 py-4 last:border-b-0"
        >
          <div className="flex items-start gap-3">
            <div className="mt-1 size-12 shrink-0 rounded-full bg-muted" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-5 w-3/4 rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Empty States
// ============================================================================

interface TcasEmptyStateProps {
  title: string;
  body: string;
  icon?: string;
}

export function TcasEmptyState({ title, body, icon = 'inbox' }: TcasEmptyStateProps) {
  return (
    <div className="rounded-[1.375rem] bg-surface-variant px-6 py-8 text-center ring-1 ring-border/20">
      <MaterialSymbol name={icon} className="mx-auto text-[3rem] text-muted-foreground/40" />
      <h3 className="mt-3 text-title-medium font-black text-foreground">{title}</h3>
      <p className="mt-2 text-body-medium text-muted-foreground">{body}</p>
    </div>
  );
}

export function TcasErrorCard({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-[1.375rem] bg-red-50 px-6 py-8 text-center ring-1 ring-red-100">
      <MaterialSymbol name="error" className="mx-auto text-[3rem] text-red-500" />
      <h3 className="mt-3 text-title-medium font-black text-red-900">{message}</h3>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600"
        >
          Retry
        </button>
      )}
    </div>
  );
}

// ============================================================================
// University Logo
// ============================================================================

interface UniversityLogoProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const logoSizes = {
  sm: 'size-10',
  md: 'size-12',
  lg: 'size-16',
};

export function UniversityLogo({ src, alt, size = 'md', className }: UniversityLogoProps) {
  return (
    <div
      className={cn(
        'shrink-0 overflow-hidden rounded-full bg-surface-variant ring-1 ring-border/20',
        logoSizes[size],
        className
      )}
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        loading="lazy"
        onError={(e) => {
          // Fallback to icon on error
          const target = e.currentTarget;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `<span class="material-symbol grid h-full w-full place-items-center text-muted-foreground">school</span>`;
          }
        }}
      />
    </div>
  );
}

// ============================================================================
// Round Badge
// ============================================================================

interface TcasRoundBadgeProps {
  roundNumber: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function TcasRoundBadge({ roundNumber, size = 'md', className }: TcasRoundBadgeProps) {
  const color = TCAS_ROUND_COLORS[roundNumber] || '#6B7280';

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-black text-white',
        size === 'sm' ? 'size-7 text-xs' : 'size-9 text-sm',
        className
      )}
      style={{ backgroundColor: color }}
    >
      {roundNumber}
    </div>
  );
}

// ============================================================================
// Info Row (Key-Value Display)
// ============================================================================

interface TcasInfoRowProps {
  label: string;
  value: string | ReactNode;
  icon?: string;
}

export function TcasInfoRow({ label, value, icon }: TcasInfoRowProps) {
  return (
    <div className="flex items-start gap-3 border-b border-border/20 px-4 py-3 last:border-b-0">
      {icon && (
        <MaterialSymbol name={icon} className="mt-0.5 text-[1.15rem] text-primary" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-body-small font-bold text-muted-foreground">{label}</p>
        <p className="mt-1 text-body-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

// ============================================================================
// Search Bar
// ============================================================================

interface TcasSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function TcasSearchBar({
  value,
  onChange,
  placeholder = 'Search programs...',
  className,
}: TcasSearchBarProps) {
  return (
    <div className={cn('relative', className)}>
      <MaterialSymbol
        name="search"
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[1.25rem] text-muted-foreground"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-full bg-surface-variant pl-12 pr-4 text-body-large text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <MaterialSymbol name="close" className="text-[1.25rem]" />
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Filter Chips
// ============================================================================

interface FilterChip {
  label: string;
  onRemove: () => void;
}

export function TcasFilterChips({ chips }: { chips: FilterChip[] }) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip, index) => (
        <motion.button
          key={index}
          onClick={chip.onRemove}
          className="flex items-center gap-1.5 rounded-full bg-tabby-mint px-3 py-1.5 text-sm font-bold text-primary hover:bg-tabby-mint/80"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>{chip.label}</span>
          <MaterialSymbol name="close" className="text-[0.95rem]" />
        </motion.button>
      ))}
    </div>
  );
}
