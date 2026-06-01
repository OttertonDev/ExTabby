import type { ReactNode } from 'react';
import { NavigationRail } from './NavigationRail';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { MaterialSymbol } from '@/components/tabby/TabbyPrimitives';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <NavigationRail />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex h-[4.4rem] items-center justify-between border-b border-border/20 bg-surface px-4 sm:px-6">
          <div className="w-24 md:w-32" />
          <h1 className="font-display text-[2rem] font-black leading-none tracking-normal text-foreground">
            Tabby
          </h1>

          {user && (
            <div className="flex w-24 items-center justify-end gap-2 md:w-32">
              <div className="flex items-center gap-3">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="size-9 rounded-full ring-2 ring-tabby-mint"
                  />
                )}
                <span className="hidden max-w-28 truncate text-body-small font-bold text-muted-foreground lg:inline">
                  {user.displayName}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                title="Sign out"
                className="rounded-full"
              >
                <MaterialSymbol name="logout" className="text-[1.25rem]" />
              </Button>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}
