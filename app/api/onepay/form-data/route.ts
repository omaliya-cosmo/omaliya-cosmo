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

    // Format reference to be between 10-21 characters (critical for OnePay)
    const reference = `OM${validatedData.orderId.slice(-15)}`;

    // Make sure amount is a whole number for the hash calculation
    const amount = Math.round(validatedData.amount);

    // Calculate hash per OnePay documentation
    // app_id + currency + amount + hash_salt
    const hashInput = `${APP_ID}${validatedData.currency}${amount}${HASH_SALT}`;
    const hash = crypto.createHash("sha256").update(hashInput).digest("hex");

    // Construct form data for OnePay (using URLSearchParams for x-www-form-urlencoded)
    const formData = new URLSearchParams();
    formData.append("app_id", APP_ID || "");
    formData.append("hash", hash);
    formData.append("currency", validatedData.currency);
    formData.append("amount", amount.toString());
    formData.append("reference", reference);
    formData.append(
      "customer_first_name",
      validatedData.firstName.substring(0, 50)
    );
    formData.append(
      "customer_last_name",
      validatedData.lastName.substring(0, 50)
    );

    if (validatedData.phoneNumber) {
      formData.append(
        "customer_phone_number",
        validatedData.phoneNumber.substring(0, 15)
      );
    }

    if (validatedData.email) {
      formData.append("customer_email", validatedData.email.substring(0, 100));
    }

    formData.append("transaction_redirect_url", validatedData.redirectUrl);
    formData.append("additional_data", validatedData.orderId);

    // Log the request for debugging (mask sensitive data)
    console.log("OnePay Request (form-data):", {
      url: API_URL,
      app_id: APP_ID ? APP_ID.substring(0, 4) + "..." : "missing",
      hash: hash.substring(0, 10) + "...",
      reference,
      amount,
      currency: validatedData.currency,
    });

    // Create basic auth string (username:password format)
    // Some APIs use the app_id as username and token as password
    const basicAuth = Buffer.from(`${APP_ID}:${APP_TOKEN}`).toString("base64");

    // Make the API call to OnePay with form data and multiple authentication methods
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
        "X-API-TOKEN": APP_TOKEN || "",
      },
      body: formData.toString(),
    });

    // Get raw response for debugging
    const responseText = await response.text();
    console.log("OnePay Form-Data Raw Response:", responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (error) {
      console.error("Failed to parse OnePay response:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid response from payment gateway",
          details: responseText.substring(0, 300), // Include more content for debugging
          statusCode: response.status,
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
      console.log("OnePay form-data payment link created successfully");
      return NextResponse.json({
        success: true,
        data: responseData.data,
      });
    } else {
      // Error case - log details
      console.error("OnePay form-data API error:", {
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
    console.error("OnePay form-data integration error:", error);

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
