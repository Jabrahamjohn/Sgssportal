// Frontend/src/components/loader/skeleton.tsx
import React from "react";

export default function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}
