import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  try {
    const users = await prisma.customer.findMany();
    return new Response(JSON.stringify({ users }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch users" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
