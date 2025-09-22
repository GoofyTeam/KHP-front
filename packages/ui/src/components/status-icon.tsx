import { AlertTriangle, XCircle } from "lucide-react";

export interface StatusIconProps {
  status: string;
  className?: string;
}

export function StatusIcon({ status, className }: StatusIconProps) {
  if (status === "expired") {
    return (
      <XCircle
        className={`h-4 w-4 text-khp-error ${className || ""}`}
        aria-hidden
      />
    );
  }
  return (
    <AlertTriangle
      className={`h-4 w-4 text-khp-warning ${className || ""}`}
      aria-hidden
    />
  );
}
