import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const cartCookie = (await cookies()).get("cart")?.value;
    const cart = cartCookie ? JSON.parse(cartCookie) : { items: [] };

    return NextResponse.json(cart, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, quantity } = body;

    if (!productId || typeof quantity !== "number") {
      return NextResponse.json({ error: "Invalid cart data" }, { status: 400 });
    }

    const cartCookie = (await cookies()).get("cart")?.value;
    const cart = cartCookie ? JSON.parse(cartCookie) : { items: [] };

    const existingItem = cart.items.find(
      (item: any) => item.productId === productId
    );
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    (await cookies()).set("cart", JSON.stringify(cart), {
      path: "/",
    });
    return NextResponse.json(
      { message: "Cart updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

// PUT route to update item quantity
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { itemId, quantity } = body;

    if (!itemId || typeof quantity !== "number" || quantity < 1) {
      return NextResponse.json(
        { error: "Invalid item ID or quantity" },
        { status: 400 }
      );
    }

    const cartCookie = (await cookies()).get("cart")?.value;
    const cart = cartCookie ? JSON.parse(cartCookie) : { items: [] };

    const itemIndex = cart.items.findIndex(
      (item: any) => item.productId === itemId
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: "Item not found in cart" },
        { status: 404 }
      );
    }

    cart.items[itemIndex].quantity = quantity;

    (await cookies()).set("cart", JSON.stringify(cart), {
      path: "/",
    });

    return NextResponse.json(
      { message: "Quantity updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating quantity:", error);
    return NextResponse.json(
      { error: "Failed to update quantity" },
      { status: 500 }
    );
  }
}

// DELETE route to remove item from cart
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    const cartCookie = (await cookies()).get("cart")?.value;
    const cart = cartCookie ? JSON.parse(cartCookie) : { items: [] };

    const initialLength = cart.items.length;
    cart.items = cart.items.filter((item: any) => item.productId !== itemId);

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
