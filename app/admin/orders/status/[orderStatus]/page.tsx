"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiEdit2, FiTrash2, FiSearch, FiRefreshCw } from "react-icons/fi";
import axios from "axios";
import {
  Customer,
  Order as PrismaOrder,
  Product,
  OrderItem as PrismaOrderItem,
} from "@prisma/client";

interface OrderItem extends PrismaOrderItem {
  product: Product;
}

interface Order extends PrismaOrder {
  customer: Customer;
  items: OrderItem[];
}

const OrdersPage = ({ params }: { params: { orderStatus: string } }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("order_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const router = useRouter();
  const status = params.orderStatus.toUpperCase() || "PROCESSING";

  const fetchOrders = () => {
    setLoading(true);
    axios
      .get(`/api/orders?status=${status}`)
      .then((res) => {
        setOrders(res.data.orders);
        console.log("status", status);
        console.log("orders", res.data.orders);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [status]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete order");

      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete order");
    }
  };

  const filteredOrders = orders
    .filter((order) =>
      (order.customer?.firstName ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === "order_date") {
        return sortDirection === "asc"
          ? new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()
          : new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
      } else if (sortField === "total") {
        return sortDirection === "asc" ? a.total - b.total : b.total - a.total;
      }
      return 0;
    });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const titleMap: Record<string, string> = {
    PENDING: "Pending Orders",
    PROCESSING: "Processing Orders",
    SHIPPED: "Shipped Orders",
    CANCELED: "Canceled Orders",
    DELIVERED: "Delivered Orders",
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {titleMap[status]}
            </h1>
            <p className="text-gray-600 mt-1">
              Manage orders with status: {status}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4 pb-6 border-b">
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Search by customer name..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>
          <button
            onClick={() => setSearchTerm("")}
            className="flex items-center text-gray-600 hover:text-blue-600 py-2"
          >
            <FiRefreshCw className="mr-2" size={16} />
            Reset
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    onClick={() => handleSort("order_date")}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                  >
                    <div className="flex items-center">
                      Order Date
                      {sortField === "order_date" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  {status === "DELIVERED" && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Delivered At
                    </th>
                  )}
                  {(status === "SHIPPED" || status === "PROCESSING") && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tracking No
                    </th>
                  )}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(order.orderDate).toLocaleDateString()} <br />
                      {new Date(order.orderDate).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.items.map((item) => (
                        <div key={item.id}>
                          {item.product.name} x {item.quantity}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.customer.firstName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.customer.phoneNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      Rs {order.total.toFixed(2)}
                    </td>
                    {status === "DELIVERED" && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.deliveredAt
                          ? new Date(order.deliveredAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                    )}
                    {(status === "SHIPPED" || status === "PROCESSING") && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.trackingNumber || "N/A"}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                      >
                        <FiEdit2 className="mr-1" size={16} />
                        View
                      </button>
                      {status !== "DELIVERED" && status !== "CANCELED" && (
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="text-red-600 hover:text-red-900 flex items-center mt-2"
                        >
                          <FiTrash2 className="mr-1" size={16} />
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default OrdersPage;
