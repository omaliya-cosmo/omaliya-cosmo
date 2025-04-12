import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Promo code is required" },
        { status: 400 }
      );
    }

    // Find the promo code in the database
    const promoCode = await prisma.promoCode.findFirst({
      where: {
        code: code,
      },
    });
    console.log(promoCode);

    if (!promoCode) {
      return NextResponse.json(
        { error: "Invalid or expired promo code" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Promo code applied successfully",
      discount: promoCode.discountPercentage,
    });
  } catch (error: any) {
    console.error("Error validating promo code:", error);
    return NextResponse.json(
      { error: "Failed to validate promo code" },
      { status: 500 }
    );
  }
}
