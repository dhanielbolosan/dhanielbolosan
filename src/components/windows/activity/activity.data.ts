export const screens = ["GitHub", "Music", "Games"] as const;
export type ActivityScreen = (typeof screens)[number];

export const activityInstruction = "Select Activity to view more";
export const screenHelp: Record<ActivityScreen, string> = {
  GitHub: "View my GitHub activity for the past year",
  Music: "View the music I've been listening to",
  Games: "View the games I've been playing",
};
