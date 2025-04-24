import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;
    const body = await request.json();

    // Extract review data from request body
    const { userId, rating, review } = body;

    if (!userId || !rating) {
      return NextResponse.json(
        { error: "User ID and rating are required" },
        { status: 400 }
      );
    }

    // Create the new review
    const newReview = await prisma.review.create({
      data: {
        productId,
        userId,
        rating,
        review: review || null, // Handle empty reviews
        date: new Date(),
      },
      include: {
        customer: true, // Include customer data in response
      },
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
