'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ProductsPagination from './ProductsPagination';

interface ClientPaginationWrapperProps {
  currentPage: number;
  totalPages: number;
  currentParams: Record<string, string | undefined>;
}

export default function ClientPaginationWrapper({
  currentPage,
  totalPages,
  currentParams
}: ClientPaginationWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handlePageChange = (page: number) => {
    // Create a new URLSearchParams object from the current params
    const params = new URLSearchParams();
    
    // Add all current params except page
    Object.entries(currentParams).forEach(([key, value]) => {
      if (key !== 'page' && value) {
        params.append(key, value);
      }
    });
    
    // Add the new page, but only if it's not page 1 (to keep URLs cleaner)
    if (page > 1) {
      params.append('page', page.toString());
    }
    
    // Navigate to the new URL
    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    
    // Scroll to top before navigation
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    router.push(url);
  };

  return (
    <ProductsPagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      siblingCount={1}
    />
  );
}