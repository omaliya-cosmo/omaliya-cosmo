import { prisma } from "@/app/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const orders = await prisma.order.findMany({
      where: {
        status: status ? (status.toUpperCase() as OrderStatus) : undefined,
      },
      include: {
        customer: {
          include: {
            orders: {
              include: {
                items: {
                  include: {
                    product: true,
                    bundle: true,
                  },
                },
                address: true,
              },
            },
          },
        },
        items: {
          include: {
            product: true,
            bundle: true,
          },
        },
        address: true,
      },
    });

    return new Response(JSON.stringify({ orders }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch orders" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Order creation request:", JSON.stringify(body, null, 2));

    // Create order data with proper structure
    const orderData: any = {
      subtotal: body.subtotal,
      discountAmount: body.discountAmount || 0,
      shipping: body.shipping,
      total: body.total,
      currency: body.currency,
      status: body.status || "PENDING", // Use provided status or default to PENDING
      notes: body.notes || null,
      paymentMethod: body.paymentMethod,
      paymentSlip: body.paymentSlip || null,
      paymentTransactionId: body.paymentTransactionId || null,
      address: {
        create: {
          firstName: body.addressDetails.firstName,
          lastName: body.addressDetails.lastName,
          phoneNumber: body.addressDetails.phoneNumber || null,
          email: body.addressDetails.email || null,
          addressLine1: body.addressDetails.addressLine1,
          addressLine2: body.addressDetails.addressLine2 || null,
          city: body.addressDetails.city,
          state: body.addressDetails.state || null,
          postalCode: body.addressDetails.postalCode,
          country: body.addressDetails.country,
        },
      },
      items: {
        create: body.items.map((item: any) => ({
          productId: item.productId || null,
          bundleId: item.bundleId || null,
          quantity: item.quantity,
          price: item.price,
          isBundle: item.isBundle || false,
        })),
      },
    };

    // Add customer relationship if customerId is provided
    if (body.customerId) {
      orderData.customerId = body.customerId;
    }

    console.log("Final order data:", JSON.stringify(orderData, null, 2));

    const newOrder = await prisma.order.create({
      data: orderData,
      include: {
        address: true,
        items: {
          include: {
            product: true,
            bundle: true,
          },
        },
      },
    });

    return new Response(JSON.stringify(newOrder), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to create order",
        details: error instanceof Error ? error.message : error,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
