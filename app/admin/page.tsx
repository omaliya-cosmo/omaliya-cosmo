"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiUsers,
  FiPackage,
  FiShoppingCart,
  FiPlus,
  FiList,
  FiDollarSign,
  FiBarChart2,
  FiTrendingUp,
  FiCalendar,
  FiBell,
  FiAlertCircle,
  FiChevronRight,
  FiClock,
  FiRefreshCw,
  FiCheck,
} from "react-icons/fi";
import Link from "next/link";

interface Stats {
  users: number;
  products: number;
  orders: number;
  revenue?: number;
}

interface RecentActivity {
  id: string;
  action: string;
  user: string;
  time: string;
  type: "order" | "user" | "product";
}

interface TrendingProduct {
  id: string;
  name: string;
  sales: number;
  change: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    users: 0,
    products: 0,
    orders: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<TrendingProduct[]>(
    []
  );
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState("7");
  const router = useRouter();

  // Get current date and time for dashboard header
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Dynamic greeting based on time of day
  const hours = currentDate.getHours();
  const greeting =
    hours < 12
      ? "Good Morning"
      : hours < 18
      ? "Good Afternoon"
      : "Good Evening";

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Replace with actual API endpoints
      const [usersRes, productsRes] = await Promise.all([
        fetch("/api/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        fetch("/api/products", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
      ]);

      if (!usersRes.ok || !productsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const users = await usersRes.json();
      const products = await productsRes.json();

      // Mock data for demonstration
      setStats({
        users: users.length,
        products: products.length,
        orders: 25, // Mock data
        revenue: 7890, // Mock data
      });

      // Mock recent activity
      setActivities([
        {
          id: "1",
          action: "New order placed",
          user: "John Smith",
          time: "10 min ago",
          type: "order",
        },
        {
          id: "2",
          action: "New user registered",
          user: "Maria Garcia",
          time: "1 hour ago",
          type: "user",
        },
        {
          id: "3",
          action: "Product updated",
          user: "Admin",
          time: "3 hours ago",
          type: "product",
        },
        {
          id: "4",
          action: "Order completed",
          user: "Sarah Johnson",
          time: "5 hours ago",
          type: "order",
        },
      ]);

      // Mock trending products
      setTrendingProducts([
        { id: "1", name: "Wireless Headphones", sales: 58, change: 12 },
        { id: "2", name: "Smart Watch", sales: 43, change: -5 },
        { id: "3", name: "Laptop Sleeve", sales: 29, change: 8 },
        { id: "4", name: "Phone Case", sales: 24, change: 2 },
      ]);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setTimeout(() => setRefreshing(false), 600); // Minimum time to show refresh animation
  };

  // Helper function to get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "order":
        return <FiShoppingCart className="text-orange-500" />;
      case "user":
        return <FiUsers className="text-blue-500" />;
      case "product":
        return <FiPackage className="text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Header section with welcome message and date */}
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {greeting}, Admin
          </h1>
          <p className="text-gray-600 mt-1 flex items-center">
            <FiCalendar className="mr-2" /> {formattedDate}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="mt-4 md:mt-0 flex items-center text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg"
        >
          <FiRefreshCw className={`mr-2 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* Alerts or system messages */}
      <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <FiAlertCircle className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <span className="font-medium">Attention:</span> 5 products are low
              in stock.
              <Link
                href="/admin/inventory"
                className="ml-2 font-medium underline"
              >
                View inventory
              </Link>
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Main stats section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Users"
              value={stats.users}
              icon={<FiUsers className="text-blue-500" />}
              change="+12%"
              onClick={() => router.push("/admin/users")}
              description="Active user accounts"
            />
            <StatsCard
              title="Products"
              value={stats.products}
              icon={<FiPackage className="text-green-500" />}
              change="+5%"
              onClick={() => router.push("/admin/products")}
              description="Items in inventory"
            />
            <StatsCard
              title="Orders"
              value={stats.orders}
              icon={<FiShoppingCart className="text-orange-500" />}
              change="+18%"
              onClick={() => router.push("/admin/orders")}
              description="Total orders received"
            />
            <StatsCard
              title="Revenue"
              value={stats.revenue || 0}
              prefix="$"
              icon={<FiDollarSign className="text-purple-500" />}
              change="+24%"
              onClick={() => router.push("/admin/reports")}
              description="Monthly revenue"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Performance Summary */}
            <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Performance Overview
                </h2>
                <select
                  className="text-sm border rounded px-3 py-2 bg-white"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                </select>
              </div>

              {/* Enhanced chart placeholder */}
              <div className="h-64 bg-gray-50 rounded-lg overflow-hidden relative">
                {/* Simulated chart background */}
                <div className="absolute inset-0 flex items-end p-4">
                  <div className="w-1/7 h-20 bg-blue-200 rounded-t-sm mx-1 opacity-70"></div>
                  <div className="w-1/7 h-28 bg-blue-300 rounded-t-sm mx-1 opacity-70"></div>
                  <div className="w-1/7 h-16 bg-blue-200 rounded-t-sm mx-1 opacity-70"></div>
                  <div className="w-1/7 h-40 bg-blue-400 rounded-t-sm mx-1 opacity-70"></div>
                  <div className="w-1/7 h-32 bg-blue-300 rounded-t-sm mx-1 opacity-70"></div>
                  <div className="w-1/7 h-24 bg-blue-200 rounded-t-sm mx-1 opacity-70"></div>
                  <div className="w-1/7 h-48 bg-blue-500 rounded-t-sm mx-1 opacity-70"></div>
                </div>

                {/* Chart overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <FiBarChart2 className="h-16 w-16 text-blue-500 mb-3 opacity-20" />
                  <div className="text-center px-4">
                    <p className="text-lg font-bold text-gray-700">
                      Sales Increase
                    </p>
                    <p className="text-3xl font-bold text-blue-600 mt-1 mb-2">
                      18.2%
                    </p>
                    <p className="text-sm text-gray-500">
                      compared to previous period
                    </p>
                  </div>
                </div>
              </div>

              {/* Key metrics */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase">
                    Avg. Order Value
                  </p>
                  <p className="text-xl font-bold text-gray-800 mt-1">$78.50</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase">
                    Conversion Rate
                  </p>
                  <p className="text-xl font-bold text-gray-800 mt-1">3.8%</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase">
                    Cart Abandonment
                  </p>
                  <p className="text-xl font-bold text-gray-800 mt-1">24.3%</p>
                </div>
              </div>
            </div>

            {/* Trending Products */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Trending Products
              </h2>
              <div className="space-y-4">
                {trendingProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex items-start">
                      <div className="mr-3 bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-xs">
                        #{product.id}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.sales} sold this week
                        </p>
                      </div>
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        product.change > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {product.change > 0
                        ? `+${product.change}%`
                        : `${product.change}%`}
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                onClick={() => router.push("/admin/reports/trends")}
              >
                View full report
                <FiChevronRight className="ml-1" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {activity.action}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>{activity.user}</span>
                        <span className="mx-1">•</span>
                        <span className="flex items-center">
                          <FiClock className="mr-1" size={12} />
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                onClick={() => router.push("/admin/activity")}
              >
                View all activity
                <FiChevronRight className="ml-1" />
              </button>
            </div>

            {/* To-Do List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Tasks
              </h2>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded text-blue-500"
                  />
                  <p className="ml-3 text-sm text-gray-700">
                    Approve new product submissions
                  </p>
                  <span className="ml-auto bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                    Urgent
                  </span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded text-blue-500"
                  />
                  <p className="ml-3 text-sm text-gray-700">
                    Review customer feedback
                  </p>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded text-blue-500"
                    checked
                    disabled
                  />
                  <p className="ml-3 text-sm text-gray-400 line-through">
                    Update product descriptions
                  </p>
                  <span className="ml-auto flex items-center text-green-600 text-xs">
                    <FiCheck className="mr-1" />
                    Done
                  </span>
                </div>
              </div>
              <button className="mt-4 w-full py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                Add New Task
              </button>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                System Status
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm">Website</span>
                  </div>
                  <span className="text-xs text-green-600 font-medium">
                    Operational
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm">Database</span>
                  </div>
                  <span className="text-xs text-green-600 font-medium">
                    Operational
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                    <span className="text-sm">API</span>
                  </div>
                  <span className="text-xs text-yellow-600 font-medium">
                    Degraded Performance
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm">Payment Gateway</span>
                  </div>
                  <span className="text-xs text-green-600 font-medium">
                    Operational
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Last updated: Today at {currentDate.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Quick Actions
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
              <ActionButton
                title="Add New Product"
                icon={<FiPlus />}
                onClick={() => router.push("/admin/products/new")}
                color="blue"
              />
              <ActionButton
                title="View Orders"
                icon={<FiList />}
                onClick={() => router.push("/admin/orders")}
                color="orange"
              />
              <ActionButton
                title="Manage Users"
                icon={<FiUsers />}
                onClick={() => router.push("/admin/users")}
                color="green"
              />
              <ActionButton
                title="Sales Report"
                icon={<FiTrendingUp />}
                onClick={() => router.push("/admin/reports")}
                color="purple"
              />
            </div>
          </div>
        </>
      )}

      {/* Dashboard footer with key information */}
      <div className="mt-8 text-xs text-gray-500 flex justify-between items-center">
        <div>Last login: Today at 9:42 AM • IP: 192.168.1.1</div>
        <div>System Version: 1.0.3</div>
      </div>
    </>
  );
};

// StatsCard and ActionButton components remain the same
interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  change?: string;
  prefix?: string;
  description?: string;
  onClick: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  change,
  prefix = "",
  description,
  onClick,
}) => (
  <div
    className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow"
    onClick={onClick}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="text-gray-600 font-medium">{title}</div>
      <div className="text-2xl">{icon}</div>
    </div>
    <div className="text-3xl font-bold text-gray-800 mb-1">
      {prefix}
      {value?.toLocaleString()}
    </div>
    {change && (
      <div className="flex items-center">
        <span
          className={`text-sm ${
            change.startsWith("+") ? "text-green-500" : "text-red-500"
          }`}
        >
          {change}
        </span>
        <span className="text-xs text-gray-500 ml-2">vs last month</span>
      </div>
    )}
    {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
  </div>
);

interface ActionButtonProps {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: "blue" | "green" | "orange" | "purple";
}

const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  icon,
  onClick,
  color,
}) => {
  const colorClasses = {
    blue: "bg-blue-500 hover:bg-blue-600",
    green: "bg-green-500 hover:bg-green-600",
    orange: "bg-orange-500 hover:bg-orange-600",
    purple: "bg-purple-500 hover:bg-purple-600",
  };

  return (
    <button
      onClick={onClick}
      className={`${colorClasses[color]} text-white font-medium py-3 px-4 rounded-lg transition-colors w-full flex items-center justify-center`}
    >
      <span className="mr-2">{icon}</span>
      {title}
    </button>
  );
};

export default Dashboard;