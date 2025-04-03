import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { promocodeId: string } }
) {
  try {
    const { promocodeId } = await params; // Get promocodeId from dynamic route params

    // Validate the promo code ID
    if (!promocodeId) {
      return NextResponse.json(
        { error: "Promo code ID is required" },
        { status: 400 }
      );
    }

    // Delete the promo code from the database
    const deletedPromoCode = await prisma.promoCode.delete({
      where: { id: promocodeId },
    });

    return NextResponse.json(
      { message: "Promo code deleted successfully", deletedPromoCode },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting promo code:", error);
    return NextResponse.json(
      { error: "Failed to delete promo code" },
      { status: 500 }
    );
  }
}
