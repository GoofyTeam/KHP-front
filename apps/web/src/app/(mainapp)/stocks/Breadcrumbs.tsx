"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";

export default function StocksBreadcrumbs() {
  const pathname = usePathname();
  const isAdd = pathname === "/stocks/add";

  return (
    <Breadcrumb>
      <BreadcrumbList className="text-xl font-semibold">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/stocks">Stocks</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {isAdd && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Add</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

