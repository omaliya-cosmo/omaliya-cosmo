import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { z } from "zod";

// Schema for validating address data
const addressSchema = z.object({
  addressLine1: z.string().min(1, "Street address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional(),
});

// POST: Create or update a customer's address
export async function POST(
  req: NextRequest,
  { params }: { params: { customerId: string } }
) {
  const { customerId } = await params;

  try {
    // Validate the customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { address: true },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = addressSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid address data",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const addressData = validationResult.data;

    let address;
    if (customer.address) {
      // Update existing address
      address = await prisma.address.update({
        where: { id: customer.address.id },
        data: {
          ...addressData,
          // If firstName and lastName are not provided in the request,
          // keep the existing values from the customer
          firstName: customer.firstName,
          lastName: customer.lastName,
        },
      });
    } else {
      // Create new address
      address = await prisma.address.create({
        data: {
          ...addressData,
          firstName: customer.firstName,
          lastName: customer.lastName,
          customer: {
            connect: {
              id: customerId,
            },
          },
        },
      });
    }

    return NextResponse.json(address, { status: 200 });
  } catch (error) {
    console.error("Error managing customer address:", error);
    return NextResponse.json(
      { error: "Failed to save address" },
      { status: 500 }
    );
  }
}

// PUT: Update a customer's address
export async function PUT(
  req: NextRequest,
  { params }: { params: { customerId: string } }
) {
  const { customerId } = await params;

  try {
    // Check if customer exists and has an address
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { address: true },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    if (!customer.address) {
      return NextResponse.json(
        { error: "Customer has no address to update" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = addressSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid address data",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const addressData = validationResult.data;

    // Update the address
    const updatedAddress = await prisma.address.update({
      where: { id: customer.address.id },
      data: {
        ...addressData,
        firstName: customer.firstName,
        lastName: customer.lastName,
      },
    });

    return NextResponse.json(updatedAddress, { status: 200 });
  } catch (error) {
    console.error("Error updating customer address:", error);
    return NextResponse.json(
      { error: "Failed to update address" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a customer's address
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { customerId: string } }
) {
  const { customerId } = await params;

  try {
    // Check if customer exists and has an address
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { address: true },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    if (!customer.address) {
      return NextResponse.json(
        { error: "Customer has no address to delete" },
        { status: 404 }
      );
    }

    // Delete the address
    await prisma.address.delete({
      where: { id: customer.address.id },
    });

    return NextResponse.json(
      { success: true, message: "Address deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting customer address:", error);
    return NextResponse.json(
      { error: "Failed to delete address" },
      { status: 500 }
    );
  }
}
