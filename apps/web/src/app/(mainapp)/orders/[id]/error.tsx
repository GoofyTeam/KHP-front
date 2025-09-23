"use client";

import ErrorPage from "@/components/error-page";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function OrderError({ error, reset }: ErrorProps) {
  return (
    <ErrorPage
      error={error}
      reset={reset}
      defaultMessage="An error occurred while loading the order page."
      backHref="/orders"
      backLabel="Back to Orders"
      logError={true}
      logPrefix="Order page error"
    />
  );
}
