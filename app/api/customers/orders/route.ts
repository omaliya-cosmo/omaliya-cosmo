import { prisma } from "@/app/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/sessions";

export async function GET(request: NextRequest) {
  try {
    // Get current user from session
    const session = await getSession();
    if (!session || !session.customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    
    // Fetch orders for the current customer only
    const orders = await prisma.order.findMany({
      where: {
        customerId: session.customerId,
        status: status ? (status.toUpperCase() as OrderStatus) : undefined,
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        address: true,
        items: {
          include: {
            product: {
              select: {
                name: true,
                imageUrls: true,
              }
            },
            bundle: {
              select: {
                bundleName: true,
                imageUrl: true,
              }
            }
          },
        },
      },
      orderBy: {
        orderDate: 'desc',
      }
    });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}