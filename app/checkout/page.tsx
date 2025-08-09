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
import { useCart } from "../lib/hooks/CartContext";

// Define the structure for promo code cookie data
interface PromoCodeData {
  code: string;
  discount: number; // This is the discount percentage (e.g. 10 means 10%)
}

// Interface for shipping rates from API
interface ShippingRate {
  id: string;
  country: string;
  rateLKR: number;
  rateUSD: number;
}

// Default shipping rates to use as fallback if API call fails
const defaultShippingRates: Record<string, { LKR: number; USD: number }> = {
  Default: { LKR: 6000, USD: 20 },
  "Sri Lanka": { LKR: 350, USD: 1 },
};

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
    paymentMethod: z.enum([
      "ONEPAY",
      "KOKO",
      "CASH_ON_DELIVERY",
      "BANK_TRANSFER",
    ]),
    notes: z.string().optional(),
    paymentSlip: z.string().optional(),
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
  )
  .refine(
    (data) => {
      // If payment method is BANK_TRANSFER, paymentSlip is required
      if (data.paymentMethod === "BANK_TRANSFER") {
        return !!data.paymentSlip;
      }
      return true;
    },
    {
      message: "Payment slip is required for Bank Transfer",
      path: ["paymentSlip"],
    }
  );

interface OrderItem extends OrderItemPrisma {
  details?: any; // Unified property for product or bundle details
  isBundle: boolean;
}

interface DisplayCartItem {
  name: string;
  quantity: number;
  priceLKR: number;
  priceUSD: number;
  imageUrls?: string[];
  isBundle: boolean;
  category?: { name: string };
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingOrder, setProcessingOrder] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { country, updateCountry } = useCountry();
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [promoCode, setPromoCode] = useState<string>("");
  const [shippingRates, setShippingRates] =
    useState<Record<string, { LKR: number; USD: number }>>(
      defaultShippingRates
    );
  const [loadingShippingRates, setLoadingShippingRates] =
    useState<boolean>(true);

  const { refreshCart } = useCart();

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
    paymentMethod: "ONEPAY" | "KOKO" | "CASH_ON_DELIVERY" | "BANK_TRANSFER";
    saveAddress: boolean;
    paymentSlip?: string;
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
    paymentMethod: "CASH_ON_DELIVERY",
    saveAddress: false,
    paymentSlip: undefined,
  });

  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCustomerData() {
      const customerData = await getCustomerFromToken();
      if (customerData) {
        try {
          const { data } = await axios.get(
            `/api/customers/${customerData.id}?addresses=true`
          );
          const addresses = data.addresses || [];
          const address =
            addresses.find((addr) => addr.isDefault) || addresses[0] || {};
          setFormData((prev) => ({
            ...prev,
            firstName: address.firstName || "",
            lastName: address.lastName || "",
            email: address.email || "",
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
    // Fetch shipping rates from API
    async function fetchShippingRates() {
      try {
        setLoadingShippingRates(true);
        const { data } = await axios.get("/api/shippingrates");

        // Transform API response to match the format we need
        const ratesObject: Record<string, { LKR: number; USD: number }> = {
          Default: { LKR: 6000, USD: 20 }, // Always include a default
        };

        data.forEach((rate: ShippingRate) => {
          ratesObject[rate.country] = {
            LKR: rate.rateLKR,
            USD: rate.rateUSD,
          };
        });

        setShippingRates(ratesObject);
      } catch (err) {
        console.error("Error fetching shipping rates:", err);
        // Fall back to default shipping rates
        setShippingRates(defaultShippingRates);
      } finally {
        setLoadingShippingRates(false);
      }
    }

    fetchShippingRates();
  }, []);

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

    // Update total with new shipping cost and correctly calculated discount
    const discountAmount = (subtotal * discount) / 100; // Calculate discount amount as percentage of subtotal
    setTotal(
      subtotal -
        discountAmount +
        (country === "LK" ? shippingRate.LKR : shippingRate.USD)
    );
  }, [country, formData.country, subtotal, discount, shippingRates]);

  const fetchCartData = async () => {
    try {
      setLoading(true);
      // Fetch cart items (products and bundles) from our enhanced cart API
      const { data: cartData } = await axios.get("/api/cart");
      const cartItemsFromApi = cartData.items || [];

      if (cartItemsFromApi.length === 0) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      // Directly use the cart items from API with details
      setCartItems(cartItemsFromApi);

      // Calculate subtotal based on product or bundle prices
      const calculatedSubtotal = cartItemsFromApi.reduce((sum, item) => {
        const price = item.isBundle
          ? country === "LK"
            ? item.details?.offerPriceLKR || 0
            : item.details?.offerPriceUSD || 0
          : country === "LK"
          ? item.details?.discountPriceLKR || item.details?.priceLKR || 0
          : item.details?.discountPriceUSD || item.details?.priceUSD || 0;

        return sum + price * item.quantity;
      }, 0);

      // Check if we have a promo code applied
      const promoCodeCookie = Cookies.get("promoCodeDiscount");
      if (promoCodeCookie) {
        try {
          const promoCodeData: PromoCodeData = JSON.parse(promoCodeCookie);
          setDiscount(promoCodeData.discount || 0);
          setPromoCode(promoCodeData.code || "");

          // Calculate discount amount
          const discountAmount =
            (calculatedSubtotal * promoCodeData.discount) / 100;

          // Set subtotal and calculate total with shipping
          setSubtotal(calculatedSubtotal);
          setTotal(calculatedSubtotal - discountAmount + shippingCost);
        } catch (err) {
          console.error("Failed to parse promo code cookie:", err);
          setSubtotal(calculatedSubtotal);
          setTotal(calculatedSubtotal + shippingCost);
        }
      } else {
        setSubtotal(calculatedSubtotal);
        setTotal(calculatedSubtotal + shippingCost);
      }
    } catch (err: any) {
      console.error("Error fetching cart:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setProcessingOrder(true);
      setError(null);

      // If payment method is bank transfer and no slip is uploaded yet
      if (formData.paymentMethod === "BANK_TRANSFER" && !formData.paymentSlip) {
        if (!paymentFile) {
          setError("Please upload a payment slip for bank transfer");
          toast.error("Please upload a payment slip for bank transfer");
          setProcessingOrder(false);
          return;
        }

        // Upload the payment slip
        const paymentSlipUrl = await uploadPaymentSlip();
        if (!paymentSlipUrl) {
          setError("Failed to upload payment slip. Please try again.");
          setProcessingOrder(false);
          return;
        }
      }

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
          setDefault: formData.saveAddress, // Pass the checkbox value to the API
        },
        items: cartItems.map((item) => ({
          // For bundles, use bundleId; for products, use productId
          productId: item.isBundle ? undefined : item.productId,
          bundleId: item.isBundle ? item.productId : undefined, // In cart, bundleId is stored in productId field
          quantity: item.quantity,
          isBundle: item.isBundle,
        })),
        paymentMethod: validatedData.data.paymentMethod,
        currency: country === "LK" ? "LKR" : "USD",
        subtotal: subtotal,
        shipping: shippingCost, // Renamed to match the API schema
        discountAmount: (subtotal * discount) / 100, // Calculate discount amount based on percentage
        total: total,
        notes: validatedData.data.notes || "",
        paymentSlip: formData.paymentSlip || null, // Add payment slip URL
      };

      const response = await axios.post("/api/checkout", orderData);

      if (response.data.success) {
        const order = response.data.order;

        // If payment method is OnePay, redirect to OnePay payment gateway
        if (validatedData.data.paymentMethod === "ONEPAY") {
          try {
            const onePayPayload = {
              currency: country === "LK" ? "LKR" : "USD",
              amount: total,
              reference: order.id, // Use order ID as reference
              customer_first_name: validatedData.data.firstName,
              customer_last_name: validatedData.data.lastName,
              customer_phone_number: validatedData.data.phoneNumber || "",
              customer_email: validatedData.data.email || "",
              transaction_redirect_url: `${window.location.origin}/checkout/payment-callback?orderId=${order.id}`,
              additionalData: order.id, // Store order ID for callback reference
            };

            const onePayResponse = await axios.post(
              "/api/onepay",
              onePayPayload
            );

            if (onePayResponse.data.success) {
              // Clear cart and redirect to OnePay
              document.cookie =
                "cart=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              Cookies.remove("promoCodeDiscount");
              setCartItems([]);
              await refreshCart();

              // Redirect to OnePay payment gateway
              window.location.href =
                onePayResponse.data.data.gateway.redirect_url;
              return;
            } else {
              throw new Error(
                onePayResponse.data.error ||
                  "Failed to create OnePay payment link"
              );
            }
          } catch (onePayError) {
            console.error("OnePay error:", onePayError);
            toast.error("Failed to initiate OnePay payment. Please try again.");
            return;
          }
        } else {
          // For other payment methods (COD, Bank Transfer, etc.)
          // Clear cart cookie
          document.cookie =
            "cart=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          Cookies.remove("promoCodeDiscount");
          setCartItems([]);
          await refreshCart(); // Refresh cart context
          toast.success("Order placed successfully!");
          router.push(`/order-confirmation?orderId=${order.id}`);
        }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setPaymentFile(files[0]);
      setUploadError(null);
    }
  };

  const uploadPaymentSlip = async () => {
    if (!paymentFile) {
      setUploadError("Please select a file to upload");
      return null;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append("file", paymentFile);
      formData.append("upload_preset", "omaliya"); // Cloudinary upload preset

      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/omaliya/image/upload",
        formData
      );

      if (response.data && response.data.secure_url) {
        // Set the payment slip URL in formData
        setFormData((prev) => ({
          ...prev,
          paymentSlip: response.data.secure_url,
        }));
        return response.data.secure_url;
      } else {
        throw new Error("Failed to upload payment slip");
      }
    } catch (error) {
      console.error("Error uploading payment slip:", error);
      setUploadError("Failed to upload payment slip. Please try again.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const renderCartItem = (item: DisplayCartItem) => {
    return (
      <div
        key={item.name}
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
              ? `Rs ${(item.priceLKR * item.quantity).toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}`
              : `$ ${(item.priceUSD * item.quantity).toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}`}
          </span>
        </div>
      </div>
    );
  };

  if (loading || loadingShippingRates) {
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

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="saveAddress"
                        name="saveAddress"
                        checked={formData.saveAddress}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="saveAddress"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Save this address for future orders
                      </label>
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
                      name: item.isBundle
                        ? item.details?.bundleName || "Bundle"
                        : item.details?.name || "Product",
                      quantity: item.quantity,
                      priceLKR: item.isBundle
                        ? item.details?.offerPriceLKR || 0
                        : item.details?.discountPriceLKR ||
                          item.details?.priceLKR ||
                          0,
                      priceUSD: item.isBundle
                        ? item.details?.offerPriceUSD || 0
                        : item.details?.discountPriceUSD ||
                          item.details?.priceUSD ||
                          0,
                      imageUrls: item.isBundle
                        ? item.details?.imageUrl
                          ? [item.details.imageUrl]
                          : []
                        : item.details?.imageUrls || [],
                      isBundle: item.isBundle,
                      category: item.isBundle
                        ? { name: "Bundle" }
                        : item.details?.category || { name: "Product" },
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
                        ? `Rs ${subtotal.toLocaleString("en-US", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          })}`
                        : `$ ${subtotal.toLocaleString("en-US", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          })}`}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>
                        -{" "}
                        {country === "LK"
                          ? `Rs ${((subtotal * discount) / 100).toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2,
                              }
                            )}`
                          : `$ ${((subtotal * discount) / 100).toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2,
                              }
                            )}`}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {country === "LK"
                        ? `Rs ${shippingCost.toLocaleString("en-US", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          })}`
                        : `$ ${shippingCost.toLocaleString("en-US", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          })}`}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between py-4 font-semibold">
                  <span className="text-gray-800">Total</span>
                  <span className="text-purple-700">
                    {country === "LK"
                      ? `Rs ${total.toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })}`
                      : `$ ${total.toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })}`}
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
                      value="ONEPAY"
                      checked={formData.paymentMethod === "ONEPAY"}
                      onChange={handleInputChange}
                      className="form-radio h-5 w-5 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="flex-1">OnePay</span>
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
                      value="BANK_TRANSFER"
                      checked={formData.paymentMethod === "BANK_TRANSFER"}
                      onChange={handleInputChange}
                      className="form-radio h-5 w-5 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="flex-1">Bank Transfer</span>
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
                        d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
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
                      disabled
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

                  {formData.paymentMethod === "BANK_TRANSFER" && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="mb-3">
                        <h3 className="text-sm font-medium mb-2">
                          Bank Account Details:
                        </h3>
                        <div className="text-sm text-gray-700 space-y-1">
                          <p>
                            <strong>Bank:</strong> Bank of Ceylon
                          </p>
                          <p>
                            <strong>Account Name:</strong> K L P H Lekamge
                          </p>
                          <p>
                            <strong>Account Number:</strong> 84422146
                          </p>
                          <p>
                            <strong>Branch:</strong> Vishaka Branch
                          </p>
                        </div>
                        <hr className="my-2" />
                        <div className="text-sm text-gray-700 space-y-1">
                          <p>
                            <strong>Bank:</strong> HNB
                          </p>
                          <p>
                            <strong>Account Name:</strong> K L P H Lekamge
                          </p>
                          <p>
                            <strong>Account Number:</strong> 085020343368
                          </p>
                          <p>
                            <strong>Branch:</strong> Battaramulla
                          </p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                          Upload Payment Slip
                        </label>
                        <div className="mt-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-md file:border-0
                              file:text-sm file:font-semibold
                              file:bg-purple-50 file:text-purple-700
                              hover:file:bg-purple-100"
                          />
                          {paymentFile && (
                            <span className="text-xs text-green-600 mt-1 block">
                              Selected file: {paymentFile.name}
                            </span>
                          )}
                          {uploadError && (
                            <span className="text-xs text-red-600 mt-1 block">
                              {uploadError}
                            </span>
                          )}
                          {isUploading && (
                            <div className="flex items-center mt-2">
                              <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                              <span className="text-xs text-purple-600">
                                Uploading...
                              </span>
                            </div>
                          )}
                          {formData.paymentSlip && (
                            <div className="mt-2">
                              <span className="text-xs text-green-600 block">
                                Payment slip uploaded successfully!
                              </span>
                              <div className="mt-2 w-32 h-32 relative border border-gray-200 rounded-md overflow-hidden">
                                <Image
                                  src={formData.paymentSlip}
                                  alt="Payment Slip"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 italic">
                        Please upload a clear image of your bank transfer
                        receipt. Your order will be confirmed once the payment
                        is verified.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
