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
  isDefault: z.boolean().optional(),
});

// POST: Create or update a customer's address
export async function POST(
  req: NextRequest,
  { params }: { params: { customerId: string } }
) {
  const { customerId } = params;

  try {
    // Validate the customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { addresses: true },
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
    const isDefault = addressData.isDefault ?? false;

    // If setting this address as default, unset any existing default
    if (isDefault) {
      await prisma.customerAddress.updateMany({
        where: {
          customerId,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    // Create new address
    const address = await prisma.customerAddress.create({
      data: {
        ...addressData,
        firstName: customer.firstName,
        lastName: customer.lastName,
        isDefault,
        customer: {
          connect: {
            id: customerId,
          },
        },
      },
    });

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
  const { customerId } = params;

  try {
    // Parse and validate request body
    const body = await req.json();

    // Ensure addressId is provided
    if (!body.addressId) {
      return NextResponse.json(
        { error: "Address ID is required" },
        { status: 400 }
      );
    }

    const { addressId, ...addressData } = body;
    const validationResult = addressSchema.safeParse(addressData);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid address data",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

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

    const isDefault = addressData.isDefault ?? false;

    // If setting this address as default, unset any existing default
    if (isDefault && !existingAddress.isDefault) {
      await prisma.customerAddress.updateMany({
        where: {
          customerId,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    // Update the address
    const updatedAddress = await prisma.customerAddress.update({
      where: { id: addressId },
      data: {
        ...validationResult.data,
        isDefault,
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
  req: NextRequest,
  { params }: { params: { customerId: string } }
) {
  const { customerId } = params;

  try {
    // Get the addressId from the query parameters
    const url = new URL(req.url);
    const addressId = url.searchParams.get("addressId");

    if (!addressId) {
      return NextResponse.json(
        { error: "Address ID is required" },
        { status: 400 }
      );
    }

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

    // Delete the address
    await prisma.customerAddress.delete({
      where: { id: addressId },
    });

    // If this was the default address and customer has other addresses,
    // set a new default
    if (existingAddress.isDefault) {
      const anotherAddress = await prisma.customerAddress.findFirst({
        where: { customerId },
      });

      if (anotherAddress) {
        await prisma.customerAddress.update({
          where: { id: anotherAddress.id },
          data: { isDefault: true },
        });
      }
    }

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

// GET: Retrieve customer addresses
export async function GET(
  _req: NextRequest,
  { params }: { params: { customerId: string } }
) {
  const { customerId } = params;

  try {
    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { addresses: true },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(customer.addresses, { status: 200 });
  } catch (error) {
    console.error("Error fetching customer addresses:", error);
    return NextResponse.json(
      { error: "Failed to retrieve addresses" },
      { status: 500 }
    );
  }
}
