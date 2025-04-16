import React from 'react';
import Link from 'next/link';

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

// Header component with enhanced styling
export default function ProductsHeader({
  title,
  description,
  breadcrumbItems,
}: ProductsHeaderProps) {
  return (
    <div className="py-12 sm:py-16 container mx-auto px-4">
      {/* Breadcrumb navigation */}
      <nav className="mb-6">
        <ol className="flex space-x-2 text-sm">
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={index}>
              <li>
                {item.active ? (
                  <span className="font-medium text-purple-700">{item.label}</span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-gray-600 hover:text-purple-600 transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
              {index < breadcrumbItems.length - 1 && (
                <li aria-hidden="true" className="text-gray-500">
                  /
                </li>
              )}
            </React.Fragment>
          ))}
        </ol>
      </nav>

      {/* Title and description with gradient styling */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-800 to-pink-700">
        {title}
      </h1>
      <div className="relative max-w-3xl">
        <div className="h-0.5 w-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6"></div>
        <p className="text-lg text-gray-600 max-w-2xl">{description}</p>
      </div>
    </div>
  );
}