import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";

// Password change request schema validation
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(4, "Password must be at least 4 characters long"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    const customerId = params.customerId;
    const body = await req.json();
    console.log("Request body:", body);

    // Validate request body using the same pattern as signup
    const validation = passwordChangeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;

    // Find customer by ID
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { passwordHash: true },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, errors: { general: ["Customer not found"] } },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      customer.passwordHash
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          errors: { currentPassword: ["Current password is incorrect"] },
        },
        { status: 400 }
      );
    }

    // Hash new password with same strength as signup (10)
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update customer password
    await prisma.customer.update({
      where: { id: customerId },
      data: { passwordHash },
    });

    return NextResponse.json(
      { success: true, message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      {
        success: false,
        errors: { general: ["An error occurred while changing the password"] },
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
