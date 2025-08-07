import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// OnePay callback handler - handles POST requests with JSON payload
// According to OnePay documentation: Only POST callbacks are official
export async function POST(request: NextRequest) {
  try {
    console.log("🔔 OnePay callback received - POST method");

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

// Handle other HTTP methods with proper error responses
export async function GET(request: NextRequest) {
  console.log("⚠️ GET request received - OnePay only uses POST callbacks");
  return NextResponse.json(
    {
      success: false,
      error: "OnePay callbacks only support POST method",
      message:
        "According to OnePay documentation, only POST callbacks are supported",
    },
    { status: 405 }
  );
}

export async function PUT(request: NextRequest) {
  console.log("⚠️ PUT request received - OnePay only uses POST callbacks");
  return NextResponse.json(
    { success: false, error: "OnePay callbacks only support POST method" },
    { status: 405 }
  );
}

export async function PATCH(request: NextRequest) {
  console.log("⚠️ PATCH request received - OnePay only uses POST callbacks");
  return NextResponse.json(
    { success: false, error: "OnePay callbacks only support POST method" },
    { status: 405 }
  );
}

export async function DELETE(request: NextRequest) {
  console.log("⚠️ DELETE request received - OnePay only uses POST callbacks");
  return NextResponse.json(
    { success: false, error: "OnePay callbacks only support POST method" },
    { status: 405 }
  );
}

export async function OPTIONS(request: NextRequest) {
  console.log("🔔 OPTIONS request received - CORS preflight");
  return NextResponse.json(
    { success: true },
    {
      status: 200,
      headers: {
        Allow: "POST, OPTIONS",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
