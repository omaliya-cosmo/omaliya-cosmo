'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ProductsSorting from './ProductsSorting';

interface ClientSortingWrapperProps {
  currentSort: string;
  viewMode: 'grid' | 'list';
  currentParams: Record<string, any>;
}

export default function ClientSortingWrapper({
  currentSort,
  viewMode,
  currentParams
}: ClientSortingWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentViewMode, setCurrentViewMode] = useState<'grid' | 'list'>(viewMode);

  // Handle sort change internally
  const handleSortChange = (sort: string) => {
    // Create a new URLSearchParams object
    const params = new URLSearchParams();
    
    // Add all current params except sort
    Object.entries(currentParams).forEach(([key, value]) => {
      if (key !== 'sort' && key !== 'page' && value) {
        params.append(key, value);
      }
    });
    
    // Add the new sort
    params.append('sort', sort);
    
    // Navigate to the new URL
    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    router.push(url);
  };

  // Handle view mode change internally
  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setCurrentViewMode(mode);
    // You could store this in localStorage instead of URL parameters
    localStorage.setItem('productViewMode', mode);
  };

  return (
    <ProductsSorting
      currentSort={currentSort}
      viewMode={currentViewMode}
      onSortChange={handleSortChange}
      onViewModeChange={handleViewModeChange}
    />
  );
}