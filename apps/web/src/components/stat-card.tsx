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
    "w-full aspect-square max-w-98 flex flex-col justify-center items-center rounded-xl p-4 border";

  const variantClasses =
    variant === "outline"
      ? "bg-transparent text-khp-primary border-khp-primary"
      : "bg-khp-primary text-white border-transparent";

  return (
    <div className={[baseClasses, variantClasses, className].join(" ")}>
      <div className="flex flex-col items-center justify-center text-center h-full w-full">
        {/* Valeur principale */}
        <div className="text-3xl md:text-4xl lg:text-5xl font-bold leading-none mb-2">
          {value}
        </div>

        {/* Unité */}
        {unit && (
          <div className="text-base md:text-lg lg:text-xl font-normal opacity-90 mb-2">
            {unit}
          </div>
        )}

        {/* Label */}
        <div className="text-sm md:text-base opacity-80 leading-tight text-center">
          {label}
        </div>
      </div>
    </div>
  );
}
