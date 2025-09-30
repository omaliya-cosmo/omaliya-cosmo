import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import crypto from "crypto";

// OnePay callback token from your OnePay portal
const ONEPAY_CALLBACK_TOKEN =
  process.env.ONEPAY_CALLBACK_TOKEN ||
  "95eab8d9d2d688f97b3f4adbf7a8639b802c15a9ed72af80d2b40c293155ef6d";

export async function POST(request: NextRequest) {
  console.log("=== OnePay Callback POST Received ===");

  try {
    const body = await request.json();

    // OnePay callback payload structure
    const { transaction_id, status, status_message, additional_data } = body;

    console.log("OnePay callback received:", {
      transaction_id,
      status,
      status_message,
      additional_data,
      fullBody: body,
    });

    // Also log headers for debugging
    console.log("Request headers:", {
      contentType: request.headers.get("content-type"),
      authorization: request.headers.get("authorization"),
      userAgent: request.headers.get("user-agent"),
    });

    // Validate required fields
    if (!transaction_id || status === undefined) {
      console.error("Invalid callback payload - missing required fields");
      return NextResponse.json(
        { success: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    // Find the order by additional_data (which contains our order ID)
    let order = null;

    if (additional_data) {
      // Try to find by order ID stored in additional_data
      order = await prisma.order.findUnique({
        where: { id: additional_data },
      });
    }

    // If not found by additional_data, try to find by reference pattern
    if (!order && transaction_id) {
      // Look for orders where the OnePay reference might match
      // This is a fallback in case additional_data is not reliable
      order = await prisma.order.findFirst({
        where: {
          // Search by payment method and recent orders
          paymentMethod: "ONEPAY",
          orderDate: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
        orderBy: {
          orderDate: "desc",
        },
      });
    }

    if (!order) {
      console.error(
        `Order not found for transaction: ${transaction_id}, additional_data: ${additional_data}`
      );
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    console.log(`Processing payment callback for order: ${order.id}`);

    // Update order status based on OnePay callback
    let orderStatus = order.status;

    if (status === 1 && status_message === "SUCCESS") {
      orderStatus = "PAID";
      console.log(`Order ${order.id} payment successful`);
    } else if (status === 0 || status_message !== "SUCCESS") {
      orderStatus = "PAYMENT_FAILED";
      console.log(`Order ${order.id} payment failed: ${status_message}`);
    }

    // Update the order with payment information
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: orderStatus,
      },
    });

    console.log(`Order ${order.id} updated with status: ${orderStatus}`);

    // Send confirmation response to OnePay
    return NextResponse.json({
      success: true,
      message: "Callback processed successfully",
      order_id: order.id,
      transaction_id: transaction_id,
    });
  } catch (error) {
    console.error("OnePay callback error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint for testing callback URL accessibility
export async function GET(request: NextRequest) {
  console.log("=== OnePay Callback GET Test ===");

  return NextResponse.json({
    success: true,
    message: "OnePay callback endpoint is accessible",
    timestamp: new Date().toISOString(),
    url: request.url,
  });
}
