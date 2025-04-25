"use client";

import { useRouter } from "next/navigation";
import ProductsEmptyState from "./ProductsEmptyState";

interface ClientEmptyStateWrapperProps {
  message: string;
  suggestion: string;
  hasFilters: boolean;
}

export default function ClientEmptyStateWrapper({
  message,
  suggestion,
  hasFilters,
}: ClientEmptyStateWrapperProps) {
  const router = useRouter();

  const handleClearFilters = () => {
    router.push("/products");
  };

  return (
    <ProductsEmptyState
      message={message}
      suggestion={suggestion}
      hasFilters={hasFilters}
      onClearFilters={handleClearFilters}
    />
  );
}
