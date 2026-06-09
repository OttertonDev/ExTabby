import { useEffect, useState } from 'react';
import { animate, useMotionValue, useMotionValueEvent, useTransform, motion } from 'framer-motion';

const RING_ACTIVE = '#008CFF';
const RING_INACTIVE = '#A6E1FF';
const BOTTOM_LABEL_COLOR = 'rgb(0,73,255)';
const FILL_DURATION_S = 1.85;
const FILL_EASE = [0.4, 0, 0.2, 1] as const;

const SIZE = 100;
const CENTER = SIZE / 2;
const STROKE = SIZE * 0.147;          // ~14.7
const RADIUS = (SIZE - STROKE) / 2;   // ~42.65  (ring center-line)
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Text paths run along the ring's centre-line radius so they hug the inner edge.
// Top label:    arc centred at 270° (top). Start = 270 - sweep/2, sweep = 90°.
// Bottom label: arc centred at  90° (bottom), drawn clockwise so text reads L→R.
//               Start = 90 + sweep/2 going backward, sweep = -80°.
const TEXT_R = 32; // verified: bottom arc y=82, inner hole edge y=85 — stays inside

function polar(deg: number, r: number) {
  const a = (deg * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(a), y: CENTER + r * Math.sin(a) };
}
function arcPath(startDeg: number, sweepDeg: number, r: number) {
  const end = startDeg + sweepDeg;
  const s = polar(startDeg, r);
  const e = polar(end, r);
  const large = Math.abs(sweepDeg) > 180 ? 1 : 0;
  const sweep = sweepDeg >= 0 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} ${sweep} ${e.x} ${e.y}`;
}

// "TODAY'S CLASS": slightly smaller radius to pull it away from the stroke
const TOP_PATH = arcPath(220, 100, TEXT_R - 4);
// "N classes left": centred at 90° (bottom), counter-clockwise so text reads left-to-right
const BOT_PATH = arcPath(130, -80, TEXT_R);

const FONT_DISPLAY = '"wght" 1000, "ROND" 100, "wdth" 100, "GRAD" 0, "slnt" 0, "opsz" 18';

export interface ClassRingProps {
  progress: number;
  classesLeft: number;
  reducedMotion?: boolean;
  entryToken?: number;
}

export function ClassRing({ progress, classesLeft, reducedMotion = false, entryToken = 0 }: ClassRingProps) {
  const target = Math.min(1, Math.max(0, progress));
  const value = useMotionValue(0);
  const [percent, setPercent] = useState(0);
  const dashOffset = useTransform(value, (v) => CIRCUMFERENCE * (1 - v));

  useMotionValueEvent(value, 'change', (v) => setPercent(Math.round(v * 100)));

  useEffect(() => {
    if (reducedMotion) { value.set(target); return; }
    const controls = animate(value, target, { duration: FILL_DURATION_S, ease: FILL_EASE });
    return controls.stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, reducedMotion, entryToken]);

  const leftLabel = `${classesLeft} ${classesLeft === 1 ? 'class' : 'classes'} left`;
  const fontFamily = '"Google Sans Flex", system-ui, sans-serif';

  return (
    <div className="relative size-full">
      {/* Progress ring — rotated so arc starts at top */}
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none"
          stroke={RING_INACTIVE} strokeWidth={STROKE} strokeLinecap="round" />
        <motion.circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none"
          stroke={RING_ACTIVE} strokeWidth={STROKE} strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE} style={{ strokeDashoffset: dashOffset }} />
      </svg>

      {/* Text overlay — not rotated */}
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 h-full w-full">
        <defs>
          <path id="ring-top" d={TOP_PATH} />
          <path id="ring-bot" d={BOT_PATH} />
        </defs>

        {/* "TODAY'S CLASS" along the top inner edge */}
        <text fontSize="6.2" fontWeight="700" fontFamily={fontFamily}
          style={{ fontVariationSettings: FONT_DISPLAY }} fill="currentColor" className="fill-foreground">
          <textPath href="#ring-top" startOffset="50%" textAnchor="middle">TODAY&apos;S CLASS</textPath>
        </text>

        {/* Percentage — true centre */}
        <text x={CENTER} y={CENTER} dy="0.35em" textAnchor="middle"
          fontSize="21" fontWeight="1000" fontFamily={fontFamily}
          style={{ fontVariationSettings: FONT_DISPLAY }} fill="currentColor" className="fill-foreground">
          {percent}%
        </text>

        {/* "N classes left" along the bottom inner edge */}
        <text fontSize="6.2" fontWeight="700" fontFamily={fontFamily}
          style={{ fontVariationSettings: FONT_DISPLAY }} fill={BOTTOM_LABEL_COLOR}>
          <textPath href="#ring-bot" startOffset="50%" textAnchor="middle">{leftLabel}</textPath>
        </text>
      </svg>
    </div>
  );
}
