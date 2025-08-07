/**
 * OnePay Test Component
 *
 * This component can be used to test OnePay integration
 * Add this to any page to test the payment flow
 */

"use client";

import { useState, useEffect } from "react";

// OnePay types for this component
interface OnePayResult {
  code: "201" | "400";
  transaction_id: string;
  status: "SUCCESS" | "FAIL";
}

declare global {
  interface Window {
    onePayData: any;
    onPayButtonClicked: () => void;
  }
}

export default function OnePayTest() {
  const [testResult, setTestResult] = useState<string>("");

  useEffect(() => {
    const handleSuccess = (e: Event) => {
      const evt = e as CustomEvent;
      setTestResult(`✅ Payment Success: ${JSON.stringify(evt.detail)}`);
    };

    const handleFail = (e: Event) => {
      const evt = e as CustomEvent;
      setTestResult(`❌ Payment Failed: ${JSON.stringify(evt.detail)}`);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("onePaySuccess", handleSuccess);
      window.addEventListener("onePayFail", handleFail);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("onePaySuccess", handleSuccess);
        window.removeEventListener("onePayFail", handleFail);
      }
    };
  }, []);

  const testPayment = () => {
    if (
      typeof window === "undefined" ||
      typeof window.onPayButtonClicked !== "function"
    ) {
      setTestResult("❌ OnePay not loaded");
      return;
    }

    window.onePayData = {
      currency: "LKR",
      amount: 1000,
      appid: process.env.NEXT_PUBLIC_ONEPAY_APP_ID || "TEST_APP_ID",
      hashToken: process.env.NEXT_PUBLIC_ONEPAY_HASH_TOKEN || "TEST_HASH_TOKEN",
      apptoken: process.env.NEXT_PUBLIC_ONEPAY_APP_TOKEN || "TEST_APP_TOKEN",
      orderReference: `TEST${Date.now().toString().slice(-10)}`,
      customerFirstName: "Test",
      customerLastName: "User",
      customerPhoneNumber: "0712345678",
      customerEmail: "test@example.com",
      transactionRedirectUrl: window.location.href,
      additionalData: "Test payment",
    };

    setTestResult("🔄 Initiating test payment...");
    window.onPayButtonClicked();
  };

  return (
    <div className="p-6 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">OnePay Integration Test</h3>

      <div className="space-y-4">
        <button
          onClick={testPayment}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test OnePay Payment (LKR 1000)
        </button>

        {testResult && (
          <div className="p-4 bg-white border rounded">
            <h4 className="font-medium mb-2">Test Result:</h4>
            <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p>
            <strong>Note:</strong> This test component uses the same OnePay
            integration as the checkout page.
          </p>
          <p>
            Make sure you have set up your environment variables in .env.local
          </p>
        </div>
      </div>
    </div>
  );
}
