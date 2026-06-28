import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "md" | "lg";
};

export function Button({
  size = "md",
  className,
  ...props
}: ButtonProps) {
  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={
        "rounded bg-black text-white hover:bg-gray-800 flex items-center justify-center " +
        sizes[size] +
        " " +
        (className || "")
      }
      {...props}
    />
  );
}