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
  FiTrendingUp,
  FiCalendar,
  FiBell,
  FiAlertCircle,
  FiChevronRight,
  FiClock,
  FiRefreshCw,
  FiCheck,
  FiBarChart2,
  FiPieChart,
  FiActivity,
  FiGift,
  FiStar,
  FiPercent,
  FiSettings,
} from "react-icons/fi";
import Link from "next/link";
import axios from "axios";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const lineChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(0, 0, 0, 0.05)",
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
  elements: {
    line: {
      tension: 0.4,
    },
  },
};

interface Stats {
  users: number;
  products: number;
  orders: number;
  revenue?: number;
  pending?: number;
  processing?: number;
  shipped?: number;
  delivered?: number;
  conversionRate?: number;
  avgOrderValue?: number;
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

const calculateChange = (currentValue: number) => {
  const randomChange = Math.floor(Math.random() * 21) - 10; // -10 to +10
  return randomChange;
};

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
  const [salesData, setSalesData] = useState<any>(null);
  const [categoryData, setCategoryData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hours = currentDate.getHours();
  const greeting =
    hours < 12
      ? "Good Morning"
      : hours < 18
      ? "Good Afternoon"
      : "Good Evening";

  const generateSalesData = (monthlyRevenue: any[]) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const currentMonth = new Date().getMonth();
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const monthIndex = (currentMonth - i + 12) % 12;
      return months[monthIndex];
    }).reverse();

    const revenueMap = new Map(
      monthlyRevenue.map((item) => [
        new Date(item.orderDate).getMonth(),
        item._sum.total || 0,
      ])
    );

    const data = last6Months.map((_, index) => {
      const monthIndex = (currentMonth - (5 - index) + 12) % 12;
      return revenueMap.get(monthIndex) || 0;
    });

    return {
      labels: last6Months,
      datasets: [
        {
          label: "Revenue (LKR)",
          data: data,
          borderColor: "rgb(99, 102, 241)",
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          fill: true,
        },
      ],
    };
  };

  const generateCategoryData = (categorySales: any[]) => {
    const categoryMap = categorySales.reduce((acc, item) => {
      const categoryName = item.product.category.name;
      acc[categoryName] = (acc[categoryName] || 0) + (item._sum.quantity || 0);
      return acc;
    }, {});

    return {
      labels: Object.keys(categoryMap),
      datasets: [
        {
          label: "Sales by Category",
          data: Object.values(categoryMap),
          backgroundColor: [
            "rgba(99, 102, 241, 0.8)",
            "rgba(168, 85, 247, 0.8)",
            "rgba(236, 72, 153, 0.8)",
            "rgba(249, 168, 212, 0.8)",
            "rgba(216, 180, 254, 0.8)",
          ],
        },
      ],
    };
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/admin/stats");
      const {
        stats,
        recentOrders,
        trendingProducts,
        categorySales,
        monthlyRevenue,
      } = response.data;

      setStats(stats);
      setActivities(
        recentOrders.map((order: any) => ({
          id: order.id,
          action: `New order #${order.id}`,
          user: order.customer
            ? `${order.customer.firstName} ${order.customer.lastName}`
            : "Guest User",
          time: new Date(order.orderDate).toLocaleString(),
          type: "order",
        }))
      );

      setTrendingProducts(
        trendingProducts.map((item: any) => ({
          id: item.productId,
          name: item.product.name,
          sales: item._sum.quantity,
          change: calculateChange(item._sum.quantity),
        }))
      );

      setSalesData(generateSalesData(monthlyRevenue));
      setCategoryData(generateCategoryData(categorySales));
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setTimeout(() => setRefreshing(false), 600);
  };

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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Pending Orders"
              value={stats.pending || 0}
              icon={<FiClock className="text-yellow-500" />}
              change={`${(
                ((stats.pending || 0) / (stats.orders || 1)) *
                100
              ).toFixed(1)}%`}
              onClick={() => router.push("/admin/orders/status/pending")}
              description="Orders awaiting approval"
            />
            <StatsCard
              title="Processing Orders"
              value={stats.processing || 0}
              icon={<FiRefreshCw className="text-blue-500" />}
              change={`${(
                ((stats.processing || 0) / (stats.orders || 1)) *
                100
              ).toFixed(1)}%`}
              onClick={() => router.push("/admin/orders/status/processing")}
              description="Orders being processed"
            />
            <StatsCard
              title="Shipped Orders"
              value={stats.shipped || 0}
              icon={<FiTrendingUp className="text-green-500" />}
              change={`${(
                ((stats.shipped || 0) / (stats.orders || 1)) *
                100
              ).toFixed(1)}%`}
              onClick={() => router.push("/admin/orders/status/shipped")}
              description="Orders shipped to customers"
            />
            <StatsCard
              title="Delivered Orders"
              value={stats.delivered || 0}
              icon={<FiCheck className="text-purple-500" />}
              change={`${(
                ((stats.delivered || 0) / (stats.orders || 1)) *
                100
              ).toFixed(1)}%`}
              onClick={() => router.push("/admin/orders/status/delivered")}
              description="Orders successfully delivered"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FiBarChart2 className="mr-2 text-indigo-500" />
                  Revenue Overview
                </h2>
                <select className="text-sm border rounded-md p-1">
                  <option>Last 6 Months</option>
                  <option>Last Year</option>
                </select>
              </div>
              <div className="h-80">
                <Line options={lineChartOptions} data={salesData} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FiPieChart className="mr-2 text-purple-500" />
                  Sales by Category
                </h2>
              </div>
              <div className="h-80">
                <Bar options={lineChartOptions} data={categoryData} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiStar className="mr-2 text-yellow-500" />
                Best Sellers
              </h2>
              <div className="space-y-4">
                {trendingProducts.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3">
                      <FiPackage className="text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-800">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {product.sales} units sold
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        product.change > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.change > 0 ? "+" : ""}
                      {product.change}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiPercent className="mr-2 text-green-500" />
                Active Promotions
              </h2>
            </div>
          </div>

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
                onClick={() => router.push("/admin/inventory/products/new")}
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
                title="Settings"
                icon={<FiSettings />}
                onClick={() => router.push("/admin/settings")}
                color="purple"
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

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
    className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow transform hover:-translate-y-1"
    onClick={onClick}
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <div className="text-3xl text-gray-500">{icon}</div>
    </div>
    <div className="text-3xl font-extrabold text-gray-900 mb-2">
      {prefix}
      {value?.toLocaleString()}
    </div>
    {change && (
      <div className="flex items-center text-sm">
        <span
          className={`font-medium ${
            change.startsWith("+") ? "text-green-600" : "text-red-600"
          }`}
        >
          {change}
        </span>
        <span className="text-gray-500 ml-2">vs last month</span>
      </div>
    )}
    {description && (
      <p className="text-sm text-gray-500 mt-2 leading-relaxed">
        {description}
      </p>
    )}
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
