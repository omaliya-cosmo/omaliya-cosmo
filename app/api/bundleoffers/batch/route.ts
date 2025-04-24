import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const { bundleIds } = await req.json();

    if (!Array.isArray(bundleIds) || bundleIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid bundleIds array" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Fetch bundles from the database
    const bundles = await prisma.bundleOffer.findMany({
      where: { id: { in: bundleIds } },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrls: true,
              },
            },
          },
        },
      },
    });

    return new Response(JSON.stringify(bundles), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching bundles:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
