"use client";

import { useState } from "react";
import { useOnePayIntegration } from "@/components/OnePay/useOnePayIntegration";

export default function OnePayTestPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [testData, setTestData] = useState({
    amount: "100.00",
    currency: "LKR",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "0771234567",
  });

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  // OnePay integration hook
  const { isScriptLoaded, initiatePayment } = useOnePayIntegration({
    onSuccess: (result) => {
      setResult(result);
      setIsProcessing(false);
      addLog(`✅ Payment SUCCESS: ${JSON.stringify(result)}`);
    },
    onError: (result) => {
      setResult(result);
      setIsProcessing(false);
      addLog(`❌ Payment FAILED: ${JSON.stringify(result)}`);
    },
    onStatusChange: (processing) => {
      setIsProcessing(processing);
      addLog(
        processing
          ? "🔄 Payment processing..."
          : "⏹️ Payment processing stopped"
      );
    },
  });

  const testPayment = async () => {
    addLog("🚀 Starting OnePay payment test...");

    try {
      const orderReference = `TEST${Date.now().toString().slice(-10)}`; // 10-21 chars required

      addLog(`📋 Order Reference: ${orderReference}`);
      addLog(`💰 Amount: ${testData.amount} ${testData.currency}`);

      const paymentData = {
        amount: parseFloat(testData.amount),
        currency: testData.currency,
        orderReference,
        customerFirstName: testData.firstName,
        customerLastName: testData.lastName,
        customerEmail: testData.email,
        customerPhoneNumber: testData.phone,
        additional_data: "OnePay Test Payment",
      };

      addLog(`� Initiating payment with browser redirect...`);

      const success = await initiatePayment(paymentData);

      if (!success) {
        addLog("❌ Failed to initiate payment");
      }
    } catch (error) {
      addLog(`❌ Error initiating payment: ${error}`);
      setIsProcessing(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            OnePay Integration Test
          </h1>

          {/* Test Configuration */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Test Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  type="number"
                  value={testData.amount}
                  onChange={(e) =>
                    setTestData((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  className="w-full p-2 border rounded"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Currency
                </label>
                <select
                  value={testData.currency}
                  onChange={(e) =>
                    setTestData((prev) => ({
                      ...prev,
                      currency: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="LKR">LKR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={testData.firstName}
                  onChange={(e) =>
                    setTestData((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={testData.lastName}
                  onChange={(e) =>
                    setTestData((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={testData.email}
                  onChange={(e) =>
                    setTestData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={testData.phone}
                  onChange={(e) =>
                    setTestData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>

          {/* Environment Check */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Environment Check</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>OnePay Integration:</span>
                <span className="text-green-600">
                  ✅ JavaScript SDK (Browser Redirect)
                </span>
              </div>
              <div className="flex justify-between">
                <span>OnePay Script:</span>
                <span
                  className={
                    isScriptLoaded ? "text-green-600" : "text-orange-600"
                  }
                >
                  {isScriptLoaded ? "✅ Loaded" : "⏳ Loading..."}
                </span>
              </div>
              <div className="flex justify-between">
                <span>App ID:</span>
                <span
                  className={
                    process.env.NEXT_PUBLIC_ONEPAY_APP_ID
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {process.env.NEXT_PUBLIC_ONEPAY_APP_ID
                    ? `✅ ${process.env.NEXT_PUBLIC_ONEPAY_APP_ID.substring(
                        0,
                        5
                      )}...`
                    : "❌ Missing"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Hash Token:</span>
                <span
                  className={
                    process.env.NEXT_PUBLIC_ONEPAY_HASH_TOKEN
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {process.env.NEXT_PUBLIC_ONEPAY_HASH_TOKEN
                    ? `✅ ${process.env.NEXT_PUBLIC_ONEPAY_HASH_TOKEN.substring(
                        0,
                        5
                      )}...`
                    : "❌ Missing"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>App Token:</span>
                <span
                  className={
                    process.env.NEXT_PUBLIC_ONEPAY_APP_TOKEN
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {process.env.NEXT_PUBLIC_ONEPAY_APP_TOKEN
                    ? "✅ Provided"
                    : "❌ Missing"}
                </span>
              </div>
            </div>
          </div>

          {/* Test Button */}
          <div className="mb-6">
            <button
              onClick={testPayment}
              disabled={isProcessing || !isScriptLoaded}
              className={`px-6 py-3 rounded-lg font-medium ${
                isProcessing || !isScriptLoaded
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isProcessing
                ? "Processing Payment..."
                : !isScriptLoaded
                ? "OnePay Loading..."
                : "Test OnePay Payment"}
            </button>
            <button
              onClick={clearLogs}
              className="ml-4 px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700"
            >
              Clear Logs
            </button>
          </div>

          {/* Result */}
          {result && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                result.status === "SUCCESS"
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <h3 className="text-lg font-semibold mb-2">Payment Result</h3>
              <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}

          {/* Logs */}
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Debug Logs</h3>
              <span className="text-sm text-gray-400">
                {logs.length} entries
              </span>
            </div>
            <div className="text-xs font-mono max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
