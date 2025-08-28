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

export type MeasurementCategory = "masse" | "volume" | "unité";

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

  // Méthodes
  frenchLabel: (unit: MeasurementUnitType): string => {
    switch (unit) {
      // Mass
      case "kg":
        return "Kilogramme (kg)";
      case "hg":
        return "Hectogramme (hg)";
      case "dag":
        return "Décagramme (dag)";
      case "g":
        return "Gramme (g)";
      case "dg":
        return "Décigramme (dg)";
      case "cg":
        return "Centigramme (cg)";
      case "mg":
        return "Milligramme (mg)";

      // Volume
      case "kL":
        return "Kilolitre (kL)";
      case "hL":
        return "Hectolitre (hL)";
      case "daL":
        return "Décalitre (daL)";
      case "L":
        return "Litre (L)";
      case "dL":
        return "Décilitre (dL)";
      case "cL":
        return "Centilitre (cL)";
      case "mL":
        return "Millilitre (mL)";

      case "unit":
        return "Unit (unit)";
      default:
        return "null";
    }
  },

  category: (unit: MeasurementUnitType): MeasurementCategory => {
    if (["kg", "hg", "dag", "g", "dg", "cg", "mg"].includes(unit)) {
      return "masse";
    } else if (["kL", "hL", "daL", "L", "dL", "cL", "mL"].includes(unit)) {
      return "volume";
    } else {
      return "unité";
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
    label: MeasurementUnit.frenchLabel(value),
    category: MeasurementUnit.category(value),
  }));
};

export const getMeasurementUnitsByCategory = (
  category: MeasurementCategory
): MeasurementUnitInfo[] => {
  return getAllMeasurementUnits().filter((unit) => unit.category === category);
};
