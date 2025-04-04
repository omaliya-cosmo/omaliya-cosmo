import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { customerDetails, items, paymentMethod, currency, shipping, notes } =
      body;

    // Validate required fields
    if (
      !customerDetails ||
      !items ||
      !paymentMethod ||
      !currency ||
      shipping === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const {
      email,
      firstName,
      lastName,
      phoneNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
    } = customerDetails;

    // Check if the customer exists
    let customer = await prisma.customer.findUnique({
      where: { email },
    });

    // If the customer exists, update their details
    if (customer) {
      customer = await prisma.customer.update({
        where: { email },
        data: {
          firstName,
          lastName,
          phoneNumber,
          addressLine1,
          addressLine2,
          city,
          state,
          postalCode,
          country,
        },
      });
    } else {
      // If the customer does not exist, create a new one
      customer = await prisma.customer.create({
        data: {
          email,
          firstName,
          lastName,
          phoneNumber,
          addressLine1,
          addressLine2,
          city,
          state,
          postalCode,
          country,
          isRegistered: false, // Mark as not registered
        },
      });
    }
    console.log("Customer details:", customerDetails);

    // Calculate subtotal and total
    let subtotal = 0;
    const orderItems = await Promise.all(
      items.map(async (item: { productId: string; quantity: number }) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        const price = product.discountPriceLKR || product.priceLKR;
        subtotal += price * item.quantity;

        return {
          productId: item.productId,
          quantity: item.quantity,
          price,
        };
      })
    );

    const total = subtotal + shipping;

    // Create the order
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        orderDate: new Date(),
        subtotal,
        shipping,
        total,
        currency,
        status: "PENDING",
        notes,
        paymentMethod,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    // Return success response
    return NextResponse.json(
      { message: "Checkout successful", order },
      { status: 200 }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
