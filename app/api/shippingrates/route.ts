import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// GET handler to fetch all shipping rates
export async function GET(request: Request) {
  try {
    // Get all shipping rates without country filtering
    const shippingRates = await prisma.shippingRate.findMany();
    return NextResponse.json(shippingRates);
  } catch (error) {
    console.error("Error fetching shipping rates:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipping rates" },
      { status: 500 }
    );
  }
}

// POST handler to create new shipping rate without field validation
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { country, rateLKR, rateUSD } = body;

    // Create new shipping rate without validation
    const newShippingRate = await prisma.shippingRate.create({
      data: {
        country,
        rateLKR,
        rateUSD,
      },
    });

    return NextResponse.json(newShippingRate, { status: 201 });
  } catch (error: any) {
    console.error("Error creating shipping rate:", error);

    // Handle unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A shipping rate for this country already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create shipping rate" },
      { status: 500 }
    );
  }
}
