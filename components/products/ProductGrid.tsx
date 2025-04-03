"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ProductCategory,
  Product as PrismaProduct,
  Review,
} from "@prisma/client";

interface Product extends PrismaProduct {
  category?: ProductCategory; // Include the category relation
  reviews?: Review[]; // Include reviews with count and average rating
}

interface ProductGridProps {
  products: Product[];
  currency: string;
  currencySymbol: string;
  viewMode: "grid" | "list";
}

export default function ProductGrid({
  products,
  currency,
  currencySymbol,
  viewMode,
}: ProductGridProps) {
  return (
    <div
      className={`
      ${
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          : "flex flex-col space-y-4"
      }
    `}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          currency={currency}
          currencySymbol={currencySymbol}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  currency: string;
  currencySymbol: string;
  viewMode: "grid" | "list";
}

function ProductCard({
  product,
  currency,
  currencySymbol,
  viewMode,
}: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.id}`}
      className={`group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 ${
        viewMode === "list" ? "flex items-center space-x-4" : ""
      }`}
    >
      <div
        className={`relative ${
          viewMode === "list" ? "h-24 w-24" : "h-48 aspect-w-1 aspect-h-1"
        } overflow-hidden bg-gray-100`}
      >
        {product.imageUrls && product.imageUrls.length > 0 ? (
          <Image
            src={product.imageUrls[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <svg
              className="w-12 h-12 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        {product.stock <= 0 && (
          <div className="absolute top-0 left-0 w-full h-full bg-gray-900/50 flex items-center justify-center">
            <span className="bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
        <div className="mb-1 text-xs text-purple-600 font-medium">
          {product.category?.name || "Uncategorized"}
        </div>

        <h3 className="text-gray-800 font-medium leading-tight mb-2 group-hover:text-purple-700 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center justify-between">
          <div className="font-bold text-gray-900">
            {currencySymbol}
            {currency === "LKR"
              ? product.discountPriceLKR?.toFixed(2) ||
                product.priceLKR?.toFixed(2)
              : product.discountPriceUSD?.toFixed(2) ||
                product.priceUSD?.toFixed(2)}
          </div>

          <div className="flex items-center">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i <
                    Math.round(
                      product.reviews && product.reviews.length > 0
                        ? product.reviews.reduce(
                            (sum, review) => sum + review.rating,
                            0
                          ) / product.reviews.length
                        : 0
                    )
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">
              ({product.reviews?.length || 0})
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
