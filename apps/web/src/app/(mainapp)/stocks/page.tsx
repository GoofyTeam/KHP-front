"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { AlertTriangle, Search, MoreVertical, Plus } from "lucide-react";

import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { MultiSelect } from "@workspace/ui/components/multi-select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { useIngredients, getStockStatus } from "@/hooks/useIngredients";
import { DataTable } from "@/components/data-table/data-table";
import { columns } from "@/components/data-table/columns";
import type { ColumnFiltersState, OnChangeFn } from "@tanstack/react-table";

export default function StocksPage() {
  const {
    ingredients,
    initialLoading,
    searchLoading,
    loadingMore,
    error,
    hasMore,
    fetchIngredients,
    loadMore,
  } = useIngredients();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Options for the multi-selects
  const categoryOptions = [
    { label: "Meat", value: "Meat" },
    { label: "Vegetables", value: "Vegetables" },
    { label: "Dairy", value: "Dairy" },
    { label: "Grains", value: "Grains" },
  ];

  const statusOptions = [
    { label: "In Stock", value: "in-stock" },
    { label: "Low Stock", value: "low-stock" },
    { label: "Out of Stock", value: "out-of-stock" },
  ];

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Initial load
  useEffect(() => {
    fetchIngredients().catch(console.error);
  }, [fetchIngredients]);

  // Handle search changes
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) return; // Wait for debounce

    const searchQuery = debouncedSearchTerm.trim();
    fetchIngredients(searchQuery).catch(console.error);
  }, [debouncedSearchTerm, searchTerm, fetchIngredients]);

  // Update column filters when filters change and auto-load more data if needed
  useEffect(() => {
    const filters: ColumnFiltersState = [];

    if (searchTerm.trim()) {
      filters.push({ id: "name", value: searchTerm.trim() });
    }

    if (categoryFilter.length > 0) {
      filters.push({ id: "categories", value: categoryFilter });
    }

    if (statusFilter.length > 0) {
      filters.push({ id: "status", value: statusFilter });
    }

    setColumnFilters(filters);

    // Auto-load more data when filters are applied to ensure we have enough results
    if (
      (categoryFilter.length > 0 || statusFilter.length > 0) &&
      ingredients.length < 50 &&
      hasMore &&
      !loadingMore
    ) {
      console.log("Auto-loading more data for filtering...");
      loadMore().catch(console.error);
    }
  }, [
    searchTerm,
    categoryFilter,
    statusFilter,
    ingredients.length,
    hasMore,
    loadingMore,
    loadMore,
  ]);

  const handleLoadMore = useCallback(() => {
    loadMore().catch(console.error);
  }, [loadMore]);

  // Count filtered results
  const filteredCount = useMemo(() => {
    if (columnFilters.length === 0) return ingredients.length;

    return ingredients.filter((ingredient) => {
      return columnFilters.every((filter) => {
        if (filter.id === "name") {
          return ingredient.name
            .toLowerCase()
            .includes((filter.value as string).toLowerCase());
        }
        if (filter.id === "categories") {
          const values = Array.isArray(filter.value)
            ? (filter.value as string[])
            : [filter.value as string];
          return values.some((value) =>
            ingredient.categories.some((category) =>
              category.name.toLowerCase().includes(value.toLowerCase())
            )
          );
        }
        if (filter.id === "status") {
          const status = getStockStatus(ingredient.quantities);
          const values = Array.isArray(filter.value)
            ? (filter.value as string[])
            : [filter.value as string];
          return values.includes(status);
        }
        return true;
      });
    }).length;
  }, [ingredients, columnFilters]);

  // Auto-load more data if we don't have enough filtered results
  useEffect(() => {
    const hasActiveFilters =
      categoryFilter.length > 0 || statusFilter.length > 0;
    if (
      hasActiveFilters &&
      filteredCount < 10 &&
      hasMore &&
      !loadingMore &&
      !searchLoading
    ) {
      console.log(`Only ${filteredCount} filtered results, loading more...`);
      setTimeout(() => {
        loadMore().catch(console.error);
      }, 500); // Small delay to avoid rapid loading
    }
  }, [
    filteredCount,
    categoryFilter.length,
    statusFilter.length,
    hasMore,
    loadingMore,
    searchLoading,
    loadMore,
  ]);

  const handleRegisterLost = () => {
    console.log("Register lost clicked");
    // Implement register lost functionality
  };

  const handleAddToStock = () => {
    console.log("Add to stock clicked");
    // Implement add to stock functionality
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-4 pt-6">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">Erreur de chargement</h3>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
            <Button
              onClick={() => fetchIngredients().catch(console.error)}
              variant="outline"
            >
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-44 bg-muted rounded animate-pulse" />
              <div className="h-10 w-36 bg-muted rounded animate-pulse" />
              <div className="h-10 w-64 bg-muted rounded animate-pulse" />
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-24 bg-muted rounded animate-pulse" />
              <div className="h-8 w-24 bg-muted rounded animate-pulse" />
              <div className="h-8 w-20 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="h-96 w-full bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MultiSelect
            options={categoryOptions}
            onValueChange={setCategoryFilter}
            defaultValue={categoryFilter}
            placeholder="Select Categories"
            variant="default"
            className="w-auto"
          />

          <MultiSelect
            options={statusOptions}
            onValueChange={setStatusFilter}
            defaultValue={statusFilter}
            placeholder="Select Status"
            variant="default"
            className="w-auto"
          />

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 max-w-sm h-[48px]"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Desktop buttons */}
          <div className="hidden lg:flex items-center space-x-2">
            <Button
              variant="khp-destructive"
              size="lg"
              onClick={handleRegisterLost}
            >
              Register lost
            </Button>
            <Button variant="khp-default" size="lg" onClick={handleAddToStock}>
              Add to stock
            </Button>
          </div>

          {/* Mobile/Tablet dropdown */}
          <div className="lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-24 w-24" />
                  <span className="sr-only">More actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={handleRegisterLost}
                  className="bg-destructive text-khp-text-on-primary"
                >
                  <AlertTriangle className="mr-2 h-4 w-4 text-khp-text-on-primary" />
                  Register lost
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleAddToStock}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add to stock
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={ingredients}
        columnFilters={columnFilters}
        onColumnFiltersChange={
          setColumnFilters as OnChangeFn<ColumnFiltersState>
        }
        searchLoading={searchLoading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
}
