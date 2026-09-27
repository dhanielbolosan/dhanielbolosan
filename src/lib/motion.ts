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

// Allow the mobile hint to remain visible through ten window-entry durations.
export const scrollHintDurationMs = windowEntryMs * 10;

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
