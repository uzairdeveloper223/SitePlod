import * as React from "react"
import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "relative bg-charcoal text-champagne flex flex-col border border-gold/30 transition-all duration-500 hover:border-gold hover:-translate-y-1 hover:shadow-gold group",
        className
      )}
      {...props}
    />
  )
}

function CardCornerDecorations({ className }: { className?: string }) {
  return (
    <>
      <div className={cn("absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-gold/50 transition-all duration-300 group-hover:border-gold group-hover:opacity-100", className)} aria-hidden="true" />
      <div className={cn("absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-gold/50 transition-all duration-300 group-hover:border-gold group-hover:opacity-100", className)} aria-hidden="true" />
    </>
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col space-y-1.5 p-6 border-b border-gold/20",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn(
        "font-display text-2xl leading-none text-gold uppercase tracking-widest",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-pewter text-sm leading-relaxed", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("absolute top-4 right-4", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("p-6 pt-0", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center p-6 pt-0 border-t border-gold/20", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardCornerDecorations,
}
