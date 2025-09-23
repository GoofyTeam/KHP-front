"use client";

import React, { useTransition, useEffect, useState } from "react";
import { useQuery, useApolloClient } from "@apollo/client";
import { Button } from "@workspace/ui/components/button";
import { Switch } from "@workspace/ui/components/switch";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { toast } from "sonner";
import { updateCompanyBusinessHoursAction } from "@/app/(mainapp)/settings/company/actions";
import { GetCompanyOptionsDocument } from "@workspace/graphql";

const DAYS_OF_WEEK = [
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
  { value: 7, label: "Sunday", short: "Sun" },
];

interface DayHours {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  isOvernight: boolean;
}

// Générer les options d'heures et de minutes
const generateTimeOptions = () => {
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
  const minutes = ["00", "15", "30", "45"];
  return { hours, minutes };
};

const { hours: hourOptions, minutes: minuteOptions } = generateTimeOptions();

interface TimeSelectorProps {
  value: string; // Format HH:MM
  onChange: (time: string) => void;
  label: string;
}

function TimeSelector({ value, onChange, label }: TimeSelectorProps) {
  const [hour, minute] = value.split(":");

  const handleHourChange = (newHour: string) => {
    onChange(`${newHour}:${minute}`);
  };

  const handleMinuteChange = (newMinute: string) => {
    onChange(`${hour}:${newMinute}`);
  };

  return (
    <div className="flex flex-col">
      <span className="text-xs text-khp-text/60 mb-2">{label}</span>
      <div className="flex gap-1">
        <Select value={hour} onValueChange={handleHourChange}>
          <SelectTrigger className="w-20 h-9 text-sm font-mono bg-khp-surface border-khp-primary/20 focus:border-khp-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {hourOptions.map((h) => (
              <SelectItem key={h} value={h} className="font-mono">
                {h}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="flex items-center text-khp-text/50 font-mono">:</span>

        <Select value={minute} onValueChange={handleMinuteChange}>
          <SelectTrigger className="w-20 h-9 text-sm font-mono bg-khp-surface border-khp-primary/20 focus:border-khp-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {minuteOptions.map((m) => (
              <SelectItem key={m} value={m} className="font-mono">
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function BusinessHoursSection() {
  const apolloClient = useApolloClient();
  const { data } = useQuery(GetCompanyOptionsDocument, {
    fetchPolicy: "network-only",
    errorPolicy: "all",
    notifyOnNetworkStatusChange: true,
  });
  const [isPending, startTransition] = useTransition();

  // État local pour gérer les horaires de chaque jour
  const [weekHours, setWeekHours] = useState<Record<number, DayHours>>({
    1: {
      isOpen: false,
      openTime: "09:00",
      closeTime: "18:00",
      isOvernight: false,
    },
    2: {
      isOpen: false,
      openTime: "09:00",
      closeTime: "18:00",
      isOvernight: false,
    },
    3: {
      isOpen: false,
      openTime: "09:00",
      closeTime: "18:00",
      isOvernight: false,
    },
    4: {
      isOpen: false,
      openTime: "09:00",
      closeTime: "18:00",
      isOvernight: false,
    },
    5: {
      isOpen: false,
      openTime: "09:00",
      closeTime: "18:00",
      isOvernight: false,
    },
    6: {
      isOpen: false,
      openTime: "09:00",
      closeTime: "18:00",
      isOvernight: false,
    },
    7: {
      isOpen: false,
      openTime: "09:00",
      closeTime: "18:00",
      isOvernight: false,
    },
  });

  useEffect(() => {
    if (data?.me?.company?.businessHours) {
      const hours = data.me.company.businessHours;

      // Initialize all days as closed
      const newWeekHours: Record<number, DayHours> = {
        1: {
          isOpen: false,
          openTime: "09:00",
          closeTime: "18:00",
          isOvernight: false,
        },
        2: {
          isOpen: false,
          openTime: "09:00",
          closeTime: "18:00",
          isOvernight: false,
        },
        3: {
          isOpen: false,
          openTime: "09:00",
          closeTime: "18:00",
          isOvernight: false,
        },
        4: {
          isOpen: false,
          openTime: "09:00",
          closeTime: "18:00",
          isOvernight: false,
        },
        5: {
          isOpen: false,
          openTime: "09:00",
          closeTime: "18:00",
          isOvernight: false,
        },
        6: {
          isOpen: false,
          openTime: "09:00",
          closeTime: "18:00",
          isOvernight: false,
        },
        7: {
          isOpen: false,
          openTime: "09:00",
          closeTime: "18:00",
          isOvernight: false,
        },
      };

      // Set open days from API data
      hours.forEach((hour) => {
        newWeekHours[hour.day_of_week] = {
          isOpen: true,
          openTime: hour.opens_at,
          closeTime: hour.closes_at,
          isOvernight: hour.is_overnight || false,
        };
      });

      setWeekHours(newWeekHours);
    }
  }, [data]);

  const handleSave = () => {
    // Convertir l'état local en format API
    const business_hours = Object.entries(weekHours)
      .filter(([, dayHours]) => dayHours.isOpen)
      .map(([day, dayHours]) => ({
        day_of_week: parseInt(day),
        opens_at: dayHours.openTime,
        closes_at: dayHours.closeTime,
        is_overnight: dayHours.isOvernight,
      }));

    startTransition(async () => {
      try {
        const result = await updateCompanyBusinessHoursAction({
          business_hours,
        });

        if (result.success) {
          toast.success("Business hours updated successfully");
          await apolloClient.refetchQueries({
            include: [GetCompanyOptionsDocument],
            updateCache(cache) {
              cache.evict({ fieldName: "me" });
            },
          });
        } else {
          toast.error(result.error || "An error occurred");
        }
      } catch {
        toast.error("An unexpected error occurred");
      }
    });
  };

  const updateDayHours = (day: number, updates: Partial<DayHours>) => {
    setWeekHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], ...updates },
    }));
  };

  const copyToAllDays = (sourceDay: number) => {
    const sourceHours = weekHours[sourceDay];
    const newWeekHours = { ...weekHours };

    Object.keys(newWeekHours).forEach((day) => {
      const dayNum = parseInt(day);
      if (dayNum !== sourceDay) {
        newWeekHours[dayNum] = { ...sourceHours };
      }
    });

    setWeekHours(newWeekHours);
  };

  return (
    <div className="bg-khp-surface rounded-2xl shadow-lg border border-khp-primary/20 overflow-hidden">
      <div className="bg-gradient-to-r from-khp-primary/5 to-khp-primary/10 px-6 py-5 border-b border-khp-primary/20">
        <h2 className="text-xl font-semibold text-khp-primary">
          Business Hours
        </h2>
        <p className="text-sm text-khp-text/70 mt-1">
          Set your opening hours for each day of the week
        </p>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-4">
          {DAYS_OF_WEEK.map((day) => {
            const dayHours = weekHours[day.value];
            return (
              <div
                key={day.value}
                className="flex items-center gap-6 p-5 border rounded-xl bg-gradient-to-r from-white/50 to-transparent hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center space-x-3 w-28">
                  <Checkbox
                    checked={dayHours.isOpen}
                    onCheckedChange={(checked) =>
                      updateDayHours(day.value, { isOpen: !!checked })
                    }
                    className="border-khp-primary/30 data-[state=checked]:bg-khp-primary data-[state=checked]:border-khp-primary"
                  />
                  <span className="font-semibold text-khp-text">
                    {day.label}
                  </span>
                </div>

                {dayHours.isOpen ? (
                  <>
                    <div className="flex items-center gap-4">
                      <TimeSelector
                        value={dayHours.openTime}
                        onChange={(time) =>
                          updateDayHours(day.value, { openTime: time })
                        }
                        label="Opens"
                      />
                      <div className="flex items-center justify-center">
                        <span className="text-sm text-khp-text/50 font-medium">
                          —
                        </span>
                      </div>
                      <TimeSelector
                        value={dayHours.closeTime}
                        onChange={(time) =>
                          updateDayHours(day.value, { closeTime: time })
                        }
                        label="Closes"
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2 bg-khp-primary/5 px-3 py-2 rounded-lg">
                        <Switch
                          checked={dayHours.isOvernight}
                          onCheckedChange={(checked) =>
                            updateDayHours(day.value, { isOvernight: checked })
                          }
                          className="data-[state=checked]:bg-khp-primary"
                        />
                        <span className="text-sm font-medium text-khp-text">
                          Overnight
                        </span>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => copyToAllDays(day.value)}
                        className="text-xs font-medium border-khp-primary/20 text-khp-primary hover:bg-khp-primary hover:text-white transition-colors"
                      >
                        Copy to all
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center">
                    <span className="text-khp-text/40 italic font-medium bg-gray-50 px-4 py-2 rounded-lg">
                      Closed
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-khp-primary/10">
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="w-full bg-khp-primary hover:bg-khp-primary/90 text-white"
          >
            {isPending ? "Saving..." : "Save Business Hours"}
          </Button>
        </div>
      </div>
    </div>
  );
}
