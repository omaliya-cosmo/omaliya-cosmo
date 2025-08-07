"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

interface OnePayScriptProps {
  onLoad?: () => void;
  onError?: () => void;
}

export default function OnePayScript({ onLoad, onError }: OnePayScriptProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Check if OnePay is already loaded
    if (typeof window !== "undefined" && window.onPayButtonClicked) {
      setIsLoaded(true);
      onLoad?.();
    }
  }, [onLoad]);

  const handleLoad = () => {
    console.log("✅ OnePay script loaded successfully");
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    console.error("❌ Failed to load OnePay script");
    setHasError(true);
    setIsLoaded(false);
    onError?.();
  };

  return (
    <>
      <Script
        src="https://storage.googleapis.com/onepayjs/onepayv2.js"
        strategy="beforeInteractive"
        onLoad={handleLoad}
        onError={handleError}
        id="onepay-script"
      />
      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === "development" && (
        <div
          style={{
            position: "fixed",
            top: "10px",
            right: "10px",
            background: isLoaded ? "#10b981" : hasError ? "#ef4444" : "#f59e0b",
            color: "white",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "12px",
            zIndex: 9999,
            fontFamily: "monospace",
          }}
        >
          OnePay: {isLoaded ? "Loaded" : hasError ? "Error" : "Loading..."}
        </div>
      )}
    </>
  );
}
