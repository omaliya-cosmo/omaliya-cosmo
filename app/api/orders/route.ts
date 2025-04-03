// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // If status is provided and is 'pending', filter by it
    const whereClause =
      status === "pending" ? { status: "PENDING" as const } : {};

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        customer: true,
        products: true,
      },
      orderBy: {
        orderDate: "desc",
      },
    });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
