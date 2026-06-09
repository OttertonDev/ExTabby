import { type ReactNode } from 'react';

interface WidgetModuleProps {
  label?: string;
  children: ReactNode;
}

/** A labelled card that groups widgets together. Modules tile side-by-side on wide screens. */
export function WidgetModule({ label, children }: WidgetModuleProps) {
  return (
    <div className="flex w-fit flex-col gap-2">
      {label && (
        <span
          className="text-body-small font-medium uppercase tracking-widest text-muted-foreground"
          style={{ fontSize: '0.68rem' }}
        >
          {label}
        </span>
      )}
      {children}
    </div>
  );
}
