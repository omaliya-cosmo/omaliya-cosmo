import { prisma } from "@/app/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let whereCondition: any = {};

    // Support Pending + Paid together
    if (status) {
      if (status === "PENDING_AND_PAID") {
        whereCondition = {
          status: { in: ["PENDING", "PAID"] },
        };
      } else {
        whereCondition = {
          status: status.toUpperCase() as OrderStatus,
        };
      }
    }

    const orders = await prisma.order.findMany({
      where: whereCondition,
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
