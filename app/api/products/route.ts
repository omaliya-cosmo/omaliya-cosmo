import { prisma } from "@/app/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeReviews = searchParams.get("reviews") === "true";
    const includeCategory = searchParams.get("category") === "true";

    const products = await prisma.product.findMany({
      include: {
        reviews: includeReviews,
        category: includeCategory,
      },
    });
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
