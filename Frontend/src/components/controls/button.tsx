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
      className={`px-4 py-2.5 rounded-lg font-medium transition text-sm ${className} ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      {children}
    </button>
  );
}
