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
    const newOrder = await prisma.order.create({
      data: body,
    });
    return new Response(JSON.stringify({ order: newOrder }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to create order" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
