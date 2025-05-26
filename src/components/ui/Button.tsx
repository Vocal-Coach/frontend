"use client";

import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "primary" | "secondary" | "icon" | "toggle";
  size?: "small" | "medium" | "large";
  isActive?: boolean;
  className?: string;
  title?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  size = "medium",
  isActive = false,
  className = "",
  title,
  disabled = false,
}) => {
  const baseStyles = "transition-all font-medium rounded-md focus:outline-none";

  const variantStyles = {
    primary: disabled
      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
      : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md",
    secondary: disabled
      ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
    icon: disabled
      ? "bg-transparent text-gray-400 cursor-not-allowed rounded-full p-2"
      : "bg-transparent text-gray-700 hover:bg-gray-100 rounded-full p-2",
    toggle: disabled
      ? isActive
        ? "bg-gray-400 text-gray-200 border-gray-400 cursor-not-allowed"
        : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
      : isActive
      ? "bg-indigo-600 text-white border-indigo-600"
      : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200",
  };

  const sizeStyles = {
    small: "py-1 px-3 text-sm",
    medium: "py-2 px-4 text-base",
    large: "py-3 px-6 text-lg",
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      title={title}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
