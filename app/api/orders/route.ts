import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

// GET all orders or a specific order if id is provided
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (id) {
      // Get a specific order with its items and product details
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          customer: true,
          products: {
            include: {
              product: true
            }
          }
        }
      });

      if (!order) {
        return NextResponse.json(
          { success: false, message: 'Order not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, order });
    } else {
      // Get all orders with pagination
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const skip = (page - 1) * limit;

      const status = url.searchParams.get('status') as OrderStatus | null;
      const customerId = url.searchParams.get('customerId');

      const whereClause: any = {};
      if (status) whereClause.status = status;
      if (customerId) whereClause.customerId = customerId;

      const [orders, totalCount] = await Promise.all([
        prisma.order.findMany({
          where: whereClause,
          include: {
            customer: true,
            products: {
              include: {
                product: true
              }
            }
          },
          skip,
          take: limit,
          orderBy: { orderDate: 'desc' }
        }),
        prisma.order.count({ where: whereClause })
      ]);

      return NextResponse.json({
        success: true,
        orders,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit)
        }
      });
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST to create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract order data from the request body
    const { 
      customerId,
      items,
      total,
      notes,
      status = OrderStatus.PENDING
    } = body;
    
    // Validate required fields
    if (!customerId || !items || items.length === 0 || total === undefined) {
      return NextResponse.json(
        { success: false, message: 'Missing required order information' },
        { status: 400 }
      );
    }

    // Validate that customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      );
    }

    // Transaction to ensure all database operations succeed or fail together
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          customerId,
          total,
          status,
          notes
        }
      });
      
      // Create order items
      for (const item of items) {
        const { productId, quantity } = item;
        
        // Check if product exists
        const product = await tx.product.findUnique({
          where: { id: productId }
        });
        
        if (!product) {
          throw new Error(`Product with ID ${productId} not found`);
        }
        
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId,
            quantity
          }
        });
      }
      
      return newOrder;
    });
    
    // Fetch the complete order with its relations
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        customer: true,
        products: {
          include: {
            product: true
          }
        }
      }
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Order created successfully',
      order: completeOrder
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create order' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PATCH to update an order's status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, deliveredAt, notes } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Update the order
    const updateData: any = {};
    if (status) updateData.status = status;
    if (deliveredAt !== undefined) updateData.deliveredAt = deliveredAt ? new Date(deliveredAt) : null;
    if (notes !== undefined) updateData.notes = notes;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        products: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update order' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE to remove an order
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Delete order items first due to foreign key constraints
    await prisma.$transaction([
      prisma.orderItem.deleteMany({
        where: { orderId: id }
      }),
      prisma.order.delete({
        where: { id }
      })
    ]);

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete order' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}