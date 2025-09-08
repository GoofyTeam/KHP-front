export type ActionResult<T = unknown> =
  | { success: true; data?: T }
  | { success: false; error: string };

/**
 * Gestionnaire d'erreur générique pour les Server Actions
 */
export function handleActionError<T = unknown>(
  error: unknown,
  prefix = ""
): ActionResult<T> {
  if (error instanceof Error && error.message.includes("422")) {
    try {
      const errorMatch = error.message.match(/422: (.+)/);
      if (errorMatch) {
        const errorData = JSON.parse(errorMatch[1]);
        if (errorData.errors) {
          const firstError = Object.values(errorData.errors)[0];
          const errorMessage = Array.isArray(firstError)
            ? firstError[0]
            : String(firstError);
          return {
            success: false,
            error: `${prefix}${errorMessage}`,
          };
        }
      }
    } catch {}
  }

  return {
    success: false,
    error: error instanceof Error ? error.message : "Unknown error",
  };
}

/**
 * Wrapper pour exécuter des appels HTTP et gérer les erreurs de façon standardisée
 */
export async function executeHttpAction<T>(
  httpCall: () => Promise<T>,
  errorPrefix = ""
): Promise<ActionResult<T>> {
  try {
    const result = await httpCall();
    return { success: true, data: result };
  } catch (error) {
    return handleActionError(error, errorPrefix);
  }
}
