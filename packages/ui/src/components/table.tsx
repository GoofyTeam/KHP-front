"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

export type TableVariant = "default" | "inventory" | "add-stock";

const variantStyles: Record<
  TableVariant,
  {
    wrapper: string;
    table: string;
    header: string;
    body: string;
    footer: string;
    row: string;
    head: string;
    cell: string;
    caption: string;
  }
> = {
  default: {
    wrapper: "relative w-full overflow-x-auto",
    table: "w-full caption-bottom text-sm",
    header: "[&_tr]:border-b border-blue-500",
    body: "[&_tr:last-child]:border-0",
    footer: "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
    row: "border-b border-gray-200 hover:bg-muted/50 data-[state=selected]:bg-muted transition-colors",
    head: "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
    cell: "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
    caption: "text-muted-foreground mt-4 text-sm",
  },
  inventory: {
    wrapper:
      "relative w-full overflow-x-auto rounded-lg border-2 border-khp-primary/30",
    table:
      "w-full caption-bottom text-sm text-khp-text-secondary border-collapse",
    header:
      "bg-white border-b border-khp-primary/30 [&_tr]:border-none text-khp-text-primary",
    body: "[&_tr:last-child]:border-0",
    footer: "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
    row: "border-b border-text-secondary h-16",
    head: "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
    cell: "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
    caption: "text-muted-foreground mt-4 text-sm",
  },
  "add-stock": {
    wrapper: "relative w-full overflow-x-auto rounded-lg border border-dashed",
    table: "w-full caption-bottom text-sm",
    header: "[&_tr]:border-b border-pink-500 border-dashed",
    body: "[&_tr:last-child]:border-0",
    footer: "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
    row: "border-b border-gray-200 border-dashed hover:bg-muted/50 transition-colors",
    head: "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
    cell: "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
    caption: "text-muted-foreground mt-4 text-sm",
  },
};

const TableVariantContext = React.createContext<TableVariant>("default");
const useTableVariant = () => React.useContext(TableVariantContext);

interface TableProps extends React.ComponentProps<"table"> {
  variant?: TableVariant;
}
function Table({
  variant = "default",
  className,
  children,
  ...props
}: TableProps) {
  const styles = variantStyles[variant];
  return (
    <TableVariantContext.Provider value={variant}>
      <div data-slot="table-container" className={cn(styles.wrapper)}>
        <table
          data-slot="table"
          className={cn(styles.table, className)}
          {...props}
        >
          {children}
        </table>
      </div>
    </TableVariantContext.Provider>
  );
}

function TableHeader({
  className,
  children,
  ...props
}: React.ComponentProps<"thead">) {
  const styles = variantStyles[useTableVariant()];
  return (
    <thead
      data-slot="table-header"
      className={cn(styles.header, className)}
      {...props}
    >
      <tr>{children}</tr>
    </thead>
  );
}

function TableBody(props: React.ComponentProps<"tbody">) {
  const styles = variantStyles[useTableVariant()];
  return (
    <tbody
      data-slot="table-body"
      className={cn(styles.body, props.className)}
      {...props}
    />
  );
}

function TableFooter(props: React.ComponentProps<"tfoot">) {
  const styles = variantStyles[useTableVariant()];
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(styles.footer, props.className)}
      {...props}
    />
  );
}

function TableRow(props: React.ComponentProps<"tr">) {
  const styles = variantStyles[useTableVariant()];
  return (
    <tr
      data-slot="table-row"
      className={cn(styles.row, props.className)}
      {...props}
    />
  );
}

function TableHead(props: React.ComponentProps<"th">) {
  const styles = variantStyles[useTableVariant()];
  return (
    <th
      data-slot="table-head"
      className={cn(styles.head, props.className)}
      {...props}
    />
  );
}

function TableCell(props: React.ComponentProps<"td">) {
  const styles = variantStyles[useTableVariant()];
  return (
    <td
      data-slot="table-cell"
      className={cn(styles.cell, props.className)}
      {...props}
    />
  );
}

function TableCaption(props: React.ComponentProps<"caption">) {
  const styles = variantStyles[useTableVariant()];
  return (
    <caption
      data-slot="table-caption"
      className={cn(styles.caption, props.className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
