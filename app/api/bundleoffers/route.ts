import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma"; // Adjust the import path as necessary

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
    const {
      bundleName,
      productIds,
      originalPriceLKR,
      originalPriceUSD,
      offerPriceLKR,
      offerPriceUSD,
      endDate,
    } = body;

    // Validate the input
    if (
      !bundleName ||
      !Array.isArray(productIds) ||
      productIds.some((id) => typeof id !== "string") || // Ensure productIds are strings
      typeof originalPriceLKR !== "number" ||
      typeof originalPriceUSD !== "number" ||
      typeof offerPriceLKR !== "number" ||
      typeof offerPriceUSD !== "number" ||
      !endDate ||
      isNaN(Date.parse(endDate)) // Validate ISO-8601 format
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid input. Required: bundleName (string), productIds (array of strings), originalPriceLKR (number), originalPriceUSD (number), offerPriceLKR (number), offerPriceUSD (number), endDate (valid ISO-8601 string)",
        },
        { status: 400 }
      );
    }

    // Create the bundle offer
    const bundleOffer = await prisma.bundleOffer.create({
      data: {
        bundleName,
        originalPriceLKR,
        originalPriceUSD,
        offerPriceLKR,
        offerPriceUSD,
        endDate: new Date(endDate),
      },
    });

    // Create entries in ProductsOnBundles for each product
    const productsOnBundles = await prisma.productsOnBundles.createMany({
      data: productIds.map((productId: string) => ({
        productId,
        bundleId: bundleOffer.id,
      })),
    });

    return NextResponse.json(
      {
        message: "Bundle offer created successfully",
        bundleOffer,
        productsOnBundles,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating bundle offer:", error);
    return NextResponse.json(
      { error: "Failed to create bundle offer" },
      { status: 500 }
    );
  }
}
