export function extractApiErrorMessage(error: unknown): string {
  try {
    // Prefer backend-provided messages when available
    if (error && typeof error === "object") {
      const anyErr = error as any;

      // Our HttpClient attaches `data` with server response
      if ("data" in anyErr && anyErr.data != null) {
        const data = anyErr.data;

        if (typeof data === "string" && data.trim().length > 0) {
          return data;
        }

        if (typeof data === "object") {
          // Common API shapes: { message: string } or { errors: Record<string, string[]|string> }
          if ("message" in (data as any) && typeof (data as any).message === "string") {
            return (data as any).message as string;
          }

          if (
            "errors" in (data as any) &&
            (data as any).errors &&
            typeof (data as any).errors === "object"
          ) {
            const errorsObj = (data as any).errors as Record<string, unknown>;
            // Take the first error message found
            for (const key of Object.keys(errorsObj)) {
              const val = errorsObj[key];
              if (Array.isArray(val)) {
                const first = val.find((v) => typeof v === "string");
                if (typeof first === "string" && first.trim().length > 0) return first;
              } else if (typeof val === "string") {
                if (val.trim().length > 0) return val;
              }
            }
          }
        }
      }

      // Fallback to standard error message
      if ("message" in anyErr && typeof anyErr.message === "string" && anyErr.message.trim().length > 0) {
        return anyErr.message as string;
      }
    }
  } catch {
    // no-op; fall through to generic message
  }

  return "Une erreur est survenue. Veuillez réessayer.";
}

