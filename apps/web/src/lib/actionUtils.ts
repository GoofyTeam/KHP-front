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
  if (error instanceof Error) {
    // Parse HTTP status codes from error messages (format: "STATUS: message")
    const statusMatch = error.message.match(/^(\d{3}):\s*(.*)$/);
    if (statusMatch) {
      const status = Number(statusMatch[1]);
      const detail = statusMatch[2] || "";

      switch (status) {
        case 401:
          return {
            success: false,
            error: `${prefix}Unauthorized access`,
          };
        case 419:
          return {
            success: false,
            error: `${prefix}CSRF token expired. The operation may have been retried automatically.`,
          };
        case 422:
          // Parse validation errors
          try {
            const errorData = JSON.parse(detail);
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
          } catch {}
          return {
            success: false,
            error: `${prefix}Validation error: ${detail}`,
          };
        case 500:
          return {
            success: false,
            error: `${prefix}Server error occurred`,
          };
        default:
          return {
            success: false,
            error: `${prefix}${detail || error.message}`,
          };
      }
    }

    // Handle legacy 422 format for backward compatibility
    if (error.message.includes("422")) {
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
  }

  return {
    success: false,
    error:
      error instanceof Error
        ? `${prefix}${error.message}`
        : `${prefix}Unknown error`,
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
    // Let Next.js redirect errors pass through
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return handleActionError(error, errorPrefix);
  }
}
