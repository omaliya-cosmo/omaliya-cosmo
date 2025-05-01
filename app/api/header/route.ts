import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch all required header data in parallel
    const [products, categories, bundles] = await Promise.all([
      // Fetch limited products for the header
      prisma.product.findMany({
        take: 10, // Limit to a few products for the header
        orderBy: {
          createdAt: "desc",
        },
      }),

      // Fetch all categories
      prisma.productCategory.findMany(),

      // Fetch all bundle offers
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

    // Return all data in a single response
    return NextResponse.json(
      {
        products,
        categories,
        bundles,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching header data:", error);
    return NextResponse.json(
      { error: "Failed to fetch header data" },
      { status: 500 }
    );
  }
}
