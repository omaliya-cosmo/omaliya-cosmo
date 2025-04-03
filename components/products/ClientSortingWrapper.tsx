"use client";

import ProductsSorting from "./ProductsSorting";

interface ClientSortingWrapperProps {
  currentSort: string;
  viewMode: "grid" | "list";
  onSortChange: (sort: string) => void;
  onViewModeChange: (mode: "grid" | "list") => void;
}

export default function ClientSortingWrapper({
  currentSort,
  viewMode,
  onSortChange,
  onViewModeChange,
}: ClientSortingWrapperProps) {
  return (
    <ProductsSorting
      currentSort={currentSort}
      viewMode={viewMode}
      onSortChange={onSortChange}
      onViewModeChange={onViewModeChange}
    />
  );
}
