import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  IconCircleCheck,
  IconInfoCircle,
  IconAlertCircle,
  IconCircleX,
  IconLoader2,
} from "@tabler/icons-react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <IconCircleCheck className="h-6 w-6" />,
        info: <IconInfoCircle className="h-6 w-6" />,
        warning: <IconAlertCircle className="h-6 w-6" />,
        error: <IconCircleX className="h-6 w-6" />,
        loading: <IconLoader2 className="h-6 w-6 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
          description: "!text-[var(--normal-text)]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
