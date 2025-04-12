import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const { categoryId } = await params; // Get categoryId from dynamic route params

    const category = await prisma.productCategory.findUnique({
      where: { id: categoryId }, // Ensure that categoryId is of the correct format
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Return the category data
    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const { categoryId } = params;
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.description) {
      return NextResponse.json(
        { error: "Name and description are required" },
        { status: 400 }
      );
    }

    // Update the category
    const updatedCategory = await prisma.productCategory.update({
      where: { id: categoryId },
      data: {
        name: body.name,
        description: body.description,
        imageUrl: body.imageUrl,
      },
    });

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const { categoryId } = params;

    // Check if category exists
    const existingCategory = await prisma.productCategory.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Delete the category
    await prisma.productCategory.delete({
      where: { id: categoryId },
    });

    return NextResponse.json(
      { message: "Category deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
