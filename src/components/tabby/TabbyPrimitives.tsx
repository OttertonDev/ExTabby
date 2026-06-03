import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TabbyHeaderBadgeProps {
  symbol: string;
  shape?: 'arch' | 'gem' | 'ghost' | 'pill' | 'circle';
  className?: string;
}

const shapeClasses = {
  // M3 Arch: 4-vertex polygon, top corners fully rounded (r=1.0), bottom corners lightly rounded (r=0.2)
  // For 48px badge: top = 24px (50%), bottom = 4.8px (10%)
  arch: 'rounded-t-[1.5rem] rounded-b-[0.3rem]',
  gem: 'rounded-[1.2rem] rotate-45 [&>span]:-rotate-45',
  ghost: 'rounded-t-[1.75rem] rounded-b-[0.85rem]',
  pill: 'rounded-full',
  circle: 'rounded-full',
};

export function TabbyHeaderBadge({ symbol, shape = 'arch', className }: TabbyHeaderBadgeProps) {
  return (
    <div
      className={cn(
        'grid size-12 shrink-0 place-items-center bg-primary text-primary-foreground',
        shapeClasses[shape],
        className
      )}
    >
      <MaterialSymbol name={symbol} className="text-[1.75rem]" />
    </div>
  );
}

interface TabbyPageHeaderProps {
  title: string;
  subtitle?: string;
  symbol: string;
  shape?: TabbyHeaderBadgeProps['shape'];
  action?: ReactNode;
  titleVariation?: string;
}

export function TabbyPageHeader({ title, subtitle, symbol, shape, action, titleVariation }: TabbyPageHeaderProps) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <TabbyHeaderBadge symbol={symbol} shape={shape} />
        <div className="min-w-0">
          <h2
            className="truncate font-display text-headline-large font-black leading-tight tracking-normal text-foreground"
            style={{ fontVariationSettings: titleVariation ?? '"wght" 1000' }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 max-w-2xl text-body-medium text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

export function TabbyEmptyState({
  title,
  body,
  compact = false,
  icon = 'inbox',
}: {
  title: string;
  body: string;
  compact?: boolean;
  icon?: string;
}) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] bg-surface-variant text-center ring-1 ring-border/25">
      {!compact && (
        <div className="mx-auto flex h-36 max-w-sm items-center justify-center bg-tabby-mint">
          <MaterialSymbol
            name={icon}
            className="text-[5rem] text-primary/30"
          />
        </div>
      )}
      <div className={cn('mx-auto max-w-xl px-6', compact ? 'py-7' : 'py-6')}>
        <h3 className="text-title-large font-black text-foreground">{title}</h3>
        <p className="mt-2 text-body-medium text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

export function TabbySection({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      {title && (
        <h3 className="mb-3 text-title-large font-black text-foreground">{title}</h3>
      )}
      <div className="overflow-hidden rounded-[1.375rem] bg-[hsl(210_40%_97%)] ring-1 ring-border/20 shadow-md">
        {children}
      </div>
    </section>
  );
}

export function MaterialSymbol({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('material-symbol inline-flex items-center justify-center shrink-0', className)}
    >
      {name}
    </span>
  );
}
