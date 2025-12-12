import React from "react";

export default function Button({
  children,
  onClick,
  className = "",
  type = "button",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 text-sm shadow-sm active:scale-95 ${
        disabled 
          ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none" 
          : "bg-[var(--sgss-navy)] hover:bg-[var(--sgss-gold)] text-white hover:shadow-lg hover:shadow-yellow-500/20"
      } ${className}`}
    >
      {children}
    </button>
  );
}
