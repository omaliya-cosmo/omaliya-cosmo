import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // OnePay callback payload structure
    const { transaction_id, status, status_message, additional_data } = body;

    console.log("OnePay callback received:", body);

    // Find the order by reference (transaction_id should match our order reference)
    const order = await prisma.order.findFirst({
      where: {
        // Assuming we store the OnePay transaction ID in a field or use order ID as reference
        id: additional_data, // or however you link the order to OnePay transaction
      },
    });

    if (!order) {
      console.error("Order not found for transaction:", transaction_id);
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Update order status based on OnePay callback
    let orderStatus = order.status;
    if (status === 1 && status_message === "SUCCESS") {
      orderStatus = "PAID";
    } else if (status === 0) {
      orderStatus = "PAYMENT_FAILED";
    }

    // Update the order with payment information
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: orderStatus,
        // You might want to add fields to store transaction details
        // paymentTransactionId: transaction_id,
        // paymentStatus: status_message,
      },
    });

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
