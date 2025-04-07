"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import ProductBreadcrumbs from "@/components/product-detail/ProductBreadcrumbs";
import ProductGallery from "@/components/product-detail/ProductGallery";
import ProductInfo from "@/components/product-detail/ProductInfo";
import ProductPricing from "@/components/product-detail/ProductPricing";
import ProductDetails from "@/components/product-detail/ProductDetails";
import ProductReviews from "@/components/product-detail/ProductReviews";
import RelatedProducts from "@/components/product-detail/RelatedProducts";
import AddToCartButton from "@/components/product-detail/AddToCartButton";
import NewsletterSection from "@/components/home/Newsletter";
import { Product, ProductCategory, Review } from "@prisma/client";

interface ProductWithDetails extends Product {
  category?: ProductCategory;
  reviews?: Review[];
}

export default function ProductDetailPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currency, setCurrency] = useState<"LKR" | "USD">("LKR");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const response = await axios.get(`/api/products/${productId}`);
        setProduct(response.data.product);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div>
              <div className="h-10 bg-gray-200 rounded w-3/4 mb-6"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-4 w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded mb-8 w-4/6"></div>
              <div className="h-12 bg-gray-200 rounded mb-6 w-1/3"></div>
              <div className="h-12 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-50 p-6 rounded-lg text-center">
          <h2 className="text-xl font-medium text-red-600 mb-2">
            {error || "Product not found"}
          </h2>
          <p className="text-red-500 mb-4">
            We couldn't find the product you're looking for.
          </p>
          <a
            href="/products"
            className="inline-block bg-indigo-600 text-white px-5 py-2.5 rounded-md hover:bg-indigo-700"
          >
            Return to Products
          </a>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-white">
      <div className="container mx-auto px-4 py-8">
        <ProductBreadcrumbs product={product} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          {/* Left column: Product images */}
          <ProductGallery images={product.imageUrls} />

          {/* Right column: Product info and actions */}
          <div>
            <ProductInfo 
              name={product.name} 
              description={product.description} 
              category={product.category} 
              stock={product.stock}
            />
            
            <ProductPricing 
              priceLKR={product.priceLKR}
              discountPriceLKR={product.discountPriceLKR}
              priceUSD={product.priceUSD}
              discountPriceUSD={product.discountPriceUSD}
              currency={currency}
              onCurrencyChange={setCurrency}
            />
            
            <div className="mt-8 space-y-4">
              {/* Quantity selector */}
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Quantity:</span>
                <div className="flex border border-gray-300 rounded">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 border-r border-gray-300"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-16 text-center py-1 focus:outline-none"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 border-l border-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Add to cart button */}
              <AddToCartButton 
                product={product} 
                quantity={quantity} 
                currency={currency}
              />
            </div>
          </div>
        </div>

        {/* Product details, specifications, etc */}
        <ProductDetails product={product} />

        {/* Reviews section */}
        <ProductReviews reviews={product.reviews || []} productId={product.id} />

        {/* Related products */}
        <RelatedProducts categoryId={product.categoryId} currentProductId={product.id} />
      </div>
      
      <NewsletterSection />
    </main>
  );
}