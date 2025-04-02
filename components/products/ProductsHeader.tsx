import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/solid';

interface BreadcrumbItem {
  label: string;
  href: string;
  active?: boolean;
}

interface ProductsHeaderProps {
  title: string;
  description: string;
  breadcrumbItems: BreadcrumbItem[];
}

export default function ProductsHeader({ title, description, breadcrumbItems }: ProductsHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 py-10 md:py-16">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <nav className="mb-6">
          <ol className="flex flex-wrap items-center text-sm">
            {breadcrumbItems.map((item, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && <ChevronRightIcon className="h-4 w-4 mx-2 text-gray-400" />}
                {item.active ? (
                  <span className="text-purple-700 font-medium">{item.label}</span>
                ) : (
                  <Link href={item.href} className="text-gray-600 hover:text-purple-700">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
        
        {/* Page Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{title}</h1>
        
        {/* Description */}
        <p className="text-gray-600 max-w-3xl">{description}</p>
      </div>
    </div>
  );
}