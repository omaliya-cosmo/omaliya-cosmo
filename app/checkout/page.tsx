"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCountry } from "../lib/hooks/useCountry";
import { Product } from "@prisma/client";
import Cookies from "js-cookie"; // Import js-cookie to handle cookies
import { getCustomerFromToken } from "../actions";

interface CartItem extends Product {
  productId: string;
  quantity: number;
}

const shippingFees = [
  { country: "Sri Lanka", fee: 500 },
  { country: "USA", fee: 15 },
  { country: "UK", fee: 20 },
  { country: "Australia", fee: 25 },
  { country: "Canada", fee: 30 },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingOrder, setProcessingOrder] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { country, updateCountry } = useCountry();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    paymentMethod: "PAY_HERE",
  });

  useEffect(() => {
    async function loadCustomerData() {
      const customerData = await getCustomerFromToken();
      if (customerData) {
        setFormData((prev) => ({
          ...prev,
          firstName: customerData.firstName || "",
          lastName: customerData.lastName || "",
          email: customerData.email || "",
          phoneNumber: customerData.phoneNumber || "",
          addressLine1: customerData.addressLine1 || "",
          addressLine2: customerData.addressLine2 || "",
          city: customerData.city || "",
          state: customerData.state || "",
          postalCode: customerData.postalCode || "",
          country: customerData.country || "",
        }));
      }
    }
    loadCustomerData();
  }, []);

  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchCartData();
  }, [country]);

  const fetchCartData = async () => {
    try {
      setLoading(true);
      const { data: cartData } = await axios.get<{ items: CartItem[] }>(
        "/api/cart"
      );
      const cartItemsFromApi = cartData.items || [];

      if (cartItemsFromApi.length === 0) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      const productIds = cartItemsFromApi.map((item) => item.productId);
      const { data: productsData } = await axios.post<Product[]>(
        "/api/products/batch",
        { productIds }
      );

      const mergedItems = cartItemsFromApi.map((cartItem) => {
        const product = productsData.find(
          (p) => p.id === cartItem.productId
        ) || {
          id: cartItem.productId,
          name: "Unknown Product",
          price: 0,
          priceLKR: 0,
          priceUSD: 0,
        };
        return { ...cartItem, ...product };
      });

      setCartItems(mergedItems);

      const calculatedSubtotal = mergedItems.reduce(
        (sum, item) =>
          sum +
          (country === "LK" ? item.priceLKR : item.priceUSD) * item.quantity,
        0
      );

      // Retrieve promo code discount from cookies
      const promoCodeDiscount = parseFloat(
        Cookies.get("promoCodeDiscount") || "0"
      );
      setDiscount(promoCodeDiscount);

      setSubtotal(calculatedSubtotal);
      setTotal(calculatedSubtotal + shipping - promoCodeDiscount);

      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching cart:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name == "country") {
      setShipping(shippingFees.find((fee) => fee.country === value)?.fee ?? 0);
      setTotal(subtotal + shipping - discount);
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setProcessingOrder(true);
      setError(null);

      // Prepare customer details
      const customerDetails = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
      };

      // Prepare order data
      const orderData = {
        customerDetails,
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentMethod: formData.paymentMethod.toUpperCase(),
        currency: country === "LK" ? "LKR" : "USD",
        shipping,
        notes: "Please deliver between 9 AM and 5 PM", // Example note
      };

      // Send order data to the backend
      const response = await axios.post("/api/checkout", orderData);

      if (response.status === 200) {
        // Clear cart cookies
        document.cookie =
          "cart=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        setCartItems([]);

        toast.success("Order placed successfully!", {
          position: "bottom-right",
        });

        // Redirect to order confirmation page
        router.push(`/order-confirmation?orderId=${response.data.order.id}`);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to place order";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "bottom-right",
      });
    } finally {
      setProcessingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500">Loading checkout information...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 py-6 px-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Checkout
            </h1>
          </div>

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
              Please add items to your cart before proceeding to checkout.
            </p>
            <Link
              href="/products"
              className="inline-block bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-xl font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-150"
            >
              Explore Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <ToastContainer />

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 py-6 px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Checkout
          </h1>
          <p className="text-purple-200 mt-2">Complete your purchase</p>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left side - Customer Information */}
            <div className="md:col-span-2">
              <form onSubmit={handleSubmit}>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Contact Information
                  </h2>

                  <div className="space-y-4">
                    {/* Form fields with improved contrast */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                        />
                      </div>
                    </div>
                    {country == "LK" ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="phoneNumber"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Shipping Address
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        name="addressLine1"
                        value={formData.addressLine1}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                        placeholder="Street address, P.O. box, company name"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                          Address Line 2{" "}
                          <span className="text-gray-500 text-xs">
                            (Optional)
                          </span>
                        </label>
                        <input
                          type="text"
                          name="addressLine2"
                          value={formData.addressLine2}
                          onChange={handleInputChange}
                          className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                          placeholder="Apartment, suite, unit, building, floor, etc."
                        />
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                          State/Province/Region
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                        />
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                        />
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                          Country
                        </label>
                        <select
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                        >
                          <option value="">Select a country</option>
                          {shippingFees.map((fee) => (
                            <option key={fee.country} value={fee.country}>
                              {fee.country}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Payment Method
                  </h2>

                  <div className="space-y-3">
                    <label className="flex items-center p-4 border-2 border-gray-300 bg-gray-50 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="PAY_HERE"
                        checked={formData.paymentMethod === "PAY_HERE"}
                        onChange={handleInputChange}
                        className="h-5 w-5 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-medium text-gray-800">
                          PayHere
                        </span>
                        <span className="block text-xs text-gray-600">
                          Secure online payment gateway for Sri Lanka
                        </span>
                      </div>
                      <div className="ml-auto flex space-x-1">
                        <div className="w-8 h-5 bg-blue-600 rounded"></div>
                        <div className="w-8 h-5 bg-gray-800 rounded"></div>
                      </div>
                    </label>

                    <label className="flex items-center p-4 border-2 border-gray-300 bg-gray-50 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="KOKO"
                        checked={formData.paymentMethod === "KOKO"}
                        onChange={handleInputChange}
                        className="h-5 w-5 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-medium text-gray-800">
                          KOKO Payment
                        </span>
                        <span className="block text-xs text-gray-600">
                          Pay using KOKO digital wallet
                        </span>
                      </div>
                      <div className="ml-auto">
                        <div className="w-8 h-5 bg-purple-500 rounded"></div>
                      </div>
                    </label>

                    <label className="flex items-center p-4 border-2 border-gray-300 bg-gray-50 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="CASH_ON_DELIVERY"
                        checked={formData.paymentMethod === "CASH_ON_DELIVERY"}
                        onChange={handleInputChange}
                        className="h-5 w-5 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-medium text-gray-800">
                          Cash On Delivery
                        </span>
                        <span className="block text-xs text-gray-600">
                          Pay after recieving the product
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processingOrder}
                  className={`w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium py-4 px-6 rounded-xl ${
                    processingOrder
                      ? "opacity-70 cursor-wait"
                      : "hover:shadow-lg transform hover:-translate-y-0.5"
                  } transition-all duration-150`}
                >
                  {processingOrder ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing Order...
                    </div>
                  ) : (
                    "Complete Order"
                  )}
                </button>

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
              </form>
            </div>

            {/* Right side - Order Summary */}
            <div className="md:col-span-1">
              <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-md p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-100"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.imageUrls ? (
                          <Image
                            src={item.imageUrls[0]}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-8 w-8"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-800 truncate">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-600">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <div className="text-sm font-medium text-gray-800">
                        {country === "LK"
                          ? `Rs ${(item.priceLKR * item.quantity).toFixed(2)}`
                          : `$${(item.priceUSD * item.quantity).toFixed(2)}`}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-300 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Subtotal</span>
                    <span className="font-medium text-gray-800">
                      {country === "LK"
                        ? `Rs ${subtotal.toFixed(2)}`
                        : `$${subtotal.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Shipping</span>
                    <span className="font-medium text-green-600">
                      {shipping}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">
                        {country === "LK" ? "- Rs" : "- $"}{" "}
                        {(subtotal * (discount / 100)).toFixed(2)}`
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-300 mt-4 pt-4 bg-white p-3 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-base font-bold text-gray-800">
                      Total
                    </span>
                    <span className="text-base font-bold text-purple-700">
                      {country === "LK"
                        ? `Rs ${total.toFixed(2)}`
                        : `$${total.toFixed(2)}`}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-300">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">
                      Currency
                    </span>
                    <span className="text-sm font-medium px-2 py-1 bg-purple-100 text-purple-700 rounded">
                      {country === "LK" ? "LKR (Rs)" : "USD ($)"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-300">
                  <Link
                    href="/cart"
                    className="flex items-center justify-center text-purple-700 hover:text-purple-900 text-sm font-medium"
                  >
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
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Return to cart
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
