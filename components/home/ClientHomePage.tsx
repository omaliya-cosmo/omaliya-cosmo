"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useCountry } from "@/app/lib/hooks/useCountry";

// Imported Components
import HeroSection from "@/components/home/HeroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import BenefitsBanner from "@/components/home/BenefitsBanner";
import Testimonials from "@/components/home/Testimonials";
import FeaturedBundles from "@/components/home/FeaturedBundles";
import SocialMediaFeed from "@/components/home/SocialMediaFeed";
import { useCart } from "@/app/lib/hooks/CartContext";
import {
  BundleOffer as PrismaBundleOffer,
  ProductsOnBundles as PrismaProductsOnBundles,
  Product as PrismaProduct,
  ProductCategory,
  Review,
} from "@prisma/client";

// Define the types
interface ProductsOnBundles extends PrismaProductsOnBundles {
  product: Product;
}

interface BundleOffer extends PrismaBundleOffer {
  products: ProductsOnBundles[];
}

interface Product extends PrismaProduct {
  reviews?: Review[];
  category?: ProductCategory;
}

interface CartProduct {
  id: string;
  name: string;
}

interface ClientHomePageProps {
  initialProducts: Product[];
  initialCategories: ProductCategory[];
  initialBundleOffers: BundleOffer[];
}

export default function ClientHomePage({ 
  initialProducts,
  initialCategories,
  initialBundleOffers
}: ClientHomePageProps) {
  const { country } = useCountry();
  const [products] = useState<Product[]>(initialProducts);
  const [categories] = useState<ProductCategory[]>(initialCategories);
  const [bundleoffers] = useState<BundleOffer[]>(initialBundleOffers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use our cart context to refresh cart data
  const { refreshCart } = useCart();

  const addToCart = async (product: CartProduct) => {
    try {
      await axios.post("/api/cart", {
        productId: product.id,
        quantity: 1,
      });

      // Refresh cart data in the context
      await refreshCart();

      toast.success(`Added ${product.name} to your cart!`, {
        position: "bottom-right",
        autoClose: 3000,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error adding to cart";
      toast.error(errorMessage, {
        position: "bottom-right",
      });
    }
  };

  return (
    <>
      {/* Main article for the homepage content - better semantic structure for SEO */}
      <article>
        {/* Main hero section */}
        <section aria-labelledby="hero-heading">
          <h1 id="hero-heading" className="sr-only">Omaliya Cosmetics - Natural Beauty Products from Sri Lanka</h1>
          <HeroSection />
        </section>

        {/* Product categories section */}
        <section aria-labelledby="categories-heading" className="bg-white">
          <h2 id="categories-heading" className="sr-only">Product Categories</h2>
          <CategoriesSection
            categories={categories}
            loading={loading}
            error={error}
          />
        </section>

        {/* Featured products section */}
        <section aria-labelledby="featured-products-heading" className="bg-white">
          <h2 id="featured-products-heading" className="sr-only">Featured Products</h2>
          <FeaturedProducts
            products={products}
            loading={loading}
            error={error}
            addToCart={addToCart}
            country={country}
          />
        </section>

        {/* Featured bundles section */}
        <section aria-labelledby="featured-bundles-heading" className="bg-white">
          <h2 id="featured-bundles-heading" className="sr-only">Featured Bundle Offers</h2>
          <FeaturedBundles
            bundles={bundleoffers}
            loading={loading}
            error={error}
            country={country}
          />
        </section>

        {/* Benefits banner section */}
        <section aria-labelledby="benefits-heading" className="bg-white">
          <h2 id="benefits-heading" className="sr-only">Our Benefits</h2>
          <BenefitsBanner />
        </section>

        {/* Social media feed section */}
        <section aria-labelledby="social-media-heading" className="bg-white">
          <h2 id="social-media-heading" className="sr-only">Follow Us on Social Media</h2>
          <SocialMediaFeed />
        </section>

        {/* Testimonials section */}
        <section aria-labelledby="testimonials-heading" className="bg-white">
          <h2 id="testimonials-heading" className="sr-only">Customer Testimonials</h2>
          <Testimonials />
        </section>
      </article>
    </>
  );
}
