import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent text-sm font-semibold tracking-normal shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition-[background-color,border-color,color,box-shadow,transform] duration-150 outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary text-primary-foreground shadow-[0_8px_18px_rgba(0,80,48,0.14)] hover:border-primary/95 hover:bg-primary/95 hover:shadow-[0_10px_24px_rgba(0,80,48,0.18)]",
        destructive:
          "border-destructive bg-destructive text-white hover:bg-destructive/90 hover:shadow-[0_8px_18px_rgba(220,38,38,0.14)] focus-visible:ring-destructive/25 dark:bg-destructive/60",
        outline:
          "border-border/70 bg-background text-foreground shadow-[0_1px_3px_rgba(16,24,40,0.06)] hover:border-primary/35 hover:bg-primary/[0.04] hover:text-foreground hover:shadow-[0_4px_12px_rgba(16,24,40,0.08)] dark:border-border/70 dark:bg-muted/20 dark:hover:bg-muted/40",
        secondary:
          "border-border/60 bg-muted/65 text-foreground hover:border-border hover:bg-muted hover:shadow-[0_4px_12px_rgba(16,24,40,0.07)]",
        ghost:
          "border-transparent bg-transparent shadow-none hover:bg-primary/[0.06] hover:text-primary",
        link: "border-transparent bg-transparent p-0 text-primary shadow-none underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3.5",
        sm: "h-9 gap-1.5 px-3.5 has-[>svg]:px-3",
        lg: "h-11 px-5 has-[>svg]:px-4",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
