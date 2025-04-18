import React from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
}

interface ProductBreadcrumbsProps {
  product: Product;
}

export default function ProductBreadcrumbs({ product }: ProductBreadcrumbsProps) {
  return (
    <nav className="mb-6">
      <ol className="flex flex-wrap items-center space-x-2 text-sm">
        <li>
          <Link 
            href="/" 
            className="text-gray-600 hover:text-purple-600 transition-colors"
          >
            Home
          </Link>
        </li>
        <li aria-hidden="true" className="text-gray-500">
          /
        </li>
        <li>
          <Link 
            href="/products" 
            className="text-gray-600 hover:text-purple-600 transition-colors"
          >
            Products
          </Link>
        </li>
        {product.category && (
          <>
            <li aria-hidden="true" className="text-gray-500">
              /
            </li>
            <li>
              <Link
                href={`/products?category=${product.category.id}`}
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                {product.category.name}
              </Link>
            </li>
          </>
        )}
        <li aria-hidden="true" className="text-gray-500">
          /
        </li>
        <li>
          <span className="font-medium text-purple-700">{product.name}</span>
        </li>
      </ol>
    </nav>
  );
}