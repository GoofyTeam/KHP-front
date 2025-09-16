"use client";

import ErrorPage from "@/components/error-page";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MovePageError({ error, reset }: ErrorProps) {
  return (
    <ErrorPage
      error={error}
      reset={reset}
      defaultMessage="An error occurred while loading the move quantity page."
      backHref="/stocks"
      backLabel="Back to Stocks"
    />
  );
}
