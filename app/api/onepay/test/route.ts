import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Testing database connection...");

    // Test database connection
    const orderCount = await prisma.order.count({
      where: {
        paymentMethod: "ONEPAY",
      },
    });

    console.log(`📊 Found ${orderCount} OnePay orders in database`);

    // Find recent pending orders
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: "PENDING_PAYMENT",
        paymentMethod: "ONEPAY",
      },
      orderBy: {
        id: "desc",
      },
      take: 5,
    });

    console.log(
      `⏳ Found ${pendingOrders.length} PENDING_PAYMENT OnePay orders:`,
      pendingOrders.map((o) => ({
        id: o.id,
        status: o.status,
        orderDate: o.orderDate,
      }))
    );

    return NextResponse.json({
      success: true,
      message: "Database connection test successful",
      totalOnePayOrders: orderCount,
      pendingOrders: pendingOrders.map((o) => ({
        id: o.id,
        status: o.status,
        orderDate: o.orderDate,
        paymentTransactionId: o.paymentTransactionId,
      })),
    });
  } catch (error) {
    console.error("❌ Database connection test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Database connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
