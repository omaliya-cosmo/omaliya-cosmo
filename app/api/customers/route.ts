import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  try {
    const customers = await prisma.customer.findMany();
    return new Response(JSON.stringify({ customers }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch customers" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
