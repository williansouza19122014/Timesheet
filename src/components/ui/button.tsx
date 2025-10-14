import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-gradient-to-r from-[#7355f6] to-[#a26cff] text-white shadow-[0_10px_25px_-12px_rgba(115,85,246,0.6)] hover:from-[#6245f6] hover:to-[#8f5cff] focus-visible:ring-white/40 dark:focus-visible:ring-[#4c43f6]/40",
        outline:
          "border border-slate-300 bg-white/80 text-slate-600 shadow-sm backdrop-blur-sm hover:border-accent/60 hover:text-accent dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-[#6b67ff]/50 dark:hover:text-white",
        subtle:
          "border border-transparent bg-slate-100/80 text-slate-700 shadow-sm hover:bg-slate-200/80 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-700/60",
        ghost:
          "border border-transparent bg-transparent text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white",
        destructive:
          "border border-transparent bg-red-500 text-white shadow-sm hover:bg-red-500/90",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-2xl px-7",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

