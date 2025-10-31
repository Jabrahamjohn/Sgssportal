import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  color?: "gray" | "blue" | "green" | "red" | "yellow";
  className?: string;
}

export default function Badge({
  children,
  color = "blue",
  className = "",
}: BadgeProps) {
  const colorMap = {
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorMap[color]} ${className}`}
    >
      {children}
    </span>
  );
}
