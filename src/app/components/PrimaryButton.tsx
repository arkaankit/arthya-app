import React from "react";

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
}

// The single filled Signal Orange action per screen (Obscura "Primary CTA").
export function PrimaryButton({ children, icon, className = "", ...props }: PrimaryButtonProps) {
  return (
    <button
      className={`h-9 px-4 rounded-md shrink-0 whitespace-nowrap inline-flex items-center justify-center gap-2 bg-orange-500 text-white text-sm font-medium shadow-pressed transition-colors hover:bg-orange-600 disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
