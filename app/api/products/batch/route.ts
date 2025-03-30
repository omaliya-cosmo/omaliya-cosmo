import { prisma } from "@/app/lib/prisma"; // Adjust import path as needed

export async function POST(req: Request) {
  try {
    const { productIds } = await req.json();

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid productIds array" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Fetch products from the database
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    return new Response(JSON.stringify(products), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
