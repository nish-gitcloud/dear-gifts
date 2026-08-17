"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg";
}

/**
 * The three button roles used throughout the creator wizard (spec section
 * 64): Continue (primary), Back (secondary), and low-emphasis ghost actions.
 * Minimum 44px touch target on all sizes (spec section 53).
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "touch-target inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          size === "md" ? "px-6 py-3 text-sm" : "px-8 py-4 text-base",
          variant === "primary" &&
            "bg-[var(--dg-primary,#E85C7B)] text-white shadow-lg shadow-black/10 hover:brightness-110 active:scale-[0.98] focus-visible:ring-[var(--dg-primary,#E85C7B)]",
          variant === "secondary" &&
            "bg-transparent border border-current/20 text-[var(--dg-text,#241A17)] hover:bg-black/5 active:scale-[0.98]",
          variant === "ghost" &&
            "bg-transparent text-[var(--dg-text,#241A17)]/70 hover:text-[var(--dg-text,#241A17)]",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
