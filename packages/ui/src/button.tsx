"use client";

import { ReactNode } from "react";

interface ButtonProps {
  variant?: "primary" | "outline" | "secondary";
  className?: string;
  onClick?: () => void;
  size?: "lg" | "sm";
  children: ReactNode;
}

export const Button = ({
  size = "lg",
  variant = "primary",
  className = "",
  onClick,
  children,
}: ButtonProps) => {
  const baseStyles =
    "rounded font-medium cursor-pointer transition-colors duration-200";

  const variants = {
    primary: "bg-green-500 text-white hover:bg-green-600",
    secondary: "bg-gray-500 text-white hover:bg-gray-600",
    outline: "border-2 border-green-500 text-green-500 hover:bg-green-50",
  };

  const sizes = {
    lg: "px-4 py-2 text-base",
    sm: "px-2 py-1 text-sm",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
