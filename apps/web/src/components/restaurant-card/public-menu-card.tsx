import type {
  RestaurantCardCompany,
  RestaurantCardMenu,
} from "@/queries/restaurant-card-query";

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

function formatPrice(price: number | string): string {
  const numericPrice =
    typeof price === "number" ? price : Number.parseFloat(price);

  if (Number.isNaN(numericPrice)) {
    return "--";
  }
  return priceFormatter.format(numericPrice);
}

interface PublicMenuCardProps {
  company: RestaurantCardCompany;
}

export function PublicMenuCard({ company }: PublicMenuCardProps) {
  const showImages = company.show_menu_images ?? true;
  const menus = company.menus || [];
  const displayName = company.name || "Restaurant";
  const initials = displayName.trim().slice(0, 2).toUpperCase();

  return (
    <div className="min-h-svh bg-slate-100 text-slate-900">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="mx-auto flex max-w-4xl flex-col gap-2 px-6 py-8 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-slate-900 text-white text-xl font-semibold uppercase">
            {initials || "KH"}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{displayName}</h1>
          {company.slug || company.public_menu_card_url ? (
            <p className="text-sm text-slate-500">
              @{company.slug || company.public_menu_card_url}
            </p>
          ) : null}
          <p className="text-sm text-slate-600">
            Régalez-vous avec nos délicieuses sélections de menus !
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        {menus.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-slate-700">
              Aucun menu disponible pour le moment
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Revenez plus tard pour découvrir les créations de ce restaurant.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {menus.map((menu) => (
              <MenuItemCard key={menu.id} menu={menu} showImage={showImages} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

interface MenuItemCardProps {
  menu: RestaurantCardMenu;
  showImage: boolean;
}

function MenuItemCard({ menu, showImage }: MenuItemCardProps) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md sm:flex-row">
      {showImage && menu.image_url ? (
        <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-slate-100 sm:w-44">
          <img
            src={menu.image_url}
            alt={menu.name}
            className="size-full object-cover"
            loading="lazy"
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-slate-900">
              {menu.name}
            </h3>
            {menu.type ? (
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {menu.type}
              </p>
            ) : null}
          </div>
          <span className="text-lg font-semibold text-slate-900">
            {formatPrice(menu.price)}
          </span>
        </div>

        {menu.description ? (
          <p className="text-sm leading-relaxed text-slate-600">
            {menu.description}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <StockBadge hasStock={menu.has_sufficient_stock} />
          {menu.categories?.map((category) => (
            <span
              key={category.id}
              className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600"
            >
              {category.name}
            </span>
          ))}
        </div>

        {menu.allergens?.length ? (
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span className="font-semibold text-slate-700">Allergènes : </span>
            {menu.allergens.join(", ")}
          </div>
        ) : null}
      </div>
    </article>
  );
}

interface StockBadgeProps {
  hasStock: boolean;
}

function StockBadge({ hasStock }: StockBadgeProps) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${hasStock ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
    >
      {hasStock ? "Disponible" : "Indisponible"}
    </span>
  );
}
