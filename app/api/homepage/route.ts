import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeReviews = searchParams.get("reviews") === "true";
    const includeCategory = searchParams.get("category") === "true";

    // Fetch all data concurrently for better performance
    const [products, categories, bundleOffers] = await Promise.all([
      prisma.product.findMany({
        include: {
          reviews: includeReviews,
          category: includeCategory,
        },
      }),
      prisma.productCategory.findMany(),
      prisma.bundleOffer.findMany({
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
      }),
    ]);

    return NextResponse.json(
      {
        products,
        categories,
        bundleOffers,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch homepage data",
      },
      {
        status: 500,
      }
    );
  }
}
