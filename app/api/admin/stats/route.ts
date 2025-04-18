import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    // Get base statistics
    const [
      users,
      products,
      orders,
      monthlyRevenue,
      categorySales,
      recentOrders,
      trendingProducts,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.product.count(),
      prisma.order.findMany({
        where: {
          orderDate: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
          },
        },
      }),
      // Get monthly revenue for last 6 months
      prisma.order.groupBy({
        by: ["orderDate"],
        where: {
          orderDate: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
          },
        },
        _sum: {
          total: true,
        },
      }),
      // Get sales by category
      prisma.$transaction(async (tx) => {
        const groupedData = await tx.orderItem.groupBy({
          by: ["productId"],
          where: {
            product: {
              isNot: null,
            },
          },
          _sum: {
            quantity: true,
          },
        });

        const productIds = groupedData
          .map((item) => item.productId)
          .filter((id): id is string => id !== null);
        const products = await tx.product.findMany({
          where: {
            id: {
              in: productIds,
            },
          },
          include: {
            category: true,
          },
        });

        return groupedData.map((item) => ({
          ...item,
          product: products.find((p) => p.id === item.productId),
        }));
      }),
      // Get recent orders
      prisma.order.findMany({
        take: 5,
        orderBy: {
          orderDate: "desc",
        },
        include: {
          customer: true,
        },
      }),
      // Get trending products
      prisma.$transaction(async (tx) => {
        const groupedItems = await tx.orderItem.groupBy({
          by: ["productId"],
          where: {
            product: {
              isNot: null,
            },
            order: {
              orderDate: {
                gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
              },
            },
          },
          _sum: {
            quantity: true,
          },
        });

        const productIds = groupedItems
          .map((item) => item.productId)
          .filter((id): id is string => id !== null);
        const products = await tx.product.findMany({
          where: {
            id: {
              in: productIds,
            },
          },
        });

        return groupedItems.map((item) => ({
          ...item,
          product: products.find((p) => p.id === item.productId),
        }));
      }),
    ]);

    // Calculate order statistics
    const orderStats = orders.reduce(
      (acc, order) => {
        acc.total++;
        const status = order.status.toLowerCase() as
          | "pending"
          | "processing"
          | "shipped"
          | "delivered";
        if (status in acc) {
          acc[status]++;
        }
        acc.revenue += order.total;
        return acc;
      },
      {
        total: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        revenue: 0,
      }
    );

    // Calculate conversion rate (completed orders / total orders)
    const conversionRate = orders.length
      ? (orders.filter((o) => o.status === "DELIVERED").length /
          orders.length) *
        100
      : 0;

    // Calculate average order value
    const avgOrderValue = orders.length
      ? orderStats.revenue / orders.length
      : 0;

    return NextResponse.json({
      stats: {
        users,
        products,
        ...orderStats,
        conversionRate,
        avgOrderValue,
      },
      monthlyRevenue,
      categorySales,
      recentOrders,
      trendingProducts,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin statistics" },
      { status: 500 }
    );
  }
}
