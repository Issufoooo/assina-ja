import type { Variants, Transition } from 'framer-motion'

// ─── Transitions ──────────────────────────────────────────────────────────────

export const springSnap: Transition = {
  type: 'spring', stiffness: 600, damping: 38,
}
export const springFast: Transition = {
  type: 'spring', stiffness: 420, damping: 34,
}
export const springSmooth: Transition = {
  type: 'spring', stiffness: 280, damping: 28,
}
export const springGentle: Transition = {
  type: 'spring', stiffness: 160, damping: 22,
}
export const easeOut: Transition = {
  duration: 0.28, ease: [0.16, 1, 0.3, 1],
}
export const easeFast: Transition = {
  duration: 0.16, ease: [0.16, 1, 0.3, 1],
}

// ─── Page / Step Transitions ──────────────────────────────────────────────────

export const stepVariants: Variants = {
  initial: { x: 28, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] } },
  exit:    { x: -20, opacity: 0, transition: { duration: 0.20, ease: 'easeIn' } },
}

export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: easeFast },
  exit:    { opacity: 0, transition: { duration: 0.16 } },
}

export const slideUpVariants: Variants = {
  initial: { y: '100%', opacity: 0 },
  animate: { y: 0, opacity: 1, transition: springSmooth },
  exit:    { y: '100%', opacity: 0, transition: { duration: 0.22, ease: 'easeIn' } },
}

// ─── List / Stagger ───────────────────────────────────────────────────────────

export const listContainerVariants: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

export const listItemVariants: Variants = {
  initial: { y: 16, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: springSmooth },
}

// ─── Element Entrances ────────────────────────────────────────────────────────

export const fadeUpVariants: Variants = {
  initial: { y: 12, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: easeOut },
}

export const scaleInVariants: Variants = {
  initial: { scale: 0.85, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: springGentle },
}

// ─── Success Sequence ─────────────────────────────────────────────────────────

export const successRingVariants: Variants = {
  initial: { scale: 0.4, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { ...springGentle, delay: 0.05 } },
}

export const successCheckVariants: Variants = {
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1, opacity: 1,
    transition: {
      pathLength: { duration: 0.45, ease: 'easeOut', delay: 0.18 },
      opacity:    { duration: 0.10, delay: 0.18 },
    },
  },
}

export const successTextVariants: Variants = {
  initial: { y: 12, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { ...easeOut, delay: 0.42 } },
}

// ─── Error Shake ──────────────────────────────────────────────────────────────

export const shakeVariants: Variants = {
  idle:  { x: 0 },
  shake: {
    x: [0, -8, 8, -6, 6, -3, 0],
    transition: { duration: 0.40, ease: 'easeInOut' },
  },
}

// ─── Interaction Constants ────────────────────────────────────────────────────

export const tapScale     = { scale: 0.97  } as const
export const tapScaleCard = { scale: 0.985 } as const
export const hoverLift    = { y: -2        } as const
export const hoverScale   = { scale: 1.01  } as const
