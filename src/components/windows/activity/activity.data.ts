export const screens = ["GitHub", "Music", "Games"] as const;
export type ActivityScreen = (typeof screens)[number];

export const activityInstruction = "Select Activity to view more";

// Screens with their own instruction replace the default while they are open.
export const screenInstruction: Partial<Record<ActivityScreen, string>> = {
  Music: "Select a disc to play it",
};
export const screenHelp: Record<ActivityScreen, string> = {
  GitHub: "View my GitHub activity for the past year",
  Music: "View the music I've been listening to",
  Games: "View the games I've been playing",
};
