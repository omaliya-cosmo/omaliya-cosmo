import React from "react";
import Link from "next/link";
import { FiChevronRight, FiHome } from "react-icons/fi";
import { Product, ProductCategory } from "@prisma/client";

interface ProductWithCategory extends Product {
  category?: ProductCategory;
}

interface ProductBreadcrumbsProps {
  product: ProductWithCategory;
}

const ProductBreadcrumbs: React.FC<ProductBreadcrumbsProps> = ({ product }) => {
  return (
    <nav className="flex py-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600"
          >
            <FiHome className="mr-2" size={16} />
            Home
          </Link>
        </li>
        <li>
          <div className="flex items-center">
            <FiChevronRight className="text-gray-400" size={16} />
            <Link
              href="/products"
              className="ml-1 text-sm font-medium text-gray-600 hover:text-indigo-600 md:ml-2"
            >
              Products
            </Link>
          </div>
        </li>
        {product.category && (
          <li>
            <div className="flex items-center">
              <FiChevronRight className="text-gray-400" size={16} />
              <Link
                href={`/products?category=${product.category.id}`}
                className="ml-1 text-sm font-medium text-gray-600 hover:text-indigo-600 md:ml-2"
              >
                {product.category.name}
              </Link>
            </div>
          </li>
        )}
        <li aria-current="page">
          <div className="flex items-center">
            <FiChevronRight className="text-gray-400" size={16} />
            <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 truncate max-w-[160px]">
              {product.name}
            </span>
          </div>
        </li>
      </ol>
    </nav>
  );
};

export default ProductBreadcrumbs;