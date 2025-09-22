"use client";

import { useEffect, useState } from "react";

export const RenderDateWithMinutesAndSeconds = ({
  locale = "en-US",
}: {
  locale?: string;
}) => {
  const [actualTime, setActualTime] = useState(new Date());

  useEffect(() => {
    if (!locale) {
      console.warn(
        "No locale provided to RenderDateWithMinutesAndSeconds, using default locale"
      );
    }

    const interval = setInterval(() => {
      setActualTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [locale]);

  return (
    <span>
      {actualTime.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })}
    </span>
  );
};

export const RenderDateWithMinutes = ({
  locale = "en-US",
}: {
  locale?: string;
}) => {
  const [actualTime, setActualTime] = useState(new Date());

  useEffect(() => {
    if (!locale) {
      console.warn(
        "No locale provided to RenderDateWithMinutes, using default locale"
      );
    }

    const interval = setInterval(() => {
      setActualTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [locale]);

  return (
    <span>
      {actualTime.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}
    </span>
  );
};
