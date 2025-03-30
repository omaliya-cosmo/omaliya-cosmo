"use client";
import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { useCountry } from "../lib/hooks/useCountry";

// Define the cart item structure from the cart API
interface CartItem {
  _id: string;
  productId: string;
  quantity: number;
}

// Define the category structure from the category API
interface Category {
  id: string;
  name: string;
  description: string;
}

// Define the product structure from the products API, with only categoryId initially
interface Product {
  id?: string;
  name: string;
  price: number;
  priceLKR: number;
  priceUSD: number;
  categoryId?: string; // Changed from category object to categoryId
  image?: string;
}

// Combined structure for display purposes
interface DisplayCartItem extends CartItem, Product {
  category?: Category; // Add category object to the display item
}

const CartPage = () => {
  const [cartItems, setCartItems] = useState<DisplayCartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingCheckout, setProcessingCheckout] = useState<boolean>(false);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const [removingItem, setRemovingItem] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState<string>("");
  const [discount, setDiscount] = useState<number>(0);
  const [applyingPromo, setApplyingPromo] = useState<boolean>(false);

  const { country, updateCountry } = useCountry();
  console.log(country);

  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum + (country === "LK" ? item.priceLKR : item.priceUSD) * item.quantity,
    0
  );
  const tax = subtotal * 0.07; // 7% tax
  const total = subtotal + tax - discount;

  useEffect(() => {
    fetchCartData();
  }, []);

  const fetchCartData = async () => {
    try {
      setLoading(true);
      // Fetch cart items (only productId and quantity)
      const { data: cartData } = await axios.get<{ items: CartItem[] }>(
        "/api/cart"
      );
      const cartItemsFromApi = cartData.items || [];

      if (cartItemsFromApi.length === 0) {
        setCartItems([]);
        return;
      }

      // Fetch product details for all productIds in the cart
      const productIds = cartItemsFromApi.map((item) => item.productId);
      const { data: productsData } = await axios.post<Product[]>(
        "/api/products/batch",
        { productIds }
      );

      // Extract unique category IDs from products
      const categoryIds = [
        ...new Set(
          productsData.map((product) => product.categoryId).filter(Boolean)
        ),
      ] as string[];

      // Fetch category details for all categoryIds
      const categoryPromises = categoryIds.map((categoryId) =>
        axios.get<Category>(`/api/categories/${categoryId}`)
      );
      const categoryResponses = await Promise.all(categoryPromises);
      const categories = categoryResponses.map((res) => res.data);

      // Merge cart items with product details and category names
      const mergedItems: DisplayCartItem[] = cartItemsFromApi.map(
        (cartItem) => {
          const product = productsData.find(
            (p) => p.id === cartItem.productId
          ) || {
            id: cartItem.productId,
            name: "Unknown Product",
            price: 0,
            priceLKR: 0,
            priceUSD: 0,
            categoryId: "",
          };
          const category = categories.find(
            (cat) => cat.id === product.categoryId
          ) || {
            id: product.categoryId || "",
            name: "Unknown Category",
            description: "No description avalaible",
          };
          return { ...cartItem, ...product, category };
        }
      );

      console.log(mergedItems);
      setCartItems(mergedItems);
    } catch (err: any) {
      console.error("Error fetching cart:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      setUpdatingItem(itemId);
      const response = await axios.put("/api/cart", {
        itemId,
        quantity: newQuantity,
      });

      // Update local state only if the API call succeeds
      setCartItems((prev) =>
        prev.map((item) =>
          item._id === itemId ? { ...item, quantity: newQuantity } : item
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
      fetchCartData();
      setUpdatingItem(null);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      setRemovingItem(itemId);
      const response = await axios.delete("/api/cart", {
        data: { itemId },
      });

      // Update local state only if the API call succeeds
      setCartItems((prev) => prev.filter((item) => item._id !== itemId));

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
      fetchCartData();
      setRemovingItem(null);
    }
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    try {
      setApplyingPromo(true);
      setError(null);
      const { data } = await axios.post("/api/promo/validate", {
        code: promoCode,
      });
      setDiscount(data.discount || 0);
      toast.success(
        `Promo code applied! You saved Rs ${data.discount.toFixed(2)}`,
        { position: "bottom-right" }
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to apply promo code", {
        position: "bottom-right",
      });
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleCheckout = async () => {
    // handle payment
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
                  key={item._id}
                  className="bg-white border border-gray-100 rounded-xl mb-4 p-4 md:p-6 hover:shadow-lg transition-all duration-200 group relative"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-12 md:col-span-6 flex items-center space-x-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center group-hover:bg-purple-50 transition-coloRs ">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="object-cover"
                          />
                        ) : (
                          <div className="text-gray-400 group-hover:text-purple-500 transition-coloRs ">
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
                        <Link href={`/products/Rs {item.productId}`}>
                          <h3 className="font-semibold text-gray-800 text-lg mb-1 group-hover:text-purple-700 transition-coloRs ">
                            {item.name}
                          </h3>
                        </Link>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            #{item.productId.substring(0, 8)}
                          </span>
                          <span className="inline-block w-2 h-2 rounded-full bg-purple-500"></span>
                          <span className="text-sm text-gray-500">
                            {item.category?.name || "Cosmetics"}
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
                          className={`w-8 h-8 flex items-center justify-center Rs {
                            updatingItem === item.id
                              ? "text-gray-400"
                              : "text-gray-600 hover:text-purple-700 hover:bg-purple-50"
                          } rounded-l-lg transition-coloRs `}
                          onClick={() =>
                            item.id &&
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={
                            updatingItem === item.id || item.quantity <= 1
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
                          {updatingItem === item.id ? (
                            <div className="w-4 h-4 border-2 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <button
                          className={`w-8 h-8 flex items-center justify-center ${
                            updatingItem === item.id
                              ? "text-gray-400"
                              : "text-gray-600 hover:text-purple-700 hover:bg-purple-50"
                          } rounded-r-lg transition-coloRs `}
                          onClick={() =>
                            item.id &&
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={updatingItem === item.id}
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
                          ? `Rs ${item.priceLKR.toFixed(2)}`
                          : `$ ${item.priceUSD.toFixed(2)}`}
                      </span>
                    </div>
                  </div>

                  <button
                    className={`absolute top-4 right-4 ${
                      removingItem === item._id
                        ? "text-gray-400"
                        : "text-gray-400 hover:text-red-500"
                    } transition-coloRs  hidden group-hover:block`}
                    onClick={() => item.id && removeItem(item.id)}
                    disabled={removingItem === item.id}
                  >
                    {removingItem === item._id ? (
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
                          ? "opacity-70 cuRs or-wait"
                          : "hover:bg-purple-700"
                      } transition-coloRs `}
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
                      Discount applied: Rs {discount.toFixed(2)}
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
                        Rs {subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="font-medium text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Estimated Tax</span>
                      <span className="font-medium">Rs {tax.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span className="font-medium">
                          -Rs {discount.toFixed(2)}
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
                        Rs {total.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Delivery expected in 3-5 business days
                    </p>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={processingCheckout || cartItems.length === 0}
                    className={`w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 px-6 rounded-xl font-medium flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                      processingCheckout || cartItems.length === 0
                        ? "opacity-70 cuRs or-not-allowed"
                        : ""
                    }`}
                  >
                    {processingCheckout ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                        Processing...
                      </>
                    ) : (
                      <>
                        Proceed to Checkout
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 ml-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </>
                    )}
                  </button>

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
