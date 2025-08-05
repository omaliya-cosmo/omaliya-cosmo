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

    // Make sure we have the required environment variables
    if (!APP_ID || !APP_TOKEN || !HASH_SALT) {
      console.error("OnePay credentials missing", {
        hasAppId: !!APP_ID,
        hasAppToken: !!APP_TOKEN,
        hasHashSalt: !!HASH_SALT,
      });
      return NextResponse.json(
        { success: false, error: "Payment gateway configuration error" },
        { status: 500 }
      );
    }

    // Format reference to be between 10-21 characters (OnePay requirement)
    const reference = `OM${validatedData.orderId.slice(-15)}`.substring(0, 21);
    console.log("Reference:", reference, "Length:", reference.length);

    // Amount must be a whole number
    const amount = Math.round(validatedData.amount);

    // Calculate hash per OnePay documentation
    // app_id + currency + amount + hash_salt
    const hashInput = `${APP_ID}${validatedData.currency}${amount}${HASH_SALT}`;
    const hash = crypto.createHash("sha256").update(hashInput).digest("hex");

    // Log the hash calculation for debugging
    console.log("OnePay Hash:", {
      amount: amount,
      hashLength: hash.length,
    });

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

    console.log("OnePay payload:", JSON.stringify(payload));

    // Try with BASIC AUTH - this is often what API providers expect
    // when they mention "Authorization" header without specifying Bearer
    const auth = Buffer.from(`${APP_ID}:${APP_TOKEN}`).toString("base64");

    // Make the API call to OnePay
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(payload),
    });

    // Get raw response for debugging
    const responseText = await response.text();
    console.log("OnePay raw response:", responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (error) {
      console.error("Failed to parse OnePay response:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid response from payment gateway",
          details: responseText.substring(0, 100),
        },
        { status: 500 }
      );
    }

    // Handle response
    if (response.ok && responseData.status === 200) {
      console.log("OnePay payment link created successfully");
      return NextResponse.json({
        success: true,
        data: responseData.data,
      });
    } else {
      console.error("OnePay API error:", {
        status: response.status,
        responseData,
      });

      // If we get an authentication error, try another method as a fallback
      if (
        response.status === 401 ||
        responseData.error === "Invalid app credentials"
      ) {
        console.log("Trying alternate authentication method...");

        const altResponse = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: APP_TOKEN,
            "X-App-ID": APP_ID,
          },
          body: JSON.stringify(payload),
        });

        const altResponseText = await altResponse.text();
        console.log("OnePay alternate auth response:", altResponseText);

        try {
          const altResponseData = JSON.parse(altResponseText);

          if (altResponse.ok && altResponseData.status === 200) {
            console.log("Alternate auth succeeded!");
            return NextResponse.json({
              success: true,
              data: altResponseData.data,
              note: "Used alternate authentication",
            });
          }
        } catch (e) {
          console.error("Failed to parse alternate response:", e);
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: responseData.message || "Failed to create payment link",
          details: responseData,
        },
        { status: 400 }
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
