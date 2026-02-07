"use client";

import { Button } from "@/components/ui/button";

interface ScanButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "outline";
  className?: string;
}

export function ScanButton({
  onClick,
  disabled = false,
  variant = "default",
  className,
}: ScanButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      className={`flex items-center gap-2 ${className || ""}`}
    >
      <span className="text-xl">📸</span>
      <span>Scanner un ticket</span>
    </Button>
  );
}
