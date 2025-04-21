"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import ProductBreadcrumbs from "@/components/product-detail/ProductBreadcrumbs";
import ProductGallery from "@/components/product-detail/ProductGallery";
import ProductInfo from "@/components/product-detail/ProductInfo";
import ProductPricing from "@/components/product-detail/ProductPricing";
import ProductDetails from "@/components/product-detail/ProductDetails";
import RelatedProducts from "@/components/product-detail/RelatedProducts";
import AddToCartButton from "@/components/product-detail/AddToCartButton";
import NewsletterSection from "@/components/home/Newsletter";
import {
  Product as PrismaProduct,
  ProductCategory,
  Review,
} from "@prisma/client";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import { getCustomerFromToken } from "@/app/actions";
import Footer from "@/components/layout/Footer";

interface Product extends PrismaProduct {
  category?: ProductCategory;
  reviews?: Review[];
}

export default function ProductDetailPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState<Product>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currency, setCurrency] = useState<"LKR" | "USD">("LKR");
  const [quantity, setQuantity] = useState(1);

  // States for header data
  const [userData, setUserData] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bundleoffers, setBundleoffers] = useState([]);
  const [headerLoading, setHeaderLoading] = useState(true);
  const [headerError, setHeaderError] = useState(null);

  // Function to fetch cart count - moved outside useEffect to be reusable
  const fetchCartCount = async () => {
    try {
      const res = await axios.get("/api/cart");
      const data = res.data;
      const totalItems =
        data.items?.reduce(
          (sum: number, item: any) => sum + item.quantity,
          0
        ) || 0;

      setCartCount(totalItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  // Fetch user data and cart count
  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await getCustomerFromToken();
      setUserData(userData);
    };

    fetchUserData();
    fetchCartCount();
  }, []);

  // Fetch header data (products, categories, bundles)
  useEffect(() => {
    const fetchHeaderData = async () => {
      setHeaderLoading(true);
      try {
        // Fetch featured products for header
        const productsResponse = await axios.get("/api/products");
        setProducts(productsResponse.data.products);

        // Fetch categories
        const categoriesResponse = await axios.get("/api/categories");
        setCategories(categoriesResponse.data.categories);

        // Fetch bundle offers
        const bundlesResponse = await axios.get("/api/bundleoffers");
        setBundleoffers(bundlesResponse.data);
      } catch (err) {
        console.error("Error fetching header data:", err);
        setHeaderError(err);
      } finally {
        setHeaderLoading(false);
      }
    };

    fetchHeaderData();
  }, []);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const response = await axios.get(`/api/products/${productId}`);
        setProduct(response.data);
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
    <main className="bg-gradient-to-b from-purple-50 via-white to-purple-50 min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <Header
        userData={userData}
        cartCount={cartCount}
        products={products}
        categories={categories}
        bundles={bundleoffers}
        loading={headerLoading}
        error={headerError}
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large blurred background gradients */}
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full bg-gradient-to-r from-purple-100/30 to-pink-100/30 blur-3xl"
          style={{ top: "5%", left: "30%", transform: "translateX(-50%)" }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: 20,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-pink-100/20 to-purple-100/20 blur-3xl"
          style={{ bottom: "10%", right: "5%" }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            repeat: Infinity,
            duration: 25,
            ease: "easeInOut",
          }}
        />

        {/* Floating particles with various sizes */}
        <motion.div
          className="absolute w-10 h-10 rounded-full bg-purple-200/60"
          style={{ top: "15%", left: "10%" }}
          animate={{
            y: [-30, 0, -30],
            x: [20, 0, 20],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            repeat: Infinity,
            duration: 12,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute w-8 h-8 rounded-full bg-pink-200/60"
          style={{ top: "25%", right: "15%" }}
          animate={{
            y: [0, 25, 0],
            x: [0, -15, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: 14,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-24 py-8">
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
                onAddToCartSuccess={fetchCartCount}
              />
            </div>
          </div>
        </div>

        {/* Product details and reviews */}
        <ProductDetails
          product={product}
          reviews={product.reviews || []}
          productId={product.id}
        />

        {/* Related products */}
        <RelatedProducts
          categoryId={product.categoryId}
          currentProductId={product.id}
        />
      </div>

      <Footer />
    </main>
  );
}
