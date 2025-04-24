"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { format, parseISO, differenceInDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  Download,
  RefreshCcw,
  Filter,
  ShoppingBag,
  AlertTriangle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

// Using types based on the provided schema
type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "CANCELED"
  | "DELIVERED";
type PaymentMethod = "CASH_ON_DELIVERY" | "PAY_HERE" | "KOKO";
type Currency = "LKR" | "USD";

// Required type definitions based on the schema
type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  registeredAt: Date;
  address?: Address;
  orders: Order[];
};

type Address = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
};

type Order = {
  id: string;
  customerId?: string;
  orderDate: Date;
  deliveredAt?: Date;
  subtotal: number;
  discountAmount: number;
  shipping: number;
  total: number;
  currency: Currency;
  status: OrderStatus;
  notes?: string;
  items: OrderItem[];
  trackingNumber?: string;
  paymentMethod: PaymentMethod;
  addressId: string;
  address: Address;
};

type OrderItem = {
  id: string;
  orderId: string;
  productId?: string;
  product?: Product;
  bundleId?: string;
  bundle?: BundleOffer;
  quantity: number;
  price: number;
  isBundle: boolean;
};

type Product = {
  id: string;
  name: string;
  imageUrls?: string[];
};

type BundleOffer = {
  id: string;
  bundleName: string;
  originalPriceLKR: number;
  originalPriceUSD: number;
  offerPriceLKR: number;
  offerPriceUSD: number;
  endDate: Date;
  stock: number;
  imageUrl?: string;
};

interface ProfileOrdersProps {
  customer: Customer;
}

export default function ProfileOrders({ customer }: ProfileOrdersProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(
    null
  );

  // Filter orders based on active tab and search query
  const filteredOrders = useMemo(() => {
    if (!customer?.orders) {
      return [];
    }

    let result = [...customer.orders];

    // Filter by status tab
    if (activeTab !== "all") {
      result = result.filter(
        (order) => order.status.toLowerCase() === activeTab.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (order) =>
          order.id.toLowerCase().includes(query) ||
          order.items.some((item) => {
            const productName =
              item.product?.name || item.bundle?.bundleName || "";
            return productName.toLowerCase().includes(query);
          })
      );
    }

    // Sort orders
    result = result.sort((a, b) => {
      const dateA = new Date(a.orderDate).getTime();
      const dateB = new Date(b.orderDate).getTime();

      if (sortOrder === "newest") {
        return dateB - dateA;
      } else if (sortOrder === "oldest") {
        return dateA - dateB;
      } else if (sortOrder === "highest") {
        return b.total - a.total;
      } else if (sortOrder === "lowest") {
        return a.total - b.total;
      }
      return 0;
    });

    return result;
  }, [customer?.orders, activeTab, searchQuery, sortOrder]);

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Format date in relative terms
  const formatRelativeDate = (date: Date) => {
    const now = new Date();
    const diffDays = differenceInDays(now, date);

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return format(date, "MMM d, yyyy");
  };

  // Get status details
  const getStatusDetails = (status: OrderStatus) => {
    const statusLower = status.toLowerCase() as
      | "processing"
      | "shipped"
      | "delivered"
      | "canceled"
      | "pending";

    switch (statusLower) {
      case "pending":
        return {
          icon: <Clock className="h-4 w-4" />,
          label: "Pending",
          color: "bg-yellow-50 text-yellow-700 border-yellow-200",
          description: "Your order is pending",
        };
      case "processing":
        return {
          icon: <Clock className="h-4 w-4" />,
          label: "Processing",
          color: "bg-blue-50 text-blue-700 border-blue-200",
          description: "Your order is being processed",
        };
      case "shipped":
        return {
          icon: <Truck className="h-4 w-4" />,
          label: "Shipped",
          color: "bg-amber-50 text-amber-700 border-amber-200",
          description: "Your order is on the way",
        };
      case "delivered":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          label: "Delivered",
          color: "bg-green-50 text-green-700 border-green-200",
          description: "Your order has been delivered",
        };
      case "canceled":
        return {
          icon: <XCircle className="h-4 w-4" />,
          label: "Canceled",
          color: "bg-red-50 text-red-700 border-red-200",
          description: "Your order was canceled",
        };
      default:
        return {
          icon: <Package className="h-4 w-4" />,
          label: "Unknown",
          color: "bg-gray-50 text-gray-700 border-gray-200",
          description: "",
        };
    }
  };

  // Calculate progress for order status
  const calculateStatusProgress = (status: OrderStatus) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "pending":
        return 10;
      case "processing":
        return 25;
      case "shipped":
        return 75;
      case "delivered":
        return 100;
      case "canceled":
        return 100;
      default:
        return 0;
    }
  };

  // Get order status timeline steps
  const getOrderTimeline = (order: Order) => {
    const statusLower = order.status.toLowerCase();

    const steps = [
      { status: "pending", label: "Pending", completed: true },
      {
        status: "processing",
        label: "Processing",
        completed: ["processing", "shipped", "delivered"].includes(statusLower),
      },
      {
        status: "shipped",
        label: "Shipped",
        completed: ["shipped", "delivered"].includes(statusLower),
      },
      {
        status: "delivered",
        label: "Delivered",
        completed: statusLower === "delivered",
      },
    ];

    // Handle canceled orders differently
    if (statusLower === "canceled") {
      return [
        { status: "pending", label: "Pending", completed: true },
        { status: "canceled", label: "Canceled", completed: true },
      ];
    }

    return steps;
  };

  // Find selected order details
  const selectedOrder = useMemo(() => {
    if (!selectedOrderId || !customer?.orders) return null;
    return (
      customer.orders.find((order) => order.id === selectedOrderId) || null
    );
  }, [selectedOrderId, customer?.orders]);

  // View details of an order
  const viewOrderDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  // Reset selected order
  const closeOrderDetails = () => {
    setSelectedOrderId(null);
  };

  // Reorder items from a previous order
  const reorderItems = (orderId: string) => {
    // In a real app, this would add items to cart and redirect
    console.log(`Reordering items from order ${orderId}`);
    alert("Items added to cart! Redirecting to checkout...");
  };

  // Cancel an order
  const cancelOrder = async (orderId: string) => {
    if (
      window.confirm(
        "Are you sure you want to cancel this order? This action cannot be undone."
      )
    ) {
      try {
        setCancellingOrderId(orderId);
        await axios.put(`/api/orders/${orderId}`, {
          status: "CANCELED",
        });

        // Update the order status in the UI
        if (customer?.orders) {
          const updatedOrders = customer.orders.map((order) =>
            order.id === orderId
              ? { ...order, status: "CANCELED" as OrderStatus }
              : order
          );

          // Update customer orders in the parent component
          // This is a simplified approach - in a real app you'd use a proper state management system
          customer.orders = updatedOrders;

          // If the canceled order is the currently selected one, update it
          if (selectedOrderId === orderId) {
            setSelectedOrderId(null);
            setTimeout(() => setSelectedOrderId(orderId), 10); // Re-open with updated state
          }
        }

        alert("Order has been cancelled successfully");
      } catch (error) {
        console.error("Error cancelling order:", error);
        alert(
          "Failed to cancel order. Please try again or contact customer support."
        );
      } finally {
        setCancellingOrderId(null);
      }
    }
  };

  // Get order number from order id
  const getOrderNumber = (orderId: string) => {
    return orderId.substring(orderId.length - 6).toUpperCase();
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle>Your Orders</CardTitle>
          <CardDescription>View and track your recent orders</CardDescription>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              className="pl-9 w-full sm:w-[200px]"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
            />
          </div>

          <Select
            value={sortOrder}
            onValueChange={(value) => {
              setSortOrder(value);
              setCurrentPage(1); // Reset to first page on sort
            }}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="highest">Price: High-Low</SelectItem>
              <SelectItem value="lowest">Price: Low-High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value);
            setCurrentPage(1); // Reset to first page on tab change
          }}
        >
          <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="mb-6 inline-flex min-w-full sm:w-auto">
              <TabsTrigger
                value="all"
                className="flex items-center gap-1 sm:gap-2 py-2"
              >
                <Package className="h-3.5 w-3.5" />
                <span className="whitespace-nowrap text-xs sm:text-sm">
                  All
                </span>
                <span className="ml-1 rounded-full bg-muted px-1.5 sm:px-2 py-0.5 text-xs font-medium">
                  {customer?.orders?.length || 0}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="processing"
                className="flex items-center gap-1 sm:gap-2 py-2"
              >
                <Clock className="h-3.5 w-3.5" />
                <span className="whitespace-nowrap text-xs sm:text-sm">
                  Processing
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="shipped"
                className="flex items-center gap-1 sm:gap-2 py-2"
              >
                <Truck className="h-3.5 w-3.5" />
                <span className="whitespace-nowrap text-xs sm:text-sm">
                  Shipped
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="delivered"
                className="flex items-center gap-1 sm:gap-2 py-2"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                <span className="whitespace-nowrap text-xs sm:text-sm">
                  Delivered
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value={activeTab}
            className="mt-0"
            key={`${activeTab}-${searchQuery}-${sortOrder}-${currentPage}`}
          >
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg overflow-hidden">
                    <div className="p-4 bg-muted/40">
                      <div className="flex justify-between items-center">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-36" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-4 mb-4">
                        <Skeleton className="h-16 w-16 rounded-md" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-full max-w-[180px]" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-md" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-full max-w-[220px]" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                    <div className="p-4 bg-muted/40">
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-9 w-28" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : currentOrders.length > 0 ? (
              <AnimatePresence mode="wait">
                <div className="space-y-6">
                  {currentOrders.map((order) => {
                    const statusDetails = getStatusDetails(order.status);
                    const orderNumber = getOrderNumber(order.id);

                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card
                          className={`border ${
                            order.status === "CANCELED"
                              ? "border-red-200"
                              : order.status === "DELIVERED"
                              ? "border-green-200"
                              : ""
                          }`}
                        >
                          <CardHeader className="p-4 bg-muted/30">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium">
                                    Order #{orderNumber}
                                  </h3>
                                  <Badge
                                    variant="outline"
                                    className={`flex items-center gap-1 ${statusDetails.color}`}
                                  >
                                    {statusDetails.icon}
                                    {statusDetails.label}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  <span>
                                    {formatRelativeDate(order.orderDate)}
                                  </span>
                                  <span className="mx-1.5">•</span>
                                  <span>
                                    {order.items.length} item
                                    {order.items.length !== 1 ? "s" : ""}
                                  </span>
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={() => viewOrderDetails(order.id)}
                              >
                                View Details
                                <ChevronRight className="h-3.5 w-3.5" />
                              </Button>
                            </div>

                            {/* Order progress for non-canceled orders */}
                            {order.status !== "CANCELED" && (
                              <div className="mt-2">
                                <Progress
                                  value={calculateStatusProgress(order.status)}
                                  className="h-1.5"
                                />
                                <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
                                  {getOrderTimeline(order).map((step, idx) => (
                                    <div
                                      key={idx}
                                      className={`flex items-center ${
                                        step.completed ? "text-primary" : ""
                                      }`}
                                    >
                                      {step.completed ? (
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                      ) : (
                                        <div className="h-3 w-3 rounded-full border border-muted-foreground mr-1" />
                                      )}
                                      {step.label}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardHeader>

                          <CardContent className="px-4 py-3">
                            <div className="space-y-3">
                              {order.items.slice(0, 2).map((item) => {
                                const productName = item.isBundle
                                  ? item.bundle?.bundleName || "Bundle"
                                  : item.product?.name || "Product";
                                const imageUrl = item.isBundle
                                  ? item.bundle?.imageUrl
                                  : item.product?.imageUrls?.[0];

                                return (
                                  <div
                                    key={item.id}
                                    className="flex items-center gap-3"
                                  >
                                    <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                                      {imageUrl ? (
                                        <div
                                          className="h-full w-full bg-cover bg-center"
                                          style={{
                                            backgroundImage: `url('${imageUrl}')`,
                                            backgroundColor: "rgba(0,0,0,0.05)",
                                          }}
                                          title={productName}
                                        />
                                      ) : (
                                        <Package className="h-6 w-6 text-muted-foreground/60" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex justify-between">
                                        <p className="font-medium line-clamp-1">
                                          {productName}
                                        </p>
                                        <p className="font-medium">
                                          {order.currency}{" "}
                                          {item.price.toFixed(2)}
                                        </p>
                                      </div>
                                      <div className="flex justify-between">
                                        <div className="text-sm text-muted-foreground">
                                          Qty: {item.quantity}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                          {order.currency}{" "}
                                          {(item.price * item.quantity).toFixed(
                                            2
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}

                              {order.items.length > 2 && (
                                <p className="text-sm text-muted-foreground pt-1">
                                  + {order.items.length - 2} more item(s)
                                </p>
                              )}
                            </div>
                          </CardContent>

                          <CardFooter className="p-4 bg-muted/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Order Total:
                              </p>
                              <p className="text-lg font-semibold">
                                {order.currency} {order.total.toFixed(2)}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2 self-end sm:self-center">
                              {order.status === "PENDING" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 border-red-300 text-red-600 hover:bg-red-50"
                                  onClick={() => cancelOrder(order.id)}
                                  disabled={cancellingOrderId === order.id}
                                >
                                  {cancellingOrderId === order.id ? (
                                    <span className="animate-pulse">
                                      Cancelling...
                                    </span>
                                  ) : (
                                    <>
                                      <XCircle className="h-3.5 w-3.5" />
                                      <span className="whitespace-nowrap">
                                        Cancel Order
                                      </span>
                                    </>
                                  )}
                                </Button>
                              )}

                              {order.status === "DELIVERED" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                                  onClick={() => reorderItems(order.id)}
                                >
                                  <RefreshCcw className="h-3.5 w-3.5" />
                                  <span className="whitespace-nowrap">
                                    Buy Again
                                  </span>
                                </Button>
                              )}

                              {(order.status === "SHIPPED" ||
                                order.status === "DELIVERED") &&
                                order.trackingNumber && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                                    onClick={() =>
                                      window.open(
                                        `https://track.aftership.com/trackings?tracking_number=${order.trackingNumber}`,
                                        "_blank"
                                      )
                                    }
                                  >
                                    <Truck className="h-3.5 w-3.5" />
                                    <span className="whitespace-nowrap">
                                      Track
                                    </span>
                                    <span className="hidden sm:inline">
                                      Shipment
                                    </span>
                                  </Button>
                                )}

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 sm:h-9 px-2 sm:px-3"
                                  >
                                    <Filter className="h-3.5 w-3.5" />
                                    <span className="sr-only">
                                      More options
                                    </span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    className="flex items-center gap-2"
                                    onClick={() =>
                                      window.open(
                                        `/invoice/${order.id}`,
                                        "_blank"
                                      )
                                    }
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                    Download Invoice
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="flex items-center gap-2"
                                    onClick={() =>
                                      (window.location.href = `/orders/${order.id}`)
                                    }
                                  >
                                    <ChevronRight className="h-3.5 w-3.5" />
                                    Order Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="flex items-center gap-2"
                                    onClick={() =>
                                      (window.location.href = "/contact")
                                    }
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                    Report Issue
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>

                      {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                        .filter(
                          (page) =>
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(page - currentPage) <= 1
                        )
                        .map((page, idx, arr) => (
                          <React.Fragment key={page}>
                            {idx > 0 && arr[idx - 1] !== page - 1 && (
                              <span className="text-muted-foreground">...</span>
                            )}
                            <Button
                              variant={
                                currentPage === page ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => paginate(page)}
                            >
                              {page}
                            </Button>
                          </React.Fragment>
                        ))}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          paginate(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-medium mb-2">No orders found</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-sm">
                  {searchQuery
                    ? `We couldn't find any orders matching "${searchQuery}". Try a different search or clear your filter.`
                    : `You haven't placed any ${
                        activeTab !== "all"
                          ? getStatusDetails(
                              activeTab.toUpperCase() as OrderStatus
                            ).label.toLowerCase()
                          : ""
                      } orders yet.`}
                </p>
                {searchQuery ? (
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                ) : (
                  <Link href="/products" passHref>
                    <Button>
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Browse Products
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Order Details Modal */}
      <Dialog
        open={!!selectedOrderId}
        onOpenChange={(open) => !open && closeOrderDetails()}
      >
        <DialogContent className="sm:max-w-4xl">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Order #{getOrderNumber(selectedOrder.id)}
                  <Badge
                    variant="outline"
                    className={`ml-2 ${
                      getStatusDetails(selectedOrder.status).color
                    }`}
                  >
                    {getStatusDetails(selectedOrder.status).icon}
                    <span className="ml-1">
                      {getStatusDetails(selectedOrder.status).label}
                    </span>
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Placed on{" "}
                  {format(new Date(selectedOrder.orderDate), "MMMM d, yyyy")} •
                  {selectedOrder.items.length} item
                  {selectedOrder.items.length !== 1 ? "s" : ""}
                </DialogDescription>
              </DialogHeader>

              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-6 p-1">
                  {/* Order timeline */}
                  {selectedOrder.status !== "CANCELED" &&
                    selectedOrder.trackingNumber && (
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          Tracking Information
                        </h4>
                        <p className="text-sm">
                          <span className="text-muted-foreground">
                            Tracking Number:
                          </span>{" "}
                          <span className="font-medium">
                            {selectedOrder.trackingNumber}
                          </span>
                        </p>

                        {selectedOrder.deliveredAt && (
                          <p className="text-sm mt-1">
                            <span className="text-muted-foreground">
                              Delivered on:
                            </span>{" "}
                            <span className="font-medium">
                              {format(
                                selectedOrder.deliveredAt,
                                "MMMM d, yyyy"
                              )}
                            </span>
                          </p>
                        )}

                        <Button
                          variant="link"
                          size="sm"
                          className="px-0 py-1 mt-2"
                          onClick={() =>
                            window.open(
                              `https://track.aftership.com/trackings?tracking_number=${selectedOrder.trackingNumber}`,
                              "_blank"
                            )
                          }
                        >
                          Track your package
                          <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </div>
                    )}

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Order Items */}
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-muted/40 px-4 py-2 border-b">
                        <h3 className="font-medium">
                          Items ({selectedOrder.items.length})
                        </h3>
                      </div>
                      <div className="p-4 space-y-4">
                        {selectedOrder.items.map((item) => {
                          const productName = item.isBundle
                            ? item.bundle?.bundleName || "Bundle"
                            : item.product?.name || "Product";
                          const imageUrl = item.isBundle
                            ? item.bundle?.imageUrl
                            : item.product?.imageUrls?.[0];

                          return (
                            <div key={item.id} className="flex gap-3">
                              <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                                {imageUrl ? (
                                  <div
                                    className="h-full w-full bg-cover bg-center"
                                    style={{
                                      backgroundImage: `url('${imageUrl}')`,
                                      backgroundColor: "rgba(0,0,0,0.05)",
                                    }}
                                    title={productName}
                                  />
                                ) : (
                                  <Package className="h-6 w-6 text-muted-foreground/60" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <p className="font-medium">{productName}</p>
                                  <p className="font-medium">
                                    {selectedOrder.currency}{" "}
                                    {item.price.toFixed(2)}
                                  </p>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Qty: {item.quantity}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="bg-muted/40 p-4 border-t">
                        <div className="flex justify-between mb-1">
                          <p className="text-sm">Subtotal</p>
                          <p className="font-medium">
                            {selectedOrder.currency}{" "}
                            {selectedOrder.subtotal.toFixed(2)}
                          </p>
                        </div>
                        {selectedOrder.discountAmount > 0 && (
                          <div className="flex justify-between mb-1">
                            <p className="text-sm">Discount</p>
                            <p className="font-medium text-green-600">
                              -{selectedOrder.currency}{" "}
                              {selectedOrder.discountAmount.toFixed(2)}
                            </p>
                          </div>
                        )}
                        <div className="flex justify-between mb-1">
                          <p className="text-sm">Shipping</p>
                          <p className="font-medium">
                            {selectedOrder.currency}{" "}
                            {selectedOrder.shipping.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex justify-between pt-2 border-t mt-2">
                          <p className="font-medium">Total</p>
                          <p className="font-medium">
                            {selectedOrder.currency}{" "}
                            {selectedOrder.total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Details & Shipping */}
                    <div className="space-y-4">
                      {/* Payment Info */}
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted/40 px-4 py-2 border-b">
                          <h3 className="font-medium">Payment Information</h3>
                        </div>
                        <div className="p-4">
                          <p className="mb-1 text-sm">
                            <span className="text-muted-foreground">
                              Method:
                            </span>{" "}
                            <span className="font-medium capitalize">
                              {selectedOrder.paymentMethod
                                ?.replace("_", " ")
                                .toLowerCase()}
                            </span>
                          </p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">Date:</span>{" "}
                            <span className="font-medium">
                              {format(
                                new Date(selectedOrder.orderDate),
                                "MMMM d, yyyy"
                              )}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted/40 px-4 py-2 border-b">
                          <h3 className="font-medium">Shipping Address</h3>
                        </div>
                        <div className="p-4">
                          <p className="font-medium">
                            {selectedOrder.address.firstName}{" "}
                            {selectedOrder.address.lastName}
                          </p>
                          <p className="text-sm">
                            {selectedOrder.address.addressLine1}
                          </p>
                          {selectedOrder.address.addressLine2 && (
                            <p className="text-sm">
                              {selectedOrder.address.addressLine2}
                            </p>
                          )}
                          <p className="text-sm">
                            {selectedOrder.address.city}
                            {selectedOrder.address.state
                              ? `, ${selectedOrder.address.state}`
                              : ""}{" "}
                            {selectedOrder.address.postalCode}
                          </p>
                          <p className="text-sm">
                            {selectedOrder.address.country}
                          </p>
                          {selectedOrder.address.phoneNumber && (
                            <p className="text-sm mt-1">
                              Phone: {selectedOrder.address.phoneNumber}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Additional Actions */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {selectedOrder.status === "PENDING" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1.5 border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => cancelOrder(selectedOrder.id)}
                            disabled={cancellingOrderId === selectedOrder.id}
                          >
                            <XCircle className="h-4 w-4" />
                            {cancellingOrderId === selectedOrder.id
                              ? "Cancelling..."
                              : "Cancel Order"}
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1.5"
                          onClick={() =>
                            window.open(
                              `/invoice/${selectedOrder.id}`,
                              "_blank"
                            )
                          }
                        >
                          <Download className="h-4 w-4" />
                          Download Invoice
                        </Button>

                        {selectedOrder.status === "DELIVERED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1.5"
                            onClick={() => reorderItems(selectedOrder.id)}
                          >
                            <RefreshCcw className="h-4 w-4" />
                            Reorder
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1.5"
                          onClick={() => (window.location.href = "/contact")}
                        >
                          <XCircle className="h-4 w-4" />
                          Report Issue
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter>
                <Button variant="outline" onClick={closeOrderDetails}>
                  Close
                </Button>

                {selectedOrder.trackingNumber &&
                  selectedOrder.status !== "CANCELED" && (
                    <Button
                      onClick={() =>
                        window.open(
                          `https://track.aftership.com/trackings?tracking_number=${selectedOrder.trackingNumber}`,
                          "_blank"
                        )
                      }
                      className="gap-2"
                    >
                      <Truck className="h-4 w-4" />
                      Track Order
                    </Button>
                  )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
