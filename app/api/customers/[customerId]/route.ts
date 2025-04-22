import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { customerId: string } }
) {
  const { customerId } = await params;

  try {
    const { searchParams } = new URL(req.url);
    const includeOrders = searchParams.get("orders") === "true";
    const includeReviews = searchParams.get("reviews") === "true";
    const includeAddress = searchParams.get("address") === "true";

    // Fetch the customer from the database
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        address: includeAddress,
        orders: includeOrders,
        reviews: includeReviews,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
