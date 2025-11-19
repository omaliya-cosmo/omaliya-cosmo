"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiEdit2, FiTrash2, FiSearch, FiRefreshCw } from "react-icons/fi";
import axios from "axios";

const StatusOrdersPage = ({ params }) => {
  const router = useRouter();
  const status = params.orderStatus.toUpperCase(); // PENDING, SHIPPED, etc.

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOrders = () => {
    setLoading(true);

    axios
      .get(`/api/orders?status=${status}`)
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
  }, [status]);

  const filteredOrders = orders.filter((order) =>
    (order.customer?.firstName ?? "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const titleMap = {
    PENDING: "Pending Orders (Pending + Paid)",
    PROCESSING: "Processing Orders",
    SHIPPED: "Shipped Orders",
    CANCELED: "Canceled Orders",
    DELIVERED: "Delivered Orders",
  };

  return (
    <>
      {/* SEARCH BAR AREA */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{titleMap[status]}</h1>

        <div className="flex items-center space-x-4 mt-6">
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Search by customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
            />
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
          </div>

          <button
            onClick={() => setSearchTerm("")}
            className="flex items-center text-gray-600 hover:text-blue-600"
          >
            <FiRefreshCw className="mr-1" /> Reset
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Order Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4">
                      {new Date(order.orderDate).toLocaleString()}
                    </td>

                    <td className="px-6 py-4 capitalize">
                      {order.address.firstName} {order.address.lastName}
                    </td>

                    <td className="px-6 py-4">Rs {order.total.toFixed(2)}</td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === "PAID"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                      >
                        <FiEdit2 className="mr-1" /> View
                      </button>
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

export default StatusOrdersPage;
