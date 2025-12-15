// Frontend/src/components/controls/badge.tsx
import type { ReactNode } from "react";

export type BadgeVariant = "neutral" | "info" | "success" | "warning" | "danger";
export type BadgeColor = "gray" | "blue" | "green" | "red" | "yellow";

interface BadgeProps {
  children: ReactNode;
  // legacy
  color?: BadgeColor;
  // app uses this everywhere
  variant?: BadgeVariant;
  className?: string;
}

export default function Badge({
  children,
  color,
  variant,
  className = "",
}: BadgeProps) {
  const variantMap: Record<BadgeVariant, string> = {
    neutral: "bg-gray-100 text-gray-700",
    info: "bg-blue-100 text-blue-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-700",
  };

  const colorMap: Record<BadgeColor, string> = {
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-800",
  };

  const cls = variant
    ? variantMap[variant]
    : color
    ? colorMap[color]
    : variantMap.info;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls} ${className}`}>
      {children}
    </span>
  );
}
