"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
  defaultMessage?: string;
  backHref?: string;
  backLabel?: string;
  onBack?: () => void;
  logError?: boolean;
  logPrefix?: string;
}

export default function ErrorPage({
  error,
  reset,
  defaultMessage = "An error occurred while loading the page.",
  backHref = "/dashboard",
  backLabel = "Go to Dashboard",
  onBack,
  logError = false,
  logPrefix = "Page error",
}: ErrorPageProps) {
  // Log error if requested
  if (logError) {
    console.error(`${logPrefix}:`, error);
  }
  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center space-y-4 pt-6">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Something went wrong!</h3>
            <p className="text-sm text-muted-foreground">
              {error.message || defaultMessage}
            </p>
            {process.env.NODE_ENV === "development" && error.digest && (
              <p className="text-xs text-muted-foreground font-mono">
                Error ID: {error.digest}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={reset} variant="outline">
              Try Again
            </Button>
            {onBack ? (
              <Button
                onClick={onBack}
                variant="default"
                className="bg-khp-primary text-primary-foreground hover:bg-khp-primary/90"
              >
                {backLabel}
              </Button>
            ) : (
              <Button
                asChild
                variant="default"
                className="bg-khp-primary text-primary-foreground hover:bg-khp-primary/90"
              >
                <Link href={backHref}>{backLabel}</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
