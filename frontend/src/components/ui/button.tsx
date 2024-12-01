import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium",
    // Enhanced transitions
    "transition-all duration-200 ease-in-out",
    // Focus styles
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    // Disabled styles
    "disabled:pointer-events-none disabled:opacity-50",
    // SVG styles
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    // Hover and active transform effects
    "hover:transform hover:scale-[1.02] active:scale-[0.98]",
    // Add subtle shadow transition
    "shadow-sm hover:shadow-md",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-[#0a66c2] text-white",
          "hover:bg-[#004182]",
          "active:bg-[#00294e]",
          "focus-visible:ring-[#0a66c2]",
          // Add gradient overlay on hover
          "relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-gradient-to-t before:from-transparent before:to-white/10",
          "before:opacity-0 hover:before:opacity-100",
          "before:transition-opacity before:duration-200",
        ].join(" "),
        destructive: [
          "bg-[#cc1016] text-white",
          "hover:bg-[#a00e12]",
          "active:bg-[#800b0e]",
          "focus-visible:ring-[#cc1016]",
          // Add subtle pulse on hover
          "hover:animate-subtle-pulse",
        ].join(" "),
        outline: [
          "bg-transparent text-[#0a66c2]",
          "active:bg-[#0a66c2]/10",
          "focus-visible:ring-[#0a66c2]",
          // Smooth border transition
          "transition-[border,transform,shadow]",
          "hover:border-[#004182]",
        ].join(" "),
        // secondary: [
        //   "bg-[#f3f2ef] text-[#666666]",
        //   "hover:bg-[#e1e1e1]",
        //   "active:bg-[#d1d1d1]",
        //   "focus-visible:ring-[#0a66c2]",
        //   // Add subtle background transition
        //   "transition-[background,transform,shadow]",
        // ].join(" "),
        // link: [
        //   "text-[#0a66c2] underline-offset-4 bg-transparent",
        //   "hover:underline",
        //   "active:text-[#00294e]",
        //   // Add smooth underline animation
        //   "relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full",
        //   "after:origin-bottom-right after:scale-x-0",
        //   "hover:after:origin-bottom-left hover:after:scale-x-100",
        //   "after:transition-transform after:duration-300",
        // ].join(" "),
        iconLight: [
          "bg-white text-[#666666] border border-[#e1e1e1]",
          "hover:bg-[#f3f2ef] hover:border-[#0a66c2]/30",
          "active:bg-[#e1e1e1]",
          "focus-visible:ring-[#0a66c2]",
          // Add rotate animation for icons
          "[&_svg]:transition-transform [&_svg]:duration-200",
          "hover:[&_svg]:rotate-12",
          // Smooth border and background transitions
          "transition-[border,background,transform,shadow]",
        ].join(" "),

      },
      size: {
        default: "h-9 px-4 py-2 text-base",
        sm: [
          "h-8 px-3 text-sm",
          "rounded-md",
          // Adjust shadow for smaller size
          "shadow-sm hover:shadow",
        ].join(" "),
        lg: [
          "h-12 px-8 text-lg",
          "rounded-md",
          // Larger shadow for bigger buttons
          "shadow-md hover:shadow-lg",
        ].join(" "),
        icon: [
          "h-9 w-9",
          // Special handling for icon buttons
          "grid place-items-center",
          "[&_svg]:size-5",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Add the keyframes for the subtle pulse animation
const style = document.createElement('style');
style.textContent = `
  @keyframes subtle-pulse {
    0% { transform: scale(1.02); }
    50% { transform: scale(1.01); }
    100% { transform: scale(1.02); }
  }
  .animate-subtle-pulse {
    animation: subtle-pulse 2s infinite;
  }
`;
document.head.appendChild(style);

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
        className={cn(
          buttonVariants({ variant, size, className }),
          "relative overflow-hidden",
          "touch-none select-none",
          "user-select-none"
        )}
        onClick={(e : React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          const button = e.currentTarget;
          const ripple = document.createElement('span');
          const rect = button.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          const x = e.clientX - rect.left - size/2;
          const y = e.clientY - rect.top - size/2;
          
          ripple.style.width = ripple.style.height = `${size}px`;
          ripple.style.left = `${x}px`;
          ripple.style.top = `${y}px`;
          ripple.className = 'absolute rounded-full bg-white/30 animate-ripple pointer-events-none';
          
          button.appendChild(ripple);
          
          setTimeout(() => ripple.remove(), 600);
          
          props.onClick?.(e);
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }