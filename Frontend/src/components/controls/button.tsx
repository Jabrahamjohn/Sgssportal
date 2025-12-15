// Frontend/src/components/controls/button.tsx
import type { ReactNode } from "react";

export type ButtonVariant = "default" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonType = {
  children: ReactNode;
  onClick?: () => void | Promise<void>;
  className?: string;
  type?: "button" | "submit" | "reset";     // native button type
  htmlType?: "button" | "submit" | "reset"; // compatibility (antd-like callers)
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
  icon?: any; // allows passing AntD icons or React components
};

export default function Button({
  children,
  onClick,
  className = "",
  type = "button",
  htmlType,
  disabled = false,
  loading = false,
  block = false,
  size = "md",
  variant = "default",
  icon: Icon,
}: ButtonType) {
  const isDisabled = disabled || loading;

  const sizeCls =
    size === "sm"
      ? "px-3 py-1.5 text-xs"
      : size === "lg"
      ? "px-6 py-3 text-base"
      : "px-5 py-2.5 text-sm";

  const variantCls =
    variant === "outline"
      ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
      : variant === "ghost"
      ? "bg-transparent text-gray-700 hover:bg-gray-100"
      : variant === "danger"
      ? "bg-red-600 text-white hover:bg-red-700"
      : "bg-[var(--sgss-navy)] text-white hover:bg-[var(--sgss-gold)] hover:shadow-lg hover:shadow-yellow-500/20";

  return (
    <button
      type={htmlType ?? type}
      disabled={isDisabled}
      onClick={onClick}
      className={[
        "rounded-xl font-semibold transition-all duration-200 shadow-sm active:scale-95 inline-flex items-center justify-center gap-2",
        block ? "w-full" : "",
        sizeCls,
        isDisabled ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none" : variantCls,
        className,
      ].join(" ")}
    >
      {loading ? <span className="animate-pulse">...</span> : Icon ? <Icon /> : null}
      {children}
    </button>
  );
}
