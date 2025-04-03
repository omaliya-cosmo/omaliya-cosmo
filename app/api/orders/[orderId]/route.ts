import { prisma } from "@/app/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    // Fetch the order along with its customer and items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Transform the order items to include product details
    const transformedOrder = {
      ...order,
      items: order.items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        image: item.product.images[0] || null,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    return new Response(JSON.stringify({ order: transformedOrder }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch order" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const body = await request.json();

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: body,
    });

    return new Response(JSON.stringify({ order: updatedOrder }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to update order" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    await prisma.order.delete({
      where: { id: orderId },
    });

    return new Response(
      JSON.stringify({ message: "Order deleted successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to delete order" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
