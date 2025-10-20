import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { label?: string };

export default function Button3D({ label, children, className = "", ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`rounded-2xl px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow active:translate-y-[1px] ${className}`}
    >
      {children ?? label}
    </button>
  );
}
