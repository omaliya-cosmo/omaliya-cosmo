import { NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';

// Environment variables for OnePay should be in the .env file
const APP_ID = process.env.ONEPAY_APP_ID;
const APP_TOKEN = process.env.ONEPAY_APP_TOKEN;
const HASH_SALT = process.env.ONEPAY_HASH_SALT;
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
    const body = await request.json();
    const validatedData = onePayRequestSchema.parse(body);
    
    // Generate hash using SHA-256
    // Format: app_id + currency + amount + hash_salt
    const hashInput = `${APP_ID}${validatedData.currency}${validatedData.amount}${HASH_SALT}`;
    const hash = crypto.createHash('sha256').update(hashInput).digest('hex');
    
    // Prepare OnePay request payload
    const payload = {
      currency: validatedData.currency,
      app_id: APP_ID,
      hash: hash,
      amount: validatedData.amount,
      reference: validatedData.orderId,
      customer_first_name: validatedData.firstName,
      customer_last_name: validatedData.lastName,
      customer_phone_number: validatedData.phoneNumber || "",
      customer_email: validatedData.email || "",
      transaction_redirect_url: validatedData.redirectUrl,
      additionalData: validatedData.additionalData || validatedData.orderId,
    };
    
    // Make request to OnePay API
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": APP_TOKEN || "",
      },
      body: JSON.stringify(payload),
    });
    
    const responseData = await response.json();
    
    if (response.ok && responseData.status === 200) {
      return NextResponse.json({
        success: true,
        data: responseData.data,
      });
    } else {
      console.error("OnePay API error:", responseData);
      return NextResponse.json({
        success: false,
        error: responseData.message || "Failed to create payment link",
        details: responseData
      }, { status: 400 });
    }
  } catch (error) {
    console.error("OnePay integration error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: "Validation error",
        details: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}
