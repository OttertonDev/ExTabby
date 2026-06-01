// Material 3 Motion - Easing curves
export const materialEasing = {
  standard: [0.2, 0.0, 0, 1.0] as const,
  emphasized: [0.2, 0.0, 0, 1.0] as const,
  emphasizedDecelerate: [0.05, 0.7, 0.1, 1.0] as const,
  emphasizedAccelerate: [0.3, 0.0, 0.8, 0.15] as const,
};

// Material 3 Motion - Duration tokens (in milliseconds)
export const materialDurations = {
  short1: 50,
  short2: 100,
  short3: 150,
  short4: 200,
  medium1: 250,
  medium2: 300,
  medium3: 350,
  medium4: 400,
  long1: 450,
  long2: 500,
  long3: 550,
  long4: 600,
} as const;

// Framer Motion variants for common animations
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: {
    duration: materialDurations.medium2 / 1000,
    ease: materialEasing.standard,
  },
};

export const slideInFromRight = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '100%', opacity: 0 },
  transition: {
    duration: materialDurations.medium4 / 1000,
    ease: materialEasing.emphasizedDecelerate,
  },
};

export const slideInFromLeft = {
  initial: { x: '-100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '-100%', opacity: 0 },
  transition: {
    duration: materialDurations.medium4 / 1000,
    ease: materialEasing.emphasizedDecelerate,
  },
};

export const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
  transition: {
    duration: materialDurations.medium2 / 1000,
    ease: materialEasing.emphasized,
  },
};
