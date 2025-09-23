import type {
  RestaurantCardBusinessHour,
  RestaurantCardCompany,
} from "@/queries/restaurant-card-query";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";
import { MapPin } from "lucide-react";

import { PublicMenuCardClient } from "./public-menu-card-client";
import { Button } from "@workspace/ui/components/button";

const DAY_LABELS: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

function getNormalizedDay(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

function buildDateWithTime(base: Date, time: string, dayOffset: number) {
  const [hours, minutes, seconds] = time
    .split(":")
    .map((value) => Number.parseInt(value ?? "0", 10));

  return new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate() + dayOffset,
    Number.isNaN(hours) ? 0 : hours,
    Number.isNaN(minutes) ? 0 : minutes,
    Number.isNaN(seconds) ? 0 : seconds,
    0
  );
}

function getSlotWindow(
  slot: RestaurantCardBusinessHour,
  now: Date,
  openDayOffset: number
) {
  const open = buildDateWithTime(now, slot.opens_at, openDayOffset);
  let close = buildDateWithTime(now, slot.closes_at, openDayOffset);

  if (slot.is_overnight || close <= open) {
    close = buildDateWithTime(now, slot.closes_at, openDayOffset + 1);
  }

  return { open, close };
}

interface BusinessWindow {
  slot: RestaurantCardBusinessHour;
  open: Date;
  close: Date;
}

interface BusinessHoursStatus {
  isOpen: boolean;
  currentWindow?: BusinessWindow;
  nextWindow?: BusinessWindow;
  timeUntilCloseMs?: number;
  timeUntilOpenMs?: number;
}

function collectBusinessWindows(
  businessHours: RestaurantCardBusinessHour[],
  now: Date
): BusinessWindow[] {
  const windows: BusinessWindow[] = [];

  for (let dayOffset = -1; dayOffset <= 7; dayOffset += 1) {
    const targetDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + dayOffset
    );
    const normalizedDay = getNormalizedDay(targetDate);

    businessHours.forEach((slot) => {
      if (slot.day_of_week !== normalizedDay) {
        return;
      }

      const window = getSlotWindow(slot, now, dayOffset);
      windows.push({ slot, ...window });
    });
  }

  return windows.sort((a, b) => a.open.getTime() - b.open.getTime());
}

function getBusinessHoursStatus(
  businessHours: RestaurantCardBusinessHour[] | null | undefined,
  now: Date = new Date()
): BusinessHoursStatus {
  if (!businessHours?.length) {
    return { isOpen: false };
  }

  const windows = collectBusinessWindows(businessHours, now);

  const currentWindow = windows.find(
    (window) => now >= window.open && now <= window.close
  );

  if (currentWindow) {
    const timeUntilCloseMs = currentWindow.close.getTime() - now.getTime();
    const nextWindow = windows.find(
      (window) => window.open > currentWindow.close
    );

    return {
      isOpen: true,
      currentWindow,
      nextWindow,
      timeUntilCloseMs,
    };
  }

  const nextWindow = windows.find((window) => window.open > now);

  return {
    isOpen: false,
    nextWindow,
    timeUntilOpenMs: nextWindow
      ? nextWindow.open.getTime() - now.getTime()
      : undefined,
  };
}

function formatTime(value: string) {
  return value?.slice(0, 5) || "--";
}

function formatTimeRange(slot: RestaurantCardBusinessHour) {
  return `${formatTime(slot.opens_at)} - ${formatTime(slot.closes_at)}`;
}

function formatBusinessHours(
  businessHours: RestaurantCardBusinessHour[] | null | undefined
) {
  if (!businessHours?.length) {
    return [];
  }

  const sorted = [...businessHours].sort((a, b) => {
    if (a.day_of_week !== b.day_of_week) {
      return a.day_of_week - b.day_of_week;
    }

    if (a.sequence !== b.sequence) {
      return a.sequence - b.sequence;
    }

    return a.opens_at.localeCompare(b.opens_at);
  });

  const grouped = new Map<number, string[]>();

  sorted.forEach((slot) => {
    const existing = grouped.get(slot.day_of_week) ?? [];
    grouped.set(slot.day_of_week, [...existing, formatTimeRange(slot)]);
  });

  return Array.from({ length: 7 }, (_, index) => {
    const dayNumber = index + 1;
    const ranges = grouped.get(dayNumber) ?? [];

    return {
      dayNumber,
      dayLabel: DAY_LABELS[dayNumber],
      ranges,
    };
  });
}

function formatDuration(milliseconds: number | undefined) {
  if (!milliseconds || milliseconds <= 0) {
    return null;
  }

  const totalMinutes = Math.floor(milliseconds / 60000);

  if (totalMinutes <= 0) {
    return null;
  }

  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const pad = (value: number) => value.toString().padStart(2, "0");

  if (days >= 1) {
    return `${days}J ${pad(hours)}H ${pad(minutes)}M`;
  }

  if (hours >= 1) {
    return `${pad(hours)}H ${pad(minutes)}M`;
  }

  return `${pad(minutes)}M`;
}

function buildAddressLine(address: RestaurantCardCompany["address"]) {
  if (!address) {
    return null;
  }

  const line = address.line?.trim();
  const locality = [address.postal_code, address.city]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
  const country = address.country?.trim();

  const parts = [line, locality, country].filter(Boolean) as string[];

  if (!parts.length) {
    return null;
  }

  return parts.join(", ");
}

function buildGoogleMapsUrl(address: RestaurantCardCompany["address"]) {
  if (!address) {
    return null;
  }

  const queryParts = [
    address.line,
    address.postal_code,
    address.city,
    address.country,
  ]
    .map((part) => part?.trim())
    .filter(Boolean);

  if (!queryParts.length) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryParts.join(" "))}`;
}

interface PublicMenuCardProps {
  company: RestaurantCardCompany;
}

export function PublicMenuCard({ company }: PublicMenuCardProps) {
  const displayName = company.name || "Restaurant";
  const initials = displayName.trim().slice(0, 2).toUpperCase() || "KH";
  const slugOrUrl = company.slug || company.public_menu_card_url;
  const showImages =
    company.settings?.show_menu_images ?? company.show_menu_images ?? true;
  const menus = company.menus ?? [];
  const businessHoursStatus = getBusinessHoursStatus(company.business_hours);
  const isOpen = businessHoursStatus.isOpen;
  const addressLine = buildAddressLine(company.address);
  const mapsUrl = buildGoogleMapsUrl(company.address);
  const hasBusinessHours = (company.business_hours?.length ?? 0) > 0;
  const contact = company.contact;
  const hasContactInfo = Boolean(
    contact?.name || contact?.email || contact?.phone
  );
  const formattedBusinessHours = formatBusinessHours(company.business_hours);
  const timeUntilCloseLabel = formatDuration(
    businessHoursStatus.timeUntilCloseMs
  );
  const timeUntilOpenLabel = formatDuration(
    businessHoursStatus.timeUntilOpenMs
  );
  const badgeLabel = isOpen
    ? timeUntilCloseLabel
      ? `Open · closes in ${timeUntilCloseLabel}`
      : "Open"
    : timeUntilOpenLabel
      ? `Closed · opens in ${timeUntilOpenLabel}`
      : "Closed";

  return (
    <div className="min-h-svh bg-slate-100 text-slate-900 scroll-smooth">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="mx-auto flex max-w-4xl flex-col gap-2 px-6 pt-8 pb-2 text-center">
          <Avatar className="mx-auto size-14">
            <AvatarImage alt={displayName} src={company.logo_url || ""} />
            <AvatarFallback className="bg-slate-900 text-white text-xl font-semibold uppercase">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-3xl font-bold tracking-tight">{displayName}</h1>
          {hasBusinessHours ? (
            <div className="flex items-center justify-center gap-2">
              <Badge
                variant={isOpen ? "success" : "destructive"}
                className="rounded-md"
              >
                {badgeLabel}
              </Badge>
            </div>
          ) : null}
          {(slugOrUrl || hasBusinessHours) && (
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500">
              {slugOrUrl ? <p>@{slugOrUrl}</p> : null}
            </div>
          )}
          {addressLine ? (
            mapsUrl ? (
              <div className="flex items-center justify-center gap-2">
                <MapPin className="size-4 text-slate-400" />
                <Button variant="link" size="sm" asChild>
                  <a
                    className="text-sm text-slate-500 transition hover:text-slate-700"
                    href={mapsUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {addressLine}
                  </a>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-slate-500">{addressLine}</p>
            )
          ) : null}
          {company.contact?.phone ? (
            <Button variant="link" size="sm" asChild>
              <a
                className="text-sm text-slate-500 transition hover:text-slate-700"
                href={`tel:${company.contact.phone}`}
              >
                {company.contact.phone}
              </a>
            </Button>
          ) : null}
        </div>
        <div className="border-t border-slate-200 bg-slate-50 py-2 text-center text-xs text-slate-500">
          <Button variant="link" size="sm" asChild>
            <a href="#more-details">More details</a>
          </Button>
        </div>
      </header>

      <PublicMenuCardClient
        companyData={{
          name: displayName,
          slug: slugOrUrl,
        }}
        menus={menus}
        showImages={showImages}
      />
      <footer
        className="mt-12 border-t border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500"
        id="more-details"
      >
        <div
          className={cn(
            "flex justify-between gap-8 mb-4 max-w-4xl mx-auto",
            !hasBusinessHours && !hasContactInfo && "hidden"
          )}
        >
          {hasContactInfo ? (
            <div className="text-left space-y-2">
              <p className="text-sm font-semibold text-slate-800">Contact</p>
              {contact?.name ? (
                <p className="text-sm text-slate-700">{contact.name}</p>
              ) : null}
              {contact?.email ? (
                <a
                  className="block text-sm text-slate-600 transition hover:text-slate-800"
                  href={`mailto:${contact.email}`}
                >
                  {contact.email}
                </a>
              ) : null}
              {contact?.phone ? (
                <a
                  className="block text-sm text-slate-600 transition hover:text-slate-800"
                  href={`tel:${contact.phone}`}
                >
                  {contact.phone}
                </a>
              ) : null}
            </div>
          ) : null}

          {hasBusinessHours ? (
            <div className="space-y-2 text-left">
              <p className="text-sm font-semibold text-slate-800">
                Business hours
              </p>
              <ul className="space-y-1">
                {formattedBusinessHours.map(
                  ({ dayNumber, dayLabel, ranges }) => (
                    <li
                      key={dayNumber}
                      className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-sm"
                    >
                      <span className="font-medium text-slate-700">
                        {dayLabel}
                      </span>
                      <span
                        className={cn(
                          "text-slate-600",
                          ranges.length ? "" : "font-medium"
                        )}
                      >
                        {ranges.length ? ranges.join(", ") : "Closed"}
                      </span>
                    </li>
                  )
                )}
              </ul>
            </div>
          ) : null}
        </div>
        <p>
          Powered by{" "}
          <a
            className="text-slate-600 font-semibold hover:underline"
            href="https://goofykhp.fr"
            target="_blank"
            rel="noopener noreferrer"
          >
            KHP
          </a>
        </p>
      </footer>
    </div>
  );
}
