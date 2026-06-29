import {
  IconHome,
  IconBrandGithub,
  IconBrandLinkedin,
} from "@tabler/icons-react";
import { Separator } from "../imports/separator";
import { Dock, DockIcon } from "../imports/dock";
import { Tooltip, TooltipContent, TooltipTrigger } from "../imports/tooltip";
import { ThemeToggle } from "../theme-toggle";

export const PortfolioDock = () => {
  return (
    <div className="relative">
      <Dock
        className="rounded-full bg-background"
        iconMagnification={60}
      >
        <DockIcon
          className="rounded-full border bg-background"
          onClick={() =>
            document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <IconHome className="size-full" />
            </TooltipTrigger>
            <TooltipContent>Home</TooltipContent>
          </Tooltip>
        </DockIcon>

        <Separator orientation="vertical" />

        <DockIcon
          className="rounded-full border bg-background"
          onClick={() =>
            window.open(
              "https://github.com/dhanielbolosan",
              "_blank",
              "noopener,noreferrer",
            )
          }
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <IconBrandGithub className="size-full" />
            </TooltipTrigger>
            <TooltipContent>GitHub</TooltipContent>
          </Tooltip>
        </DockIcon>

        <DockIcon
          className="rounded-full border bg-background"
          onClick={() =>
            window.open(
              "https://www.linkedin.com/in/dhaniel-bolosan",
              "_blank",
              "noopener,noreferrer",
            )
          }
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <IconBrandLinkedin className="size-full" />
            </TooltipTrigger>
            <TooltipContent>LinkedIn</TooltipContent>
          </Tooltip>
        </DockIcon>

        <Separator orientation="vertical" />

        <DockIcon className="rounded-full border bg-background">
          <ThemeToggle />
        </DockIcon>
      </Dock>
    </div>
  );
};
