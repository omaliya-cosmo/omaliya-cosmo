import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  try {
    const categories = await prisma.productCategory.findMany();
    return new Response(JSON.stringify({ categories }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch categories" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
