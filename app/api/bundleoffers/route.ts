import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma"; // Adjust the import path as necessary
import { z } from "zod";

// Zod schema for bundle offer validation
const bundleOfferSchema = z.object({
  bundleName: z.string().min(1, "Bundle name is required"),
  productIds: z.array(z.string()).min(1, "At least one product is required"),
  originalPriceLKR: z.number().positive("Original LKR price must be positive"),
  originalPriceUSD: z.number().positive("Original USD price must be positive"),
  offerPriceLKR: z.number().positive("Offer LKR price must be positive"),
  offerPriceUSD: z.number().positive("Offer USD price must be positive"),
  endDate: z.string().datetime("Invalid date format"),
  imageUrl: z.string().url().optional(),
});

// GET method to fetch all bundle offers
export async function GET() {
  try {
    // Fetch all bundle offers from the database
    const bundleOffers = await prisma.bundleOffer.findMany({
      include: { products: { include: { product: true } } },
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

    // Validate the input using Zod
    const validatedData = bundleOfferSchema.parse(body);

    // Create the bundle offer
    const bundleOffer = await prisma.bundleOffer.create({
      data: {
        bundleName: validatedData.bundleName,
        originalPriceLKR: validatedData.originalPriceLKR,
        originalPriceUSD: validatedData.originalPriceUSD,
        offerPriceLKR: validatedData.offerPriceLKR,
        offerPriceUSD: validatedData.offerPriceUSD,
        endDate: new Date(validatedData.endDate),
        imageUrl: validatedData.imageUrl,
        products: {
          create: validatedData.productIds.map((productId) => ({
            product: {
              connect: { id: productId },
            },
          })),
        },
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

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create bundle offer" },
      { status: 500 }
    );
  }
}
