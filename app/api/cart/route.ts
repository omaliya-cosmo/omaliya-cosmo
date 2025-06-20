import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";

// Helper to validate item stock before adding to cart
async function validateItemStock(
  itemId: string,
  quantity: number,
  isBundle: boolean
) {
  try {
    if (isBundle) {
      const bundle = await prisma.bundleOffer.findUnique({
        where: { id: itemId },
        select: { stock: true },
      });
      return bundle && bundle.stock >= quantity;
    } else {
      const product = await prisma.product.findUnique({
        where: { id: itemId },
        select: { stock: true },
      });
      return product && product.stock >= quantity;
    }
  } catch (error) {
    console.error("Error validating stock:", error);
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    const cartCookie = (await cookies()).get("cart")?.value;
    const cart = cartCookie ? JSON.parse(cartCookie) : { items: [] };

    if (cart.items.length > 0) {
      // Fetch additional details for products and bundles in the cart
      const productIds = cart.items
        .filter((item: any) => !item.isBundle)
        .map((item: any) => item.productId);

      const bundleIds = cart.items
        .filter((item: any) => item.isBundle)
        .map((item: any) => item.productId);

      const [products, bundles] = await Promise.all([
        productIds.length > 0
          ? prisma.product.findMany({
              where: { id: { in: productIds } },
              select: {
                id: true,
                name: true,
                imageUrls: true,
                priceLKR: true,
                discountPriceLKR: true,
                priceUSD: true,
                discountPriceUSD: true,
                stock: true,
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            })
          : [],
        bundleIds.length > 0
          ? prisma.bundleOffer.findMany({
              where: { id: { in: bundleIds } },
              select: {
                id: true,
                bundleName: true,
                imageUrl: true,
                offerPriceLKR: true,
                offerPriceUSD: true,
                originalPriceLKR: true,
                originalPriceUSD: true,
                stock: true,
                products: {
                  include: {
                    product: {
                      select: {
                        name: true,
                        imageUrls: true,
                      },
                    },
                  },
                },
              },
            })
          : [],
      ]);

      // Enhance cart items with product/bundle details
      const enhancedItems = cart.items.map((item: any) => {
        if (item.isBundle) {
          const bundle = bundles.find((b) => b.id === item.productId);
          return {
            ...item,
            details: bundle || null,
          };
        } else {
          const product = products.find((p) => p.id === item.productId);
          return {
            ...item,
            details: product || null,
          };
        }
      });

      return NextResponse.json(
        {
          items: enhancedItems,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(cart, { status: 200 });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productId,
      quantity,
      isBundle = false,
      replaceQuantity = false,
    } = body;

    if (!productId || typeof quantity !== "number" || quantity <= 0) {
      return NextResponse.json({ error: "Invalid cart data" }, { status: 400 });
    }

    // Validate stock availability
    const hasStock = await validateItemStock(productId, quantity, isBundle);
    if (!hasStock) {
      return NextResponse.json(
        {
          error: `${
            isBundle ? "Bundle" : "Product"
          } is out of stock or unavailable`,
        },
        { status: 400 }
      );
    }

    const cartCookie = (await cookies()).get("cart")?.value;
    const cart = cartCookie ? JSON.parse(cartCookie) : { items: [] };

    const existingItem = cart.items.find(
      (item: any) => item.productId === productId && item.isBundle === isBundle
    );

    if (existingItem) {
      // If item exists, update quantity
      const newQuantity = replaceQuantity
        ? quantity
        : existingItem.quantity + quantity;

      // Validate total quantity against stock
      const stockValid = await validateItemStock(
        productId,
        newQuantity,
        isBundle
      );
      if (!stockValid) {
        return NextResponse.json(
          {
            error: `Not enough stock available for ${
              isBundle ? "bundle" : "product"
            }`,
          },
          { status: 400 }
        );
      }

      existingItem.quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        quantity,
        isBundle,
        addedAt: new Date().toISOString(),
      });
    }

    (await cookies()).set("cart", JSON.stringify(cart), {
      path: "/",
      // Set cookie to expire in 30 days
      maxAge: 30 * 24 * 60 * 60,
    });

    return NextResponse.json(
      { message: "Cart updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

// DELETE route to remove item from cart
export async function DELETE(req: NextRequest) {
  try {
    // Check if this is a request to clear the entire cart
    const url = new URL(req.url);
    const clearCart = url.searchParams.get("clear") === "true";

    if (clearCart) {
      // Clear the entire cart
      (await cookies()).set("cart", JSON.stringify({ items: [] }), {
        path: "/",
      });

      return NextResponse.json(
        { message: "Cart cleared successfully" },
        { status: 200 }
      );
    }

    // This is a request to remove a specific item
    const { productId, isBundle } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    const cartCookie = (await cookies()).get("cart")?.value;
    const cart = cartCookie ? JSON.parse(cartCookie) : { items: [] };

    const initialLength = cart.items.length;
    cart.items = cart.items.filter((item: any) => {
      // If isBundle is specified, filter by both productId and isBundle
      if (isBundle !== undefined) {
        return item.productId !== productId || item.isBundle !== isBundle;
      }
      // Otherwise, filter by productId only (backward compatibility)
      return item.productId !== productId;
    });

    if (cart.items.length === initialLength) {
      return NextResponse.json(
        { error: "Item not found in cart" },
        { status: 404 }
      );
    }

    (await cookies()).set("cart", JSON.stringify(cart), {
      path: "/",
    });

    return NextResponse.json(
      { message: "Item removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing item:", error);
    return NextResponse.json(
      { error: "Failed to remove item" },
      { status: 500 }
    );
  }
}
