import type { ReactNode } from 'react';
import { NavigationRail } from './NavigationRail';
import { useAuth } from '@/hooks/useAuth';
import { MaterialSymbol } from '@/components/tabby/TabbyPrimitives';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="relative h-screen overflow-hidden overscroll-none bg-[#f3f8ff] text-foreground">
      <NavigationRail />

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden overscroll-none px-4 pb-[5.25rem] pt-3 md:absolute md:inset-0 md:block md:px-0 md:pb-0 md:pt-0">
        <header className="relative z-10 flex h-[5.5rem] shrink-0 items-center justify-center md:block md:h-0">
          <div className="flex h-14 w-full max-w-[37.5rem] items-center rounded-full bg-[#cfe3ff] px-5 text-[#364963] md:absolute md:left-1/2 md:top-7 md:w-[600px] md:max-w-none md:-translate-x-1/2">
            <span className="flex-1 text-body-large font-medium">Search</span>
            <MaterialSymbol name="search" className="text-[1.35rem]" />
          </div>

          {user && (
            <div className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center md:right-[37px] md:top-3.5 md:translate-y-0">
              <div className="rounded-full bg-[conic-gradient(#2ca363_0_33%,#1a73e8_0_66%,#ff7a00_0_100%)] p-[3px]">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="size-[4.9rem] rounded-full bg-white object-cover p-[3px] md:size-[5.15rem]"
                  />
                )}
                {!user.photoURL && (
                  <div className="grid size-[4.9rem] place-items-center rounded-full bg-white p-[3px] text-primary md:size-[5.15rem]">
                    <MaterialSymbol name="person" className="text-[2rem]" />
                  </div>
                )}
              </div>
            </div>
          )}
        </header>

        <main className="min-h-0 flex-1 overflow-hidden rounded-[2rem] bg-white shadow-sm md:absolute md:bottom-[37px] md:left-[285px] md:right-[37px] md:top-28 md:rounded-[3.5rem]">
          {children}
        </main>
      </div>
    </div>
  );
}
