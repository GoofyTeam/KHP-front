import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Ingredient Not Found
          </h1>

          <p className="text-gray-600 mb-6">
            The ingredient you are looking for does not exist or has been
            deleted.
          </p>

          <Button
            asChild
            variant="default"
            className="bg-khp-primary text-primary-foreground hover:bg-khp-primary/90"
          >
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
