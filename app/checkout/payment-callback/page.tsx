"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!orderId) {
        setStatus("failed");
        setMessage("Invalid order reference");
        return;
      }

      try {
        // Check the actual order status from our database
        const response = await axios.get(`/api/orders/${orderId}`);

        if (response.data && response.data.id) {
          const order = response.data;

          console.log("Order status:", order.status);

          // Check the actual payment status from the order
          if (order.status === "PAID") {
            setStatus("success");
            setMessage("Payment processed successfully!");

            // Redirect to order confirmation after a short delay
            setTimeout(() => {
              router.push(`/order-confirmation?orderId=${orderId}`);
            }, 2000);
          } else if (order.status === "PAYMENT_FAILED") {
            setStatus("failed");
            setMessage(
              "Payment was not successful. Please try again or contact support."
            );
          } else {
            // Still pending - keep checking for a bit longer
            setMessage("Payment is being processed. Please wait...");

            // Retry checking status after 3 seconds, up to 5 times
            let retryCount = 0;
            const maxRetries = 5;

            const checkAgain = async () => {
              if (retryCount >= maxRetries) {
                setStatus("failed");
                setMessage(
                  "Payment status could not be confirmed. Please contact support with your order ID: " +
                    orderId
                );
                return;
              }

              retryCount++;

              try {
                const retryResponse = await axios.get(`/api/orders/${orderId}`);
                if (retryResponse.data && retryResponse.data.id) {
                  const updatedOrder = retryResponse.data;

                  if (updatedOrder.status === "PAID") {
                    setStatus("success");
                    setMessage("Payment processed successfully!");
                    setTimeout(() => {
                      router.push(`/order-confirmation?orderId=${orderId}`);
                    }, 2000);
                  } else if (updatedOrder.status === "PAYMENT_FAILED") {
                    setStatus("failed");
                    setMessage(
                      "Payment was not successful. Please try again or contact support."
                    );
                  } else {
                    // Still pending, try again
                    setTimeout(checkAgain, 3000);
                  }
                }
              } catch (error) {
                console.error("Retry payment check error:", error);
                setTimeout(checkAgain, 3000);
              }
            };

            // Start retry checking after 3 seconds
            setTimeout(checkAgain, 3000);
          }
        } else {
          setStatus("failed");
          setMessage("Order not found. Please contact support.");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setStatus("failed");
        setMessage("Payment verification failed. Please contact support.");
      }
    };

    checkPaymentStatus();
  }, [orderId, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Processing Payment
          </h2>
          <p className="text-gray-600">
            Please wait while we verify your payment...
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Payment Successful!
          </h2>
          <p className="text-gray-600 mb-4">{message}</p>
          <p className="text-sm text-gray-500">
            Redirecting to order confirmation...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Payment Failed
        </h2>
        <p className="text-gray-600 mb-4">{message}</p>
        <button
          onClick={() => router.push("/checkout")}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
        >
          Return to Checkout
        </button>
      </div>
    </div>
  );
}

function PaymentCallbackLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading...</h2>
        <p className="text-gray-600">
          Please wait while we process your request...
        </p>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<PaymentCallbackLoading />}>
      <PaymentCallbackContent />
    </Suspense>
  );
}
