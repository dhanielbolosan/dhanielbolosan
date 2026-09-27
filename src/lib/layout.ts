import type { ComponentType } from "react";
import { Status } from "@/components/windows/status/status";
import { Contact } from "@/components/windows/contact/contact";
import { History } from "@/components/windows/history/history";
import { Projects } from "@/components/windows/projects/projects";
import { Skills } from "@/components/windows/skills/skills";
import { Activity } from "@/components/windows/activity/activity";
import { Config } from "@/components/windows/config/config";

export const entryDirections = {
  Navbar: "top",
  Status: "left",
  Contact: "right",
  History: "bottom",
  Projects: "left",
  Skills: "bottom",
  Activity: "top",
  Config: "right",
} as const;

type WindowColumn = {
  label: string;
  split?: boolean;
  windows: {
    Component: ComponentType;
    direction: "top" | "bottom" | "left" | "right";
    raised?: boolean;
  }[];
};

export const columns: WindowColumn[] = [
  {
    label: "Status",
    split: true,
    windows: [
      { Component: Status, direction: entryDirections.Status },
      { Component: Contact, direction: entryDirections.Contact, raised: true },
    ],
  },

  {
    label: "History",
    windows: [{ Component: History, direction: entryDirections.History }],
  },

  {
    label: "Materia",
    split: true,
    windows: [
      {
        Component: Projects,
        direction: entryDirections.Projects,
        raised: true,
      },

      { Component: Skills, direction: entryDirections.Skills },
    ],
  },

  {
    label: "Extras",
    split: true,
    windows: [
      { Component: Activity, direction: entryDirections.Activity },
      { Component: Config, direction: entryDirections.Config },
    ],
  },
];
