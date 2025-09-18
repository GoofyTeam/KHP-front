"use client";

import { useRouter } from "next/navigation";
import ErrorPage from "@/components/error-page";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LossError({ error, reset }: ErrorProps) {
  const router = useRouter();
  
  return (
    <ErrorPage
      error={error}
      reset={reset}
      defaultMessage="An error occurred while loading the loss page."
      backLabel="Go to Stocks"
      onBack={() => router.back()}
    />
  );
}
