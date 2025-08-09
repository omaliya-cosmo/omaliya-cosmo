import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";

// OnePay configuration - These should be stored in environment variables
const ONEPAY_API_URL = "https://api.onepay.lk/v3/checkout/link/";
const ONEPAY_APP_ID = process.env.ONEPAY_APP_ID || "";
const ONEPAY_HASH_SALT = process.env.ONEPAY_HASH_SALT || "";

// Schema for OnePay payment request
const onePayRequestSchema = z.object({
  currency: z.string(),
  amount: z.number(),
  reference: z.string(),
  customer_first_name: z.string(),
  customer_last_name: z.string(),
  customer_phone_number: z.string(),
  customer_email: z.string(),
  transaction_redirect_url: z.string(),
  additionalData: z.string().optional(),
  items: z.array(z.string()).optional(),
});

// Generate hash for OnePay request
function generateHash(
  appId: string,
  currency: string,
  amount: string,
  hashSalt: string
): string {
  const concatenatedString = `${appId}${currency}${amount}${hashSalt}`;
  return crypto.createHash("sha256").update(concatenatedString).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = onePayRequestSchema.parse(body);

    // Generate hash for the request
    const hash = generateHash(
      ONEPAY_APP_ID,
      validatedData.currency,
      validatedData.amount.toString(),
      ONEPAY_HASH_SALT
    );

    // Prepare OnePay request payload
    const onePayPayload = {
      currency: validatedData.currency,
      app_id: ONEPAY_APP_ID,
      hash: hash,
      amount: validatedData.amount,
      reference: validatedData.reference,
      customer_first_name: validatedData.customer_first_name,
      customer_last_name: validatedData.customer_last_name,
      customer_phone_number: validatedData.customer_phone_number,
      customer_email: validatedData.customer_email,
      transaction_redirect_url: validatedData.transaction_redirect_url,
      additionalData: validatedData.additionalData || "",
      items: validatedData.items || [],
    };

    // Make request to OnePay API
    const response = await fetch(ONEPAY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ONEPAY_API_TOKEN || ""}`,
      },
      body: JSON.stringify(onePayPayload),
    });

    const responseData = await response.json();

    if (response.ok && responseData.status === 200) {
      return NextResponse.json({
        success: true,
        data: responseData.data,
      });
    } else {
      console.error("OnePay API error:", responseData);
      return NextResponse.json(
        {
          success: false,
          error: responseData.message || "Failed to create payment link",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("OnePay API error:", error);

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
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check transaction status
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const transactionId = searchParams.get("transaction_id");

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    // Implement OnePay transaction status check if needed
    // For now, return a placeholder response
    return NextResponse.json({
      success: true,
      transaction_id: transactionId,
      status: "pending", // This would come from OnePay API
    });
  } catch (error) {
    console.error("OnePay status check error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
