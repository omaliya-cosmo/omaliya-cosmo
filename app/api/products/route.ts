import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  try {
    const products = await prisma.product.findMany();
    return new Response(JSON.stringify({ products }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch products" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received body:", body); // Debugging line to check the received body
    const newProduct = await prisma.product.create({
      data: body,
    });
    return new Response(JSON.stringify({ product: newProduct }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to create product" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
