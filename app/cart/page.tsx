"use client";
import { useState, useEffect } from "react";
// import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { useCountry } from "../lib/hooks/useCountry";
import { Product, ProductCategory } from "@prisma/client";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { useCart } from "../lib/context/CartContext";

// Define the cart item structure from the cart API
interface CartItem {
  productId: string;
  quantity: number;
  isBundle: boolean;
  details?: any; // This will contain product or bundle details from the enhanced API
}

// Combined structure for display purposes
interface DisplayCartItem {
  productId: string;
  quantity: number;
  isBundle: boolean;
  name: string;
  description: string;
  imageUrls: string[];
  priceLKR: number;
  priceUSD: number;
  discountPriceLKR: number | null;
  discountPriceUSD: number | null;
  category?: ProductCategory;
  // Bundle specific fields
  originalPriceLKR?: number;
  originalPriceUSD?: number;
  offerPriceLKR?: number;
  offerPriceUSD?: number;
  bundleProducts?: Product[];
}

// Define the structure for promo code cookie data
interface PromoCodeData {
  code: string;
  discount: number;
}

const CartPage = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<DisplayCartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // const [processingCheckout, setProcessingCheckout] = useState<boolean>(false);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const [removingItem, setRemovingItem] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState<string>("");
  const [discount, setDiscount] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [applyingPromo, setApplyingPromo] = useState<boolean>(false);

  const { refreshCart } = useCart();

  const { country } = useCountry();

  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum + (country === "LK" ? item.priceLKR : item.priceUSD) * item.quantity,
    0
  );

  // Calculate discount amount and total when subtotal or discount changes
  useEffect(() => {
    const calculatedDiscountAmount = (subtotal * discount) / 100;
    setDiscountAmount(calculatedDiscountAmount);
    setTotal(subtotal - calculatedDiscountAmount);
  }, [subtotal, discount]);

  useEffect(() => {
    fetchCartData();
    loadPromoCodeFromCookies();
  }, []);

  // Function to update the cart count
  const updateCartCount = async () => {
    await refreshCart();
  };

  // Update cart count whenever cart items change
  useEffect(() => {
    updateCartCount();
  }, [cartItems]);

  const fetchCartData = async () => {
    try {
      setLoading(true);
      // Fetch cart items (products and bundles) from our enhanced cart API
      const { data: cartData } = await axios.get("/api/cart");
      const cartItemsFromApi = cartData.items || [];
      console.log("Cart data:", cartItemsFromApi);

      if (cartItemsFromApi.length === 0) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      // Map the enhanced cart items to display format
      const displayItems: DisplayCartItem[] = cartItemsFromApi.map(
        (item: CartItem) => {
          if (item.isBundle) {
            const bundleDetails = item.details || {};
            return {
              productId: item.productId,
              quantity: item.quantity,
              isBundle: true,
              name: bundleDetails.bundleName || "Bundle",
              description: `Bundle with ${
                bundleDetails.products?.length || 0
              } products`,
              imageUrls: bundleDetails.imageUrl ? [bundleDetails.imageUrl] : [],
              priceLKR: bundleDetails.offerPriceLKR || 0,
              priceUSD: bundleDetails.offerPriceUSD || 0,
              discountPriceLKR: null,
              discountPriceUSD: null,
              originalPriceLKR: bundleDetails.originalPriceLKR || 0,
              originalPriceUSD: bundleDetails.originalPriceUSD || 0,
              offerPriceLKR: bundleDetails.offerPriceLKR || 0,
              offerPriceUSD: bundleDetails.offerPriceUSD || 0,
              bundleProducts:
                bundleDetails.products?.map((p: any) => p.product) || [],
            };
          } else {
            // Regular product
            const productDetails = item.details || {};
            return {
              productId: item.productId,
              quantity: item.quantity,
              isBundle: false,
              name: productDetails.name || "Product",
              description: productDetails.description || "",
              imageUrls: productDetails.imageUrls || [],
              priceLKR: productDetails.priceLKR || 0,
              priceUSD: productDetails.priceUSD || 0,
              discountPriceLKR: productDetails.discountPriceLKR || null,
              discountPriceUSD: productDetails.discountPriceUSD || null,
              category: productDetails.category,
            };
          }
        }
      );

      setCartItems(displayItems);

      // Calculate prices based on the new data
      const calculatedSubtotal = displayItems.reduce((sum, item) => {
        const price = item.isBundle
          ? country === "LK"
            ? item.offerPriceLKR || 0
            : item.offerPriceUSD || 0
          : country === "LK"
          ? item.discountPriceLKR || item.priceLKR || 0
          : item.discountPriceUSD || item.priceUSD || 0;

        return sum + price * item.quantity;
      }, 0);

      // Check if we have a promo code applied
      const promoCodeCookie = Cookies.get("promoCodeDiscount");
      if (promoCodeCookie) {
        try {
          const promoCodeData: PromoCodeData = JSON.parse(promoCodeCookie);
          setDiscount(promoCodeData.discount || 0);
          setPromoCode(promoCodeData.code || "");
          const discountAmount =
            (calculatedSubtotal * promoCodeData.discount) / 100;
          setDiscountAmount(discountAmount);
          setTotal(calculatedSubtotal - discountAmount);
        } catch (err) {
          console.error("Failed to parse promo code cookie:", err);
          setTotal(calculatedSubtotal);
        }
      } else {
        setTotal(calculatedSubtotal);
      }
    } catch (err: any) {
      console.error("Error fetching cart:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPromoCodeFromCookies = async () => {
    const promoCodeCookie = Cookies.get("promoCodeDiscount");
    if (promoCodeCookie) {
      try {
        const promoCodeData: PromoCodeData = JSON.parse(promoCodeCookie);
        // Instead of directly applying the discount from cookie, validate it with server
        try {
          setApplyingPromo(true);
          const { data } = await axios.post("/api/promocodes/validate", {
            code: promoCodeData.code,
          });

          // Only set the discount if server validation passes
          setPromoCode(promoCodeData.code);
          setDiscount(data.discount || 0);

          // If server returns different discount than cookie, update the cookie
          if (data.discount !== promoCodeData.discount) {
            Cookies.set(
              "promoCodeDiscount",
              JSON.stringify({
                code: promoCodeData.code,
                discount: data.discount,
              })
            );
          }
        } catch (err) {
          // If server rejects the promocode, clear it from cookie
          console.error("Failed to validate saved promo code:", err);
          Cookies.remove("promoCodeDiscount");
          setPromoCode("");
          setDiscount(0);
        } finally {
          setApplyingPromo(false);
        }
      } catch (err) {
        console.error("Failed to parse promo code cookie:", err);
        Cookies.remove("promoCodeDiscount");
        setPromoCode("");
        setDiscount(0);
      }
    }
  };

  const updateQuantity = async (
    productId: string,
    newQuantity: number,
    isBundle: boolean = false
  ) => {
    if (newQuantity < 1) return;
    try {
      setUpdatingItem(productId);
      const response = await axios.post("/api/cart", {
        productId,
        quantity: newQuantity,
        isBundle,
        replaceQuantity: true, // This tells the API to replace the quantity instead of adding to it
      });

      // Update local state only if the API call succeeds
      setCartItems((prev) =>
        prev.map((item) =>
          item.productId === productId && item.isBundle === isBundle
            ? { ...item, quantity: newQuantity }
            : item
        )
      );

      // Optional: Show success message if needed
      toast.success(response.data.message || "Quantity updated", {
        position: "bottom-right",
      });
    } catch (err: any) {
      // More specific error handling based on status codes
      const errorMessage =
        err.response?.data?.error || "Failed to update quantity";
      if (err.response?.status === 404) {
        toast.error("Item not found in cart", { position: "bottom-right" });
      } else {
        toast.error(errorMessage, { position: "bottom-right" });
      }
      console.error("Error updating cart:", err);
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeItem = async (productId: string, isBundle: boolean = false) => {
    try {
      setRemovingItem(productId);
      const response = await axios.delete("/api/cart", {
        data: { productId, isBundle },
      });

      // Update local state only if the API call succeeds
      setCartItems((prev) =>
        prev.filter(
          (item) =>
            !(item.productId === productId && item.isBundle === isBundle)
        )
      );

      toast.info(response.data.message || "Item removed from cart", {
        position: "bottom-right",
      });
    } catch (err: any) {
      // More specific error handling based on status codes
      const errorMessage = err.response?.data?.error || "Failed to remove item";
      if (err.response?.status === 404) {
        toast.error("Item not found in cart", { position: "bottom-right" });
      } else {
        toast.error(errorMessage, { position: "bottom-right" });
      }
      console.error("Error removing item:", err);
    } finally {
      setRemovingItem(null);
    }
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    try {
      setApplyingPromo(true);
      setError(null);
      const { data } = await axios.post("/api/promocodes/validate", {
        code: promoCode,
      });
      setDiscount(data.discount || 0);
      // Calculate the discount amount immediately for the toast message
      const calculatedDiscountAmount = (subtotal * data.discount) / 100;
      // Set promo code discount in cookies
      Cookies.set(
        "promoCodeDiscount",
        JSON.stringify({ code: promoCode, discount: data.discount })
      );
      toast.success(
        `Promo code applied! You saved ${
          country === "LK" ? "Rs" : "$"
        } ${calculatedDiscountAmount.toFixed(2)}`,
        { position: "bottom-right" }
      );
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to apply promo code",
        {
          position: "bottom-right",
        }
      );
    } finally {
      setApplyingPromo(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <ToastContainer />
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 py-6 px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Your Shopping Cart
          </h1>
          <p className="text-purple-200 mt-2">
            Review your items before checkout
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Loading your cart...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-purple-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Discover our collection of beauty products and add your favorites
              to your cart.
            </p>
            <Link
              href="/products"
              className="inline-block bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-xl font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-150"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="p-6 md:p-8">
            <div className="mb-10">
              <div className="hidden md:grid grid-cols-12 gap-6 text-sm font-semibold text-gray-500 mb-4 px-4 border-b pb-2">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="bg-white border border-gray-100 rounded-xl mb-4 p-4 md:p-6 hover:shadow-lg transition-all duration-200 group relative"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-12 md:col-span-6 flex items-center space-x-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center group-hover:bg-purple-50 transition-colors">
                        {item.imageUrls.length > 0 ? (
                          <Image
                            src={item.imageUrls[0]}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="object-cover"
                          />
                        ) : (
                          <div className="text-gray-400 group-hover:text-purple-500 transition-colors">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-10 w-10"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <Link
                          href={
                            item.isBundle
                              ? `/bundles/${item.productId}`
                              : `/products/${item.productId}`
                          }
                        >
                          <h3 className="font-semibold text-gray-800 text-lg mb-1 group-hover:text-purple-700 transition-colors">
                            {item.name}
                          </h3>
                        </Link>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            #{item.productId.substring(0, 8)}
                          </span>
                          <span className="inline-block w-2 h-2 rounded-full bg-purple-500"></span>
                          <span className="text-sm text-gray-500">
                            {item.isBundle
                              ? "Bundle"
                              : item.category?.name || "Cosmetics"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-4 md:col-span-2 text-center">
                      <div className="md:hidden text-xs text-gray-500 mb-1">
                        Price
                      </div>
                      <span className="font-medium text-gray-900">
                        {country === "LK"
                          ? `Rs ${item.priceLKR.toFixed(2)}`
                          : `$ ${item.priceUSD.toFixed(2)}`}
                      </span>
                    </div>

                    <div className="col-span-4 md:col-span-2 flex justify-center">
                      <div className="md:hidden text-xs text-gray-500 mb-1">
                        Quantity
                      </div>
                      <div className="flex items-center border border-gray-200 rounded-lg shadow-sm">
                        <button
                          className={`w-8 h-8 flex items-center justify-center ${
                            updatingItem === item.productId
                              ? "text-gray-400"
                              : "text-gray-600 hover:text-purple-700 hover:bg-purple-50"
                          } rounded-l-lg transition-colors`}
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity - 1,
                              item.isBundle
                            )
                          }
                          disabled={
                            updatingItem === item.productId ||
                            item.quantity <= 1
                          }
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 12H4"
                            />
                          </svg>
                        </button>
                        <span className="w-8 h-8 flex items-center justify-center text-gray-800 font-medium">
                          {updatingItem === item.productId ? (
                            <div className="w-4 h-4 border-2 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <button
                          className={`w-8 h-8 flex items-center justify-center ${
                            updatingItem === item.productId
                              ? "text-gray-400"
                              : "text-gray-600 hover:text-purple-700 hover:bg-purple-50"
                          } rounded-r-lg transition-colors`}
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity + 1,
                              item.isBundle
                            )
                          }
                          disabled={updatingItem === item.productId}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="col-span-4 md:col-span-2 text-right">
                      <div className="md:hidden text-xs text-gray-500 mb-1">
                        Total
                      </div>
                      <span className="font-semibold text-gray-900">
                        {country === "LK"
                          ? `Rs ${(item.priceLKR * item.quantity).toFixed(2)}`
                          : `$ ${(item.priceUSD * item.quantity).toFixed(2)}`}
                      </span>
                    </div>
                  </div>

                  <button
                    className={`absolute top-4 right-4 ${
                      removingItem === item.productId
                        ? "text-gray-400"
                        : "text-gray-400 hover:text-red-500"
                    } transition-colors hidden group-hover:block`}
                    onClick={() => removeItem(item.productId, item.isBundle)}
                    disabled={removingItem === item.productId}
                  >
                    {removingItem === item.productId ? (
                      <div className="w-5 h-5 border-2 border-gray-200 border-t-red-500 rounded-full animate-spin"></div>
                    ) : (
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-5 gap-8 items-start">
              <div className="md:col-span-3">
                <div className="bg-purple-50 p-6 rounded-xl mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Have a promo code?
                  </h3>
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-grow px-4 py-2 bg-white border border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      className={`px-4 py-2 bg-purple-600 text-white font-medium rounded-r-lg ${
                        applyingPromo
                          ? "opacity-70 cursor-wait"
                          : "hover:bg-purple-700"
                      } transition-colors`}
                      onClick={applyPromoCode}
                      disabled={applyingPromo || !promoCode.trim()}
                    >
                      {applyingPromo ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-purple-200 border-t-white rounded-full animate-spin mr-2"></div>
                          <span>Applying...</span>
                        </div>
                      ) : (
                        "Apply"
                      )}
                    </button>
                  </div>

                  {discount > 0 && (
                    <div className="mt-3 text-sm text-green-600 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Discount applied: {discount} %
                    </div>
                  )}
                </div>

                <Link
                  href="/products"
                  className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Continue Shopping
                </Link>
              </div>

              <div className="md:col-span-2">
                <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Order Summary
                  </h3>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-gray-600">
                      <span>
                        Subtotal (
                        {cartItems.reduce(
                          (sum, item) => sum + item.quantity,
                          0
                        )}{" "}
                        items)
                      </span>
                      <span className="font-medium">
                        {country === "LK"
                          ? `Rs ${subtotal.toFixed(2)}`
                          : `$ ${subtotal.toFixed(2)}`}
                      </span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span className="font-medium">
                          -{" "}
                          {country === "LK"
                            ? `Rs ${discountAmount.toFixed(2)}`
                            : `$ ${discountAmount.toFixed(2)}`}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-800">
                        Total
                      </span>
                      <span className="text-lg font-bold text-purple-700">
                        {country === "LK"
                          ? `Rs ${total.toFixed(2)}`
                          : `$ ${total.toFixed(2)}`}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Delivery expected in 3-5 business days
                    </p>
                  </div>

                  <Link
                    href="/checkout"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-md transition duration-200 flex items-center justify-center"
                  >
                    <span>Proceed to Checkout</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>

                  <div className="mt-4 flex items-center justify-center space-x-2">
                    <span className="text-gray-500 text-sm">
                      Secure payment
                    </span>
                    <div className="flex space-x-1">
                      <div className="w-8 h-5 bg-gray-800 rounded"></div>
                      <div className="w-8 h-5 bg-blue-600 rounded"></div>
                      <div className="w-8 h-5 bg-red-500 rounded"></div>
                      <div className="w-8 h-5 bg-yellow-500 rounded"></div>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm">
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {error}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
