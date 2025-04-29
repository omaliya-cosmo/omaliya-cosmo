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
  Address,
  BundleOffer,
} from "@prisma/client";

interface OrderItem extends PrismaOrderItem {
  product: Product;
  bundle: BundleOffer;
}

interface Order extends PrismaOrder {
  customer?: Customer;
  items: OrderItem[];
  address: Address;
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("order_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const router = useRouter();

  const fetchOrders = () => {
    setLoading(true);
    axios
      .get(`/api/orders`)
      .then((res) => {
        setOrders(res.data.orders);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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
    .filter(
      (order) =>
        (order.address?.firstName ?? "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (order.address?.phoneNumber ?? "")
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

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
            <p className="text-gray-600 mt-1">Manage orders every status</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4 pb-6 border-b">
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Search by customer / phone number..."
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
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Items
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Phone/Email
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Other
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm">
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(order.orderDate).toLocaleDateString()} <br />
                      {new Date(order.orderDate).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {order.items.map((item) => (
                        <div key={item.id}>
                          {item.isBundle && item.bundle
                            ? `Bundle: ${item.bundle.bundleName} x ${item.quantity}`
                            : item.product
                            ? `${item.product.name} x ${item.quantity}`
                            : "Unknown Item"}
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap capitalize">
                      {order.address.firstName} {order.address.lastName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {order.address.phoneNumber || order.address.email}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      Rs {order.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "PROCESSING"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "SHIPPED"
                            ? "bg-purple-100 text-purple-800"
                            : order.status === "DELIVERED"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {order.status === "DELIVERED"
                        ? order.deliveredAt
                          ? new Date(order.deliveredAt).toLocaleDateString()
                          : ""
                        : order.status === "SHIPPED" ||
                          order.status === "PROCESSING"
                        ? order.trackingNumber || ""
                        : ""}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                      >
                        <FiEdit2 className="mr-1" size={16} />
                        View
                      </button>
                      {order.status !== "DELIVERED" &&
                        order.status !== "CANCELED" && (
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
