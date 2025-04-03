import { NextResponse } from 'next/server';
import { PrismaClient, OrderStatus } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Define the type for cart items
    type CartItem = {
      productId: string;
      quantity: number;
    };

    // Extract order data from the request body
    const { 
      firstName, 
      lastName, 
      email, 
      addressLine1,
      addressLine2,
      city,
      postalCode,
      country: customerCountry,
      paymentMethod,
      cartItems,
      orderTotal,
      currency
    }: { 
      firstName: string; 
      lastName: string; 
      email: string; 
      addressLine1: string; 
      addressLine2?: string; 
      city: string; 
      postalCode?: string; 
      country: string; 
      paymentMethod: string; 
      cartItems: CartItem[]; 
      orderTotal: number; 
      currency: string; 
    } = body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !addressLine1 || !city || !cartItems || !orderTotal) {
      return NextResponse.json(
        { success: false, message: 'Missing required order information' },
        { status: 400 }
      );
    }

    // Step 1: Process customer outside of transaction
    let customer = await prisma.customer.findUnique({
      where: { email }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          firstName,
          lastName,
          email,
          addressLine1,
          addressLine2,
          city,
          postalCode,
          country: customerCountry,
          isRegistered: false // Guest checkout
        }
      });
    }
    
    // Step 2: Create the order
    const newOrder = await prisma.order.create({
      data: {
        customerId: customer.id,
        total: orderTotal,
        status: OrderStatus.PENDING,
        notes: `Payment method: ${paymentMethod}, Currency: ${currency}`
      }
    });
    
    // Step 3: Create order items
    const orderItemsPromises = cartItems.map(item => 
      prisma.orderItem.create({
        data: {
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity
        }
      })
    );
    
    await Promise.all(orderItemsPromises);
    
    // Step 4: Fetch the complete order with all details for the confirmation page
    const completeOrder = await prisma.order.findUnique({
      where: { id: newOrder.id },
      include: {
        customer: true,
        products: {
          include: {
            product: true
          }
        }
      }
    });
    
    console.log('Order created:', newOrder.id);
    
    // Create response with cookie clearing
    const response = NextResponse.json({ 
      success: true,
      message: 'Order placed successfully',
      orderId: newOrder.id,
      orderDate: newOrder.orderDate,
      orderStatus: newOrder.status,
      order: completeOrder // Include full order details
    });
    
    // Clear the cart cookie by setting it to empty with expired date
    cookies().set({
      name: 'cart',
      value: '',
      expires: new Date(0), // Set to epoch time to expire immediately
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { success: false, message: 'Checkout failed. Please try again.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}