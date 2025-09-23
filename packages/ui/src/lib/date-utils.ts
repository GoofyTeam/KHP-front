/**
 * Format a date string to display time in HH:MM format
 * @param dateString - The date string to format
 * @param locale - The locale to use for formatting (default: "fr-FR")
 * @returns Formatted time string
 */
export function formatTime(
  dateString: string,
  locale: string = "fr-FR",
): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format a date string to display date in a readable format
 * @param dateString - The date string to format
 * @param locale - The locale to use for formatting (default: "fr-FR")
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string,
  locale: string = "fr-FR",
): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a date string to display date in long format with weekday
 * @param dateString - The date string to format
 * @param locale - The locale to use for formatting (default: "fr-FR")
 * @returns Formatted long date string
 */
export function formatLongDate(
  dateString: string,
  locale: string = "fr-FR",
): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format a date string to display both date and time
 * @param dateString - The date string to format
 * @param locale - The locale to use for formatting (default: "fr-FR")
 * @returns Formatted date and time string
 */
export function formatDateTime(
  dateString: string,
  locale: string = "fr-FR",
): string {
  const date = new Date(dateString);
  return date.toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formats a date string for display in French locale with full month name
 * @param value - The date string to format
 * @returns Formatted date string or the original value if invalid
 */
export function formatExpirationDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
