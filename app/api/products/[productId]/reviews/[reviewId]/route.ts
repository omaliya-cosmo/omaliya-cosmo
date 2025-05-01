import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string; reviewId: string } }
) {
  try {
    const { productId, reviewId } = params;

    // First check if the review exists and belongs to the specified product
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        productId: productId,
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found or does not belong to this product" },
        { status: 404 }
      );
    }

    // Delete the review
    await prisma.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json(
      { success: true, message: "Review deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
