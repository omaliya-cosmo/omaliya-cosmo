import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma"; // Adjust the import path as necessary
// Remove z import since we won't be using Zod

// Remove bundleOfferSchema definition

// GET method remains unchanged
export async function GET() {
  try {
    // Fetch all bundle offers from the database
    const bundleOffers = await prisma.bundleOffer.findMany({
      include: {
        products: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    // Return the bundle offers as a JSON response
    return NextResponse.json(bundleOffers, { status: 200 });
  } catch (error) {
    console.error("Error fetching bundle offers:", error);
    return NextResponse.json(
      { error: "Failed to fetch bundle offers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // No validation - use the body directly
    const bundleOffer = await prisma.bundleOffer.create({
      data: {
        bundleName: body.bundleName,
        originalPriceLKR: body.originalPriceLKR,
        originalPriceUSD: body.originalPriceUSD,
        offerPriceLKR: body.offerPriceLKR,
        offerPriceUSD: body.offerPriceUSD,
        endDate: new Date(body.endDate),
        imageUrl: body.imageUrl,
        products: {
          create: body.productIds.map((productId: string) => ({
            product: {
              connect: { id: productId },
            },
          })),
        },
        stock: body.stock,
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Bundle offer created successfully",
        bundleOffer,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating bundle offer:", error);

    // Removed Zod-specific error handling
    return NextResponse.json(
      { error: "Failed to create bundle offer" },
      { status: 500 }
    );
  }
}
