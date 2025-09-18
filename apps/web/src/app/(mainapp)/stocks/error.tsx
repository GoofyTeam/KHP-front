"use client";

import ErrorPage from "@/components/error-page";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function StocksError({ error, reset }: ErrorProps) {
  return (
    <ErrorPage
      error={error}
      reset={reset}
      defaultMessage="An error occurred while loading the stocks page."
      backHref="/dashboard"
      backLabel="Go to Dashboard"
      logError={true}
      logPrefix="Stocks page error"
    />
  );
}
