/**
 * Formate une quantité en limitant le nombre de décimales
 * @param quantity - La quantité à formater
 * @param maxDecimals - Nombre maximum de décimales (défaut: 3)
 * @returns La quantité formatée sous forme de chaîne
 */
export function formatQuantity(
  quantity: number,
  maxDecimals: number = 3
): string {
  // Gestion des cas spéciaux
  if (isNaN(quantity) || !isFinite(quantity)) {
    return "0";
  }

  // Arrondir à maxDecimals décimales
  const multiplier = Math.pow(10, maxDecimals);
  const rounded = Math.round(quantity * multiplier) / multiplier;

  // Si c'est un entier ou très proche d'un entier, afficher sans décimales
  if (Math.abs(rounded - Math.round(rounded)) < 0.001) {
    return Math.round(rounded).toString();
  }

  // Sinon, formater avec les décimales nécessaires (max 3)
  const formatted = rounded.toFixed(maxDecimals);

  // Supprimer les zéros inutiles à la fin
  return formatted.replace(/\.?0+$/, "");
}
