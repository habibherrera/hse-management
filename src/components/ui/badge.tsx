import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/10 text-primary",
        secondary: "border-transparent bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
        destructive: "border-transparent bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400",
        outline: "text-foreground border-border",
        success: "border-transparent bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
        warning: "border-transparent bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
        danger: "border-transparent bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
