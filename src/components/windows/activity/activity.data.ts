export const screens = ["GitHub", "Music", "Games"] as const;
export type ActivityScreen = (typeof screens)[number];

export const activityInstruction = "Select Activity to view more";

// Screens with their own instruction replace the default while they are open.
export const screenInstruction: Partial<Record<ActivityScreen, string>> = {
  Music: "Select disc to play it",
};

// Each screen's line in the Activity switcher.
export const screenHelp: Record<ActivityScreen, string> = {
  GitHub: "View GitHub activity",
  Music: "View recent music",
  Games: "View recent games",
};
