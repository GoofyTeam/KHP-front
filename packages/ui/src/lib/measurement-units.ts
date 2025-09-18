export type MeasurementUnitType =
  // Mass (gram variants)
  | "kg"
  | "hg"
  | "dag"
  | "g"
  | "dg"
  | "cg"
  | "mg"
  // Volume (litre variants)
  | "kL"
  | "hL"
  | "daL"
  | "L"
  | "dL"
  | "cL"
  | "mL"
  // Unitary (single unit only)
  | "unit";

export type MeasurementCategory = "mass" | "volume" | "unit";

export const MeasurementUnit = {
  // Mass (gram variants)
  KILOGRAM: "kg" as MeasurementUnitType,
  HECTOGRAM: "hg" as MeasurementUnitType,
  DECAGRAM: "dag" as MeasurementUnitType,
  GRAM: "g" as MeasurementUnitType,
  DECIGRAM: "dg" as MeasurementUnitType,
  CENTIGRAM: "cg" as MeasurementUnitType,
  MILLIGRAM: "mg" as MeasurementUnitType,

  // Volume (litre variants)
  KILOLITRE: "kL" as MeasurementUnitType,
  HECTOLITRE: "hL" as MeasurementUnitType,
  DECALITRE: "daL" as MeasurementUnitType,
  LITRE: "L" as MeasurementUnitType,
  DECILITRE: "dL" as MeasurementUnitType,
  CENTILITRE: "cL" as MeasurementUnitType,
  MILLILITRE: "mL" as MeasurementUnitType,

  // Unitary (single unit only)
  UNIT: "unit" as MeasurementUnitType,

  // Helpers
  label: (unit: MeasurementUnitType): string => {
    switch (unit) {
      // Mass
      case "kg":
        return "Kilogram (kg)";
      case "hg":
        return "Hectogram (hg)";
      case "dag":
        return "Decagram (dag)";
      case "g":
        return "Gram (g)";
      case "dg":
        return "Decigram (dg)";
      case "cg":
        return "Centigram (cg)";
      case "mg":
        return "Milligram (mg)";

      // Volume
      case "kL":
        return "Kiloliter (kL)";
      case "hL":
        return "Hectoliter (hL)";
      case "daL":
        return "Decaliter (daL)";
      case "L":
        return "Liter (L)";
      case "dL":
        return "Deciliter (dL)";
      case "cL":
        return "Centiliter (cL)";
      case "mL":
        return "Milliliter (mL)";

      case "unit":
        return "Unit";
      default:
        return "Unknown unit";
    }
  },

  category: (unit: MeasurementUnitType): MeasurementCategory => {
    if (["kg", "hg", "dag", "g", "dg", "cg", "mg"].includes(unit)) {
      return "mass";
    } else if (["kL", "hL", "daL", "L", "dL", "cL", "mL"].includes(unit)) {
      return "volume";
    } else {
      return "unit";
    }
  },

  baseUnits: (): Record<string, MeasurementUnitType> => {
    return {
      mass: "g",
      volume: "L",
      unit: "unit",
    };
  },

  values: (): MeasurementUnitType[] => {
    return [
      "kg",
      "hg",
      "dag",
      "g",
      "dg",
      "cg",
      "mg",
      "kL",
      "hL",
      "daL",
      "L",
      "dL",
      "cL",
      "mL",
      "unit",
    ];
  },
};

export type MeasurementUnitInfo = {
  value: MeasurementUnitType;
  label: string;
  category: MeasurementCategory;
};

export const getAllMeasurementUnits = (): MeasurementUnitInfo[] => {
  return MeasurementUnit.values().map((value) => ({
    value,
    label: MeasurementUnit.label(value),
    category: MeasurementUnit.category(value),
  }));
};

export const getAllMeasurementUnitsOnlyValues = (): {
  value: string;
  label: string;
}[] => {
  return MeasurementUnit.values().map((value) => ({
    value,
    label: value,
  }));
};

export const getMeasurementUnitsByCategory = (
  category: MeasurementCategory
): MeasurementUnitInfo[] => {
  return getAllMeasurementUnits().filter((unit) => unit.category === category);
};

// Conversion factors relative to base units (g for mass, L for volume)
const MASS_TO_G: Record<MeasurementUnitType, number> = {
  kg: 1000,
  hg: 100,
  dag: 10,
  g: 1,
  dg: 0.1,
  cg: 0.01,
  mg: 0.001,
  kL: NaN,
  hL: NaN,
  daL: NaN,
  L: NaN,
  dL: NaN,
  cL: NaN,
  mL: NaN,
  unit: NaN,
};

const VOLUME_TO_L: Record<MeasurementUnitType, number> = {
  kg: NaN,
  hg: NaN,
  dag: NaN,
  g: NaN,
  dg: NaN,
  cg: NaN,
  mg: NaN,
  kL: 1000,
  hL: 100,
  daL: 10,
  L: 1,
  dL: 0.1,
  cL: 0.01,
  mL: 0.001,
  unit: NaN,
};

/**
 * Convert a numeric quantity between compatible measurement units.
 * - Mass units convert via grams.
 * - Volume units convert via litres.
 * - 'unit' only converts to itself.
 * Returns null if units are incompatible.
 */
export function convertMeasurement(
  value: number,
  from: MeasurementUnitType,
  to: MeasurementUnitType
): number | null {
  if (from === to) return value;

  const fromCategory = MeasurementUnit.category(from);
  const toCategory = MeasurementUnit.category(to);

  if (fromCategory !== toCategory) {
    return null;
  }

  // Handle 'unit' category (no scaling across categories)
  if (fromCategory === "unit") {
    return null; // only identical units handled earlier
  }

  if (fromCategory === "mass") {
    const fromFactor = MASS_TO_G[from];
    const toFactor = MASS_TO_G[to];
    if (!isFinite(fromFactor) || !isFinite(toFactor)) return null;
    const inBase = value * fromFactor; // to grams
    return inBase / toFactor; // to target mass unit
  }

  if (fromCategory === "volume") {
    const fromFactor = VOLUME_TO_L[from];
    const toFactor = VOLUME_TO_L[to];
    if (!isFinite(fromFactor) || !isFinite(toFactor)) return null;
    const inBase = value * fromFactor; // to litres
    return inBase / toFactor; // to target volume unit
  }

  return null;
}

