"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AutoBreadcrumb as CoreAutoBreadcrumb } from "@workspace/ui/components/auto-breadcrumb";

type Props = React.ComponentProps<typeof CoreAutoBreadcrumb>;

export function AutoBreadcrumb(
  props: Omit<Props, "pathname" | "renderLink">
) {
  const pathname = usePathname() || "/";
  return (
    <CoreAutoBreadcrumb
      pathname={pathname}
      renderLink={(href, label) => <Link href={href}>{label}</Link>}
      {...props}
    />
  );
}

export default AutoBreadcrumb;
