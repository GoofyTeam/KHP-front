"use client";

import { useEffect, useMemo, useState } from "react";

import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Separator } from "@workspace/ui/components/separator";
import { AllegernsBadge } from "@workspace/ui/components/allergens-badge";

type AllergenCode = Parameters<typeof AllegernsBadge>[0]["allergens"];

import type { RestaurantCardMenu } from "@/queries/restaurant-card-query";
import { Label } from "@workspace/ui/components/label";

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

function normalizeText(value: string | null | undefined): string {
  if (!value) return "";

  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/[’']/g, "")
    .normalize("NFC")
    .trim();
}

interface OptionItem {
  value: string;
  label: string;
}

function getMenuTypeInfo(menu: RestaurantCardMenu): OptionItem {
  const label = menu.type?.trim();

  if (!label) {
    return { value: "other", label: "Other" };
  }

  const normalized = normalizeText(label);

  if (!normalized) {
    return { value: "other", label: label || "Other" };
  }

  return { value: normalized, label };
}

function capitalizeFirstLetter(text: string) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

interface PublicMenuCardClientProps {
  companyData: { name: string | null; slug: string | null };
  menus: RestaurantCardMenu[];
  showImages: boolean;
}

export function PublicMenuCardClient({
  companyData,
  menus,
  showImages,
}: PublicMenuCardClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [allergenFilter, setAllergenFilter] = useState("all");

  const typeOptions = useMemo<OptionItem[]>(() => {
    const map = new Map<string, string>();

    menus.forEach((menu) => {
      const { value, label } = getMenuTypeInfo(menu);

      if (!map.has(value)) {
        map.set(value, label);
      }
    });

    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) =>
        a.label.localeCompare(b.label, "fr", { sensitivity: "base" })
      );
  }, [menus]);

  const categoryOptions = useMemo<OptionItem[]>(() => {
    const map = new Map<string, string>();

    menus.forEach((menu) => {
      menu.categories?.forEach((category) => {
        const label = category.name?.trim();
        if (!label) return;
        const value = normalizeText(label);

        if (!map.has(value)) {
          map.set(value, label);
        }
      });
    });

    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) =>
        a.label.localeCompare(b.label, "fr", { sensitivity: "base" })
      );
  }, [menus]);

  const allergenOptions = useMemo<OptionItem[]>(() => {
    const map = new Map<string, string>();

    menus.forEach((menu) => {
      menu.allergens?.forEach((allergen) => {
        const label = allergen.trim();
        if (!label) return;
        const value = normalizeText(label);

        if (!map.has(value)) {
          map.set(value, label);
        }
      });
    });

    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) =>
        a.label.localeCompare(b.label, "fr", { sensitivity: "base" })
      );
  }, [menus]);

  const filteredMenus = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm);

    return menus.filter((menu) => {
      const { value: menuTypeValue } = getMenuTypeInfo(menu);
      const categoryValues =
        menu.categories
          ?.map((category) => normalizeText(category.name))
          .filter((value): value is string => Boolean(value)) ?? [];
      const allergenValues =
        menu.allergens
          ?.map((allergen) => normalizeText(allergen))
          .filter((value): value is string => Boolean(value)) ?? [];

      const matchesType = typeFilter === "all" || menuTypeValue === typeFilter;
      const matchesCategory =
        categoryFilter === "all" || categoryValues.includes(categoryFilter);
      const matchesAllergen =
        allergenFilter === "all" || allergenValues.includes(allergenFilter);

      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          menu.name,
          menu.description,
          menu.type,
          ...(menu.allergens || []),
          ...(menu.categories?.map((category) => category.name) || []),
        ]
          .filter(Boolean)
          .some((value) =>
            normalizeText(value?.toString()).includes(normalizedSearch)
          );

      return matchesType && matchesCategory && matchesAllergen && matchesSearch;
    });
  }, [allergenFilter, categoryFilter, menus, searchTerm, typeFilter]);

  const groupedMenus = useMemo(() => {
    const groups = new Map<
      string,
      { label: string; menus: RestaurantCardMenu[] }
    >();

    filteredMenus.forEach((menu) => {
      const { value, label } = getMenuTypeInfo(menu);
      const key = value || "other";

      if (!groups.has(key)) {
        groups.set(key, { label, menus: [] });
      }

      groups.get(key)!.menus.push(menu);
    });

    return Array.from(groups.entries())
      .map(([key, group]) => ({ key, ...group }))
      .map((group) => ({
        ...group,
        menus: group.menus
          .slice()
          .sort((a, b) =>
            a.name.localeCompare(b.name, "fr", { sensitivity: "base" })
          ),
      }))
      .sort((a, b) =>
        a.label.localeCompare(b.label, "fr", { sensitivity: "base" })
      );
  }, [filteredMenus]);

  //Customize page title and meta description for SEO
  useEffect(() => {
    document.title = companyData.name
      ? `${companyData.name} - Menu`
      : "Restaurant - Menu";
    const metaDescription = document.querySelector(
      'meta[name="description"]'
    ) as HTMLMetaElement | null;
    if (metaDescription && companyData.name) {
      metaDescription.content = `Explore the menu of ${companyData.name}${
        companyData.slug ? ` (@${companyData.slug})` : ""
      } and discover delicious dishes to satisfy your cravings.`;
    }
  }, [companyData.name, companyData.slug]);

  return (
    <>
      <section className="bg-slate-100">
        <div className="mx-auto max-w-4xl px-4 pb-6 pt-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white/80 px-5 py-6 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-4">
              <div className="w-full">
                <Label
                  htmlFor="search"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Search
                </Label>
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search dishes, categories, allergens..."
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div>
                  <Label className="mb-2 block text-sm font-medium text-slate-700">
                    Type
                  </Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {typeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block text-sm font-medium text-slate-700">
                    Category
                  </Label>
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block text-sm font-medium text-slate-700">
                    Allergens
                  </Label>
                  <Select
                    value={allergenFilter}
                    onValueChange={setAllergenFilter}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="All allergens" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All allergens</SelectItem>
                      {allergenOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        {menus.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-slate-700">
              No menus are available yet
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Please check back later to discover this restaurant&apos;s dishes.
            </p>
          </div>
        ) : filteredMenus.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-700">
              No matching results
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Adjust your filters or reset the search to explore more dishes.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {groupedMenus.map((group, index) => (
              <section key={group.key} className="space-y-6">
                {index > 0 ? <Separator className="my-4" /> : null}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-2xl font-semibold text-slate-800">
                    {capitalizeFirstLetter(group.label)}
                  </h2>
                  <span className="text-sm text-slate-500">
                    {group.menus.length} dish
                    {group.menus.length > 1 ? "es" : ""}
                  </span>
                </div>
                <div className="space-y-6">
                  {group.menus.map((menu) => (
                    <MenuItemCard
                      key={menu.id}
                      menu={menu}
                      showImage={showImages}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </>
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
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Allergens
            </span>
            <div className="flex flex-wrap gap-2">
              {menu.allergens.map((allergen) => (
                <AllegernsBadge
                  key={allergen}
                  allergens={allergen as AllergenCode}
                  variant="secondary"
                />
              ))}
            </div>
          </div>
        ) : null}

        {menu.description ? (
          <p className="text-sm leading-relaxed text-slate-600">
            {menu.description}
          </p>
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
      {hasStock ? "Available" : "Unavailable"}
    </span>
  );
}
