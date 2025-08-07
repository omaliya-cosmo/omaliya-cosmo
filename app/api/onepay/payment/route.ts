import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const {
      amount,
      currency,
      orderReference,
      customerFirstName,
      customerLastName,
      customerEmail,
      customerPhoneNumber,
      additional_data,
    } = body;

    if (
      !amount ||
      !currency ||
      !orderReference ||
      !customerFirstName ||
      !customerLastName
    ) {
      return NextResponse.json(
        { error: "Missing required payment fields" },
        { status: 400 }
      );
    }

    // Get OnePay credentials from environment
    const appId = process.env.NEXT_PUBLIC_ONEPAY_APP_ID;
    const hashToken = process.env.NEXT_PUBLIC_ONEPAY_HASH_TOKEN;
    const appToken = process.env.NEXT_PUBLIC_ONEPAY_APP_TOKEN;

    if (!appId || !hashToken || !appToken) {
      return NextResponse.json(
        { error: "OnePay configuration missing" },
        { status: 500 }
      );
    }

    // Create callback URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const callbackUrl = `${baseUrl}/api/onepay/callback`;

    // Prepare OnePay request data in the format that worked before
    const onePayData = {
      currency: currency,
      amount: parseFloat(amount.toString()),
      appid: appId,
      hash: hashToken, // Note: using 'hash' instead of 'hashToken'
      apptoken: appToken,
      reference: orderReference, // Note: using 'reference' instead of 'orderReference'
      customer_first_name: customerFirstName,
      customer_last_name: customerLastName,
      customer_phone_number: customerPhoneNumber || "+94771234567",
      customer_email: customerEmail || "noemail@example.com",
      transaction_redirect_url: callbackUrl,
      additional_data: additional_data || "Payment from Omaliya Cosmetics",
    };

    console.log("🚀 Creating OnePay payment session:", {
      ...onePayData,
      appid: `${onePayData.appid.substring(0, 5)}...`,
      hash: `${onePayData.hash.substring(0, 5)}...`,
      apptoken: "***HIDDEN***",
    });

    try {
      // Use the main OnePay endpoint that was working before
      const onePayResponse = await fetch("https://onepay.lk/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(onePayData),
      });

      if (!onePayResponse.ok) {
        const errorText = await onePayResponse.text();
        console.error("❌ OnePay API error:", onePayResponse.status, errorText);
        return NextResponse.json(
          { error: `OnePay API error: ${onePayResponse.status}` },
          { status: 500 }
        );
      }

      const onePayResult = await onePayResponse.json();
      console.log("✅ OnePay payment session created:", onePayResult);

      // OnePay typically returns a gateway URL in the data.gateway field
      if (onePayResult.data && onePayResult.data.gateway) {
        return NextResponse.json({
          success: true,
          paymentUrl: onePayResult.data.gateway,
          sessionId: onePayResult.data.session_id || null,
          transactionId: onePayResult.data.transaction_id || null,
          reference: orderReference,
          response: onePayResult, // Include full response for debugging
        });
      } else if (onePayResult.gateway) {
        // Alternative response format
        return NextResponse.json({
          success: true,
          paymentUrl: onePayResult.gateway,
          sessionId: onePayResult.session_id || null,
          transactionId: onePayResult.transaction_id || null,
          reference: orderReference,
          response: onePayResult,
        });
      } else {
        console.error("❌ Invalid OnePay response format:", onePayResult);
        return NextResponse.json(
          {
            error: "Invalid OnePay response format",
            response: onePayResult,
            debug: "Expected gateway URL in response",
          },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("❌ OnePay API request failed:", error);
      return NextResponse.json(
        { error: "OnePay service unavailable. Please try again later." },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("OnePay payment creation error:", error);
    return NextResponse.json(
      { error: "Failed to create payment session" },
      { status: 500 }
    );
  }
}
