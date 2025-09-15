export function extractApiErrorMessage(error: unknown): string {
  try {
    // Prefer backend-provided messages when available
    if (error && typeof error === "object") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyErr = error as any;

      // Our HttpClient attaches `data` with server response
      if ("data" in anyErr && anyErr.data != null) {
        const data = anyErr.data;

        if (typeof data === "string" && data.trim().length > 0) {
          return data;
        }

        if (typeof data === "object") {
          // Common API shapes: { message: string } or { errors: Record<string, string[]|string> }
          if (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            "message" in (data as any) &&
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            typeof (data as any).message === "string"
          ) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (data as any).message as string;
          }

          if (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            "errors" in (data as any) &&
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (data as any).errors &&
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            typeof (data as any).errors === "object"
          ) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errorsObj = (data as any).errors as Record<string, unknown>;
            // Take the first error message found
            for (const key of Object.keys(errorsObj)) {
              const val = errorsObj[key];
              if (Array.isArray(val)) {
                const first = val.find((v) => typeof v === "string");
                if (typeof first === "string" && first.trim().length > 0)
                  return first;
              } else if (typeof val === "string") {
                if (val.trim().length > 0) return val;
              }
            }
          }
        }
      }

      // Fallback to standard error message
      if (
        "message" in anyErr &&
        typeof anyErr.message === "string" &&
        anyErr.message.trim().length > 0
      ) {
        return anyErr.message as string;
      }
    }
  } catch {
    // no-op; fall through to generic message
    console.error("Error extracting API error message:", error);
  }

  return "Une erreur est survenue. Veuillez réessayer.";
}
