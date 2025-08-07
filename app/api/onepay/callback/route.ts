import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// OnePay callback handler - handles POST requests with JSON payload
export async function POST(request: NextRequest) {
  try {
    console.log("🔔 OnePay callback received - POST method");

    // Parse the JSON body from OnePay
    const body = await request.json();
    console.log("📋 OnePay callback payload:", body);

    // Extract data according to OnePay documentation format
    const { transaction_id, status, status_message, additional_data } = body;

    // Validate required fields
    if (!transaction_id || (status !== 0 && status !== 1)) {
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

    // Check if payment was successful (status = 1 means SUCCESS)
    const isSuccess = status === 1;
    console.log(`� OnePay payment ${isSuccess ? "SUCCESS" : "FAILED"}:`, {
      transaction_id,
      status,
      status_message,
      additional_data,
    });

    if (isSuccess) {
      // Payment successful - find and update the order
      try {
        // Find the most recent PENDING_PAYMENT order for OnePay
        // Since OnePay doesn't send order reference in callback, we'll find by latest pending order
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
      // Payment failed
      console.log(
        `❌ OnePay payment failed for transaction ${transaction_id}:`,
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
    searchParams: Object.fromEntries(searchParams.entries())
  });
  
  // If no parameters, assume success and find the most recent order
  if (!transaction_id && !status) {
    console.log("⚠️ No parameters in GET callback - assuming successful payment");
    
    try {
      // Find the most recent PENDING_PAYMENT OnePay order
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
            // We don't have transaction_id from OnePay, so we'll generate a placeholder
            paymentTransactionId: `ONEPAY_${order.id}_${Date.now()}`,
          },
        });
        
        console.log(`✅ Order ${updatedOrder.id} updated: PENDING_PAYMENT → PENDING`);
        
        // Redirect to order confirmation
        return NextResponse.redirect(
          new URL(`/order-confirmation?orderId=${order.id}`, request.url)
        );
      } else {
        console.error("❌ No PENDING_PAYMENT order found");
      }
    } catch (error) {
      console.error("❌ Error finding/updating order:", error);
    }
    
    // Fallback: redirect to generic success
    return NextResponse.redirect(
      new URL("/checkout?success=payment_completed", request.url)
    );
  }

  if (status === "1" || status === "SUCCESS") {
    // Successful payment - redirect to order confirmation
    if (transaction_id) {
      // Find the order by transaction ID
      try {
        const order = await prisma.order.findFirst({
          where: {
            paymentTransactionId: transaction_id,
          },
        });

        if (order) {
          return NextResponse.redirect(
            new URL(
              `/order-confirmation?orderId=${order.id}&transactionId=${transaction_id}`,
              request.url
            )
          );
        }
      } catch (error) {
        console.error("Error finding order for redirect:", error);
      }
    }

    // Fallback redirect to a generic success page
    return NextResponse.redirect(
      new URL("/checkout?success=payment_completed", request.url)
    );
  } else {
    // Failed payment - redirect to checkout with error
    return NextResponse.redirect(
      new URL("/checkout?error=payment_failed", request.url)
    );
  }
}
