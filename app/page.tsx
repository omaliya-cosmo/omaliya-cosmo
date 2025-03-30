"use client";

import { getCustomerFromToken } from "./actions";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Product, ProductCategory } from "../types";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

import { useCountry } from "@/app/lib/hooks/useCountry";

export default function Home() {
  const [userData, setUserData] = useState<any>([]);
  const { country, updateCountry } = useCountry();

  useEffect(() => {
    const fetchAdmin = async () => {
      const userData = await getCustomerFromToken();
      setUserData(userData);
    };
    fetchAdmin();
  }, []);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [categories, setCategories] = useState<ProductCategory[]>([]);

  useEffect(() => {
    // Fetch products data
    axios
      .get("/api/products")
      .then((res) => {
        setProducts(res.data.products);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    // Fetch categories data
    axios
      .get("/api/categories")
      .then((res) => {
        setCategories(res.data.categories);
      })
      .catch((err) => {
        setError(err.message);
      });

    // Fetch actual cart data
    fetchCartData();
  }, []);

  const fetchCartData = async () => {
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

  const addToCart = async (product: Product) => {
    setAddingToCart(product.id);

    try {
      await axios.post("/api/cart", {
        productId: product.id,
        quantity: 1,
      });

      setCartCount((prev) => prev + 1);
      toast.success(`Added ${product.name} to your cart!`, {
        position: "bottom-right",
        autoClose: 3000,
      });
    } catch (error: any) {
      toast.error(error.message || "Error adding to cart", {
        position: "bottom-right",
      });
    } finally {
      setAddingToCart(null);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Cosmetics"; // Default to "Cosmetics" if not found
  };

  // Group products by category (just for display purposes)
  const productsByCategory = products.reduce((acc, product) => {
    const category = product.categoryId || "other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <div className="min-h-screen flex flex-col">
      <h1 className="font-poppins">Puluwanda</h1>
      <ToastContainer />

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        {/* Top Announcement Bar */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-2 px-4 text-center text-sm font-medium">
          Free shipping on all orders over $50 • 30-day money-back guarantee
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                OMALIYA
              </span>
              <span className="ml-1 text-xs text-gray-500 hidden sm:inline-block">
                COSMETICS
              </span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full py-2 pl-10 pr-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-300 text-gray-700"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/products"
                className="text-gray-700 hover:text-purple-600 font-medium"
              >
                Shop
              </Link>
              <Link
                href="/categories"
                className="text-gray-700 hover:text-purple-600 font-medium"
              >
                Categories
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-purple-600 font-medium"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-purple-600 font-medium"
              >
                Contact
              </Link>

              {/* Cart Icon */}
              <Link
                href="/cart"
                className="text-gray-700 hover:text-purple-600 relative group"
              >
                <div className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 group-hover:scale-110 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-entrance">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity whitespace-nowrap">
                  View Cart
                </span>
              </Link>

              {/* Account */}
              <div className="relative group">
                <button className="text-gray-700 hover:text-purple-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                  {userData ? (
                    <div className="py-2">
                      <div className="px-4 py-3 border-b">
                        <p className="text-sm text-gray-500">Signed in as</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {userData.email}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                      >
                        Your Profile
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                      >
                        Your Orders
                      </Link>
                      <Link
                        href="/api/auth/signout"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                      >
                        Sign Out
                      </Link>
                    </div>
                  ) : (
                    <div className="py-2">
                      <Link
                        href="/login"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/register"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                      >
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <Link href="/cart" className="mr-4 text-gray-700 relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button
                className="text-gray-700"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Search Bar - Mobile */}
          <div className="mt-4 md:hidden">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full py-2 pl-10 pr-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-300 text-gray-700"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden bg-white shadow-lg absolute w-full transition-all duration-300 ease-in-out ${
            isMenuOpen ? "max-h-96" : "max-h-0 overflow-hidden"
          }`}
        >
          <div className="container mx-auto px-4 py-2">
            <nav className="flex flex-col space-y-4 py-4">
              <Link
                href="/products"
                className="text-gray-700 hover:text-purple-600 font-medium py-2"
              >
                Shop
              </Link>
              <Link
                href="/categories"
                className="text-gray-700 hover:text-purple-600 font-medium py-2"
              >
                Categories
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-purple-600 font-medium py-2"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-purple-600 font-medium py-2"
              >
                Contact
              </Link>

              <div className="border-t border-gray-200 my-2 pt-2">
                {userData ? (
                  <>
                    <Link
                      href="/profile"
                      className="text-gray-700 hover:text-purple-600 font-medium py-2 block"
                    >
                      Your Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="text-gray-700 hover:text-purple-600 font-medium py-2 block"
                    >
                      Your Orders
                    </Link>
                    <Link
                      href="/api/auth/signout"
                      className="text-gray-700 hover:text-purple-600 font-medium py-2 block"
                    >
                      Sign Out
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-gray-700 hover:text-purple-600 font-medium py-2 block"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="text-gray-700 hover:text-purple-600 font-medium py-2 block"
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 text-white">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-pattern opacity-10"></div>
          </div>
          <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
            <div className="max-w-xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Discover Your Natural Beauty
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-8">
                Premium cosmetics and beauty products for the modern woman.
                Explore our exclusive collections.
              </p>
              <div className="flex space-x-4">
                <Link
                  href="/products"
                  className="bg-white text-purple-800 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Shop Now
                </Link>
                <Link
                  href="/new-arrivals"
                  className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-purple-800 transition-colors"
                >
                  New Arrivals
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
              Shop by Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {["Skincare", "Makeup", "Haircare", "Fragrances"].map(
                (category) => (
                  <Link
                    href={`/categories/${category.toLowerCase()}`}
                    key={category}
                    className="group"
                  >
                    <div className="bg-white rounded-lg shadow-md overflow-hidden aspect-square relative">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-900 opacity-60 group-hover:opacity-70 transition-opacity"></div>
                      <div className="absolute inset-0 flex items-end p-4">
                        <h3 className="text-white font-bold text-lg md:text-xl">
                          {category}
                        </h3>
                      </div>
                    </div>
                  </Link>
                )
              )}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                Featured Products
              </h2>
              <Link
                href="/products"
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                View All
              </Link>
            </div>

            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center">
                {error}
              </div>
            )}

            {!loading && !error && products.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No products available yet. Check back soon!
              </div>
            )}

            {!loading && !error && products.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {products.slice(0, 8).map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-square bg-gray-100 relative">
                      <div className="absolute inset-0 flex items-center justify-center text-gray-300 group-hover:text-purple-300 transition-colors">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-16 w-16"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      {/* Quick-add overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart(product);
                          }}
                          className="bg-white text-purple-600 px-4 py-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform shadow-md hover:shadow-lg hover:bg-purple-600 hover:text-white"
                        >
                          Quick Add
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-800 mb-1 group-hover:text-purple-600 transition-colors">
                        <Link href={`/products/${product.id}`}>
                          {product.name}
                        </Link>
                      </h3>
                      <p className="text-gray-500 text-sm mb-2">
                        {getCategoryName(product.categoryId)}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900">
                          {country === "LK"
                            ? `Rs ${product.priceLKR.toFixed(2)}`
                            : `$ ${product.priceUSD.toFixed(2)}`}
                        </span>
                        <button
                          className="text-gray-500 hover:text-purple-600 transition-colors relative"
                          onClick={() => addToCart(product)}
                          disabled={addingToCart === product.id}
                        >
                          {addingToCart === product.id ? (
                            <svg
                              className="animate-spin h-6 w-6"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Benefits Banner */}
        <section className="py-12 md:py-16 bg-purple-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 bg-purple-100 rounded-full p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Free Shipping</h3>
                  <p className="text-gray-600 text-sm">
                    On all orders over $50
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 bg-purple-100 rounded-full p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">100% Authentic</h3>
                  <p className="text-gray-600 text-sm">
                    Guaranteed original products
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 bg-purple-100 rounded-full p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Secure Payment</h3>
                  <p className="text-gray-600 text-sm">
                    Multiple payment methods
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Collection */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
              New Season Collection
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-r from-pink-100 to-pink-200 rounded-lg p-8 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Spring Glow
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Lightweight formulas for a fresh look
                  </p>
                  <Link
                    href="/collections/spring"
                    className="inline-block bg-white text-pink-600 px-6 py-2 rounded-full font-medium hover:bg-pink-600 hover:text-white transition-colors"
                  >
                    Shop Now
                  </Link>
                </div>
                <div className="absolute right-0 bottom-0 opacity-30 transform translate-x-8 translate-y-8">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-48 w-48"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={0.5}
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                    />
                  </svg>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-8 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Luxury Essentials
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Premium products for your daily routine
                  </p>
                  <Link
                    href="/collections/essentials"
                    className="inline-block bg-white text-purple-600 px-6 py-2 rounded-full font-medium hover:bg-purple-600 hover:text-white transition-colors"
                  >
                    Shop Now
                  </Link>
                </div>
                <div className="absolute right-0 bottom-0 opacity-30 transform translate-x-8 translate-y-8">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-48 w-48"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={0.5}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
              What Our Customers Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: "Sarah J.",
                  role: "Makeup Artist",
                  comment:
                    "I've been using Omaliya products for my clients and myself. The quality is exceptional and the prices are reasonable.",
                },
                {
                  name: "Emma T.",
                  role: "Regular Customer",
                  comment:
                    "I love how these products are gentle on my sensitive skin. The skincare line has transformed my routine completely!",
                },
                {
                  name: "Michelle K.",
                  role: "Beauty Blogger",
                  comment:
                    "Omaliya stands out with their commitment to quality. Their customer service is outstanding and products arrive beautifully packaged.",
                },
              ].map((testimonial, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-semibold">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-800">
                        {testimonial.name}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">
                    "{testimonial.comment}"
                  </p>
                  <div className="mt-4 flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-12 md:py-16 bg-purple-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Join Our Newsletter
            </h2>
            <p className="text-purple-200 mb-8 max-w-xl mx-auto">
              Subscribe to our newsletter for exclusive offers, beauty tips, and
              first access to new product launches.
            </p>
            <div className="max-w-md mx-auto flex">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow px-4 py-3 rounded-l-lg focus:outline-none text-gray-800"
              />
              <button className="bg-purple-900 hover:bg-purple-800 px-6 py-3 rounded-r-lg font-medium transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">About Omaliya</h3>
              <p className="text-gray-400 mb-4">
                Premium beauty products imported from around the world, bringing
                you the best in cosmetics and skincare.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 // filepath: c:\Users\Dell\Desktop\omaliya-cosmo\src\pages\index.tsx
0 1.325 1.325v21.351c0 .732.593 1.325 1.325 1.325h21.351c.732 0 1.325-.593 1.325-1.325v-21.351c0-.732-.593-1.325-1.325-1.325zm-14.75 22h-3v-9h3v9zm-1.5-10.25c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75 .784 1.75 1.75-.784 1.75-1.75 1.75zm13 10.25h-3v-4c0-.966-.784-2-2-2s-2 .784-2 2v4h-3v-9h3v2c0 .966 .784 2 2 2s2-.784 2-2v-2h3v9z"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-800 pt-6 text-center">
              <p className="text-gray-400 text-sm">
                &copy; 2023 Omaliya. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
