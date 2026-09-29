// Share the base cadence across window transitions, pointers, and previews.
export const fadeMs = 150;
export const windowEntryMs = fadeMs * 3;
export const cornerTransitionMs = fadeMs * 3;
export const slideshowIntervalMs = fadeMs * 10;
export const columnStaggerMs = 45;
export const windowStaggerMs = 30;
export const entranceBufferMs = 40;

// Keep portrait effects and their cleanup/cooldown timers together.
export const portraitHitMs = 150;
export const damageNumberMs = 600;
export const portraitAttackCooldownMs = 450;

// Spin one disc turn per 1.5 seconds and wait up to 1.5 seconds for a cover.
export const discSpinMs = fadeMs * 10;
export const coverWaitMs = fadeMs * 10;

// Keep the mobile hint visible for 4.5 seconds after it first appears.
export const scrollHintDurationMs = fadeMs * 30;

// Share the typing cadence and scale the erase speed.
export const typingIntervalMs = 10;
export const eraseSpeedMultiplier = 2;

// Apply shared durations before React mounts so CSS and JS remain in sync.
export const motionCssVariables = {
  "--fade-duration": `${fadeMs}ms`,
  "--window-entry-duration": `${windowEntryMs}ms`,
  "--pointer-bob-duration": `${windowEntryMs * 2}ms`,
  "--portrait-hit-duration": `${portraitHitMs}ms`,
  "--damage-number-duration": `${damageNumberMs}ms`,
};
