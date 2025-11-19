"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import OrderToggleButtons from "../common/order-toggle-buttons";

type OrderProps = {
  orderId: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  deliveryFee: number;
  orderDate: string;
  total: number;
  status: string;
};

export default function PendingOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderProps[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Pending + Paid orders
  const fetchOrders = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(`/api/orders?includePendingAndPaid=true`);
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <p>Loading orders...</p>;

  const capitalizeFirstLetter = (word: string) =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

  return (
    <div>
      <OrderToggleButtons status="PENDING" />

      <h1 className="text-2xl font-bold mb-4">Pending & Paid Orders</h1>

      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full table-auto bg-white rounded-lg shadow-md">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium"></th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No pending or paid orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.orderId} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{order.orderId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.name}</td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    Rs. {order.total.toFixed(2)}
                  </td>

                  {/* Status Column: Pending or Paid */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold
                      ${
                        order.status === "PAID"
                          ? "bg-green-200 text-green-700"
                          : "bg-yellow-200 text-yellow-700"
                      }
                    `}
                    >
                      {capitalizeFirstLetter(order.status)}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => router.push(`/dashboard/orders/${order.orderId}`)}
                      className="text-blue-600 hover:underline"
                    >
                      View Order
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
