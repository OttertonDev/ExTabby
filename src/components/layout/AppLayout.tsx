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
          {/* Mobile search bar with profile inside */}
          <div className="flex h-12 w-full items-center gap-3 rounded-full bg-[#cfe3ff] pl-4 pr-1 text-[#364963] md:hidden">
            <MaterialSymbol name="search" className="shrink-0 text-[1.25rem]" />
            <span className="flex-1 text-body-medium font-medium">Search</span>
            {user && (
              <div className="flex shrink-0 items-center justify-center rounded-full p-[2px]" style={{ background: 'conic-gradient(#3174F1 0% 25%, #249A41 25% 50%, #F6AD01 50% 75%, #E92D18 75% 100%)' }}>
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="size-[32px] rounded-full object-cover"
                  />
                )}
                {!user.photoURL && (
                  <div className="grid size-[32px] place-items-center rounded-full bg-white text-primary">
                    <MaterialSymbol name="person" className="text-[1.2rem]" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop search bar */}
          <div className="hidden h-12 w-[560px] items-center rounded-full bg-[#cfe3ff] px-4 text-[#364963] md:absolute md:left-1/2 md:top-5 md:flex md:-translate-x-1/2">
            <span className="flex-1 text-body-medium font-medium">Search</span>
            <MaterialSymbol name="search" className="text-[1.25rem]" />
          </div>

          {/* Desktop profile picture */}
          {user && (
            <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 items-center md:right-[45px] md:top-[44px] md:flex md:-translate-y-1/2">
              <div className="grid size-[52px] shrink-0 place-items-center rounded-full p-[3px]" style={{ background: 'conic-gradient(#3174F1 0% 25%, #249A41 25% 50%, #F6AD01 50% 75%, #E92D18 75% 100%)' }}>
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="size-[46px] rounded-full object-cover"
                  />
                )}
                {!user.photoURL && (
                  <div className="grid size-[46px] place-items-center rounded-full bg-white text-primary">
                    <MaterialSymbol name="person" className="text-[1.4rem]" />
                  </div>
                )}
              </div>
            </div>
          )}
        </header>

        <main className="min-h-0 flex-1 overflow-hidden rounded-[2rem] bg-white md:absolute md:bottom-[41px] md:left-[285px] md:right-[45px] md:top-[85px] md:rounded-[50px]">
          {children}
        </main>
      </div>
    </div>
  );
}
