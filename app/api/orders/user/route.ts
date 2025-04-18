import { getSession } from "@/app/lib/sessions";
import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await getSession();
    
    // If no session exists, user is not authenticated
    if (!session || !session.customerId) {
      return NextResponse.json(
        { error: "Authentication required" }, 
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    
    // Fetch orders for the authenticated user
    const orders = await prisma.order.findMany({
      where: {
        customerId: session.customerId,
        status: status ? status.toUpperCase() as any : undefined,
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
                priceLKR: true,
                priceUSD: true,
              }
            },
            bundle: {
              select: {
                bundleName: true,
                imageUrl: true,
                offerPriceLKR: true,
                offerPriceUSD: true,
              }
            }
          }
        }
      },
      orderBy: {
        orderDate: 'desc',
      }
    });
    
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Failed to fetch user orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" }, 
      { status: 500 }
    );
  }
}