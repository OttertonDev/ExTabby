import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { tabbyAssets } from '@/lib/tabby';

interface TabbyHeaderBadgeProps {
  symbol: string;
  shape?: 'arch' | 'gem' | 'ghost' | 'pill' | 'circle';
  className?: string;
}

const shapeClasses = {
  arch: 'rounded-t-[1.65rem] rounded-b-[0.95rem]',
  gem: 'rounded-[1.1rem] rotate-45 [&>span]:-rotate-45',
  ghost: 'rounded-t-[1.7rem] rounded-b-[0.9rem]',
  pill: 'rounded-full',
  circle: 'rounded-full',
};

export function TabbyHeaderBadge({ symbol, shape = 'arch', className }: TabbyHeaderBadgeProps) {
  return (
    <div
      className={cn(
        'grid size-12 shrink-0 place-items-center bg-primary text-primary-foreground shadow-sm',
        shapeClasses[shape],
        className
      )}
    >
      <MaterialSymbol name={symbol} className="size-6" />
    </div>
  );
}

interface TabbyPageHeaderProps {
  title: string;
  subtitle?: string;
  symbol: string;
  shape?: TabbyHeaderBadgeProps['shape'];
  action?: ReactNode;
}

export function TabbyPageHeader({ title, subtitle, symbol, shape, action }: TabbyPageHeaderProps) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <TabbyHeaderBadge symbol={symbol} shape={shape} />
        <div className="min-w-0">
          <h2 className="truncate font-display text-headline-medium font-black leading-tight tracking-normal text-foreground">
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
}: {
  title: string;
  body: string;
  compact?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] bg-surface-variant text-center ring-1 ring-border/25">
      {!compact && (
        <div className="mx-auto h-36 max-w-sm overflow-hidden bg-tabby-mint">
          <img
            src={tabbyAssets.welcome}
            alt=""
            className="h-full w-full object-cover object-center"
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
      <div className="overflow-hidden rounded-[1.375rem] bg-surface-variant ring-1 ring-border/20">
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
