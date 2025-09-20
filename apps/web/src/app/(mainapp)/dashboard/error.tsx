"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <AlertCircle className="h-16 w-16 text-khp-error" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-khp-text-primary">
            Dashboard Loading Error
          </h1>
          <p className="text-khp-text-secondary">
            An error occurred while loading the dashboard data. This could be
            due to a network issue or server problem.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-khp-primary text-white rounded-md hover:bg-khp-primary-hover transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>

          <div className="text-sm text-khp-text-secondary">
            <p>If the problem persists, please contact support.</p>
            {process.env.NODE_ENV === "development" && (
              <details className="mt-2 text-left">
                <summary className="cursor-pointer text-khp-text-primary hover:text-khp-text-primary">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
