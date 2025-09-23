"use client";

import { useEffect, useRef, useState } from "react";
import { useApolloClient, useQuery } from "@apollo/client";
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
  SortableOverlay,
} from "@workspace/ui/components/sortable";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Loader2, GripVertical, RefreshCw } from "lucide-react";

import {
  GetMenuTypesDocument,
  type GetMenuTypesQuery,
  type MenuType,
} from "@workspace/graphql";

import { updateMenuTypeAction } from "@/app/(mainapp)/settings/menu-types/actions";

function normalizeMenuTypes(menuTypes: MenuType[]): MenuType[] {
  return [...menuTypes]
    .map((item) => ({ ...item }))
    .sort((a, b) => {
      if (a.public_index === b.public_index) {
        return a.name.localeCompare(b.name);
      }
      return a.public_index - b.public_index;
    })
    .map((item, index) => ({ ...item, public_index: index }));
}

function SortMenuTypesSection() {
  const apolloClient = useApolloClient();
  const { data, loading, error, refetch } = useQuery<GetMenuTypesQuery>(
    GetMenuTypesDocument,
    {
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
      notifyOnNetworkStatusChange: true,
    }
  );

  const [orderedMenuTypes, setOrderedMenuTypes] = useState<MenuType[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  const originalOrderRef = useRef<MenuType[]>([]);

  useEffect(() => {
    if (!data?.menuTypes) return;
    if (hasChanges) return;

    const normalized = normalizeMenuTypes(data.menuTypes);
    setOrderedMenuTypes(normalized);
    originalOrderRef.current = normalized.map((item) => ({ ...item }));
  }, [data?.menuTypes, hasChanges]);

  const handleResetOrder = () => {
    setOrderedMenuTypes(originalOrderRef.current.map((item) => ({ ...item })));
    setHasChanges(false);
    setSaveStatus("idle");
    setSaveError(null);
  };

  const handleReorder = (items: MenuType[]) => {
    const normalized = items.map((item, index) => ({
      ...item,
      public_index: index,
    }));
    setOrderedMenuTypes(normalized);
    setHasChanges(true);
    setSaveStatus("idle");
    setSaveError(null);
  };

  const handleSaveOrder = async () => {
    if (!hasChanges || isSaving) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const updates = orderedMenuTypes
        .map((menuType, index) => ({ menuType, index }))
        .filter(({ menuType, index }) => {
          return originalOrderRef.current[index]?.id !== menuType.id;
        });

      if (updates.length === 0) {
        originalOrderRef.current = orderedMenuTypes.map((item) => ({
          ...item,
        }));
        setHasChanges(false);
        setSaveStatus("success");
        setIsSaving(false);
        setTimeout(() => setSaveStatus("idle"), 2500);
        return;
      }

      for (const { menuType, index } of updates) {
        await updateMenuTypeAction(menuType.id, { public_index: index });
      }

      await Promise.all([
        refetch(),
        apolloClient.refetchQueries({ include: [GetMenuTypesDocument] }),
      ]);

      originalOrderRef.current = orderedMenuTypes.map((item) => ({
        ...item,
      }));

      setHasChanges(false);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch (saveError) {
      console.error("Error saving menu type order", saveError);
      setSaveStatus("error");
      setSaveError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save menu type order."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const renderContent = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-10 gap-4">
          <p className="text-khp-danger font-medium">
            Error loading menu types order
          </p>
          <Button onClick={() => refetch()} variant="khp-default">
            Retry
          </Button>
        </div>
      );
    }

    if (loading && orderedMenuTypes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-khp-primary" />
          <p className="text-khp-text-secondary">Loading menu types...</p>
        </div>
      );
    }

    if (orderedMenuTypes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <p className="text-khp-text-primary font-medium text-lg">
            No menu types available yet
          </p>
          <p className="text-khp-text-secondary text-sm max-w-sm">
            Create menu types first to define how they should appear on your
            public menus.
          </p>
        </div>
      );
    }

    return (
      <Sortable
        value={orderedMenuTypes}
        onValueChange={handleReorder}
        getItemValue={(item) => item.id}
      >
        <SortableContent className="divide-y divide-khp-primary/10">
          {orderedMenuTypes.map((menuType, index) => (
            <SortableItem
              key={menuType.id}
              value={menuType.id}
              className="px-4 py-3 bg-white hover:bg-khp-primary/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <SortableItemHandle className="h-10 w-10 flex items-center justify-center rounded-md bg-khp-primary/10 text-khp-primary">
                  <GripVertical className="h-5 w-5" />
                </SortableItemHandle>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-khp-text-primary font-medium truncate text-base">
                      {menuType.name}
                    </p>
                    <Badge className="bg-khp-primary/10 text-khp-primary">
                      Position {index + 1}
                    </Badge>
                  </div>
                </div>
              </div>
            </SortableItem>
          ))}
        </SortableContent>
        <SortableOverlay>
          {({ value }) => {
            const menuType = orderedMenuTypes.find((item) => item.id === value);
            if (!menuType) return null;
            const index = orderedMenuTypes.findIndex(
              (item) => item.id === menuType.id
            );
            return (
              <div className="px-4 py-3 bg-white rounded-md shadow-lg border border-khp-primary/30 flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-md bg-khp-primary/10 text-khp-primary">
                  <GripVertical className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <p className="text-khp-text-primary font-medium">
                    {menuType.name}
                  </p>
                  <Badge className="bg-khp-primary/10 text-khp-primary">
                    Position {index + 1}
                  </Badge>
                </div>
              </div>
            );
          }}
        </SortableOverlay>
      </Sortable>
    );
  };

  return (
    <div className="bg-khp-surface rounded-2xl shadow-lg border border-khp-primary/20 overflow-hidden w-full">
      <div className="bg-gradient-to-r from-khp-primary/5 to-khp-primary/10 px-6 py-5 border-b border-khp-primary/20">
        <h2 className="text-xl font-semibold text-khp-primary">
          Menu Types Positioning
        </h2>
        <p className="text-sm text-khp-text/70 mt-1">
          Drag and drop to set the order of your menu types on public menus
        </p>
      </div>
      <div className="p-6 space-y-6">
        {renderContent()}

        {orderedMenuTypes.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 text-sm text-khp-text-secondary">
              {saveStatus === "success" && (
                <span className="text-green-600 font-medium">
                  Order saved successfully
                </span>
              )}
              {saveStatus === "error" && saveError && (
                <span className="text-red-600 font-medium">{saveError}</span>
              )}
              {hasChanges && saveStatus === "idle" && (
                <span className="text-khp-text/80">
                  You have unsaved changes
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleResetOrder}
                disabled={
                  isSaving || (!hasChanges && orderedMenuTypes.length > 0)
                }
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
              <Button
                type="button"
                onClick={handleSaveOrder}
                disabled={!hasChanges || isSaving}
                variant="khp-default"
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving order...
                  </>
                ) : (
                  "Save Order"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SortMenuTypesSection;
