'use client';

import { AutoBreadcrumb } from '@/components/auto-breadcrumb';

export default function LossBreadcrumb() {
  return (
    <AutoBreadcrumb
      listClassName="text-xl font-semibold"
      lastLabel="Loss"
      isLink={(href) => href !== '/loss'}
      overrides={{ loss: 'Losses' }}
    />
  );
}

