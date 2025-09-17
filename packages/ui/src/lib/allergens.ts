/**
 * Mapping des allergènes avec leurs labels en français et anglais
 */
export const allergenLabels: Record<string, string> = {
  gluten: "Gluten",
  fruits_a_coque: "Tree nuts",
  crustaces: "Crustaceans",
  celeri: "Celery",
  oeufs: "Eggs",
  moutarde: "Mustard",
  poisson: "Fish",
  soja: "Soy",
  lait: "Milk",
  sulfites: "Sulfites",
  sesame: "Sesame",
  lupin: "Lupin",
  arachides: "Peanuts",
  mollusques: "Molluscs",
};

/**
 * Obtient le label d'un allergène
 * @param allergen - Le code de l'allergène
 * @returns Le label traduit ou le code original si non trouvé
 */
export function getAllergenLabel(allergen: string): string {
  return allergenLabels[allergen] || allergen;
}

/**
 * Mappe une liste d'allergènes vers leurs labels
 * @param allergens - Liste des codes d'allergènes
 * @returns Liste des labels traduits
 */
export function mapAllergensToLabels(allergens: string[]): string[] {
  return allergens.map(getAllergenLabel);
}

/**
 * Crée des options pour un select/multiselect d'allergènes
 * @param allergens - Liste des codes d'allergènes disponibles
 * @returns Options formatées pour un composant de sélection
 */
export function createAllergenOptions(allergens: string[]): Array<{ value: string; label: string }> {
  return allergens.map((allergen) => ({
    value: allergen,
    label: getAllergenLabel(allergen),
  }));
}

/**
 * Obtient tous les allergènes disponibles sous forme d'options
 * @returns Toutes les options d'allergènes
 */
export function getAllAllergenOptions(): Array<{ value: string; label: string }> {
  return Object.entries(allergenLabels).map(([value, label]) => ({
    value,
    label,
  }));
}
