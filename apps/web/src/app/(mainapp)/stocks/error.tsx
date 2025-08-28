"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function StocksError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log l'erreur pour le monitoring
    console.error("Stocks page error:", error);
  }, [error]);

  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center space-y-4 pt-6">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Something went wrong!</h3>
            <p className="text-sm text-muted-foreground">
              {error.message ||
                "An error occurred while loading the stocks page."}
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
            <Button
              asChild
              variant="default"
              className="bg-khp-primary text-primary-foreground hover:bg-khp-primary/90"
            >
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
