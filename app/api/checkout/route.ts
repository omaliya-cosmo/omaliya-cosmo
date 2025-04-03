import { NextResponse } from "next/server";
import {
  PrismaClient,
  OrderStatus,
  PaymentMethod,
  Currency,
} from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      addressLine1,
      addressLine2,
      city,
      postalCode,
      country: customerCountry,
      paymentMethod,
      cartItems,
      orderTotal,
      currency,
    } = body;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !addressLine1 ||
      !city ||
      !cartItems ||
      !orderTotal
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required order information" },
        { status: 400 }
      );
    }

    // Create or update customer
    const customer = await prisma.customer.upsert({
      where: { email },
      create: {
        firstName,
        lastName,
        email,
        addressLine1,
        addressLine2,
        city,
        postalCode,
        country: customerCountry,
        isRegistered: false,
      },
      update: {
        firstName,
        lastName,
        addressLine1,
        addressLine2,
        city,
        postalCode,
        country: customerCountry,
      },
    });

    // Format order items
    const orderItems = cartItems.map((item: any) => ({
      productId: item.id || item.productId,
      quantity: item.quantity,
      price: currency === "LKR" ? item.priceLKR : item.priceUSD,
      name: item.name,
      subtotal:
        (currency === "LKR" ? item.priceLKR : item.priceUSD) * item.quantity,
    }));

    // Calculate order totals
    const subtotal = orderItems.reduce(
      (sum: number, item: any) => sum + item.subtotal,
      0
    );
    const shipping = 0; // Free shipping
    const total = orderTotal;

    // Create the order
    const newOrder = await prisma.order.create({
      data: {
        customerId: customer.id,
        orderDate: new Date(),
        subtotal,
        shipping,
        total,
        currency: currency === "LKR" ? Currency.LKR : Currency.USD,
        status: OrderStatus.PENDING,
        paymentMethod:
          paymentMethod === "cod"
            ? PaymentMethod.CASH_ON_DELIVERY
            : paymentMethod === "koko"
            ? PaymentMethod.KOKO
            : PaymentMethod.PAY_HERE,
        items: orderItems,
      },
    });

    const completeOrder = await prisma.order.findUnique({
      where: { id: newOrder.id },
      include: { customer: true },
    });

    // Create response with cookie clearing
    const response = NextResponse.json({
      success: true,
      message: "Order placed successfully",
      orderId: newOrder.id,
      orderDate: newOrder.orderDate,
      orderStatus: newOrder.status,
      order: completeOrder,
    });

    // Clear the cart cookie
    const cookieStore = await cookies();
    cookieStore.set("cart", "", { expires: new Date(0), path: "/" });

    return response;
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { success: false, message: "Checkout failed. Please try again." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
