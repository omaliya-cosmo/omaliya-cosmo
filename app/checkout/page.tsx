"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCountry } from "../lib/hooks/useCountry";
import {
  Address,
  BundleOffer,
  OrderItem as OrderItemPrisma,
  Product,
} from "@prisma/client";
import Cookies from "js-cookie";
import { getCustomerFromToken } from "../actions";
import { z } from "zod";

const checkoutSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z
      .string()
      .email("Please enter a valid email address")
      .optional()
      .or(z.literal("")),
    phoneNumber: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .regex(/^\d+$/, "Phone number must contain only digits")
      .optional()
      .or(z.literal("")),
    addressLine1: z.string().min(1, "Address is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
    paymentMethod: z.enum(["PAY_HERE", "KOKO", "CASH_ON_DELIVERY"]),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      const hasEmail = !!data.email && data.email !== "";
      const hasPhone = !!data.phoneNumber && data.phoneNumber !== "";
      return hasEmail || hasPhone;
    },
    {
      message: "Either a valid email or phone number must be provided",
      path: ["email"], // Only one path is allowed; Zod doesn't highlight multiple fields well
    }
  );

interface OrderItem extends OrderItemPrisma {
  product: Product;
  bundle: BundleOffer;
}

interface DisplayCartItem {
  _id: string;
  name: string;
  quantity: number;
  priceLKR: number;
  priceUSD: number;
  imageUrls?: string[];
  isBundle: boolean;
  category?: { name: string };
}

// Define shipping rates by country
const shippingRates: Record<string, { LKR: number; USD: number }> = {
  "Sri Lanka": { LKR: 350, USD: 1 },
  "United States": { LKR: 4500, USD: 15 },
  "United Kingdom": { LKR: 5000, USD: 17 },
  Australia: { LKR: 5500, USD: 18 },
  Canada: { LKR: 5000, USD: 17 },
  Germany: { LKR: 5200, USD: 17.5 },
  France: { LKR: 5200, USD: 17.5 },
  Italy: { LKR: 5200, USD: 17.5 },
  Spain: { LKR: 5200, USD: 17.5 },
  Japan: { LKR: 6000, USD: 20 },
  Singapore: { LKR: 4800, USD: 16 },
  Malaysia: { LKR: 4500, USD: 15 },
  Default: { LKR: 6000, USD: 20 },
};

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingOrder, setProcessingOrder] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { country, updateCountry } = useCountry();
  const [shippingCost, setShippingCost] = useState<number>(0);

  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    notes: string;
    addressLine1: string;
    addressLine2: string;
    state: string;
    city: string;
    postalCode: string;
    country: string;
    paymentMethod: "PAY_HERE" | "KOKO" | "CASH_ON_DELIVERY";
  }>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    notes: "",
    addressLine1: "",
    addressLine2: "",
    state: "",
    city: "",
    postalCode: "",
    country: "",
    paymentMethod: "PAY_HERE",
  });

  useEffect(() => {
    async function loadCustomerData() {
      const customerData = await getCustomerFromToken();
      if (customerData) {
        try {
          const { data } = await axios.get(
            `/api/customers/${customerData.id}?address=true`
          );
          const address = data.address || {};
          setFormData((prev) => ({
            ...prev,
            firstName: customerData.firstName || "",
            lastName: customerData.lastName || "",
            email: customerData.email || "",
            phoneNumber: address.phoneNumber || "",
            addressLine1: address.addressLine1 || "",
            addressLine2: address.addressLine2 || "",
            city: address.city || "",
            state: address.state || "",
            postalCode: address.postalCode || "",
            country: address.country || "",
          }));
        } catch (error) {
          console.error("Error fetching customer address:", error);
        }
      }
    }
    loadCustomerData();
  }, []);

  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchCartData();
  }, [country]);

  useEffect(() => {
    // Calculate shipping cost based on selected country
    const countryKey =
      Object.keys(shippingRates).find(
        (key) => key.toLowerCase() === formData.country.toLowerCase()
      ) || "Default";

    const shippingRate = shippingRates[countryKey];
    setShippingCost(country === "LK" ? shippingRate.LKR : shippingRate.USD);

    // Update total with new shipping cost
    setTotal(
      subtotal -
        discount +
        (country === "LK" ? shippingRate.LKR : shippingRate.USD)
    );
  }, [country, formData.country, subtotal, discount]);

  const fetchCartData = async () => {
    try {
      setLoading(true);
      const { data: cartData } = await axios.get<{ items: OrderItem[] }>(
        "/api/cart"
      );
      const cartItemsFromApi = cartData.items || [];

      if (cartItemsFromApi.length === 0) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      // Separate regular products and bundles
      const productIds = cartItemsFromApi
        .filter((item) => !item.isBundle && item.productId)
        .map((item) => item.productId);
      const bundleIds = cartItemsFromApi
        .filter((item) => item.isBundle && item.bundleId)
        .map((item) => item.bundleId);

      const [productsData, bundlesData] = await Promise.all([
        productIds.length > 0
          ? axios.post<Product[]>("/api/products/batch", { productIds })
          : Promise.resolve({ data: [] }),
        bundleIds.length > 0
          ? axios.post<BundleOffer[]>("/api/bundles/batch", { bundleIds })
          : Promise.resolve({ data: [] }),
      ]);

      // Merge all items (both regular products and bundles)
      const mergedItems: OrderItem[] = cartItemsFromApi.map((cartItem) => {
        if (cartItem.isBundle) {
          const bundle = bundlesData.data.find(
            (b) => b.id === cartItem.bundleId
          );
          return {
            ...cartItem,
            bundle: bundle || {
              id: cartItem.bundleId || "unknown-id",
              createdAt: new Date(),
              updatedAt: new Date(),
              imageUrl: null,
              bundleName: "Unknown Bundle",
              originalPriceLKR: 0,
              originalPriceUSD: 0,
              offerPriceLKR: 0,
              offerPriceUSD: 0,
              endDate: new Date(),
            },
          };
        } else {
          const product = productsData.data.find(
            (p) => p.id === cartItem.productId
          );
          return {
            ...cartItem,
            product: product || {
              id: cartItem.productId || "unknown-id",
              name: "Unknown Product",
              description: "No description available",
              imageUrls: [],
              categoryId: "unknown-category",
              priceLKR: 0,
              discountPriceLKR: null,
              priceUSD: 0,
              discountPriceUSD: null,
              stock: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          };
        }
      });

      setCartItems(mergedItems);

      // Calculate subtotal
      const calculatedSubtotal = mergedItems.reduce((sum, item) => {
        const price = item.isBundle
          ? country === "LK"
            ? item.bundle?.offerPriceLKR || 0
            : item.bundle?.offerPriceUSD || 0
          : country === "LK"
          ? item.product?.priceLKR || 0
          : item.product?.priceUSD || 0;

        return sum + price * item.quantity;
      }, 0);

      const promoCodeDiscount = parseFloat(
        Cookies.get("promoCodeDiscount") || "0"
      );

      setDiscount(promoCodeDiscount);
      setSubtotal(calculatedSubtotal);
      setTotal(calculatedSubtotal - promoCodeDiscount + shippingCost);

      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching cart:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setProcessingOrder(true);
      setError(null);

      const validatedData = checkoutSchema.safeParse(formData);

      if (!validatedData.success) {
        const errorMessages = validatedData.error.errors.map(
          (err) => err.message
        );
        const uniqueErrors = [...new Set(errorMessages)];
        const errorMessage = uniqueErrors.join(", ");
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      const orderData = {
        addressDetails: {
          firstName: validatedData.data.firstName,
          lastName: validatedData.data.lastName,
          email: validatedData.data.email,
          phoneNumber: validatedData.data.phoneNumber,
          addressLine1: validatedData.data.addressLine1,
          addressLine2: validatedData.data.addressLine2,
          city: validatedData.data.city,
          state: validatedData.data.state,
          postalCode: validatedData.data.postalCode,
          country: validatedData.data.country,
          setDefault: true, // Add this option for logged-in users
        },
        items: cartItems.map((item) => ({
          productId: item.isBundle ? undefined : item.productId,
          bundleId: item.isBundle ? item.bundleId : undefined,
          quantity: item.quantity,
          isBundle: item.isBundle || false,
        })),
        paymentMethod: validatedData.data.paymentMethod,
        currency: country === "LK" ? "LKR" : "USD",
        subtotal: subtotal,
        discountAmount: discount,
        shippingCost: shippingCost,
        total: total,
        notes: validatedData.data.notes,
      };

      const response = await axios.post("/api/checkout", orderData);

      if (response.data.success) {
        document.cookie =
          "cart=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        setCartItems([]);
        toast.success("Order placed successfully!");
        router.push(`/order-confirmation?orderId=${response.data.order.id}`);
      } else {
        throw new Error(response.data.error || "Failed to place order");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.error || err.message;
        setError(errorMessage);
        toast.error(errorMessage);
      } else if (err instanceof Error) {
        setError(err.message);
        toast.error(err.message);
      }
    } finally {
      setProcessingOrder(false);
    }
  };

  const renderCartItem = (item: DisplayCartItem) => {
    return (
      <div
        key={item._id}
        className="flex justify-between py-3 border-b border-gray-100 last:border-0"
      >
        <div className="flex items-start">
          <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden mr-3 flex-shrink-0">
            {(item.imageUrls ?? []).length > 0 ? (
              <Image
                src={(item.imageUrls ?? [])[0]}
                alt={item.name}
                width={48}
                height={48}
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-400">
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
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              {item.name}{" "}
              <span className="text-gray-500 font-normal">
                x{item.quantity}
              </span>
            </h3>
            <p className="text-xs text-gray-500">
              {item.isBundle ? "Bundle" : item.category?.name || "Cosmetics"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="font-medium text-gray-900">
            {country === "LK"
              ? `Rs ${(item.priceLKR * item.quantity).toFixed(2)}`
              : `$ ${(item.priceUSD * item.quantity).toFixed(2)}`}
          </span>
        </div>
      </div>
    );
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
            <div className="md:col-span-2">
              <form onSubmit={handleSubmit}>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Contact Information
                  </h2>

                  <div className="space-y-4">
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
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email address"
                        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number (e.g., 0771234567)"
                        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Order Notes{" "}
                        <span className="text-gray-500 text-xs">
                          (Optional)
                        </span>
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Add any special instructions or notes about your order"
                        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 min-h-[100px]"
                      />
                    </div>
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
                          {Object.keys(shippingRates).map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
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
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                {/* Cart items */}
                <div className="max-h-64 overflow-y-auto mb-4">
                  {cartItems.map((item) => {
                    const displayItem: DisplayCartItem = {
                      _id: item.id,
                      name: item.isBundle
                        ? item.bundle?.bundleName
                        : item.product?.name,
                      quantity: item.quantity,
                      priceLKR: item.isBundle
                        ? item.bundle?.offerPriceLKR || 0
                        : item.product?.priceLKR || 0,
                      priceUSD: item.isBundle
                        ? item.bundle?.offerPriceUSD || 0
                        : item.product?.priceUSD || 0,
                      imageUrls: item.isBundle
                        ? item.bundle?.imageUrl
                          ? [item.bundle.imageUrl]
                          : []
                        : item.product?.imageUrls || [],
                      isBundle: item.isBundle,
                      category: item.isBundle ? undefined : { name: "Product" },
                    };
                    return renderCartItem(displayItem);
                  })}
                </div>

                {/* Pricing breakdown */}
                <div className="space-y-2 py-4 border-t border-b border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Subtotal (
                      {cartItems.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                      items)
                    </span>
                    <span className="font-medium">
                      {country === "LK"
                        ? `Rs ${subtotal.toFixed(2)}`
                        : `$ ${subtotal.toFixed(2)}`}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>
                        -{" "}
                        {country === "LK"
                          ? `Rs ${discount.toFixed(2)}`
                          : `$ ${discount.toFixed(2)}`}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {country === "LK"
                        ? `Rs ${shippingCost.toFixed(2)}`
                        : `$ ${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between py-4 font-semibold">
                  <span className="text-gray-800">Total</span>
                  <span className="text-purple-700">
                    {country === "LK"
                      ? `Rs ${total.toFixed(2)}`
                      : `$ ${total.toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* Payment method */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Payment Method</h2>

                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CASH_ON_DELIVERY"
                      checked={formData.paymentMethod === "CASH_ON_DELIVERY"}
                      onChange={handleInputChange}
                      className="form-radio h-5 w-5 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="flex-1">Cash on Delivery</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="PAY_HERE"
                      checked={formData.paymentMethod === "PAY_HERE"}
                      onChange={handleInputChange}
                      className="form-radio h-5 w-5 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="flex-1">Pay Here</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="KOKO"
                      checked={formData.paymentMethod === "KOKO"}
                      onChange={handleInputChange}
                      className="form-radio h-5 w-5 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="flex-1">Koko</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                  </label>
                </div>

                <button
                  onClick={() => {
                    const form = document.querySelector("form");
                    if (form) form.requestSubmit();
                  }}
                  disabled={
                    loading || cartItems.length === 0 || processingOrder
                  }
                  className={`w-full mt-6 py-3 px-4 rounded-md font-medium text-white ${
                    loading || cartItems.length === 0 || processingOrder
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700 transition-colors"
                  }`}
                >
                  {processingOrder ? (
                    <span className="flex items-center justify-center">
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
                    </span>
                  ) : (
                    `Place Order (${
                      country === "LK"
                        ? `Rs ${total.toFixed(2)}`
                        : `$ ${total.toFixed(2)}`
                    })`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
