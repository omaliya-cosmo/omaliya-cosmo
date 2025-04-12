'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCountry } from "@/app/lib/hooks/useCountry";
import { usePathname } from 'next/navigation';

interface HeaderProps {
  userData: any;
  cartCount: number;
}

export default function Header({ userData, cartCount }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { country, setCountry } = useCountry();
  const pathname = usePathname();
  
  // Change header style on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu when navigating
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log(`Searching for: ${searchQuery}`);
    // Navigate to search results page
  };
  
  return (
    <header className={`bg-white sticky top-0 z-50 transition-all duration-300  ${
      isScrolled ? 'shadow-md' : 'shadow-sm'
    }`}>
      {/* Top Announcement Bar with animated gradient */}
      <div className="relative overflow-hidden ">
        <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-700 text-white py-2 px-4 text-center text-sm font-medium">
          <div className="flex items-center justify-center space-x-2">
            <span className="inline-block animate-pulse bg-white bg-opacity-20 rounded-full p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            <span>Free shipping on orders over $50 • 30-day money-back guarantee</span>
          </div>
        </div>
        
        {/* Animated decorative element */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -right-10 top-0 w-40 h-40 bg-white opacity-5 rounded-full"></div>
          <div className="absolute -left-10 -bottom-20 w-40 h-40 bg-white opacity-5 rounded-full"></div>
        </div>
      </div>

      {/* Main Header */}
      <div className={`container mx-auto px-4 transition-all duration-300 ${
        isScrolled ? 'py-2' : 'py-4'
      }`}>
        <div className="flex justify-between items-center px-10">
          {/* Logo with animation */}
          <Link href="/" className="flex items-center group">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent transition-transform group-hover:scale-105 duration-300">
              OMALIYA
            </span>
            <span className="ml-1 text-xs uppercase tracking-wider text-gray-500 hidden sm:inline-block">
              COSMETICS
            </span>
          </Link>

          {/* Search Bar - Desktop with enhanced interaction - REDUCED WIDTH */}
          <div className="hidden md:flex flex-1 max-w-md mx-4"> {/* Changed from max-w-xl to max-w-md and mx-8 to mx-4 */}
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full py-2 pl-10 pr-12 bg-gray-100 hover:bg-gray-50 focus:bg-white rounded-full border-2 border-transparent focus:border-purple-300 focus:outline-none transition-all duration-300 text-gray-700"
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
              <button 
                type="submit" 
                className="absolute right-2 top-1.5 bg-purple-100 text-purple-600 p-1 rounded-full hover:bg-purple-200 transition-colors duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </form>
          </div>

          {/* Navigation - Desktop with mega dropdowns */}
          <nav className="hidden md:flex items-center space-x-6">
            {/* Currency indicator */}
            <div className="flex items-center">
              <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                {country === 'LK' ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    LKR (Rs)
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    USD ($)
                  </>
                )}
              </span>
            </div>

            {/* Nav links with mega dropdown menus - FIXED POSITIONING */}
            <div className="relative group">
              <Link
                href="/products"
                className={`text-gray-700 hover:text-purple-600 font-medium relative group flex items-center ${
                  pathname?.startsWith('/products') ? 'text-purple-600' : ''
                }`}
              >
                Shop
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 ${
                  pathname?.startsWith('/products') ? 'w-full' : 'group-hover:w-full'
                }`}></span>
              </Link>
              
              {/* Mega dropdown for Shop/Products - CLEAN PROFESSIONAL STYLING */}
              <div className="fixed left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm rounded-b-lg shadow-sm z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 border-t border-gray-100">
                {/* Subtle top accent */}
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-200 to-purple-400"></div>
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 bg-white border-t border-l border-gray-100"></div>
                
                <div className="container mx-auto px-4">
                  <div className="grid grid-cols-6 gap-4 p-6">
                    {/* Categories section with clean styling */}
                    <div className="col-span-1">
                      <h3 className="text-sm font-bold text-gray-800 tracking-wider uppercase mb-3 pb-1 border-b border-gray-100">
                        Categories
                      </h3>
                      <ul className="space-y-2">
                        <li>
                          <Link href="/products/category/skincare" className="text-gray-700 hover:text-purple-600 text-sm block py-1">
                            Skincare
                          </Link>
                        </li>
                        <li>
                          <Link href="/products/category/makeup" className="text-gray-700 hover:text-purple-600 text-sm block py-1">
                            Makeup
                          </Link>
                        </li>
                        <li>
                          <Link href="/products/category/hair-care" className="text-gray-700 hover:text-purple-600 text-sm block py-1">
                            Hair Care
                          </Link>
                        </li>
                        <li>
                          <Link href="/products/category/fragrance" className="text-gray-700 hover:text-purple-600 text-sm block py-1">
                            Fragrance
                          </Link>
                        </li>
                        <li>
                          <Link href="/products/category/bath-body" className="text-gray-700 hover:text-purple-600 text-sm block py-1">
                            Bath & Body
                          </Link>
                        </li>
                      </ul>
                      <div className="mt-3">
                        <Link href="/products/categories" className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                          View all categories
                        </Link>
                      </div>
                    </div>
                    
                    {/* Featured section with clean styling */}
                    <div className="col-span-1">
                      <h3 className="text-sm font-bold text-gray-800 tracking-wider uppercase mb-3 pb-1 border-b border-gray-100">
                        Featured
                      </h3>
                      <ul className="space-y-2">
                        <li>
                          <Link href="/products/new-arrivals" className="text-gray-700 hover:text-purple-600 text-sm block py-1">
                            New Arrivals
                          </Link>
                        </li>
                        <li>
                          <Link href="/products/best-sellers" className="text-gray-700 hover:text-purple-600 text-sm block py-1">
                            Best Sellers
                          </Link>
                        </li>
                        <li>
                          <Link href="/products/deals" className="text-gray-700 hover:text-purple-600 text-sm block py-1">
                            Special Deals
                          </Link>
                        </li>
                        <li>
                          <Link href="/products/gifts" className="text-gray-700 hover:text-purple-600 text-sm block py-1">
                            Gift Sets
                          </Link>
                        </li>
                        <li>
                          <Link href="/products/trending" className="text-gray-700 hover:text-purple-600 text-sm block py-1">
                            Trending Now
                          </Link>
                        </li>
                      </ul>
                    </div>
                            
                    {/* Collections section with clean styling */}
                    <div className="col-span-1">
                      <h3 className="text-sm font-bold text-gray-800 tracking-wider uppercase mb-3 pb-1 border-b border-gray-100">
                        Collections
                      </h3>
                      <ul className="space-y-2">
                        <li>
                          <Link href="/products/collection/summer-essentials" className="text-gray-700 hover:text-purple-600 text-sm block py-1">
                            Summer Essentials
                          </Link>
                        </li>
                        <li>
                          <Link href="/products/collection/organic" className="text-gray-700 hover:text-purple-600 text-sm block py-1">
                            Organic & Natural
                          </Link>
                        </li>
                        <li>
                          <Link href="/products/collection/k-beauty" className="text-gray-700 hover:text-purple-600 text-sm block py-1">
                            K-Beauty
                          </Link>
                        </li>
                        <li>
                          <Link href="/products/collection/luxury" className="text-gray-700 hover:text-purple-600 text-sm block py-1">
                            Luxury Beauty
                          </Link>
                        </li>
                        <li>
                          <Link href="/products/collection/men" className="text-gray-700 hover:text-purple-600 text-sm block py-1">
                            Men's Collection
                          </Link>
                        </li>
                      </ul>
                    </div>
                            
                    {/* Featured Products section with clean styling */}
                    <div className="col-span-3 border-l border-gray-100 pl-6">
                      <h3 className="text-sm font-bold text-gray-800 tracking-wider uppercase mb-3 pb-1 border-b border-gray-100">
                        Featured Products
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-6">
                        {/* Featured product 1 - Clean */}
                        <div className="bg-gray-50/50 rounded-lg p-4 transition-all duration-300 hover:shadow-sm">
                          <div className="aspect-w-1 aspect-h-1 mb-3 relative overflow-hidden rounded-md bg-white">
                            <div className="h-40 flex items-center justify-center">
                              {/* Product image placeholder */}
                              <div className="w-3/4 h-28 bg-gray-100 rounded"></div>
                            </div>
                            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-sm">-25%</span>
                          </div>
                          <h4 className="text-sm font-medium text-gray-800">Vitamin C Brightening Serum</h4>
                          <div className="mt-2 flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-500 line-through">$34.99</p>
                              <p className="text-sm font-semibold text-purple-600">$24.99</p>
                            </div>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={`w-3 h-3 ${i < 4 ? "text-amber-400" : "text-gray-200"}`}>★</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Featured product 2 - Clean */}
                        <div className="bg-gray-50/50 rounded-lg p-4 transition-all duration-300 hover:shadow-sm">
                          <div className="aspect-w-1 aspect-h-1 mb-3 relative overflow-hidden rounded-md bg-white">
                            <div className="h-40 flex items-center justify-center">
                              {/* Product image placeholder */}
                              <div className="w-3/4 h-28 bg-gray-100 rounded"></div>
                            </div>
                            <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-sm">New</span>
                          </div>
                          <h4 className="text-sm font-medium text-gray-800">Hyaluronic Acid Moisturizer</h4>
                          <div className="mt-2 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-purple-600">$19.99</p>
                            </div>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className="w-3 h-3 text-amber-400">★</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* View all section - Clean */}
                      <div className="mt-4 text-right">
                        <Link 
                          href="/products/featured" 
                          className="text-sm text-purple-600 font-medium hover:text-purple-800 inline-flex items-center"
                        >
                          View all featured products
                          <span className="ml-1">→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Light backdrop */}
                <div className="fixed inset-0 bg-transparent -z-10"></div>
              </div>
            </div>
            
            {/* Categories link with dropdown - FIXED POSITIONING AS WELL */}
            <div className="relative group">
              <Link
                href="/categories"
                className={`text-gray-700 hover:text-purple-600 font-medium relative group flex items-center ${
                  pathname?.startsWith('/categories') ? 'text-purple-600' : ''
                }`}
              >
                Categories
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 ${
                  pathname?.startsWith('/categories') ? 'w-full' : 'group-hover:w-full'
                }`}></span>
              </Link>
              
              {/* Categories dropdown - STANDARD POSITIONING */}
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                <div className="py-2">
                  <Link href="/categories/skincare" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600">
                    Skincare
                  </Link>
                  <Link href="/categories/makeup" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600">
                    Makeup
                  </Link>
                  <Link href="/categories/hair-care" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600">
                    Hair Care
                  </Link>
                  <Link href="/categories/fragrance" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600">
                    Fragrance
                  </Link>
                  <Link href="/categories/bath-body" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600">
                    Bath & Body
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <Link href="/categories" className="block px-4 py-2 text-sm text-purple-600 font-medium hover:bg-purple-50">
                    View All Categories
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Other nav links */}
            <Link
              href="/about"
              className={`text-gray-700 hover:text-purple-600 font-medium relative group ${
                pathname?.startsWith('/about') ? 'text-purple-600' : ''
              }`}
            >
              About
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 ${
                pathname?.startsWith('/about') ? 'w-full' : 'group-hover:w-full'
              }`}></span>
            </Link>
            <Link
              href="/contact"
              className={`text-gray-700 hover:text-purple-600 font-medium relative group ${
                pathname?.startsWith('/contact') ? 'text-purple-600' : ''
              }`}
            >
              Contact
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 ${
                pathname?.startsWith('/contact') ? 'w-full' : 'group-hover:w-full'
              }`}></span>
            </Link>

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="text-gray-700 hover:text-purple-600 relative group"
              aria-label="Shopping cart"
            >
              <div className="relative p-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 transform group-hover:scale-110 transition-all duration-300"
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
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce-short">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity whitespace-nowrap">
                View Cart
              </span>
            </Link>

            {/* Account Menu */}
            <AccountMenu userData={userData} />
          </nav>

          {/* Mobile Menu Button and Cart */}
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
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              className="text-gray-700 p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
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
                    d="M6 18L18 6M6 6l12 12"
                  />
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar - Mobile with animation */}
        <div className="mt-4 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="w-full py-2 pl-10 pr-12 bg-gray-100 hover:bg-gray-50 focus:bg-white rounded-full border-2 border-transparent focus:border-purple-300 focus:outline-none transition-all duration-300 text-gray-700"
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
            <button 
              type="submit" 
              className="absolute right-2 top-1.5 bg-purple-100 text-purple-600 p-1 rounded-full hover:bg-purple-200 transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Menu with enhanced animation */}
      <MobileMenu isOpen={isMenuOpen} userData={userData} country={country} setCountry={setCountry} pathname={pathname} />
    </header>
  );
}

function AccountMenu({ userData }) {
  return (
    <div className="relative group">
      <button className="text-gray-700 hover:text-purple-600 p-1 rounded-full group-hover:bg-purple-50 transition-colors">
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
      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl overflow-hidden z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100">
        {userData ? (
          <div className="py-1">
            <div className="px-4 py-3 border-b border-gray-100 bg-purple-50">
              <p className="text-sm text-gray-500">Signed in as</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {userData.email}
              </p>
            </div>
            <Link
              href="/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Your Profile
              </div>
            </Link>
            <Link
              href="/orders"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Your Orders
              </div>
            </Link>
            <Link
              href="/wishlist"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Wishlist
              </div>
            </Link>
            <div className="border-t border-gray-100 my-1"></div>
            <Link
              href="/api/auth/signout"
              className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </div>
            </Link>
          </div>
        ) : (
          <div className="py-1">
            <Link
              href="/login"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In
              </div>
            </Link>
            <Link
              href="/register"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Create Account
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function MobileMenu({ isOpen, userData, country, setCountry, pathname }) {
  const [expandedCategory, setExpandedCategory] = useState(null);
  
  return (
    <div
      className={`md:hidden bg-white shadow-lg absolute w-full transition-all duration-300 ease-in-out ${
        isOpen ? "max-h-[calc(100vh-100px)] overflow-y-auto" : "max-h-0 overflow-hidden"
      }`}
    >
      <div className="container mx-auto px-4 py-2">
        <nav className="flex flex-col space-y-1 py-4">
          {/* Currency indicator in mobile menu - no longer a selector */}
          <div className="border-b border-gray-100 pb-3 mb-2">
            <div className="flex items-center">
              <span className="bg-purple-50 text-purple-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {country === 'LK' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
                {country === 'LK' ? 'Sri Lankan Rupee (Rs)' : 'US Dollar ($)'}
              </span>
            </div>
          </div>
          
          {/* Nested mobile navigation */}
          <nav className="flex flex-col space-y-1 py-4">
            {/* Shop with nested submenu */}
            <div>
              <button 
                className={`w-full flex items-center justify-between text-left text-gray-700 hover:text-purple-600 font-medium py-2 px-3 rounded-lg ${
                  pathname?.startsWith('/products') ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-50'
                }`}
                onClick={() => setExpandedCategory(expandedCategory === 'shop' ? null : 'shop')}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Shop
                </div>
                <svg className={`w-4 h-4 transition-transform ${expandedCategory === 'shop' ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Submenu */}
              <div className={`overflow-hidden transition-all duration-300 ${expandedCategory === 'shop' ? 'max-h-96' : 'max-h-0'}`}>
                <div className="pl-10 pr-3 py-2 space-y-1">
                  <Link
                    href="/products/category/skincare"
                    className="block py-2 px-3 text-sm text-gray-600 hover:text-purple-600 rounded-lg hover:bg-purple-50"
                  >
                    Skincare
                  </Link>
                  <Link
                    href="/products/category/makeup"
                    className="block py-2 px-3 text-sm text-gray-600 hover:text-purple-600 rounded-lg hover:bg-purple-50"
                  >
                    Makeup
                  </Link>
                  <Link
                    href="/products/category/hair-care"
                    className="block py-2 px-3 text-sm text-gray-600 hover:text-purple-600 rounded-lg hover:bg-purple-50"
                  >
                    Hair Care
                  </Link>
                  <div className="border-t border-gray-100 my-2"></div>
                  <Link
                    href="/products/new-arrivals"
                    className="block py-2 px-3 text-sm text-gray-600 hover:text-purple-600 rounded-lg hover:bg-purple-50"
                  >
                    New Arrivals
                  </Link>
                  <Link
                    href="/products/best-sellers"
                    className="block py-2 px-3 text-sm text-gray-600 hover:text-purple-600 rounded-lg hover:bg-purple-50"
                  >
                    Best Sellers
                  </Link>
                  <div className="border-t border-gray-100 my-2"></div>
                  <Link
                    href="/products"
                    className="block py-2 px-3 text-sm font-medium text-purple-600 hover:text-purple-800 rounded-lg hover:bg-purple-50"
                  >
                    View All Products
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Categories with nested submenu */}
            <div>
              <button 
                className={`w-full flex items-center justify-between text-left text-gray-700 hover:text-purple-600 font-medium py-2 px-3 rounded-lg ${
                  pathname?.startsWith('/categories') ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-50'
                }`}
                onClick={() => setExpandedCategory(expandedCategory === 'categories' ? null : 'categories')}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Categories
                </div>
                <svg className={`w-4 h-4 transition-transform ${expandedCategory === 'categories' ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Submenu */}
              <div className={`overflow-hidden transition-all duration-300 ${expandedCategory === 'categories' ? 'max-h-80' : 'max-h-0'}`}>
                <div className="pl-10 pr-3 py-2 space-y-1">
                  <Link
                    href="/categories/skincare"
                    className="block py-2 px-3 text-sm text-gray-600 hover:text-purple-600 rounded-lg hover:bg-purple-50"
                  >
                    Skincare
                  </Link>
                  <Link
                    href="/categories/makeup"
                    className="block py-2 px-3 text-sm text-gray-600 hover:text-purple-600 rounded-lg hover:bg-purple-50"
                  >
                    Makeup
                  </Link>
                  <Link
                    href="/categories/hair-care"
                    className="block py-2 px-3 text-sm text-gray-600 hover:text-purple-600 rounded-lg hover:bg-purple-50"
                  >
                    Hair Care
                  </Link>
                  <Link
                    href="/categories/fragrance"
                    className="block py-2 px-3 text-sm text-gray-600 hover:text-purple-600 rounded-lg hover:bg-purple-50"
                  >
                    Fragrance
                  </Link>
                  <Link
                    href="/categories/bath-body"
                    className="block py-2 px-3 text-sm text-gray-600 hover:text-purple-600 rounded-lg hover:bg-purple-50"
                  >
                    Bath & Body
                  </Link>
                  <div className="border-t border-gray-100 my-2"></div>
                  <Link
                    href="/categories"
                    className="block py-2 px-3 text-sm font-medium text-purple-600 hover:text-purple-800 rounded-lg hover:bg-purple-50"
                  >
                    View All Categories
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Other nav items without dropdowns */}
            <Link
              href="/about"
              className={`flex items-center text-gray-700 hover:text-purple-600 font-medium py-2 px-3 rounded-lg ${
                pathname?.startsWith('/about') ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              About
            </Link>
            <Link
              href="/contact"
              className={`flex items-center text-gray-700 hover:text-purple-600 font-medium py-2 px-3 rounded-lg ${
                pathname?.startsWith('/contact') ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact
            </Link>

            <div className="border-t border-gray-100 my-2 pt-2">
              {userData ? (
                <>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg mb-2">
                    <p className="text-xs text-gray-500">Signed in as</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {userData.email}
                    </p>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center text-gray-700 hover:text-purple-600 font-medium py-2 px-3 rounded-lg hover:bg-gray-50"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Your Profile
                  </Link>
                  <Link
                    href="/orders"
                    className="flex items-center text-gray-700 hover:text-purple-600 font-medium py-2 px-3 rounded-lg hover:bg-gray-50"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Your Orders
                  </Link>
                  <Link
                    href="/wishlist"
                    className="flex items-center text-gray-700 hover:text-purple-600 font-medium py-2 px-3 rounded-lg hover:bg-gray-50"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Wishlist
                  </Link>
                  <div className="border-t border-gray-100 my-2"></div>
                  <Link
                    href="/api/auth/signout"
                    className="flex items-center text-red-600 font-medium py-2 px-3 rounded-lg hover:bg-red-50"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex items-center justify-center text-purple-600 font-medium py-2.5 px-3 rounded-lg border-2 border-purple-600 hover:bg-purple-50 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center justify-center text-white font-medium py-2.5 px-3 mt-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </nav>
        </nav>
      </div>
    </div>
  );
}