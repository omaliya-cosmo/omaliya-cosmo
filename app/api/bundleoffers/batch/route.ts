import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { bundleIds } = await request.json();

    if (!bundleIds || !Array.isArray(bundleIds)) {
      return NextResponse.json(
        { error: "Invalid bundle IDs provided" },
        { status: 400 }
      );
    }

    const bundles = await prisma.bundleOffer.findMany({
      where: {
        id: {
          in: bundleIds,
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

    return NextResponse.json(bundles);
  } catch (error) {
    console.error("Error fetching bundles:", error);
    return NextResponse.json(
      { error: "Failed to fetch bundles" },
      { status: 500 }
    );
  }
}
