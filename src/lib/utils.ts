import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Combine conditional classes and resolve conflicting Tailwind utilities.
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
