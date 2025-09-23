"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GetBusinessHoursDocument } from "@workspace/graphql";
import { BusinessHoursStatus } from "@/components/BusinessHoursStatus";
import { formatTime, formatLongDate } from "@workspace/ui/lib/date-utils";

interface LiveWelcomePanelProps {
  className?: string;
}

export function LiveWelcomePanel({ className }: LiveWelcomePanelProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch business hours directly in this component
  const { data: businessHoursData } = useQuery(GetBusinessHoursDocument, {
    errorPolicy: "all",
  });

  useEffect(() => {
    // Update time every second for live display
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const currentDateString = currentTime.toISOString();
  const currentDate = formatLongDate(currentDateString, "en-US");
  const currentTimeFormatted = formatTime(currentDateString, "en-US");

  return (
    <section
      className={`rounded-md border border-khp-primary/30 bg-white shadow-sm pt-2 flex flex-col min-h-0 ${className}`}
      aria-label="Welcome"
    >
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold text-khp-text-primary mb-4">
          Welcome
        </h2>
        <div className="text-center">
          <p className="text-lg text-khp-text-secondary mb-2">{currentDate}</p>
          <p className="text-xl font-semibold text-khp-primary mb-4">
            {currentTimeFormatted}
          </p>
          <BusinessHoursStatus
            businessHours={businessHoursData?.me?.company?.businessHours}
            className="mt-4"
          />
        </div>
      </div>
    </section>
  );
}
