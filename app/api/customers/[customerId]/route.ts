import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { customerId: string } }
) {
  const { customerId } = params;

  try {
    const { searchParams } = new URL(req.url);
    const includeAddresses = searchParams.get("addresses") === "true";
    const includeOrders = searchParams.get("orders") === "true";
    const includeReviews = searchParams.get("reviews") === "true";

    // Fetch the customer from the database
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        address: includeAddresses,
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
  } finally {
    await prisma.$disconnect();
  }
}
