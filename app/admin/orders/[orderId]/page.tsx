"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Customer,
  OrderItem as PrismaOrderItem,
  Order as PrismaOrder,
  Product,
} from "@prisma/client";

interface OrderItem extends PrismaOrderItem {
  product: Product;
}

interface Order extends PrismaOrder {
  customer: Customer;
  items: OrderItem[];
}

const OrderViewPage = ({ params }: { params: { orderId: string } }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  const router = useRouter();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`/api/orders/${params.orderId}`);
        setOrder(res.data);
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
        status: "PROCESSING",
      });
      setOrder((prev) =>
        prev ? { ...prev, trackingNumber, status: "PROCESSING" } : prev
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
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-8">
        <h1 className="text-3xl font-bold text-gray-800">Order Details</h1>

        {/* Customer Details */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
            Customer Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p>
              <span className="font-medium">Name:</span>{" "}
              {order.customer.firstName} {order.customer.lastName}
            </p>
            <p>
              <span className="font-medium">Email:</span> {order.customer.email}
            </p>
            <p>
              <span className="font-medium">Phone:</span>{" "}
              {order.customer.phoneNumber}
            </p>
            <p>
              <span className="font-medium">Address:</span>{" "}
              {order.customer.addressLine1},{" "}
              {order.customer.addressLine2 &&
                `${order.customer.addressLine2}, `}
              {order.customer.city}, {order.customer.state},{" "}
              {order.customer.postalCode}, {order.customer.country}
            </p>
          </div>
        </section>

        {/* Order Details */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
            Order Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p>
              <span className="font-medium">Order ID:</span> {order.id}
            </p>
            <p>
              <span className="font-medium">Date:</span>{" "}
              {new Date(order.orderDate).toLocaleString()}
            </p>
            <p>
              <span className="font-medium">Status:</span> {order.status}
            </p>
            <p>
              <span className="font-medium">Payment:</span>{" "}
              {order.paymentMethod}
            </p>
            <p>
              <span className="font-medium">Notes:</span> {order.notes || "N/A"}
            </p>
            <p>
              <span className="font-medium">Subtotal:</span> {order.currency}{" "}
              {order.subtotal.toFixed(2)}
            </p>
            <p>
              <span className="font-medium">Shipping:</span> {order.currency}{" "}
              {order.shipping.toFixed(2)}
            </p>
            <p>
              <span className="font-medium">Total:</span> {order.currency}{" "}
              {order.total.toFixed(2)}
            </p>
            {order.trackingNumber && (
              <p>
                <span className="font-medium">Tracking No.:</span>{" "}
                {order.trackingNumber}
              </p>
            )}
            {order.deliveredAt && (
              <p>
                <span className="font-medium">Delivered At:</span>{" "}
                {new Date(order.deliveredAt).toLocaleString()}
              </p>
            )}
          </div>
        </section>

        {/* Tracking Input for Pending */}
        {order.status === "PENDING" && (
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
              Fulfillment
            </h2>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleAccept}
              className="mt-2 inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition"
            >
              Accept & Process
            </button>
          </section>
        )}

        {/* Status Update */}
        {order.status === "PROCESSING" && (
          <div>
            <button
              onClick={() => handleStatusUpdate("SHIPPED")}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition"
            >
              Mark as Shipped
            </button>
          </div>
        )}

        {order.status === "SHIPPED" && (
          <div>
            <button
              onClick={() => handleStatusUpdate("DELIVERED")}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition"
            >
              Mark as Delivered
            </button>
          </div>
        )}

        {/* Delete */}
        <div className="pt-4">
          <button
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg transition"
          >
            Delete Order
          </button>
        </div>

        {/* Order Items */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
            Items
          </h2>
          <div className="overflow-x-auto">
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
        </section>
      </div>
    </div>
  );
};

export default OrderViewPage;
