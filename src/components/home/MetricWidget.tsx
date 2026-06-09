import { useEffect } from 'react';
import { animate, motion, useMotionValue } from 'framer-motion';
import { MaterialSymbol } from '@/components/tabby/TabbyPrimitives';

// Android: FillAnimationDurationMs = 1000, FillAnimationStaggerMs = 170, FastOutSlowInEasing
const FILL_DURATION_S = 1.0;
const FILL_STAGGER_S = 0.17;
const FILL_EASE = [0.4, 0, 0.2, 1] as const;

export interface MetricWidgetProps {
  label: string;
  value: string;
  iconName: string;
  inactiveColor: string;
  activeColor: string;
  textColor: string;
  /** 0..1 */
  progress: number;
  /** Stagger index (1,2,3) matching Android animationPosition. */
  animationPosition: number;
  reducedMotion?: boolean;
  entryToken?: number;
  onClick?: () => void;
}

export function MetricWidget({
  label,
  value,
  iconName,
  inactiveColor,
  activeColor,
  textColor,
  progress,
  animationPosition,
  reducedMotion = false,
  entryToken = 0,
  onClick,
}: MetricWidgetProps) {
  const target = Math.min(1, Math.max(0, progress));
  const fill = useMotionValue(0);

  useEffect(() => {
    if (reducedMotion) {
      fill.set(target);
      return;
    }
    const controls = animate(fill, target, {
      duration: FILL_DURATION_S,
      delay: Math.max(0, animationPosition) * FILL_STAGGER_S,
      ease: FILL_EASE,
    });
    return controls.stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, reducedMotion, entryToken, animationPosition]);

  const Tag = onClick ? motion.button : motion.div;

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      className="relative flex h-full w-full items-center overflow-hidden rounded-[18px] text-left"
      style={{ backgroundColor: inactiveColor, color: textColor }}
    >
      {/* Animated active fill — scaleX on a full-width layer == fillMaxWidth(progress) */}
      <motion.div
        aria-hidden
        className="absolute inset-y-0 left-0 w-full"
        style={{ backgroundColor: activeColor, scaleX: fill, transformOrigin: 'left' }}
        initial={false}
      />

      {/* Content */}
      <div className="relative z-10 flex h-full w-full items-center gap-2 pl-1.5 pr-3">
        <div
          className="grid h-[44px] w-[34px] shrink-0 place-items-center rounded-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.42)' }}
        >
          <MaterialSymbol name={iconName} className="text-[1.5rem]" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center" style={{ rowGap: '-3px' }}>
          <span
            className="truncate font-display leading-none"
            style={{ fontSize: '0.75rem', fontWeight: 1000, fontVariationSettings: '"wght" 1000, "ROND" 100' }}
          >
            {label}
          </span>
          <span
            className="truncate font-display leading-none"
            style={{ fontSize: '1.4rem', fontWeight: 1000, fontVariationSettings: '"wght" 1000, "ROND" 100, "wdth" 25' }}
          >
            {value}
          </span>
        </div>
      </div>
    </Tag>
  );
}
