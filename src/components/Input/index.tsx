import type { InputHTMLAttributes } from "react";

type IInputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", ...props }: IInputProps) {
  return (
    <input
      {...props}
      className={`
        h-9
        rounded-md
        border
        border-zinc-700
        bg-black
        px-2
        text-sm
        outline-none
        focus:border-white
        ${className}
      `}
    />
  );
}
