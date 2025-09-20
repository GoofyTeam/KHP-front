import type { RestaurantCardCompany } from "@/queries/restaurant-card-query";

import { PublicMenuCardClient } from "./public-menu-card-client";

interface PublicMenuCardProps {
  company: RestaurantCardCompany;
}

export function PublicMenuCard({ company }: PublicMenuCardProps) {
  const displayName = company.name || "Restaurant";
  const initials = displayName.trim().slice(0, 2).toUpperCase() || "KH";
  const slugOrUrl = company.slug || company.public_menu_card_url;
  const showImages = company.show_menu_images ?? true;
  const menus = company.menus ?? [];

  return (
    <div className="min-h-svh bg-slate-100 text-slate-900">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="mx-auto flex max-w-4xl flex-col gap-2 px-6 py-8 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-slate-900 text-white text-xl font-semibold uppercase">
            {initials}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{displayName}</h1>
          {slugOrUrl ? (
            <p className="text-sm text-slate-500">@{slugOrUrl}</p>
          ) : null}
          <p className="text-sm text-slate-600">
            Explore this restaurant&apos;s public menu card.
          </p>
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
    </div>
  );
}
