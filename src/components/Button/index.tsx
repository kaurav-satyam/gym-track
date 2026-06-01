import type { ReactNode } from "react";

interface IButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "success" | "danger" | "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
}: IButtonProps) {
  const variantClasses = {
    success: "bg-green-600 text-white",
    danger: "bg-red-600 text-white",
    primary: "bg-blue-600 text-white",
    secondary: " bg-zinc-800 text-zinc-400",
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`
        flex
        items-center
        justify-center
        rounded-md
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        disabled:opacity-50
      `}
    >
      {children}
    </button>
  );
}
