import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// Test endpoint to manually update order status
export async function POST(request: NextRequest) {
  try {
    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: "orderId and status are required" },
        { status: 400 }
      );
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Update the order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: status,
        notes: order.notes
          ? `${
              order.notes
            }\nTest Status Update: ${status} at ${new Date().toISOString()}`
          : `Test Status Update: ${status} at ${new Date().toISOString()}`,
      },
    });

    console.log(`Test: Order ${orderId} status updated to ${status}`);

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Test update order status error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
