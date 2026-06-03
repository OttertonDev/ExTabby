import { useCallback } from 'react';

export function useRipple() {
  const triggerRipple = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      border-radius: 50%;
      background: currentColor;
      opacity: 0.18;
      transform: scale(0);
      animation: tabby-ripple 500ms ease-out forwards;
      pointer-events: none;
    `;

    // Ensure parent has relative positioning and overflow hidden
    const prevPosition = el.style.position;
    const prevOverflow = el.style.overflow;
    if (getComputedStyle(el).position === 'static') {
      el.style.position = 'relative';
    }
    if (getComputedStyle(el).overflow === 'visible') {
      el.style.overflow = 'hidden';
    }

    el.appendChild(ripple);

    ripple.addEventListener('animationend', () => {
      ripple.remove();
      if (!prevPosition) el.style.position = '';
      if (!prevOverflow) el.style.overflow = '';
    });
  }, []);

  return { triggerRipple };
}
