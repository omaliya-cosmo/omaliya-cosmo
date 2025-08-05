import { NextResponse } from "next/server";
import crypto from "crypto";

// This endpoint provides detailed debug information about your OnePay integration
// It won't make actual API calls but will help you verify everything is set up correctly

export async function GET() {
  try {
    // Get OnePay credentials from environment
    const APP_ID = process.env.ONEPAY_APP_ID;
    const APP_TOKEN = process.env.ONEPAY_APP_TOKEN;
    const HASH_SALT = process.env.ONEPAY_HASH_SALT;
    const CALLBACK_TOKEN = process.env.ONEPAY_CALLBACK_TOKEN;

    // Sample test data
    const sampleOrderId = "123456789012345678901234"; // Typical MongoDB ObjectId
    const sampleAmount = 1000;
    const sampleCurrency = "LKR";

    // Generate truncated reference
    const truncatedReference = `REF${sampleOrderId.slice(-16)}`;

    // Generate hash
    const hashInput = `${APP_ID}${sampleCurrency}${sampleAmount}${HASH_SALT}`;
    const hash = crypto.createHash("sha256").update(hashInput).digest("hex");

    // Sample payload
    const payload = {
      currency: sampleCurrency,
      app_id: APP_ID,
      hash: hash,
      amount: sampleAmount,
      reference: truncatedReference,
      customer_first_name: "Test",
      customer_last_name: "Customer",
      customer_phone_number: "0771234567",
      customer_email: "test@example.com",
      transaction_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/order-confirmation?orderId=${sampleOrderId}`,
      additional_data: sampleOrderId,
    };

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        app_id: APP_ID
          ? {
              present: true,
              length: APP_ID.length,
              sample:
                APP_ID.substring(0, 5) +
                "..." +
                APP_ID.substring(APP_ID.length - 3),
            }
          : { present: false },
        app_token: APP_TOKEN
          ? {
              present: true,
              length: APP_TOKEN.length,
              sample:
                APP_TOKEN.substring(0, 5) +
                "..." +
                APP_TOKEN.substring(APP_TOKEN.length - 3),
            }
          : { present: false },
        hash_salt: HASH_SALT
          ? {
              present: true,
              length: HASH_SALT.length,
              sample:
                HASH_SALT.substring(0, 5) +
                "..." +
                HASH_SALT.substring(HASH_SALT.length - 3),
            }
          : { present: false },
        callback_token: CALLBACK_TOKEN
          ? {
              present: true,
              length: CALLBACK_TOKEN.length,
            }
          : { present: false },
        public_app_url: process.env.NEXT_PUBLIC_APP_URL || "Not set",
      },
      test_data: {
        sample_order_id: sampleOrderId,
        truncated_reference: {
          value: truncatedReference,
          length: truncatedReference.length,
          valid:
            truncatedReference.length >= 10 && truncatedReference.length <= 21,
        },
        hash: {
          input_pattern: "app_id + currency + amount + hash_salt",
          input_sample: `${APP_ID?.substring(
            0,
            5
          )}...${sampleCurrency}${sampleAmount}${HASH_SALT?.substring(
            0,
            5
          )}...`,
          output: hash,
          length: hash.length,
        },
        sample_payload: payload,
        headers: {
          content_type: "application/json",
          authorization: APP_TOKEN
            ? "Bearer " + APP_TOKEN.substring(0, 5) + "..."
            : "Not available",
        },
      },
      api_info: {
        api_url: "https://api.onepay.lk/v3/checkout/link/",
        request_method: "POST",
        expected_response_codes: {
          success: 200,
          validation_error: 400,
          unauthorized: 401,
        },
      },
      implementation_tips: [
        "Reference must be between 10-21 characters",
        "Authorization header is required (with or without 'Bearer ' prefix)",
        "For LKR currency, amount should be whole numbers",
        "Hash calculation: SHA-256(app_id + currency + amount + hash_salt)",
      ],
    });
  } catch (error) {
    console.error("OnePay debug error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
