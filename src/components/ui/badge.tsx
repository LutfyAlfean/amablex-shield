import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        // Risk level variants
        critical:
          "border-transparent bg-risk-critical text-white shadow",
        high:
          "border-transparent bg-risk-high text-white shadow",
        medium:
          "border-transparent bg-risk-medium text-black shadow",
        low:
          "border-transparent bg-risk-low text-white shadow",
        info:
          "border-transparent bg-risk-info text-white shadow",
        // Tag variants
        scanner:
          "border-primary/30 bg-primary/10 text-primary",
        bruteforce:
          "border-destructive/30 bg-destructive/10 text-destructive",
        suspicious:
          "border-warning/30 bg-warning/10 text-warning",
        watchlist:
          "border-risk-high/30 bg-risk-high/10 text-risk-high",
        false_positive:
          "border-muted-foreground/30 bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
