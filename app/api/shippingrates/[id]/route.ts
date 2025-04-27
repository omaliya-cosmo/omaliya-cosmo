import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// DELETE handler to remove a shipping rate by ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Check if shipping rate exists
    const existingRate = await prisma.shippingRate.findUnique({
      where: { id },
    });

    if (!existingRate) {
      return NextResponse.json(
        { error: "Shipping rate not found" },
        { status: 404 }
      );
    }

    // Delete the shipping rate
    await prisma.shippingRate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting shipping rate:", error);
    return NextResponse.json(
      { error: "Failed to delete shipping rate" },
      { status: 500 }
    );
  }
}
