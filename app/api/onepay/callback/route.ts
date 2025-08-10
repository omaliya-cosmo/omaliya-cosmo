import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import crypto from "crypto";

// OnePay callback token from your OnePay portal
const ONEPAY_CALLBACK_TOKEN =
  process.env.ONEPAY_CALLBACK_TOKEN ||
  "95eab8d9d2d688f97b3f4adbf7a8639b802c15a9ed72af80d2b40c293155ef6d";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // OnePay callback payload structure
    const { transaction_id, status, status_message, additional_data } = body;

    console.log("OnePay callback received:", {
      transaction_id,
      status,
      status_message,
      additional_data,
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
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
        orderBy: {
          createdAt: "desc",
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
        // Store transaction details for reference
        notes: order.notes
          ? `${order.notes}\nOnePay Transaction: ${transaction_id}, Status: ${status_message}`
          : `OnePay Transaction: ${transaction_id}, Status: ${status_message}`,
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
