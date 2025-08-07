import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// OnePay callback handler - handles POST requests with JSON payload
export async function POST(request: NextRequest) {
  try {
    console.log("🔔 OnePay callback received - POST method");

    // Parse the JSON body from OnePay
    const body = await request.json();
    console.log("📋 OnePay callback payload:", JSON.stringify(body, null, 2));

    // Extract data according to OnePay documentation format
    const { transaction_id, status, status_message, additional_data } = body;

    // Validate required fields
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

    // Check if payment was successful (ONLY status = 1 means SUCCESS)
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

        // Update order status from PENDING_PAYMENT to PENDING
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
      // Payment failed - don't update order status, keep as PENDING_PAYMENT
      console.log(
        `❌ OnePay payment FAILED for transaction ${transaction_id} with status ${status}:`,
        status_message
      );

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

// Handle GET requests (for direct user redirects from OnePay)
// This is the working version that was fine before
export async function GET(request: NextRequest) {
  console.log("🔔 OnePay callback received - GET method (user redirect)");

  // For GET requests, check query parameters
  const { searchParams } = new URL(request.url);
  const transaction_id = searchParams.get("transaction_id");
  const status = searchParams.get("status");

  console.log("📋 GET callback parameters:", {
    transaction_id,
    status,
    url: request.url,
    searchParams: Object.fromEntries(searchParams.entries()),
  });

  // OnePay often redirects back without parameters on success - this was working before
  if (!transaction_id && !status) {
    console.log(
      "ℹ️ OnePay redirected without parameters - assuming successful payment"
    );

    try {
      // Find the most recent PENDING_PAYMENT order
      const order = await prisma.order.findFirst({
        where: {
          status: "PENDING_PAYMENT",
          paymentMethod: "ONEPAY",
        },
        orderBy: {
          id: "desc",
        },
      });

      if (order) {
        console.log(`🔍 Found recent order ${order.id} - updating to PENDING`);

        // Update the order status (assuming success since user was redirected back)
        const updatedOrder = await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "PENDING",
            paymentMethod: "ONEPAY",
            paymentTransactionId: `ONEPAY_${order.id}_${Date.now()}`,
          },
        });

        console.log(
          `✅ Order ${updatedOrder.id} updated: PENDING_PAYMENT → PENDING`
        );

        // Redirect to order confirmation
        return NextResponse.redirect(
          new URL(`/order-confirmation?orderId=${order.id}`, request.url)
        );
      } else {
        console.error("❌ No PENDING_PAYMENT order found");
        return NextResponse.redirect(
          new URL("/checkout?error=order_not_found", request.url)
        );
      }
    } catch (error) {
      console.error("❌ Error finding/updating order:", error);
      return NextResponse.redirect(
        new URL("/checkout?error=processing_failed", request.url)
      );
    }
  }

  // If we have explicit status parameters, use them
  if (status) {
    console.log(`🔍 Processing payment with explicit status: ${status}`);

    // Accept multiple success indicators
    if (status === "1" || status === "SUCCESS" || status === "COMPLETED") {
      console.log("✅ Payment successful - explicit status");

      try {
        let order;

        // Try to find by transaction ID first
        if (transaction_id) {
          order = await prisma.order.findFirst({
            where: {
              paymentTransactionId: transaction_id,
            },
          });
        }

        // If not found by transaction ID, find most recent pending order
        if (!order) {
          order = await prisma.order.findFirst({
            where: {
              status: "PENDING_PAYMENT",
              paymentMethod: "ONEPAY",
            },
            orderBy: {
              id: "desc",
            },
          });
        }

        if (order && order.status === "PENDING_PAYMENT") {
          // Update order to PENDING only if it's currently PENDING_PAYMENT
          const updatedOrder = await prisma.order.update({
            where: { id: order.id },
            data: {
              status: "PENDING",
              paymentMethod: "ONEPAY",
              paymentTransactionId:
                transaction_id || `ONEPAY_${order.id}_${Date.now()}`,
            },
          });

          console.log(
            `✅ Order ${updatedOrder.id} updated: PENDING_PAYMENT → PENDING (Explicit Success)`
          );

          return NextResponse.redirect(
            new URL(`/order-confirmation?orderId=${order.id}`, request.url)
          );
        } else if (order) {
          // Order found but already processed
          console.log(
            `ℹ️ Order ${order.id} already processed with status: ${order.status}`
          );
          return NextResponse.redirect(
            new URL(`/order-confirmation?orderId=${order.id}`, request.url)
          );
        } else {
          console.error("❌ No order found for successful payment");
          return NextResponse.redirect(
            new URL("/checkout?error=order_not_found", request.url)
          );
        }
      } catch (error) {
        console.error("❌ Error processing successful payment:", error);
        return NextResponse.redirect(
          new URL("/checkout?error=processing_failed", request.url)
        );
      }
    } else {
      // Payment explicitly failed - don't update order status
      console.log(`❌ Payment EXPLICITLY FAILED with status: ${status}`);
      return NextResponse.redirect(
        new URL(`/checkout?error=payment_failed&status=${status}`, request.url)
      );
    }
  }

  // Fallback - shouldn't reach here normally
  console.log("⚠️ Unexpected callback state - redirecting to checkout");
  return NextResponse.redirect(
    new URL("/checkout?error=unexpected_callback", request.url)
  );
}
