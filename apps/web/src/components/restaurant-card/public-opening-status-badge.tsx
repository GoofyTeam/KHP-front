'use client';

import { useEffect, useMemo, useState } from 'react';

import type { RestaurantCardBusinessHour } from '@/queries/restaurant-card-query';
import { Badge } from '@workspace/ui/components/badge';

import {
  formatDuration,
  getBusinessHoursStatus,
} from './public-business-hours';

const REFRESH_INTERVAL_MS = 60_000;

interface PublicOpeningStatusBadgeProps {
  businessHours: RestaurantCardBusinessHour[] | null | undefined;
}

export function PublicOpeningStatusBadge({
  businessHours,
}: PublicOpeningStatusBadgeProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const status = useMemo(
    () => getBusinessHoursStatus(businessHours, now),
    [businessHours, now]
  );

  if (!businessHours?.length) {
    return null;
  }

  const timeUntilCloseLabel = formatDuration(status.timeUntilCloseMs);
  const timeUntilOpenLabel = formatDuration(status.timeUntilOpenMs);
  const badgeLabel = status.isOpen
    ? timeUntilCloseLabel
      ? `Open · closes in ${timeUntilCloseLabel}`
      : 'Open'
    : timeUntilOpenLabel
      ? `Closed · opens in ${timeUntilOpenLabel}`
      : 'Closed';

  return (
    <Badge variant={status.isOpen ? 'success' : 'destructive'}>
      {badgeLabel}
    </Badge>
  );
}
