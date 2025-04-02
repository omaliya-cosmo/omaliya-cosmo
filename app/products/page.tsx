import React from 'react';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import ProductsHeader from '@/components/products/ProductsHeader';
import ProductFilterSidebar from '@/components/products/ProductFilterSidebar';
import ProductGrid from '@/components/products/ProductGrid';
import ProductsEmptyState from '@/components/products/ProductsEmptyState';
import ProductsPagination from '@/components/products/ProductsPagination';
import ProductsSorting from '@/components/products/ProductsSorting';
import ProductsActiveFilters from '@/components/products/ProductsActiveFilters';
import NewsletterSection from '@/components/home/Newsletter';
import FeaturedProductsBanner from '@/components/home/FeaturedProducts';
import ClientPaginationWrapper from '@/components/products/ClientPaginationWrapper';
import ClientEmptyStateWrapper from '@/components/products/ClientEmptyStateWrapper';
import ClientSortingWrapper from '@/components/products/ClientSortingWrapper';
import ClientFeaturedBannerWrapper from '@/components/products/ClientFeaturedBannerWrapper';

export const metadata: Metadata = {
  title: 'Shop All Products | Omaliya Cosmetics',
  description: 'Discover our range of natural and organic cosmetics, skincare, and beauty products that help you look and feel your best.',
};

export const dynamic = 'force-dynamic';

export default async function ProductsPage({ 
  searchParams 
}: { 
  searchParams: { 
    category?: string, 
    sort?: string, 
    page?: string, 
    minPriceLKR?: string, 
    maxPriceLKR?: string,
    minPriceUSD?: string, 
    maxPriceUSD?: string,
    inStock?: string,
    rating?: string,
    search?: string
  } 
}) {
  // Get searchParams values safely
  const searchParamsObj = await searchParams;
  
  // Get currency preference from cookie
  const cookieStore = await cookies();
  const countryCookie = cookieStore.get('country');
  const country = countryCookie?.value || 'LK';
  const currency = country === 'LK' ? 'LKR' : 'USD';
  
  // Parse search parameters
  const page = Number(searchParamsObj.page) || 1;
  const sort = searchParamsObj.sort || 'newest';
  const categoryId = searchParamsObj.category;
  const search = searchParamsObj.search;
  
  // Get min/max price based on currency
  let minPrice, maxPrice;
  if (currency === 'LKR') {
    minPrice = searchParamsObj.minPriceLKR ? Number(searchParamsObj.minPriceLKR) : undefined;
    maxPrice = searchParamsObj.maxPriceLKR ? Number(searchParamsObj.maxPriceLKR) : undefined;
  } else {
    minPrice = searchParamsObj.minPriceUSD ? Number(searchParamsObj.minPriceUSD) : undefined;
    maxPrice = searchParamsObj.maxPriceUSD ? Number(searchParamsObj.maxPriceUSD) : undefined;
  }
  
  const inStock = searchParamsObj.inStock === 'true';
  const rating = searchParamsObj.rating ? Number(searchParamsObj.rating) : undefined;

  // Create the API URL with all search parameters
  const apiUrl = new URL('/api/products', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');
  
  // Add parameters to the API URL
  apiUrl.searchParams.append('page', page.toString());
  apiUrl.searchParams.append('pageSize', '12');
  apiUrl.searchParams.append('sort', sort);
  
  if (categoryId) {
    apiUrl.searchParams.append('category', categoryId);
  }
  
  if (search) {
    apiUrl.searchParams.append('search', search);
  }
  
  // Add price parameters based on currency
  if (currency === 'LKR') {
    if (minPrice) apiUrl.searchParams.append('minPriceLKR', minPrice.toString());
    if (maxPrice) apiUrl.searchParams.append('maxPriceLKR', maxPrice.toString());
  } else {
    if (minPrice) apiUrl.searchParams.append('minPriceUSD', minPrice.toString());
    if (maxPrice) apiUrl.searchParams.append('maxPriceUSD', maxPrice.toString());
  }
  
  if (inStock) {
    apiUrl.searchParams.append('inStock', 'true');
  }
  
  if (rating) {
    apiUrl.searchParams.append('rating', rating.toString());
  }

  // Fetch products from API
  const response = await fetch(apiUrl.toString(), { next: { revalidate: 60 } });
  
  let products = [];
  let totalProducts = 0;
  let totalPages = 0;
  let responseData = { currency };
  
  if (response.ok) {
    const data = await response.json();
    products = data.products;
    totalProducts = data.totalProducts;
    totalPages = data.totalPages;
    responseData = data;
  } else {
    console.error('Failed to fetch products:', await response.text());
  }

  // Fetch category name if category ID is provided
  let categoryName = '';
  if (categoryId) {
    try {
      const categoryResponse = await fetch(`/api/categories/${categoryId}`);
      if (categoryResponse.ok) {
        const categoryData = await categoryResponse.json();
        categoryName = categoryData.name;
      }
    } catch (error) {
      console.error('Error fetching category:', error);
    }
  }

  // Get active filters for display
  const activeFilters = [];
  
  if (categoryName) {
    activeFilters.push({ 
      label: 'Category', 
      value: categoryName, 
      param: 'category' 
    });
  }
  
  if (minPrice) {
    activeFilters.push({ 
      label: 'Min Price', 
      value: `${currency === 'LKR' ? 'Rs. ' : '$'}${minPrice}`, 
      param: currency === 'LKR' ? 'minPriceLKR' : 'minPriceUSD'
    });
  }
  
  if (maxPrice) {
    activeFilters.push({ 
      label: 'Max Price', 
      value: `${currency === 'LKR' ? 'Rs. ' : '$'}${maxPrice}`, 
      param: currency === 'LKR' ? 'maxPriceLKR' : 'maxPriceUSD'
    });
  }
  
  if (inStock) {
    activeFilters.push({ 
      label: 'Availability', 
      value: 'In Stock', 
      param: 'inStock' 
    });
  }
  
  if (rating) {
    activeFilters.push({ 
      label: 'Rating', 
      value: `${rating}+ Stars`, 
      param: 'rating' 
    });
  }
  
  if (search) {
    activeFilters.push({ 
      label: 'Search', 
      value: search, 
      param: 'search' 
    });
  }

  // Determine breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products', active: !categoryName }
  ];
  
  if (categoryName) {
    breadcrumbItems.push({ 
      label: categoryName, 
      href: `/categories/${categoryId}`,
      active: true
    });
  }

  // Check if filters are applied
  const hasFilters = activeFilters.length > 0;
  const hasActiveSearch = !!search;

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Banner for featured products - only show if no filters are applied */}
      {!hasFilters && (
        <ClientFeaturedBannerWrapper
          country={country}
        />
      )}
      
      {/* Products header with title and breadcrumbs */}
      <ProductsHeader 
        title={categoryName ? categoryName : "All Products"} 
        description={categoryName 
          ? `Browse our collection of ${categoryName.toLowerCase()} products.`
          : "Discover our complete range of natural and organic beauty products."
        }
        breadcrumbItems={breadcrumbItems}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Active filters */}
        {activeFilters.length > 0 && (
          <ProductsActiveFilters 
            activeFilters={activeFilters} 
            currentParams={searchParamsObj} // Changed from searchParams to searchParamsObj
          />
        )}
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter sidebar */}
          <aside className="lg:w-1/4">
            <ProductFilterSidebar 
              currentParams={searchParamsObj} // Changed from searchParams to searchParamsObj
              productCount={totalProducts}
              currency={currency} // Add currency
            />
          </aside>
          
          {/* Main product content */}
          <div className="lg:w-3/4">
            {/* Sorting and product count */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <p className="text-gray-600">
                {totalProducts > 0 ? (
                  <>
                    Showing <span className="font-medium">{(page - 1) * 12 + 1}</span> - <span className="font-medium">{Math.min(page * 12, totalProducts)}</span> of <span className="font-medium">{totalProducts}</span> products
                  </>
                ) : (
                  <span className="font-medium">No products found</span>
                )}
              </p>
              
              <ClientSortingWrapper
                currentSort={sort}
                currentParams={searchParamsObj}
                viewMode="grid" // Add the required viewMode property
              />
            </div>
            
            {/* Products grid or empty state */}
            {products.length > 0 ? (
              <ProductGrid 
                products={products} 
                currency={currency}
                currencySymbol={currency === 'LKR' ? 'Rs. ' : '$'}
              />
            ) : (
              <ClientEmptyStateWrapper
                message={hasActiveSearch 
                  ? `No products found matching "${search}"` 
                  : "No products found"
                }
                suggestion="Try adjusting your filters or search terms to find what you're looking for."
                hasFilters={hasFilters}
              />
            )}
            
            {/* Pagination - wrapped in a client component to handle client-side navigation */}
            {totalPages > 1 && (
              <ClientPaginationWrapper
                currentPage={page}
                totalPages={totalPages}
                currentParams={searchParamsObj} // Changed from searchParams to searchParamsObj
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Newsletter section */}
      <NewsletterSection />
    </main>
  );
}