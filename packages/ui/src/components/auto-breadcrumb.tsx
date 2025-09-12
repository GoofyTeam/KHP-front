"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import { cn } from "@workspace/ui/lib/utils";

type AutoBreadcrumbProps = {
  className?: string;
  listClassName?: string;
  /**
   * Override labels by full path or by raw segment.
   * Example: { "/menus/add": "Create Menu", menus: "Menus" }
   */
  overrides?: Record<string, string>;
  /**
   * If true, includes the leading slash as a root crumb linking to "/" with label "Home".
   * Default: false
   */
  includeHome?: boolean;
  /**
   * Label for the home crumb if included.
   * Default: "Home"
   */
  homeLabel?: string;
  /**
   * Optional pathname. If not provided, uses "/".
   */
  pathname?: string;
  /**
   * Custom link renderer. Defaults to native anchor tag.
   */
  renderLink?: (href: string, label: string) => React.ReactNode;
  /**
   * Controls whether a crumb (including non-last) should be linkable.
   * Defaults to linking all non-last items.
   */
  isLink?: (href: string, seg: string, idx: number, isLast: boolean) => boolean;
  /**
   * Force a label for the last crumb (page).
   */
  lastLabel?: string;
};

function titleCase(input: string) {
  return input
    .split("-")
    .map((p) => (p ? p.charAt(0).toUpperCase() + p.slice(1) : p))
    .join(" ");
}

function singularize(word: string) {
  // simple, conservative singularization: trim a single trailing "s"
  if (word.endsWith("ss")) return word; // don't change e.g. "Class"
  if (word.endsWith("s")) return word.slice(0, -1);
  return word;
}

function computeLastLabel(
  lastSegment: string,
  prevLabel: string | undefined,
  fullPath: string,
  overrides?: Record<string, string>
) {
  // Highest precedence: full path override
  if (overrides && overrides[fullPath]) return overrides[fullPath];

  // Segment override
  if (overrides && overrides[lastSegment]) return overrides[lastSegment];

  const prevSingular = prevLabel ? singularize(prevLabel) : undefined;
  if (lastSegment === "add" || lastSegment === "new") {
    return prevSingular ? `Create ${prevSingular}` : "Create";
  }
  if (lastSegment === "edit") {
    return prevSingular ? `Edit ${prevSingular}` : "Edit";
  }

  return titleCase(lastSegment);
}

export function AutoBreadcrumb({
  className,
  listClassName,
  overrides,
  includeHome = false,
  homeLabel = "Home",
  pathname = "/",
  renderLink,
  isLink,
  lastLabel,
}: AutoBreadcrumbProps) {
  const segments = pathname.split("/").filter(Boolean); // removes leading empty

  // Build cumulative hrefs for each crumb
  const crumbs = segments.map((seg: string, idx: number) => {
    const href = "/" + segments.slice(0, idx + 1).join("/");
    return { seg, href };
  });

  const items = [] as React.ReactNode[];

  if (includeHome) {
    items.push(
      <BreadcrumbItem key="home">
        {renderLink ? (
          <BreadcrumbLink asChild>
            {renderLink("/", homeLabel)}
          </BreadcrumbLink>
        ) : (
          <BreadcrumbLink href="/">{homeLabel}</BreadcrumbLink>
        )}
      </BreadcrumbItem>
    );
    if (crumbs.length > 0) items.push(<BreadcrumbSeparator key="sep-home" />);
  }

  crumbs.forEach((c: { seg: string; href: string }, idx: number) => {
    const isLast = idx === crumbs.length - 1;

    // Derive label for non-last using segment overrides or titleCase
    const segOverride = overrides?.[c.seg];
    const linkLabel = segOverride ?? titleCase(c.seg);

    if (!isLast) {
      const linkAllowed = isLink ? isLink(c.href, c.seg, idx, isLast) : true;
      items.push(
        <BreadcrumbItem key={c.href}>
          {linkAllowed ? (
            renderLink ? (
              <BreadcrumbLink asChild>
                {renderLink(c.href, linkLabel)}
              </BreadcrumbLink>
            ) : (
              <BreadcrumbLink href={c.href}>{linkLabel}</BreadcrumbLink>
            )
          ) : (
            <BreadcrumbPage>{linkLabel}</BreadcrumbPage>
          )}
        </BreadcrumbItem>
      );
      items.push(<BreadcrumbSeparator key={`sep-${c.href}`} />);
    } else {
      const prev = crumbs[idx - 1];
      const prevLabel = prev
        ? overrides?.[prev.seg] ?? titleCase(prev.seg)
        : undefined;
      const pageLabel = lastLabel ?? computeLastLabel(c.seg, prevLabel, c.href, overrides);
      items.push(
        <BreadcrumbItem key={c.href}>
          <BreadcrumbPage>{pageLabel}</BreadcrumbPage>
        </BreadcrumbItem>
      );
    }
  });

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList className={cn(listClassName)}>{items}</BreadcrumbList>
    </Breadcrumb>
  );
}

export default AutoBreadcrumb;
