import { IconHome, IconRobot, IconBrandGithub, IconBrandLinkedin } from "@tabler/icons-react";
import { Separator } from "../shadcn/separator";
import { Dock, DockIcon } from "../shadcn/dock";
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip";
import { ThemeToggle } from "./theme-toggle";

export const PortfolioDock = () => {
    return (
        <div className="relative">
            <Dock className="rounded-full" iconMagnification={75}>
                <DockIcon className="rounded-full border bg-background">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <IconHome className="size-full" />
                        </TooltipTrigger>
                        <TooltipContent>Home</TooltipContent>
                    </Tooltip>
                </DockIcon>

                <DockIcon className="rounded-full border bg-background">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <IconRobot className="size-full" />
                        </TooltipTrigger>
                        <TooltipContent>RAG</TooltipContent>
                    </Tooltip>
                </DockIcon>

                <Separator orientation="vertical" />

                <DockIcon className="rounded-full border bg-background">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <IconBrandGithub className="size-full" />
                        </TooltipTrigger>
                        <TooltipContent>GitHub</TooltipContent>
                    </Tooltip>
                </DockIcon>

                <DockIcon className="rounded-full border bg-background">
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
    )
}