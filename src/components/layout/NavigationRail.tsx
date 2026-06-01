import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MaterialSymbol } from '@/components/tabby/TabbyPrimitives';
import { tabbyAssets } from '@/lib/tabby';

const navItems = [
  { path: '/timetable', symbol: 'calendar_clock', label: 'Timetable' },
  { path: '/assignments', symbol: 'assignment', label: 'Assignment' },
  { path: '/tcas', symbol: 'school', label: 'TCAS' },
  { path: '/settings', symbol: 'settings', label: 'Settings' },
];

export function NavigationRail() {
  const location = useLocation();

  return (
    <>
      {/* Desktop Navigation Rail */}
      <nav className="hidden w-24 flex-col border-r border-border/20 bg-surface md:flex">
        <div className="flex justify-center py-4">
          <img
            src={tabbyAssets.icon}
            alt="Tabby"
            className="size-14 rounded-[1.1rem] object-cover shadow-elevation-1"
          />
        </div>
        <div className="flex flex-1 flex-col items-center gap-2 py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex h-[4.65rem] w-[4.8rem] flex-col items-center justify-center rounded-[1.35rem] transition-all',
                  'text-muted-foreground hover:bg-surface-variant hover:text-foreground',
                  isActive && 'bg-tabby-mint text-primary shadow-sm'
                )}
              >
                <MaterialSymbol name={item.symbol} className="text-[1.55rem]" />
                <span className="mt-1 max-w-full truncate px-1 text-[0.68rem] font-black leading-none">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/20 bg-surface md:hidden">
        <div className="flex h-16 items-center justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex h-full flex-1 flex-col items-center justify-center transition-colors',
                  'text-muted-foreground hover:bg-surface-variant',
                  isActive && 'text-primary'
                )}
              >
                <span className={cn('rounded-full px-4 py-0.5', isActive && 'bg-tabby-mint')}>
                  <MaterialSymbol name={item.symbol} className="text-[1.45rem]" />
                </span>
                <span className="mt-0.5 text-[0.68rem] font-black leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
