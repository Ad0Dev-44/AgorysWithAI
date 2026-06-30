import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "ghost" | "outline";
};

export function Button({
  size = "md",
  variant = "default",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "rounded flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400";

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const variants = {
    default: "bg-black text-white hover:bg-gray-800",
    ghost: "bg-transparent hover:bg-gray-100",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-100",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}