import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { bundleofferId: string } }
) {
  const { bundleofferId } = params;

  try {
    // Delete the bundle offer by ID
    const deletedBundleOffer = await prisma.bundleOffer.delete({
      where: {
        id: bundleofferId,
      },
    });

    return NextResponse.json({ success: true, data: deletedBundleOffer });
  } catch (error) {
    console.error("Error deleting bundle offer:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete bundle offer" },
      { status: 500 }
    );
  }
}
