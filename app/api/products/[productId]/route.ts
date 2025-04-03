import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = await params; // Get productId from dynamic route params

    const product = await prisma.product.findUnique({
      where: { id: productId }, // Ensure that productId is of the correct format
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
    console.log("Updating product with ID:", body); // Debugging line to check the productId

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: body.name, // Update the name field
        description: body.description, // Update the description field
        imageUrls: body.imageUrls, // Update the imageUrls field
        categoryId: body.categoryId, // Update the categoryId field
        priceLKR: body.priceLKR, // Update the priceLKR field
        discountPriceLKR: body.discountPriceLKR, // Update the discountPriceLKR field
        priceUSD: body.priceUSD, // Update the priceUSD field
        discountPriceUSD: body.discountPriceUSD, // Update the discountPriceUSD field
        stock: body.stock, // Update the stock field
      },
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
