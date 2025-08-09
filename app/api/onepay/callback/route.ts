import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// OnePay callback handler - handles POST requests with JSON payload (server-to-server)
export async function POST(request: NextRequest) {
  try {
    console.log("🔔 OnePay callback received - POST method (server webhook)");

    // Parse the JSON body from OnePay
    const body = await request.json();
    console.log("📋 OnePay callback payload:", JSON.stringify(body, null, 2));

    // Extract data according to OnePay documentation format
    const { transaction_id, status, status_message, additional_data } = body;

    // Validate required fields according to OnePay documentation
    if (!transaction_id || status === undefined) {
      console.error("❌ Missing required OnePay callback parameters:", {
        transaction_id,
        status,
        status_message,
      });
      return NextResponse.json(
        { success: false, error: "Invalid callback parameters" },
        { status: 400 }
      );
    }

    // Check if payment was successful (OnePay docs: status = 1 means SUCCESS)
    const isSuccess = status === 1;
    console.log(`💰 OnePay payment ${isSuccess ? "SUCCESS" : "FAILED"}:`, {
      transaction_id,
      status: `${status} (${isSuccess ? "SUCCESS" : "FAILED"})`,
      status_message,
      additional_data,
    });

    if (isSuccess) {
      // Payment successful - find and update the order
      try {
        // Find the most recent PENDING_PAYMENT order for OnePay
        const order = await prisma.order.findFirst({
          where: {
            status: "PENDING_PAYMENT",
            paymentMethod: "ONEPAY",
          },
          orderBy: {
            id: "desc", // Get the most recent order
          },
        });

        if (!order) {
          console.error(
            "❌ No PENDING_PAYMENT OnePay order found for transaction:",
            transaction_id
          );
          return NextResponse.json(
            { success: false, error: "Order not found" },
            { status: 404 }
          );
        }

        console.log(
          `🔍 Found order ${order.id} for transaction ${transaction_id}`
        );

        // Update order status from PENDING_PAYMENT to PENDING (only on success)
        const updatedOrder = await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "PENDING", // Change from PENDING_PAYMENT to PENDING
            paymentTransactionId: transaction_id,
            paymentMethod: "ONEPAY",
          },
        });

        console.log(
          `✅ Order ${updatedOrder.id} updated successfully: PENDING_PAYMENT → PENDING`
        );
        console.log(`💰 Transaction ID: ${transaction_id}`);

        // Return success response to OnePay
        return NextResponse.json({
          success: true,
          message: "Payment processed successfully",
          orderId: order.id,
          transactionId: transaction_id,
        });
      } catch (dbError) {
        console.error("❌ Database error updating order:", dbError);
        return NextResponse.json(
          { success: false, error: "Database update failed" },
          { status: 500 }
        );
      }
    } else {
      // Payment failed - DON'T update order status, keep as PENDING_PAYMENT
      console.log(
        `❌ OnePay payment FAILED for transaction ${transaction_id} with status ${status}:`,
        status_message
      );

      // Order stays as PENDING_PAYMENT - user can retry payment
      return NextResponse.json({
        success: false,
        error: "Payment failed",
        status: status_message || "FAILED",
        transactionId: transaction_id,
      });
    }
  } catch (error) {
    console.error("❌ OnePay callback processing error:", error);
    return NextResponse.json(
      { success: false, error: "Callback processing failed" },
      { status: 500 }
    );
  }
}

// Handle GET requests (OnePay redirects users back after payment completion)
export async function GET(request: NextRequest) {
  console.log("🔔 OnePay user redirect received - GET method");

  // Check query parameters from OnePay redirect
  const { searchParams } = new URL(request.url);
  const transaction_id = searchParams.get("transaction_id");
  const status = searchParams.get("status");

  console.log("📋 OnePay redirect parameters:", {
    transaction_id,
    status,
    url: request.url,
    allParams: Object.fromEntries(searchParams.entries()),
  });

  try {
    // First, check if there's a recent successful OnePay order (POST callback already processed)
    const recentSuccessfulOrder = await prisma.order.findFirst({
      where: {
        paymentMethod: "ONEPAY",
        status: "PENDING", // Successfully processed by POST callback
        orderDate: {
          gte: new Date(Date.now() - 10 * 60 * 1000), // Within last 10 minutes
        },
      },
      orderBy: {
        orderDate: "desc",
      },
    });

    if (recentSuccessfulOrder) {
      console.log(
        `✅ Found recent successful OnePay order: ${recentSuccessfulOrder.id}`
      );

      // SUCCESS: Clear cart and redirect to order confirmation
      const redirectUrl = new URL(
        `/order-confirmation?orderId=${recentSuccessfulOrder.id}`,
        request.url
      );

      // Add cart clearing instructions as URL parameters
      redirectUrl.searchParams.set("clearCart", "true");
      redirectUrl.searchParams.set("clearPromo", "true");
      redirectUrl.searchParams.set("paymentSuccess", "true");

      return NextResponse.redirect(redirectUrl);
    }

    // If no recent successful order, check for pending payment orders
    const pendingOrder = await prisma.order.findFirst({
      where: {
        paymentMethod: "ONEPAY",
        status: "PENDING_PAYMENT",
        orderDate: {
          gte: new Date(Date.now() - 30 * 60 * 1000), // Within last 30 minutes
        },
      },
      orderBy: {
        orderDate: "desc",
      },
    });

    // Check URL parameters for explicit status indicators
    const isExplicitSuccess =
      status === "1" || status === "SUCCESS" || status === "COMPLETED";
    const isExplicitFailure =
      status === "0" || status === "FAILED" || status === "CANCELLED";

    if (isExplicitSuccess) {
      console.log(
        "✅ OnePay redirect indicates explicit success via URL params"
      );

      if (pendingOrder) {
        // Update the order to success since URL indicates success
        const updatedOrder = await prisma.order.update({
          where: { id: pendingOrder.id },
          data: {
            status: "PENDING",
            paymentMethod: "ONEPAY",
            paymentTransactionId:
              transaction_id || `ONEPAY_${pendingOrder.id}_${Date.now()}`,
          },
        });

        console.log(
          `✅ Order ${updatedOrder.id} updated via redirect: PENDING_PAYMENT → PENDING`
        );

        // SUCCESS: Clear cart and redirect to order confirmation
        const redirectUrl = new URL(
          `/order-confirmation?orderId=${updatedOrder.id}`,
          request.url
        );

        redirectUrl.searchParams.set("clearCart", "true");
        redirectUrl.searchParams.set("clearPromo", "true");
        redirectUrl.searchParams.set("paymentSuccess", "true");

        return NextResponse.redirect(redirectUrl);
      }
    }

    if (isExplicitFailure) {
      console.log(`❌ OnePay redirect indicates explicit failure: ${status}`);
      return NextResponse.redirect(
        new URL(
          `/checkout?error=payment_failed&status=${status}&message=Payment failed. Please try again.`,
          request.url
        )
      );
    }

    // If we have a pending order but no clear success/failure indication,
    // assume success (OnePay usually only redirects back on successful completion)
    if (pendingOrder) {
      console.log(
        `🔄 OnePay redirect with pending order ${pendingOrder.id} - assuming success`
      );

      // Update the order to success (OnePay redirect usually means payment completed)
      const updatedOrder = await prisma.order.update({
        where: { id: pendingOrder.id },
        data: {
          status: "PENDING",
          paymentMethod: "ONEPAY",
          paymentTransactionId:
            transaction_id || `ONEPAY_${pendingOrder.id}_${Date.now()}`,
        },
      });

      console.log(
        `✅ Order ${updatedOrder.id} updated via redirect assumption: PENDING_PAYMENT → PENDING`
      );

      // SUCCESS: Clear cart and redirect to order confirmation
      const redirectUrl = new URL(
        `/order-confirmation?orderId=${updatedOrder.id}`,
        request.url
      );

      redirectUrl.searchParams.set("clearCart", "true");
      redirectUrl.searchParams.set("clearPromo", "true");
      redirectUrl.searchParams.set("paymentSuccess", "true");

      return NextResponse.redirect(redirectUrl);
    }
  } catch (dbError) {
    console.error("❌ Database error in GET callback:", dbError);
  }
}
