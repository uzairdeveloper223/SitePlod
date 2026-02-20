import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-12 w-full bg-transparent border-0 border-b-2 border-gold/50 px-3 py-2 text-base text-champagne transition-all duration-300 outline-none placeholder:text-pewter file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50",
        "focus:border-gold focus:shadow-[0_4px_12px_rgba(212,175,55,0.15)]",
        "aria-invalid:border-destructive aria-invalid:focus:shadow-[0_4px_12px_rgba(220,53,69,0.15)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
