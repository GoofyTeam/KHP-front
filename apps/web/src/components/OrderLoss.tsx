import React from "react";
import Link from "next/link";
import { Trash2, NotebookPen } from "lucide-react";

export type OrderLossProps = {
  className?: string;
  loading?: boolean;

  lossCount?: number;
  ordersCount?: number;

  lossHref?: string;
  ordersHref?: string;
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function OrderLoss({
  className,
  loading,
  lossCount,
  ordersCount,
  lossHref,
  ordersHref,
}: OrderLossProps) {
  return (
    <section
      className={cx(
        "rounded-md border border-khp-primary/30 shadow-sm",
        "p-3 md:p-4 flex flex-col w-full",
        className
      )}
      aria-label="Order and loss"
    >
      <h2 className="text-base font-semibold text-slate-800 md:text-lg mb-2">
        Order and loss
      </h2>

      <div className="flex-1 w-full flex flex-col divide-y divide-slate-200">
        <MetricRow
          icon={<Trash2 className="h-6 w-6 text-slate-600" aria-hidden />}
          value={lossCount}
          subLabel={`Already ${lossCount ?? "—"} loss this week`}
          href={lossHref}
          loading={loading}
        />

        <MetricRow
          icon={<NotebookPen className="h-6 w-6 text-slate-600" aria-hidden />}
          value={ordersCount}
          subLabel={`Already ${ordersCount ?? "—"} orders this week`}
          href={ordersHref}
          loading={loading}
        />
      </div>
    </section>
  );
}

function MetricRow({
  icon,
  value,
  subLabel,
  href,
  loading,
}: {
  icon: React.ReactNode;
  value?: number;
  subLabel: string;
  href?: string;
  loading?: boolean;
}) {
  const content = (
    <div className="flex-1 w-full flex flex-col items-center justify-center text-center py-2">
      <div className="flex items-center gap-2">
        {loading ? <div className="h-6 w-6 rounded bg-slate-200" /> : icon}

        {loading ? (
          <div className="h-7 w-10 rounded bg-slate-200" />
        ) : (
          <div className="text-2xl font-bold leading-none text-slate-900 md:text-3xl">
            {value ?? "—"}
          </div>
        )}
      </div>

      <p className="mt-1 text-xs text-slate-500 md:text-sm">{subLabel}</p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="flex-1 w-full flex">
        {content}
      </Link>
    );
  }
  return <div className="flex-1 w-full flex">{content}</div>;
}
