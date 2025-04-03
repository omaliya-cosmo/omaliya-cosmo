import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma"; // Adjust the import path as necessary

export async function GET() {
  try {
    // Fetch all promo codes from the database
    const promoCodes = await prisma.promoCode.findMany();

    // Return the promo codes as a JSON response
    return NextResponse.json(promoCodes, { status: 200 });
  } catch (error) {
    console.error("Error fetching promo codes:", error);
    return NextResponse.json(
      { error: "Failed to fetch promo codes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { code, discountPercentage } = body;

    // Validate the input
    if (!code || typeof discountPercentage !== "number") {
      return NextResponse.json(
        {
          error:
            "Invalid input. Required: code (string) and discountPercentage (number)",
        },
        { status: 400 }
      );
    }

    // Check if promo code already exists
    const existingPromoCode = await prisma.promoCode.findFirst({
      where: { code },
    });
    console.log(existingPromoCode);

    if (existingPromoCode) {
      return NextResponse.json(
        { error: "Promo code already exists" },
        { status: 409 }
      );
    }

    // Create new promo code
    const promoCode = await prisma.promoCode.create({
      data: {
        code,
        discountPercentage,
      },
    });

    return NextResponse.json(
      { message: "Promo code created successfully", promoCode },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating promo code:", error);
    return NextResponse.json(
      { error: "Failed to create promo code" },
      { status: 500 }
    );
  }
}
