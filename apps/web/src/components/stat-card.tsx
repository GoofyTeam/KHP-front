import React from "react";

type StatCardVariant = "default" | "outline";

interface StatCardProps {
  value: React.ReactNode;
  label: string;
  unit?: string;
  variant?: StatCardVariant;
  className?: string;
}

export function StatCard({
  value,
  label,
  unit,
  variant = "default",
  className = "",
}: StatCardProps) {
  const baseClasses =
    "w-full aspect-square flex flex-col justify-center items-center rounded-xl p-6 border";

  const variantClasses =
    variant === "outline"
      ? "bg-transparent text-khp-primary border-khp-primary"
      : "bg-khp-primary text-white border-transparent";

  return (
    <div className={[baseClasses, variantClasses, className].join(" ")}>
      <div className="text-4xl lg:text-5xl font-bold mb-4">
        {value}
        {unit ? <span className="text-xl font-normal ml-2">{unit}</span> : null}
      </div>
      <div className="text-base opacity-90 text-center">{label}</div>
    </div>
  );
}
