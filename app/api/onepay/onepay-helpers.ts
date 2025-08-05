/**
 * OnePay API Helper Functions
 *
 * This file provides utility functions for interacting with the OnePay payment gateway.
 * It helps with authentication, hash generation, and request formatting to ensure
 * consistent implementation across all OnePay integration points.
 */

import crypto from "crypto";

// Environment variables for OnePay integration
const APP_ID = process.env.ONEPAY_APP_ID?.trim();
const APP_TOKEN = process.env.ONEPAY_APP_TOKEN?.trim();
const HASH_SALT = process.env.ONEPAY_HASH_SALT?.trim();
export const API_URL = "https://api.onepay.lk/v3/checkout/link/";

/**
 * Calculates the SHA-256 hash required for OnePay API requests
 * Format: app_id + currency + amount + hash_salt
 *
 * @param currency - The currency code (LKR or USD)
 * @param amount - The transaction amount (should be a whole number)
 * @returns The calculated SHA-256 hash
 */
export function calculateOnePayHash(currency: string, amount: number): string {
  const hashInput = `${APP_ID}${currency}${Math.round(amount)}${HASH_SALT}`;
  return crypto.createHash("sha256").update(hashInput).digest("hex");
}

/**
 * Creates a reference code that meets OnePay's requirements (10-21 characters)
 *
 * @param orderId - The original order ID from the system
 * @returns A properly formatted reference code for OnePay
 */
export function formatOnePayReference(orderId: string): string {
  return `OM${orderId.slice(-15)}`; // Keep last 15 chars, add 'OM' prefix to ensure it's 10+ chars
}

/**
 * Creates payload for OnePay API request
 *
 * @param params - The parameters for the OnePay request
 * @returns A properly formatted payload object for OnePay API
 */
export function createOnePayPayload(params: {
  orderId: string;
  amount: number;
  currency: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  email?: string;
  redirectUrl: string;
  additionalData?: string;
}) {
  // Ensure amount is a whole number for the hash calculation
  const amount = Math.round(params.amount);

  // Calculate hash and format reference
  const hash = calculateOnePayHash(params.currency, amount);
  const reference = formatOnePayReference(params.orderId);

  // Return properly formatted payload
  return {
    app_id: APP_ID,
    hash: hash,
    currency: params.currency,
    amount: amount,
    reference: reference,
    customer_first_name: params.firstName.substring(0, 50),
    customer_last_name: params.lastName.substring(0, 50),
    customer_phone_number: (params.phoneNumber || "").substring(0, 15),
    customer_email: (params.email || "").substring(0, 100),
    transaction_redirect_url: params.redirectUrl,
    additional_data: params.additionalData || params.orderId,
  };
}

/**
 * Generates authorization headers for OnePay API
 * Provides different formats to handle potential authentication scenarios
 *
 * @returns An object containing different authorization header options
 */
export function getOnePayAuthHeaders() {
  const token = APP_TOKEN || "";
  const lowercaseToken = token.toLowerCase();

  return {
    // Standard auth header options
    json: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    // Lowercase token in case API is case-sensitive
    jsonLowercase: {
      "Content-Type": "application/json",
      Authorization: lowercaseToken,
    },
    // Form data headers
    form: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: token,
    },
    // Basic auth headers
    basicAuth: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${APP_ID}:${token}`).toString(
        "base64"
      )}`,
    },
    // Custom header
    customHeader: {
      "Content-Type": "application/json",
      "X-API-TOKEN": token,
    },
  };
}

/**
 * Debug function to mask sensitive data for logging
 *
 * @param value - The sensitive value to mask
 * @returns A masked version safe for logging
 */
export function maskSensitiveData(value: string | undefined): string {
  if (!value) return "missing";
  if (value.length <= 6) return "***" + value.substring(value.length - 1);
  return value.substring(0, 3) + "..." + value.substring(value.length - 3);
}
