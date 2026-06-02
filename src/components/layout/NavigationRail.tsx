import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MaterialSymbol } from '@/components/tabby/TabbyPrimitives';
import { tabbyAssets } from '@/lib/tabby';

const navItems = [
  { path: '/home', symbol: 'home', label: 'Home', top: 205 },
  { path: '/timetable', symbol: 'calendar_clock', label: 'Timetable', top: 245, selectedTop: 240, figmaSelected: true },
  { path: '/assignments', symbol: 'assignment', label: 'Assignment', top: 285 },
  { path: '/tcas', symbol: 'school', label: 'University', top: 325 },
  { path: '/classroom', symbol: 'co_present', label: 'Classroom', top: 365 },
  { path: '/settings', symbol: 'tune', label: 'Preferences', top: 405 },
];

export function NavigationRail() {
  const location = useLocation();
  const currentPath = location.pathname.replace(/\/+$/, '') || '/';

  return (
    <>
      {/* Desktop Navigation Rail */}
      <nav className="hidden h-full w-[285px] shrink-0 md:absolute md:left-0 md:top-0 md:z-30 md:block">
        <Link
          to="/timetable"
          className="absolute left-[30px] top-4 flex h-[78px] items-center text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <img
            src={tabbyAssets.transparentLogo}
            alt="Tabby"
            className="size-[78px] object-contain"
          />
          <span className="ml-[7px] font-display text-[29px] font-black leading-none text-foreground">
            Tabby
          </span>
        </Link>

        <button
          type="button"
          disabled
          className="absolute left-[30px] top-[109px] flex h-[70px] w-[142px] cursor-not-allowed items-center justify-center gap-3 rounded-[15px] bg-[#eaddff] px-4 text-[#4f2396] opacity-100"
          title="Awaits Implementation"
        >
          <MaterialSymbol name="add" className="text-[1.15rem]" />
          <span className="text-center text-[14px] font-black leading-[18px]">New<br />Items</span>
        </button>

        <div>
          {navItems.map((item) => {
            const routeActive =
              currentPath === item.path ||
              currentPath.startsWith(`${item.path}/`) ||
              (item.path === '/timetable' && currentPath === '/');
            const showSelectedPill = Boolean(item.figmaSelected);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'group absolute left-[30px] flex h-9 w-[225px] items-center rounded-full text-[#434343] transition-colors duration-200',
                  'hover:bg-[#dbeaff] hover:text-[#364963] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  showSelectedPill && 'bg-[#cfe3ff] text-[#364963]'
                )}
                style={{ top: showSelectedPill && item.selectedTop ? item.selectedTop : item.top }}
                aria-current={routeActive ? 'page' : undefined}
              >
                <MaterialSymbol
                  name={item.symbol}
                  className="ml-4 size-[25px] text-[25px] transition-[font-variation-settings] duration-200"
                />
                <span className="ml-2.5 min-w-0 truncate text-[16px] font-normal leading-none">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/30 bg-surface shadow-elevation-2 md:hidden">
        <div className="flex h-[4.5rem] items-center overflow-x-auto px-1">
          {navItems.map((item) => {
            const isActive =
              currentPath === item.path ||
              currentPath.startsWith(`${item.path}/`) ||
              (item.path === '/timetable' && currentPath === '/');

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'group flex h-full min-w-[4.75rem] flex-1 flex-col items-center justify-center rounded-2xl transition-colors duration-200',
                  'text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                  isActive && 'text-primary'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <span
                  className={cn(
                    'grid h-8 w-16 place-items-center rounded-full transition-colors duration-200',
                    'group-hover:bg-surface-variant',
                    isActive && 'bg-[#cfe3ff] text-[#364963]'
                  )}
                >
                  <MaterialSymbol
                    name={item.symbol}
                    className="text-[1.45rem] transition-[font-variation-settings] duration-200"
                  />
                </span>
                <span className="mt-1 max-w-full truncate px-1 text-label-small font-black leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
