import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params; // Get productId from dynamic route params
    const { searchParams } = new URL(request.url);
    const includeReviews = searchParams.get("reviews") === "true";
    const includeCategory = searchParams.get("category") === "true";

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        reviews: includeReviews
          ? {
              include: {
                customer: true, // Include customer data in each review
              },
            }
          : false,
        category: includeCategory,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Return the product data
    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params; // Get productId from dynamic route params
    const body = await request.json(); // Parse the request body

    const { id, ...data } = body;

    const updatedProduct = await prisma.product.update({
      where: {
        id: productId,
      },
      data: data,
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;
    const body = await request.json();

    // Use the body data directly for the update
    const updateData = { ...body };

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error("Error patching product:", error);
    return NextResponse.json(
      { error: "Failed to patch product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params; // Get productId from dynamic route params

    console.log("Deleting product with ID:", productId); // Debugging line to check the productId

    await prisma.product.delete({
      where: { id: productId }, // Delete the product by ID
    });

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
