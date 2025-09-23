"use client";

import {
  useBusinessHoursCountdown,
  type BusinessHour,
} from "@/hooks/use-business-hours-countdown";

interface BusinessHoursStatusProps {
  businessHours: BusinessHour[] | undefined;
  className?: string;
}

export function BusinessHoursStatus({
  businessHours,
  className,
}: BusinessHoursStatusProps) {
  const { isOpen, timeUntilNext, nextEvent, currentStatus } =
    useBusinessHoursCountdown(businessHours);

  if (!businessHours || businessHours.length === 0) {
    return null;
  }

  return (
    <div className={`text-center ${className}`}>
      {timeUntilNext && nextEvent && (
        <div className="text-sm text-khp-text-secondary text-center">
          <div className="mb-1 flex items-center justify-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isOpen ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span
              className={`font-medium ${
                isOpen ? "text-green-600" : "text-red-600"
              }`}
            >
              {currentStatus}
            </span>
            <span className="mx-1">•</span>
            <span>{nextEvent === "opens" ? "Opens in" : "Closes in"}</span>
          </div>
          <div className="font-semibold text-khp-primary font-mono">
            {timeUntilNext}
          </div>
        </div>
      )}
    </div>
  );
}
