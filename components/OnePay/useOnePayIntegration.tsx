"use client";

import { useEffect, useState } from "react";

interface OnePayResult {
  code: "201" | "400";
  transaction_id: string;
  status: "SUCCESS" | "FAIL";
}

type OnePayEvent = CustomEvent<OnePayResult>;

interface OnePayIntegrationProps {
  onSuccess: (result: OnePayResult) => void;
  onError: (result: OnePayResult) => void;
  onStatusChange: (isProcessing: boolean) => void;
}

export function useOnePayIntegration({
  onSuccess,
  onError,
  onStatusChange,
}: OnePayIntegrationProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    // Check if OnePay script is loaded
    const checkScript = () => {
      if (
        typeof window !== "undefined" &&
        typeof window.onPayButtonClicked === "function"
      ) {
        console.log("✅ OnePay script is ready");
        setIsScriptLoaded(true);
        return true;
      }
      return false;
    };

    // Initial check
    if (!checkScript()) {
      // Poll for script availability
      const interval = setInterval(() => {
        if (checkScript()) {
          clearInterval(interval);
        }
      }, 100);

      // Cleanup after 30 seconds
      setTimeout(() => {
        clearInterval(interval);
        if (!isScriptLoaded) {
          console.error("❌ OnePay script failed to load within 30 seconds");
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isScriptLoaded]);

  useEffect(() => {
    // OnePay event listeners
    const handleOnePaySuccess = (e: Event) => {
      const evt = e as OnePayEvent;
      console.log("✅ OnePay Success:", evt.detail);
      onStatusChange(false);
      onSuccess(evt.detail);
    };

    const handleOnePayFail = (e: Event) => {
      const evt = e as OnePayEvent;
      console.log("❌ OnePay Failed:", evt.detail);
      onStatusChange(false);
      onError(evt.detail);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("onePaySuccess", handleOnePaySuccess);
      window.addEventListener("onePayFail", handleOnePayFail);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("onePaySuccess", handleOnePaySuccess);
        window.removeEventListener("onePayFail", handleOnePayFail);
      }
    };
  }, [onSuccess, onError, onStatusChange]);

  const initiatePayment = async (paymentData: {
    amount: number;
    currency: string;
    orderReference: string;
    customerFirstName: string;
    customerLastName: string;
    customerEmail: string;
    customerPhoneNumber: string;
    additional_data?: string;
  }) => {
    if (typeof window === "undefined") {
      console.error("❌ Window object not available");
      return false;
    }

    // Validate environment variables
    const appId = process.env.NEXT_PUBLIC_ONEPAY_APP_ID;
    const hashToken = process.env.NEXT_PUBLIC_ONEPAY_HASH_TOKEN;
    const appToken = process.env.NEXT_PUBLIC_ONEPAY_APP_TOKEN;

    if (!appId || !hashToken || !appToken) {
      console.error("❌ Missing OnePay credentials");
      return false;
    }

    if (!isScriptLoaded) {
      console.error("❌ OnePay script not loaded yet");
      return false;
    }

    // Create redirect URL for OnePay callback
    const baseUrl = window.location.origin;
    const redirectUrl = `${baseUrl}/api/onepay/callback`;

    console.log("🚀 Initiating OnePay payment with browser redirect:", {
      ...paymentData,
      redirectUrl,
    });

    // Set the global onePayData object that the OnePay script uses
    const onePayData = {
      currency: paymentData.currency,
      amount: paymentData.amount,
      appid: appId,
      hashToken: hashToken,
      apptoken: appToken,
      orderReference: paymentData.orderReference,
      customerFirstName: paymentData.customerFirstName,
      customerLastName: paymentData.customerLastName,
      customerPhoneNumber: paymentData.customerPhoneNumber,
      customerEmail: paymentData.customerEmail,
      transactionRedirectUrl: redirectUrl,
      additionalData:
        paymentData.additional_data || "Payment from Omaliya Cosmetics",
    };

    // Set global onePayData for the script
    window.onePayData = onePayData;
    onStatusChange(true);

    // Try to override OnePay's modal behavior to use full browser redirect
    try {
      // Store original functions
      const originalOpenPaymentIframe = window.openPaymentIframe;
      const originalWindowOpen = window.open;

      // Override the main iframe function
      window.openPaymentIframe = (url: string, id?: string) => {
        console.log(
          "🔄 Intercepted openPaymentIframe - Redirecting browser to:",
          url
        );
        window.location.href = url;
        return;
      };

      // Override window.open to catch popup attempts
      window.open = function (
        url?: string | URL,
        target?: string,
        features?: string
      ) {
        if (
          url &&
          (url.toString().includes("onepay") ||
            url.toString().includes("gateway") ||
            url.toString().includes("payment"))
        ) {
          console.log(
            "🔄 Intercepted window.open for OnePay - Redirecting browser:",
            url
          );
          window.location.href = url.toString();
          return null;
        }
        return originalWindowOpen.call(window, url, target, features);
      };

      // Override common modal libraries
      if ((window as any).jQuery && (window as any).jQuery.fn.modal) {
        const originalModal = (window as any).jQuery.fn.modal;
        (window as any).jQuery.fn.modal = function (action: any) {
          console.log("🔄 Intercepted jQuery modal - checking for OnePay URL");
          const modalContent =
            this.find("iframe").attr("src") || this.data("url");
          if (
            modalContent &&
            (modalContent.includes("onepay") ||
              modalContent.includes("gateway"))
          ) {
            console.log(
              "🔄 Redirecting browser to OnePay instead of modal:",
              modalContent
            );
            window.location.href = modalContent;
            return this;
          }
          return originalModal.call(this, action);
        };
      }

      // Override iframe creation
      const originalCreateElement = document.createElement;
      document.createElement = function (
        tagName: string,
        options?: ElementCreationOptions
      ) {
        const element = originalCreateElement.call(document, tagName, options);
        if (tagName.toLowerCase() === "iframe") {
          // Override iframe src setter to catch OnePay URLs
          const originalSrcSetter = Object.getOwnPropertyDescriptor(
            HTMLIFrameElement.prototype,
            "src"
          )?.set;
          if (originalSrcSetter) {
            Object.defineProperty(element, "src", {
              set: function (value: string) {
                if (
                  value &&
                  (value.includes("onepay") ||
                    value.includes("gateway") ||
                    value.includes("payment"))
                ) {
                  console.log(
                    "🔄 Intercepted iframe src for OnePay - Redirecting browser:",
                    value
                  );
                  window.location.href = value;
                  return;
                }
                originalSrcSetter.call(this, value);
              },
              get: function () {
                return this.getAttribute("src");
              },
            });
          }
        }
        return element;
      };

      // Also check if the OnePay script creates modals using a different method
      // Override common modal creation patterns
      const originalBodyAppendChild = document.body.appendChild;
      document.body.appendChild = function <T extends Node>(node: T): T {
        // Check if it's a modal element with OnePay content
        if (node instanceof HTMLElement) {
          const iframe = node.querySelector("iframe");
          if (
            iframe &&
            iframe.src &&
            (iframe.src.includes("onepay") || iframe.src.includes("gateway"))
          ) {
            console.log(
              "🔄 Intercepted modal with OnePay iframe - Redirecting browser:",
              iframe.src
            );
            window.location.href = iframe.src;
            return node;
          }
        }
        return originalBodyAppendChild.call(this, node) as T;
      };

      // Call the onPayButtonClicked function
      console.log(
        "✅ Calling OnePay script function with comprehensive redirect overrides"
      );

      // Add a MutationObserver to catch any modal creation attempts
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              // Check for modal elements
              if (
                node.classList.contains("modal") ||
                node.classList.contains("popup") ||
                node.id.includes("modal") ||
                node.id.includes("popup")
              ) {
                const iframe = node.querySelector("iframe");
                if (
                  iframe &&
                  iframe.src &&
                  (iframe.src.includes("onepay") ||
                    iframe.src.includes("gateway") ||
                    iframe.src.includes("payment"))
                ) {
                  console.log(
                    "🔄 MutationObserver caught OnePay modal - Redirecting browser:",
                    iframe.src
                  );
                  window.location.href = iframe.src;
                  return;
                }
              }

              // Check if the node itself is an iframe with OnePay URL
              if (node.tagName === "IFRAME") {
                const iframe = node as HTMLIFrameElement;
                if (
                  iframe.src &&
                  (iframe.src.includes("onepay") ||
                    iframe.src.includes("gateway") ||
                    iframe.src.includes("payment"))
                ) {
                  console.log(
                    "🔄 MutationObserver caught OnePay iframe - Redirecting browser:",
                    iframe.src
                  );
                  window.location.href = iframe.src;
                  return;
                }
              }
            }
          });
        });
      });

      // Start observing
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // Stop observing after a timeout
      setTimeout(() => {
        observer.disconnect();
      }, 10000);

      window.onPayButtonClicked();

      // Restore original functions after a delay
      setTimeout(() => {
        if (originalOpenPaymentIframe) {
          window.openPaymentIframe = originalOpenPaymentIframe;
        }
        window.open = originalWindowOpen;
        document.createElement = originalCreateElement;
        document.body.appendChild = originalBodyAppendChild;
      }, 10000); // Longer timeout to ensure redirect happens

      return true;
    } catch (error) {
      console.error("❌ Error initiating OnePay payment:", error);
      onStatusChange(false);
      return false;
    }
  };

  return {
    isScriptLoaded,
    initiatePayment,
  };
}
