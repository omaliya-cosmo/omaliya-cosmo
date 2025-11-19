import { prisma } from "@/app/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let whereCondition: any = {};

    // If page requests "PENDING" → return pending + paid
    if (status) {
      if (status === "PENDING") {
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
      orderBy: { orderDate: "desc" },
      include: {
        customer: true,
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
