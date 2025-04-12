import { NextResponse } from "next/server";
import { getCustomerFromToken } from "@/app/actions";
import { z } from "zod";
import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@prisma/client";

// Custom error classes
class InsufficientStockError extends Error {
  constructor(productId: string) {
    super(`Insufficient stock for product ${productId}`);
  }
}

class InvalidTotalError extends Error {
  constructor() {
    super("Order total calculation mismatch");
  }
}

// Validation schema for the request body
const checkoutRequestSchema = z.object({
  addressDetails: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z
      .string()
      .email("Please enter a valid email address")
      .optional()
      .or(z.literal("")),
    phoneNumber: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .regex(/^\d+$/, "Phone number must contain only digits")
      .optional()
      .or(z.literal("")),
    addressLine1: z.string().min(1, "Address is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().optional(),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
    setDefault: z.boolean().optional().default(false),
  }),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().positive(),
    })
  ),
  paymentMethod: z.enum(["PAY_HERE", "KOKO", "CASH_ON_DELIVERY"]),
  currency: z.enum(["LKR", "USD"]),
  subtotal: z.number(),
  shipping: z.number(),
  discountAmount: z.number(),
  total: z.number(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = checkoutRequestSchema.parse(body);

    // Validate stock availability first
    await Promise.all(
      validatedData.items.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { stock: true },
        });

        if (!product || product.stock < item.quantity) {
          throw new InsufficientStockError(item.productId);
        }
      })
    );

    // Wrap everything in a transaction
    return await prisma.$transaction(
      async (tx) => {
        // Get authenticated customer (if any)
        const customer = await getCustomerFromToken();
        let address;

        const addressData = {
          firstName: validatedData.addressDetails.firstName,
          lastName: validatedData.addressDetails.lastName,
          phoneNumber: validatedData.addressDetails.phoneNumber || null,
          email: validatedData.addressDetails.email || null,
          addressLine1: validatedData.addressDetails.addressLine1,
          addressLine2: validatedData.addressDetails.addressLine2 || null,
          city: validatedData.addressDetails.city,
          state: validatedData.addressDetails.state || null,
          postalCode: validatedData.addressDetails.postalCode,
          country: validatedData.addressDetails.country,
        };

        if (customer && validatedData.addressDetails.setDefault) {
          // Update or create default shipping address
          const existingDefault = await tx.address.findFirst({
            where: { customerId: customer.id },
          });

          if (existingDefault) {
            address = await tx.address.update({
              where: { id: existingDefault.id },
              data: {
                ...addressData,
                customerId: customer.id,
              },
            });
          } else {
            address = await tx.address.create({
              data: {
                ...addressData,
                customerId: customer.id,
              },
            });
          }
        } else {
          // Create new address (without customer association)
          address = await tx.address.create({
            data: addressData,
          });
        }

        // Get order items with prices
        const orderItems = await Promise.all(
          validatedData.items.map(async (item) => {
            const product = await tx.product.findUnique({
              where: { id: item.productId },
            });

            if (!product) {
              throw new Error(`Product ${item.productId} not found`);
            }

            const price =
              validatedData.currency === "LKR"
                ? product.priceLKR
                : product.priceUSD;

            return {
              productId: item.productId,
              quantity: item.quantity,
              price: price,
            };
          })
        );

        // Validate total amount
        const calculatedTotal =
          orderItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ) +
          validatedData.shipping -
          validatedData.discountAmount;

        if (Math.abs(calculatedTotal - validatedData.total) > 0.01) {
          throw new InvalidTotalError();
        }

        // Create the order with optional customerId
        const order = await tx.order.create({
          data: {
            customerId: customer?.id, // Only set if customer exists
            addressId: address.id,
            subtotal: validatedData.subtotal,
            shipping: validatedData.shipping,
            discountAmount: validatedData.discountAmount,
            total: validatedData.total,
            currency: validatedData.currency,
            paymentMethod: validatedData.paymentMethod,
            notes: validatedData.notes,
            items: {
              create: orderItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
              })),
            },
          },
          include: {
            items: true,
          },
        });

        // Update product stock
        await Promise.all(
          orderItems.map((item) =>
            tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            })
          )
        );

        return NextResponse.json(
          {
            success: true,
            order: order,
          },
          { status: 200 }
        );
      },
      {
        maxWait: 5000, // 5s maximum wait time
        timeout: 10000, // 10s maximum transaction time
      }
    );
  } catch (error) {
    console.error("Checkout error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error instanceof InsufficientStockError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      );
    }

    if (error instanceof InvalidTotalError) {
      return NextResponse.json(
        {
          success: false,
          error: "Order total calculation mismatch",
        },
        { status: 400 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        {
          success: false,
          error: "Database operation failed",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
