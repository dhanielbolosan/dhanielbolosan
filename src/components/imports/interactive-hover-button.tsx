import { IconArrowRight } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

export function InteractiveHoverButton({
    children,
    className,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            className={cn(
                "group bg-background relative w-auto cursor-pointer overflow-hidden rounded-md border p-2 px-6 text-center font-semibold",
                className
            )}
            {...props}
        >
            <div className="bg-primary absolute inset-0 -translate-x-full transition-transform duration-300 group-hover:translate-x-0" />
            <span className="relative z-10 inline-block transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
                {children}
            </span>
            <div className="text-primary-foreground absolute inset-0 z-10 flex translate-x-12 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                <span>{children}</span>
                <IconArrowRight />
            </div>
        </button>
    )
}
