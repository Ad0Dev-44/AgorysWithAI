import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "ghost" | "outline" | "destructive";
};

export function Button({
  size = "md",
  variant = "default",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };

  const variants = {
  default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",

  ghost:
    "bg-transparent text-foreground hover:bg-secondary",

  outline:
    "border border-border bg-transparent text-foreground hover:bg-secondary",

  destructive:
    "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
};

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}