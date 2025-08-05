import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";

// OnePay API configuration
const APP_ID = process.env.ONEPAY_APP_ID?.trim();
const APP_TOKEN = process.env.ONEPAY_APP_TOKEN?.trim();
const HASH_SALT = process.env.ONEPAY_HASH_SALT?.trim();
const API_URL = "https://api.onepay.lk/v3/checkout/link/";

// Validation schema for OnePay request
const onePayRequestSchema = z.object({
  orderId: z.string(),
  amount: z.number(),
  currency: z.enum(["LKR", "USD"]),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  redirectUrl: z.string(),
  additionalData: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    // Validate the input data
    const body = await request.json();
    const validatedData = onePayRequestSchema.parse(body);

    // Ensure the order ID is valid
    if (!validatedData.orderId || validatedData.orderId.length < 5) {
      return NextResponse.json(
        { success: false, error: "Invalid order ID" },
        { status: 400 }
      );
    }

    // Format reference to be between 10-21 characters
    const reference = `OM${validatedData.orderId.slice(-15)}`;

    // Make sure amount is a whole number for the hash calculation
    const amount = Math.round(validatedData.amount);

    // Calculate hash per OnePay documentation
    // app_id + currency + amount + hash_salt
    const hashInput = `${APP_ID}${validatedData.currency}${amount}${HASH_SALT}`;
    const hash = crypto.createHash("sha256").update(hashInput).digest("hex");

    // Construct payload according to OnePay API documentation
    const payload = {
      app_id: APP_ID,
      hash: hash,
      currency: validatedData.currency,
      amount: amount,
      reference: reference,
      customer_first_name: validatedData.firstName.substring(0, 50),
      customer_last_name: validatedData.lastName.substring(0, 50),
      customer_phone_number: (validatedData.phoneNumber || "").substring(0, 15),
      customer_email: (validatedData.email || "").substring(0, 100),
      transaction_redirect_url: validatedData.redirectUrl,
      additional_data: validatedData.orderId,
    };

    // Generate timestamp for signed request
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // Create signature using a combination of timestamp and token
    // This is a common approach for API authentication
    const signatureInput = `${timestamp}${APP_TOKEN}${APP_ID}`;
    const signature = crypto
      .createHash("sha256")
      .update(signatureInput)
      .digest("hex");

    // Log the request for debugging
    console.log("OnePay Signed Request:", {
      url: API_URL,
      timestamp,
      signature: signature.substring(0, 10) + "...",
      payload: {
        ...payload,
        app_id: payload.app_id
          ? payload.app_id.substring(0, 4) + "..."
          : "missing",
        hash: payload.hash.substring(0, 10) + "...",
      },
    });

    // Make the API call with timestamp-based signature approach
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Timestamp": timestamp,
        "X-Signature": signature,
        "X-App-ID": APP_ID || "",
        Authorization: APP_TOKEN || "", // Keep plain token as fallback
      },
      body: JSON.stringify(payload),
    });

    // Get raw response for debugging
    const responseText = await response.text();
    console.log("OnePay Signed Raw Response:", responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (error) {
      console.error("Failed to parse OnePay response:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid response from payment gateway",
          details: responseText.substring(0, 300),
          statusCode: response.status,
          statusText: response.statusText,
        },
        { status: 500 }
      );
    }

    // Handle response based on status code
    if (
      response.ok &&
      (responseData.status === 200 || responseData.status === "200")
    ) {
      // Success case
      console.log("OnePay signed request payment link created successfully");
      return NextResponse.json({
        success: true,
        data: responseData.data,
      });
    } else {
      // Error case - log details
      console.error("OnePay API error:", {
        status: response.status,
        statusText: response.statusText,
        responseData,
      });

      return NextResponse.json(
        {
          success: false,
          error: responseData.message || "Failed to create payment link",
          details: responseData,
          code: response.status,
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("OnePay integration error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
