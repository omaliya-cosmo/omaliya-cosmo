"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Customer,
  OrderItem as PrismaOrderItem,
  Order as PrismaOrder,
  Product,
  BundleOffer,
  Address,
} from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OrderItem extends PrismaOrderItem {
  product?: Product;
  bundle?: BundleOffer;
}

interface Order extends PrismaOrder {
  customer?: Customer;
  items: OrderItem[];
  address: Address;
}

const OrderViewPage = ({ params }: { params: { orderId: string } }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [contactMethod, setContactMethod] = useState<string>("");
  const [isPaymentSlipOpen, setIsPaymentSlipOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`/api/orders/${params.orderId}`);
        setOrder(res.data);

        // Set default contact method to "phone" if available, otherwise "email"
        if (res.data.address.phoneNumber) {
          setContactMethod("phone");
        } else if (res.data.address.email) {
          setContactMethod("email");
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to fetch order details");
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.orderId]);

  const handleAccept = async () => {
    if (!trackingNumber) {
      alert("Please enter a tracking number.");
      return;
    }

    try {
      await axios.put(`/api/orders/${order?.id}`, {
        trackingNumber,
        contactMethod,
        status: "PROCESSING",
      });
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              trackingNumber,
              status: "PROCESSING",
              contactMethod,
            }
          : prev
      );
      alert("Order accepted successfully.");
    } catch (err) {
      alert("Failed to accept the order.");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/orders/${order?.id}`);
      alert("Order deleted successfully.");
      router.push("/admin/orders");
    } catch (err) {
      alert("Failed to delete the order.");
    }
  };

  const handleStatusUpdate = async (newStatus: Order["status"]) => {
    try {
      const updateData: Partial<Order> = { status: newStatus };
      if (newStatus === "DELIVERED") {
        updateData.deliveredAt = new Date();
      }

      await axios.put(`/api/orders/${order?.id}`, updateData);
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus as Order["status"],
              deliveredAt:
                newStatus === "DELIVERED" ? new Date() : prev.deliveredAt,
            }
          : prev
      );
      alert(`Order status updated to ${newStatus}.`);
    } catch (err) {
      alert(`Failed to update the order status to ${newStatus}.`);
    }
  };

  const handleOpenPaymentSlip = () => {
    setIsPaymentSlipOpen(true);
  };

  const handleClosePaymentSlip = () => {
    setIsPaymentSlipOpen(false);
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  if (!order) {
    return <div className="p-6 text-center text-gray-500">Order not found</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-2 sm:p-4 md:p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Order Details
        </h1>

        {/* Customer Details */}
        <section className="space-y-2">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700 border-b pb-2">
            Customer Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm sm:text-base">
            <p className="break-words">
              <span className="font-bold">Name:</span> {order.address.firstName}{" "}
              {order.address.lastName}
            </p>
            <p className="break-words">
              <span className="font-bold">Email:</span> {order.address.email}
            </p>
            <p className="break-words">
              <span className="font-bold">Phone:</span>{" "}
              {order.address.phoneNumber}
            </p>
            <p className="break-words col-span-1 md:col-span-2">
              <span className="font-bold">Address:</span>{" "}
              {order.address.addressLine1},{" "}
              {order.address.addressLine2 && `${order.address.addressLine2}, `}
              {order.address.city}, {order.address.state},{" "}
              {order.address.postalCode}, {order.address.country}
            </p>
            <p>
              <span className="font-bold">Is Registered:</span>{" "}
              {order.customer ? (
                <span className="bg-blue-300 p-1 px-2 text-sm rounded-sm">
                  Registered
                </span>
              ) : (
                "No"
              )}
            </p>
          </div>
        </section>

        {/* Order Details */}
        <section className="space-y-2">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700 border-b pb-2">
            Order Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm sm:text-base">
            <p className="break-words">
              <span className="font-bold">Order ID:</span> {order.id}
            </p>
            <p>
              <span className="font-bold">Date:</span>{" "}
              {new Date(order.orderDate).toLocaleString()}
            </p>
            <p>
              <span className="font-bold">Status:</span> {order.status}
            </p>
            <p className="flex flex-wrap items-center gap-2">
              <span className="font-bold">Payment:</span> {order.paymentMethod}{" "}
              {order.paymentMethod === "BANK_TRANSFER" && order.paymentSlip && (
                <button
                  onClick={() => setIsPaymentSlipOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 text-xs rounded-md transition"
                >
                  View Payment Slip
                </button>
              )}
            </p>
            <p className="col-span-1 sm:col-span-2">
              <span className="font-bold">Notes:</span> {order.notes || "N/A"}
            </p>
            <p>
              <span className="font-bold">Subtotal:</span> {order.currency}{" "}
              {order.subtotal.toFixed(2)}
            </p>
            <p>
              <span className="font-bold">Shipping:</span> {order.currency}{" "}
              {order.shipping.toFixed(2)}
            </p>
            <p>
              <span className="font-bold">Total:</span> {order.currency}{" "}
              {order.total.toFixed(2)}
            </p>
            {order.trackingNumber && (
              <p className="break-words col-span-1 sm:col-span-2">
                <span className="font-bold">Tracking No.:</span>{" "}
                {order.trackingNumber}
              </p>
            )}
            {order.deliveredAt && (
              <p>
                <span className="font-bold">Delivered At:</span>{" "}
                {new Date(order.deliveredAt).toLocaleString()}
              </p>
            )}
          </div>
        </section>

        {/* Tracking Input for Pending and Paid */}
        {(order.status === "PENDING" || order.status === "PAID") && (
          <section className="space-y-2">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700 border-b pb-2">
              Fulfillment
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                className="w-full sm:basis-6/12 border rounded-lg sm:rounded-l-lg sm:rounded-r-none px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <select
                value={contactMethod}
                onChange={(e) => setContactMethod(e.target.value)}
                className="w-full sm:basis-3/12 border rounded-lg sm:rounded-none px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {order.address.email && (
                  <option value="email">Send via Email</option>
                )}
                {order.address.phoneNumber && (
                  <option value="phone">Send via Phone</option>
                )}
              </select>
              <button
                onClick={handleAccept}
                className="w-full sm:basis-3/12 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg sm:rounded-l-none sm:rounded-r-lg transition"
              >
                Accept
              </button>
            </div>
          </section>
        )}

        {/* Status Update */}
        {order.status === "PROCESSING" && (
          <div className="flex justify-center sm:justify-start">
            <button
              onClick={() => handleStatusUpdate("SHIPPED")}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition"
            >
              Mark as Shipped
            </button>
          </div>
        )}

        {order.status === "SHIPPED" && (
          <div className="flex justify-center sm:justify-start">
            <button
              onClick={() => handleStatusUpdate("DELIVERED")}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition"
            >
              Mark as Delivered
            </button>
          </div>
        )}

        {/* Order Items */}
        <section className="space-y-2">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700 border-b pb-2">
            Items
          </h2>

          {/* Desktop View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Quantity</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 flex items-center space-x-3">
                      {item.product && (
                        <>
                          <img
                            src={item.product.imageUrls[0]}
                            alt={item.product.name}
                            className="w-10 h-10 rounded"
                          />
                          <div>
                            <div className="font-medium text-gray-800">
                              {item.product.name}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {item.product.description}
                            </div>
                          </div>
                        </>
                      )}
                      {item.bundle && (
                        <>
                          <img
                            src={item.bundle.imageUrl || ""}
                            alt={item.bundle.bundleName}
                            className="w-10 h-10 rounded"
                          />
                          <div>
                            <div className="font-medium text-gray-800">
                              {item.bundle.bundleName}
                            </div>
                            <div className="text-gray-500 text-xs">Bundle</div>
                          </div>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4">{item.quantity}</td>
                    <td className="px-6 py-4">
                      {order.currency} {item.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {order.currency} {(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View - Card Layout */}
          <div className="sm:hidden space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-3 space-y-2 bg-white shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  {item.product && (
                    <>
                      <img
                        src={item.product.imageUrls[0]}
                        alt={item.product.name}
                        className="w-12 h-12 rounded"
                      />
                      <div>
                        <div className="font-medium text-gray-800">
                          {item.product.name}
                        </div>
                        <div className="text-gray-500 text-xs line-clamp-1">
                          {item.product.description}
                        </div>
                      </div>
                    </>
                  )}
                  {item.bundle && (
                    <>
                      <img
                        src={item.bundle.imageUrl || ""}
                        alt={item.bundle.bundleName}
                        className="w-12 h-12 rounded"
                      />
                      <div>
                        <div className="font-medium text-gray-800">
                          {item.bundle.bundleName}
                        </div>
                        <div className="text-gray-500 text-xs">Bundle</div>
                      </div>
                    </>
                  )}
                </div>
                <div className="grid grid-cols-3 text-sm pt-2 border-t">
                  <div>
                    <span className="text-gray-500">Quantity:</span>
                    <p className="font-medium">{item.quantity}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Price:</span>
                    <p className="font-medium">
                      {order.currency} {item.price.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Total:</span>
                    <p className="font-medium">
                      {order.currency} {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* Delete */}
        <div className="w-full flex justify-center sm:justify-end">
          <button
            onClick={handleDelete}
            className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg transition"
          >
            Delete Order
          </button>
        </div>
      </div>

      {/* Payment Slip Dialog */}
      <Dialog open={isPaymentSlipOpen} onOpenChange={setIsPaymentSlipOpen}>
        <DialogContent className="w-[90vw] max-w-3xl p-3 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-center">Payment Slip</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center overflow-auto">
            {order.paymentSlip && (
              <img
                src={order.paymentSlip}
                alt="Payment Slip"
                className="max-h-[70vh] max-w-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderViewPage;
