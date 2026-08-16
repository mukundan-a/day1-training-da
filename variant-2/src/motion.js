// Motion tokens (build spec §2.1). Single source; never inline a duration or spring.
export const dur = { xfast: 0.18, fast: 0.32, base: 0.55, slow: 0.9, epic: 1.6 };

// bezier carries typography and camera (text, dividers, captions, push-in)
export const ease = {
  standard: [0.22, 1, 0.36, 1],
  entrance: [0.16, 1, 0.30, 1],
  exit: [0.40, 0, 1, 1],
  editorial: [0.33, 1, 0.68, 1],
};

// springs carry physical landings only (rows/owners/stubs/chips)
export const spring = {
  hero: { type: 'spring', stiffness: 120, damping: 20, mass: 1 },
  land: { type: 'spring', stiffness: 260, damping: 24, mass: 0.9 },
  sprout: { type: 'spring', stiffness: 340, damping: 22 },
  ui: { type: 'spring', stiffness: 420, damping: 34 },
};

export const stagger = { tight: 0.04, normal: 0.08, loose: 0.14 };

// reusable variant sets
export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: dur.base, ease: ease.entrance } },
};
export const staggerParent = (s = stagger.normal, delayChildren = 0.15) => ({
  hidden: {},
  show: { transition: { staggerChildren: s, delayChildren } },
});
export const riseChild = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.52, ease: ease.entrance } },
};
export const landChild = {
  hidden: { opacity: 0, y: -14 },
  show: { opacity: 1, y: 0, transition: spring.land },
};
