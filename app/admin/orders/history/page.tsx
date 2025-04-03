"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiRefreshCw,
} from "react-icons/fi";
import axios from "axios";
import { Customer } from "@prisma/client";

interface Order {
  id: string;
  customerId: string;
  products: { productId: string; quantity: number }[];
  orderDate: string;
  deliveredDate: string; // Add deliveredDate field
  total: number;
}

interface Product {
  id: string;
  name: string;
}

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const router = useRouter();

  const fetchOrders = () => {
    setLoading(true);
    axios
      .get("/api/products")
      .then((res) => {
        setProducts(res.data.products);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    axios
      .get("/api/customers")
      .then((res) => {
        setCustomers(res.data.customers);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    axios
      .get("/api/orders?status=delivered") // Fetch delivered orders
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

  const getProductName = (productId: string) => {
    const product = products.find((product) => product.id === productId);
    return product ? product.name : "";
  };

  const getCustomer = (customerId: string) => {
    const customer = customers.find((customer) => customer.id === customerId);
    return customer;
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Order History</h1>
            <p className="text-gray-600 mt-1">
              View orders that have been delivered
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4 pb-6 border-b">
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Search orders by ID..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        ) : orders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivered Day
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 odd:bg-white even:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        {new Date(order.orderDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                        })}
                      </div>
                      <div>
                        {new Date(order.orderDate).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.products.map((product) => (
                        <div key={product.productId}>
                          {getProductName(product.productId)} -{" "}
                          {product.quantity}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getCustomer(order.customerId)?.firstName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getCustomer(order.customerId)?.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getCustomer(order.customerId)?.phoneNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      Rs {order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(order.deliveredDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                        }
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() =>
                            router.push(`/admin/orders/${order.id}`)
                          }
                          className="text-indigo-600 hover:text-indigo-900 inline-flex items-center mr-4"
                        >
                          <FiEdit2 className="mr-1" size={16} />
                          View
                        </button>
                        <button
                          onClick={() =>
                            alert("Cannot delete delivered orders")
                          }
                          className="text-gray-400 cursor-not-allowed inline-flex items-center"
                        >
                          <FiTrash2 className="mr-1" size={16} />
                          Delete
                        </button>
                      </div>
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

export default OrderHistoryPage;
