// Shared 150 ms cadence and every timing derived from it.
export const fadeMs = 150;
export const windowEntryMs = fadeMs * 3;
export const cornerTransitionMs = fadeMs * 3;
export const slideshowIntervalMs = fadeMs * 10;
export const columnStaggerMs = 45;
export const windowStaggerMs = 30;
export const entranceBufferMs = 45;

// Things arrive fast and settle softly, and leave on the mirror image: slow, then gone.
export const enterEasing = "cubic-bezier(0.15, 1, 0.3, 1)";
export const exitEasing = "cubic-bezier(0.7, 0, 0.85, 0)";

// Keep portrait effects and their cleanup/cooldown timers together.
export const portraitHitMs = 150;
export const damageNumberMs = 600;
export const portraitAttackCooldownMs = 450;

// Spin one disc turn per 1.5 seconds and wait up to 1.5 seconds for a cover.
export const discSpinMs = fadeMs * 10;
export const coverWaitMs = fadeMs * 10;

// Open a contact link just after its line finishes, then restore the menu.
export const redirectDelayMs = fadeMs * 3;
export const redirectResetMs = fadeMs * 12;

// Share the typing cadence and scale the erase speed.
export const typingIntervalMs = 10;
export const eraseSpeedMultiplier = 2;

// Apply shared durations before React mounts so CSS and JS remain in sync.
export const motionCssVariables = {
  "--fade-duration": `${fadeMs}ms`,
  "--window-entry-duration": `${windowEntryMs}ms`,
  "--enter-easing": enterEasing,
  "--pointer-bob-duration": `${windowEntryMs * 2}ms`,
  "--limit-cycle-duration": `${fadeMs * 3}ms`,
  "--portrait-hit-duration": `${portraitHitMs}ms`,
  "--damage-number-duration": `${damageNumberMs}ms`,
};
