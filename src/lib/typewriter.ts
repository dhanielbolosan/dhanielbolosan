import { eraseSpeedMultiplier } from "./motion";

export type TypewriterState = { text: string; line: string; scene: string };

export const stepTypewriter = (
  current: TypewriterState,
  target: string,
  scene: string,
): TypewriterState => {
  // Start a fresh line when the dialogue scene changes.
  if (current.scene !== scene) return { text: "", line: target, scene };

  if (current.text === target) return current;

  // Erase to the shared prefix before typing the replacement text.
  if (!target.startsWith(current.text)) {
    return { ...current, text: current.text.slice(0, -1) };
  }

  return {
    text: target.slice(0, current.text.length + 1),
    line: target,
    scene,
  };
};

export const advanceTypewriter = (
  state: TypewriterState,
  target: string,
  scene: string,
  elapsedMs: number,
  typingMs: number,
) => {
  let nextState = state;
  let consumedMs = 0;

  // Catch up missed characters when a frame arrives late.
  while (true) {
    const isErasing =
      nextState.scene === scene && !target.startsWith(nextState.text);

    // Use a faster character interval while erasing.
    const intervalMs = isErasing ? typingMs / eraseSpeedMultiplier : typingMs;
    if (elapsedMs - consumedMs < intervalMs) break;

    const steppedState = stepTypewriter(nextState, target, scene);

    // Stop once typing settles, even if elapsed time remains.
    if (steppedState === nextState) break;

    nextState = steppedState;
    consumedMs += intervalMs;
  }

  return { state: nextState, consumedMs };
};
