// Read a remembered choice, falling back when storage is blocked or the value is no longer an option.
export const readChoice = <Choice extends string>(
  key: string,
  options: readonly Choice[],
  fallback: Choice,
) => {
  try {
    const saved = localStorage.getItem(key);

    return options.find((option) => option === saved) ?? fallback;
  } catch {
    return fallback;
  }
};

// Remember a choice for the next visit; blocked storage keeps it for this visit only.
export const saveChoice = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // The choice still applies until the page reloads.
  }
};
