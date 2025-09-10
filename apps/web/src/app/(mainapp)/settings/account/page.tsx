"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AccountForm } from "@/components/account/account-form";
import { useUserStore } from "@/stores/user-store";

export default function Account() {
  const router = useRouter();
  const { user, isLoading, error, fetchUser } = useUserStore();

  useEffect(() => {
    // Fetch user data only if we don't have it
    if (!user && !isLoading && !error) {
      fetchUser();
    }
  }, [user, isLoading, error, fetchUser]);

  useEffect(() => {
    // Only redirect if we have an error or if we finished loading and have no user
    if (error) {
      console.error("Failed to fetch user:", error);
      // Attendre un peu avant de rediriger pour éviter les redirections trop rapides
      const timer = setTimeout(() => {
        router.push("/login");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [error, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center lg:p-4">
        <div className="w-full">
          <div className="lg:p-8">
            <div className="max-w-2xl mx-auto space-y-8 w-full">
              {/* Skeleton loader */}
              <div className="bg-khp-surface rounded-2xl shadow-lg border border-khp-primary/20 overflow-hidden w-full">
                <div className="bg-gradient-to-r from-khp-primary/5 to-khp-primary/10 px-6 py-5 border-b border-khp-primary/20">
                  <div className="animate-pulse space-y-2">
                    <div className="h-6 bg-khp-primary/20 rounded w-1/3"></div>
                    <div className="h-4 bg-khp-primary/10 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div className="animate-pulse space-y-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-khp-primary/10 rounded w-1/4"></div>
                      <div className="h-12 bg-khp-primary/10 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-khp-primary/10 rounded w-1/4"></div>
                      <div className="h-12 bg-khp-primary/10 rounded"></div>
                    </div>
                    <div className="pt-4">
                      <div className="h-12 bg-khp-primary/20 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center lg:p-4">
        <div className="w-full">
          <div className="lg:p-8">
            <div className="max-w-2xl mx-auto space-y-8 w-full">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                <p className="text-red-700 mb-4">Failed to load user data</p>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <p className="text-gray-600 text-sm">Redirecting to login...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show content if we have user data
  if (!user) {
    return (
      <div className="h-full flex items-center justify-center lg:p-4">
        <div className="w-full">
          <div className="lg:p-8">
            <div className="max-w-2xl mx-auto space-y-8 w-full">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
                <p className="text-gray-700">No user data available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center lg:p-4">
      <div className="w-full">
        <div className="lg:p-8">
          <AccountForm user={user} />
        </div>
      </div>
    </div>
  );
}
