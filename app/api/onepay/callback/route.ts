import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // OnePay callback payload structure from documentation
    const { transaction_id, status, status_message, additional_data } = body;

    console.log("OnePay callback received:", body);

    // Validate required fields
    if (!transaction_id || status === undefined) {
      console.error("Missing required callback fields:", body);
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the order by ID (stored in additional_data)
    const order = await prisma.order.findUnique({
      where: {
        id: additional_data, // additional_data contains our order ID
      },
    });

    if (!order) {
      console.error(
        "Order not found for transaction:",
        transaction_id,
        "additional_data:",
        additional_data
      );
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Update order status based on OnePay callback
    // status: 1 = SUCCESS, 0 = FAILED (according to OnePay docs)
    let orderStatus = order.status;
    if (status === 1 && status_message === "SUCCESS") {
      orderStatus = "PAID";
      console.log(
        `Payment successful for order ${order.id}, transaction ${transaction_id}`
      );
    } else if (status === 0) {
      orderStatus = "PAYMENT_FAILED";
      console.log(
        `Payment failed for order ${order.id}, transaction ${transaction_id}`
      );
    } else {
      console.log(
        `Unknown payment status for order ${order.id}: status=${status}, message=${status_message}`
      );
    }

    // Update the order with payment information
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: orderStatus,
        // Note: You might want to add fields to the Order model to store:
        // paymentTransactionId: transaction_id,
        // paymentStatus: status_message,
        // paymentDate: new Date(),
      },
    });

    console.log(`Order ${order.id} updated to status: ${orderStatus}`);

    // Send confirmation response to OnePay
    return NextResponse.json({
      success: true,
      message: "Callback processed successfully",
    });
  } catch (error) {
    console.error("OnePay callback error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
