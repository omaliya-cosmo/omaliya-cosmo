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

  // If OnePay redirects without parameters, redirect to checkout (payment status unknown)
  if (!status && !transaction_id) {
    console.log(
      "⚠️ OnePay redirect without parameters - redirecting to checkout to retry"
    );
    return NextResponse.redirect(
      new URL(
        "/checkout?error=payment_status_unknown&message=Payment status could not be determined. Please try again.",
        request.url
      )
    );
  }

  // If we have status, process it
  if (status) {
    // OnePay success indicators in URL parameters
    if (status === "1" || status === "SUCCESS" || status === "COMPLETED") {
      console.log("✅ OnePay redirect indicates success");

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
          console.log(`🔍 Found order ${order.id} for redirect`);

          // Only update if still pending payment (avoid double processing)
          if (order.status === "PENDING_PAYMENT") {
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
              `✅ Order ${updatedOrder.id} updated via redirect: PENDING_PAYMENT → PENDING`
            );
          }

          // SUCCESS: Clear cart and redirect to order confirmation
          const redirectUrl = new URL(
            `/order-confirmation?orderId=${order.id}`,
            request.url
          );

          // Add cart clearing instructions as URL parameters
          redirectUrl.searchParams.set("clearCart", "true");
          redirectUrl.searchParams.set("clearPromo", "true");
          redirectUrl.searchParams.set("paymentSuccess", "true");

          return NextResponse.redirect(redirectUrl);
        } else {
          console.error(
            "❌ No PENDING_PAYMENT order found for successful payment"
          );
          return NextResponse.redirect(
            new URL(
              "/checkout?error=order_not_found&message=Order not found for successful payment",
              request.url
            )
          );
        }
      } catch (error) {
        console.error("❌ Error processing successful payment:", error);
        return NextResponse.redirect(
          new URL(
            "/checkout?error=processing_error&message=Error processing successful payment",
            request.url
          )
        );
      }
    } else {
      // PAYMENT FAILED: Redirect to checkout so user can retry
      console.log(`❌ OnePay redirect indicates payment failure: ${status}`);
      return NextResponse.redirect(
        new URL(
          `/checkout?error=payment_failed&status=${status}&message=Payment failed. Please try again.`,
          request.url
        )
      );
    }
  } else if (transaction_id) {
    // Has transaction ID but no status - redirect to checkout to retry
    console.log(
      `⚠️ OnePay redirect with transaction ${transaction_id} but no status - redirecting to checkout`
    );
    return NextResponse.redirect(
      new URL(
        "/checkout?error=payment_status_unknown&message=Payment status unknown. Please try again.",
        request.url
      )
    );
  }

  // Fallback - redirect to checkout
  console.log("⚠️ OnePay redirect fallback - going to checkout");
  return NextResponse.redirect(
    new URL(
      "/checkout?error=unexpected_callback&message=Unexpected payment callback. Please try again.",
      request.url
    )
  );
}
