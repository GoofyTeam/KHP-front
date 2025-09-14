"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Settings, RotateCcw, Loader2 } from "lucide-react";
import { GetQuickAccessesDocument } from "@/graphql/generated/graphql";
import QuickAccessButtonForm from "./quick-access-button-form";
import ResetDialog from "./reset-dialog";

type QuickAccessData = {
  id: number;
  name: string;
  icon: string;
  icon_color: "primary" | "warning" | "error" | "info";
  url_key: string;
};

export default function QuickAccessForm() {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const { data, loading, refetch } = useQuery(GetQuickAccessesDocument);

  const quickAccesses: QuickAccessData[] =
    data?.quickAccesses?.map((qa) => ({
      id: parseInt(qa.id),
      name: qa.name,
      icon: qa.icon,
      icon_color: qa.icon_color as "primary" | "warning" | "error" | "info",
      url_key: qa.url_key,
    })) || [];

  const handleUpdate = async () => {
    await refetch();
  };

  const handleReset = async () => {
    await refetch();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-khp-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-khp-text-primary flex items-center gap-3">
              <Settings className="h-7 w-7 text-khp-primary" />
              Quick Access Management
            </h1>
            <p className="text-khp-text-secondary mt-2 text-base">
              Configure your quick access buttons for faster navigation
            </p>
          </div>
          <Button
            onClick={() => setShowResetDialog(true)}
            variant="outline"
            className="flex items-center gap-2 h-12 px-6 text-base font-semibold border-2 border-khp-primary/20 hover:border-khp-primary hover:bg-khp-primary/5 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <RotateCcw className="h-5 w-5" />
            Reset to Default
          </Button>
        </div>
      </div>

      <Card className="bg-khp-surface border-khp-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-khp-text-primary">
            Quick Access Buttons Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {quickAccesses.map((quickAccess, index) => (
            <QuickAccessButtonForm
              key={quickAccess.id}
              index={index}
              data={quickAccess}
              onUpdate={handleUpdate}
            />
          ))}
        </CardContent>
      </Card>

      <ResetDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
        onReset={handleReset}
      />
    </div>
  );
}
