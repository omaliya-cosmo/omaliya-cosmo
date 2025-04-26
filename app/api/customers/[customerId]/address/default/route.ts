// filepath: e:\Enshift\Projects\Omaliya Cosmetics\Website Code\omaliya-cosmo\app\api\customers\[customerId]\address\default\route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { z } from "zod";

// Schema for validating request data
const defaultAddressSchema = z.object({
  addressId: z.string().min(1, "Address ID is required"),
});

// PUT: Set an address as default
export async function PUT(
  req: NextRequest,
  { params }: { params: { customerId: string } }
) {
  const { customerId } = params;

  try {
    // Parse and validate request body
    const body = await req.json();
    const validationResult = defaultAddressSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { addressId } = validationResult.data;

    // Verify the address belongs to this customer
    const existingAddress = await prisma.customerAddress.findFirst({
      where: {
        id: addressId,
        customerId,
      },
    });

    if (!existingAddress) {
      return NextResponse.json(
        { error: "Address not found for this customer" },
        { status: 404 }
      );
    }

    // First, unset any existing default addresses
    await prisma.customerAddress.updateMany({
      where: {
        customerId,
        isDefault: true,
      },
      data: { isDefault: false },
    });

    // Then set the requested address as default
    const updatedAddress = await prisma.customerAddress.update({
      where: { id: addressId },
      data: { isDefault: true },
    });

    return NextResponse.json(updatedAddress, { status: 200 });
  } catch (error) {
    console.error("Error setting default address:", error);
    return NextResponse.json(
      { error: "Failed to set default address" },
      { status: 500 }
    );
  }
}
