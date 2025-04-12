"use client";

import React, { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiHome,
  FiBox,
  FiUsers,
  FiShoppingCart,
  FiFileText,
  FiLogOut,
  FiMenu,
  FiX,
  FiSearch,
  FiBell,
  FiSettings,
  FiUser,
  FiChevronDown,
  FiChevronRight,
  FiMoon,
  FiSun,
  FiGrid,
  FiHelpCircle,
  FiMessageSquare,
  FiClock,
  FiAlertCircle,
  FiBarChart2,
  FiLayers,
  FiActivity,
  FiFilter,
  FiChevronLeft,
} from "react-icons/fi";
import { logout } from "./login/actions";
import { deleteAdminSession } from "../lib/adminSession";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [miniSidebar, setMiniSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const [helpPanelOpen, setHelpPanelOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // This should be expanded in a real app to fetch path data
  const getBreadcrumbs = (path: string) => {
    const parts = path.split("/").filter((p) => p);
    const breadcrumbs = [{ name: "Dashboard", path: "/admin" }];

    if (parts.length > 1) {
      const section = parts[1];
      breadcrumbs.push({
        name: section.charAt(0).toUpperCase() + section.slice(1),
        path: `/${parts[0]}/${section}`,
      });

      if (parts.length > 2) {
        breadcrumbs.push({
          name: parts[2] === "new" ? "New" : "Detail",
          path: `/${parts[0]}/${section}/${parts[2]}`,
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs(pathname || "");

  // Advanced navigation with nested items
  const navItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <FiHome size={20} />,
    },
    {
      name: "Products",
      path: "/admin/products",
      icon: <FiBox size={20} />,
      subItems: [
        { name: "All Products", path: "/admin/inventory/products" },
        { name: "Add Product", path: "/admin/inventory/products/new" },
        { name: "Categories", path: "/admin/inventory/categories" },
        { name: "Add Category", path: "/admin/inventory/categories/new" },
      ],
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: <FiUsers size={20} />,
    },
    {
      name: "Orders",
      path: "/admin/orders",
      icon: <FiShoppingCart size={20} />,
      subItems: [
        { name: "Proccessing Orders", path: "/admin/orders/status/processing" },
        { name: "Shipped Orders", path: "/admin/orders/status/shipped" },
        { name: "Pending Orders", path: "/admin/orders/status/pending" },
        { name: "Delivered Orders", path: "/admin/orders/status/delivered" },
        { name: "Canceled Orders", path: "/admin/orders/status/CANCELED" },
      ],
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: <FiSettings size={20} />,
    },
    {
      name: "Profile",
      path: "#",
      icon: <FiUser size={20} />,
    },
  ];

  // Mock notifications
  const notifications = [
    { id: 1, text: "New order received", time: "5 min ago", type: "order" },
    { id: 2, text: "User John registered", time: "1 hour ago", type: "user" },
    {
      id: 3,
      text: "3 products low in stock",
      time: "3 hours ago",
      type: "alert",
      urgent: true,
    },
    { id: 4, text: "Weekly report available", time: "1 day ago", type: "info" },
  ];

  // Mock search results
  const searchResults = [
    {
      id: 1,
      title: "Wireless Headphones",
      type: "product",
      path: "/admin/products/1",
    },
    { id: 2, title: "John Smith", type: "user", path: "/admin/users/2" },
    { id: 3, title: "Order #1234", type: "order", path: "/admin/orders/1234" },
    {
      id: 4,
      title: "Sales Report",
      type: "report",
      path: "/admin/analytics/reports/sales",
    },
  ];

  const handleLogout = async () => {
    logout();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMiniSidebar = () => {
    setMiniSidebar(!miniSidebar);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // In a real app, would set a class on <html> or use a context
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement global search functionality
    setSearchPanelOpen(true);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setNotificationsOpen(false);
      setUserMenuOpen(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <FiShoppingCart className="text-blue-500" />;
      case "user":
        return <FiUser className="text-green-500" />;
      case "alert":
        return <FiAlertCircle className="text-red-500" />;
      case "info":
        return <FiFileText className="text-purple-500" />;
      default:
        return <FiBell className="text-gray-500" />;
    }
  };

  // Navigation item with potential subitems
  interface NavItemProps {
    item: {
      name: string;
      path: string;
      icon?: ReactNode;
      subItems?: { name: string; path: string }[];
    };
    isNested?: boolean;
  }

  const NavItem: React.FC<NavItemProps> = ({ item, isNested = false }) => {
    const [expanded, setExpanded] = useState(false);
    const isActive = pathname === item.path;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isSubItemActive =
      hasSubItems &&
      (item.subItems ?? []).some((subItem) => pathname === subItem.path);

    useEffect(() => {
      // Auto-expand if a child is active
      if (isSubItemActive) {
        setExpanded(true);
      }
    }, [isSubItemActive]);

    return (
      <li>
        {hasSubItems ? (
          <div className="space-y-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className={`w-full flex items-center justify-between px-4 py-3 text-gray-700 rounded-lg transition-colors
                ${
                  isActive || isSubItemActive
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "hover:bg-gray-100"
                }
              `}
            >
              <div className="flex items-center">
                {!isNested && (
                  <span
                    className={`${
                      isActive || isSubItemActive
                        ? "text-blue-500"
                        : "text-gray-500"
                    } mr-3`}
                  >
                    {item.icon}
                  </span>
                )}
                <span className={miniSidebar && !isNested ? "sr-only" : ""}>
                  {item.name}
                </span>
              </div>
              <span
                className={`transition-transform duration-200 ${
                  expanded ? "rotate-90" : ""
                }`}
              >
                <FiChevronRight size={16} />
              </span>
            </button>

            {expanded && (
              <ul
                className={`pl-${isNested ? 4 : 8} space-y-1 ${
                  miniSidebar && !isNested
                    ? "absolute left-full ml-4 bg-white shadow-lg rounded-lg p-2 min-w-[12rem] z-20"
                    : ""
                }`}
              >
                {(item.subItems ?? []).map((subItem) => (
                  <NavItem key={subItem.path} item={subItem} isNested={true} />
                ))}
              </ul>
            )}
          </div>
        ) : (
          <Link
            href={item.path}
            className={`
              flex items-center px-4 py-3 text-gray-700 rounded-lg transition-colors
              ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "hover:bg-gray-100"
              }
              ${isNested ? "pl-6" : ""}
            `}
          >
            {!isNested && (
              <span
                className={`${
                  isActive ? "text-blue-500" : "text-gray-500"
                } mr-3 flex-shrink-0`}
              >
                {item.icon}
              </span>
            )}
            <span className={miniSidebar && !isNested ? "sr-only" : ""}>
              {item.name}
            </span>
          </Link>
        )}
      </li>
    );
  };

  return (
    <div
      className={`flex h-screen ${
        darkMode ? "bg-gray-900 text-gray-200" : "bg-gray-50"
      }`}
    >
      {/* Mobile sidebar backdrop */}
      {!sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        ${miniSidebar ? "lg:w-20" : "lg:w-64"}
        fixed inset-y-0 left-0 z-30 transition duration-300 transform
        ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white shadow-lg"}
        lg:translate-x-0 lg:static lg:inset-0 border-r
      `}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 mr-2 bg-blue-500 rounded-md flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">O</span>
            </div>
            {!miniSidebar && (
              <h1
                className={`text-xl font-semibold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Omaliya
              </h1>
            )}
          </div>
          <div className="flex">
            <button
              onClick={toggleMiniSidebar}
              className={`p-1 rounded-md hidden lg:block hover:${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <FiChevronLeft
                className={`transform transition-transform ${
                  miniSidebar ? "rotate-180" : ""
                }`}
              />
            </button>
            <button
              onClick={toggleSidebar}
              className={`p-1 rounded-md lg:hidden hover:${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        <div className="flex flex-col justify-between h-[calc(100%-64px)]">
          <div className="overflow-y-auto py-2 px-3">
            <nav className="space-y-1 mt-2">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <NavItem key={item.path} item={item} />
                ))}
              </ul>
            </nav>

            {/* Section divider */}
            <div className="my-4 px-4">
              <div
                className={`h-px ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}
              ></div>
            </div>

            {/* Quick shortcuts section */}
            {!miniSidebar && (
              <div className="px-4 mb-3">
                <h3
                  className={`text-xs uppercase tracking-wider ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  } mb-2`}
                >
                  Quick Access
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    className={`p-2 rounded-lg flex flex-col items-center justify-center text-xs ${
                      darkMode
                        ? "hover:bg-gray-700 text-gray-300"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    <FiGrid className="mb-1" size={16} />
                    <span>Apps</span>
                  </button>
                  <button
                    className={`p-2 rounded-lg flex flex-col items-center justify-center text-xs ${
                      darkMode
                        ? "hover:bg-gray-700 text-gray-300"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    <FiActivity className="mb-1" size={16} />
                    <span>Stats</span>
                  </button>
                  <button
                    className={`p-2 rounded-lg flex flex-col items-center justify-center text-xs ${
                      darkMode
                        ? "hover:bg-gray-700 text-gray-300"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    <FiLayers className="mb-1" size={16} />
                    <span>Docs</span>
                  </button>
                  <button
                    onClick={() => setHelpPanelOpen(true)}
                    className={`p-2 rounded-lg flex flex-col items-center justify-center text-xs ${
                      darkMode
                        ? "hover:bg-gray-700 text-gray-300"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    <FiHelpCircle className="mb-1" size={16} />
                    <span>Help</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div
            className={`p-4 border-t ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-md ${
                  darkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
              </button>

              <button
                onClick={() => setHelpPanelOpen(true)}
                className={`p-2 rounded-md ${
                  darkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                <FiHelpCircle size={18} />
              </button>
            </div>

            <button
              onClick={handleLogout}
              className={`flex items-center w-full px-4 py-3 rounded-lg ${
                darkMode
                  ? "hover:bg-red-900 hover:bg-opacity-30 text-gray-300 hover:text-red-300"
                  : "hover:bg-red-50 text-gray-700 hover:text-red-600"
              } transition-colors`}
            >
              <FiLogOut
                className={`mr-3 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
                size={20}
              />
              {!miniSidebar && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header
          className={`z-10 ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          } border-b`}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className={`p-2 rounded-md lg:hidden hover:${
                  darkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <FiMenu
                  size={24}
                  className={darkMode ? "text-gray-300" : "text-gray-600"}
                />
              </button>

              {/* Breadcrumbs */}
              <div className="hidden md:flex ml-4 items-center">
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={crumb.path}>
                    {index > 0 && (
                      <FiChevronRight
                        size={16}
                        className={`mx-2 ${
                          darkMode ? "text-gray-500" : "text-gray-400"
                        }`}
                      />
                    )}
                    <Link
                      href={crumb.path}
                      className={`text-sm ${
                        index === breadcrumbs.length - 1
                          ? darkMode
                            ? "text-white font-medium"
                            : "text-gray-800 font-medium"
                          : darkMode
                          ? "text-gray-400 hover:text-white"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      {crumb.name}
                    </Link>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Mobile search trigger */}
              <button
                className="md:hidden p-2 rounded-full hover:bg-gray-100"
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              >
                <FiSearch
                  className={darkMode ? "text-gray-300" : "text-gray-600"}
                  size={20}
                />
              </button>

              {/* Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className={`${
                  mobileSearchOpen
                    ? "flex absolute top-16 left-0 right-0 z-20 p-3 border-b bg-white"
                    : "hidden"
                } md:relative md:top-0 md:flex`}
              >
                <div className="relative w-full md:w-auto">
                  <input
                    type="text"
                    placeholder="Search..."
                    className={`${
                      mobileSearchOpen ? "w-full" : "w-40 lg:w-64"
                    } px-3 py-2 pl-10 text-sm ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-gray-200 focus:bg-gray-600"
                        : "bg-gray-100 border-transparent text-gray-800 focus:bg-white focus:border-gray-300"
                    } border rounded-lg focus:outline-none focus:ring-2 ${
                      darkMode ? "focus:ring-blue-800" : "focus:ring-blue-100"
                    }`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <FiSearch
                    className={`absolute left-3 top-2.5 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                    size={18}
                  />
                </div>
              </form>

              {/* Notifications */}
              <div className="relative">
                <button
                  className={`p-2 rounded-full relative ${
                    darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotificationsOpen(!notificationsOpen);
                    setUserMenuOpen(false);
                  }}
                >
                  <FiBell
                    size={22}
                    className={darkMode ? "text-gray-300" : "text-gray-600"}
                  />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {notificationsOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-80 rounded-lg shadow-xl z-10 py-2 ${
                      darkMode
                        ? "bg-gray-800 border border-gray-700"
                        : "bg-white"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 border-b ${
                        darkMode ? "border-gray-700" : "border-gray-100"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <h3
                          className={`font-medium ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          Notifications
                        </h3>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full ${
                            darkMode
                              ? "bg-blue-900 text-blue-300"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {notifications.length} new
                        </span>
                      </div>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 ${
                            darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                          } ${
                            notification.urgent
                              ? darkMode
                                ? "bg-red-900 bg-opacity-20"
                                : "bg-red-50"
                              : ""
                          } border-b ${
                            darkMode ? "border-gray-700" : "border-gray-100"
                          } last:border-0`}
                        >
                          <div className="flex">
                            <div className="flex-shrink-0 mr-3">
                              <div
                                className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                  darkMode ? "bg-gray-700" : "bg-gray-100"
                                }`}
                              >
                                {getNotificationIcon(notification.type)}
                              </div>
                            </div>
                            <div>
                              <p
                                className={`text-sm font-medium ${
                                  darkMode ? "text-gray-200" : "text-gray-800"
                                }`}
                              >
                                {notification.text}
                              </p>
                              <p
                                className={`text-xs mt-1 flex items-center ${
                                  darkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                <FiClock className="mr-1" size={12} />
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div
                      className={`px-4 py-2 border-t ${
                        darkMode ? "border-gray-700" : "border-gray-100"
                      } text-center`}
                    >
                      <button
                        className={`text-sm font-medium ${
                          darkMode ? "text-blue-400" : "text-blue-600"
                        }`}
                      >
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Settings button */}
              <button
                className={`p-2 rounded-full ${
                  darkMode
                    ? "hover:bg-gray-700 text-gray-300"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <FiSettings size={22} />
              </button>

              {/* User Profile */}
              <div className="relative">
                <button
                  className="flex items-center space-x-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserMenuOpen(!userMenuOpen);
                    setNotificationsOpen(false);
                  }}
                >
                  <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                    A
                  </div>
                  <span
                    className={`hidden md:inline text-sm font-medium ${
                      darkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    Admin
                  </span>
                  <FiChevronDown
                    size={16}
                    className={darkMode ? "text-gray-400" : "text-gray-500"}
                  />
                </button>

                {userMenuOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-10 ${
                      darkMode
                        ? "bg-gray-800 border border-gray-700"
                        : "bg-white"
                    }`}
                  >
                    <div
                      className={`px-4 py-3 border-b ${
                        darkMode ? "border-gray-700" : "border-gray-200"
                      }`}
                    >
                      <p
                        className={`text-sm font-medium ${
                          darkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        Admin User
                      </p>
                      <p
                        className={`text-xs ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        admin@example.com
                      </p>
                    </div>
                    <Link
                      href="/admin/profile"
                      className={`block px-4 py-2 text-sm ${
                        darkMode
                          ? "text-gray-300 hover:bg-gray-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Your Profile
                    </Link>
                    <Link
                      href="/admin/settings"
                      className={`block px-4 py-2 text-sm ${
                        darkMode
                          ? "text-gray-300 hover:bg-gray-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Settings
                    </Link>
                    <div
                      className={`border-t ${
                        darkMode ? "border-gray-700" : "border-gray-200"
                      } my-1`}
                    ></div>
                    <button
                      onClick={handleLogout}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        darkMode
                          ? "text-red-400 hover:bg-gray-700"
                          : "text-red-600 hover:bg-gray-100"
                      }`}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile search field (expanded) */}
          {mobileSearchOpen && (
            <div className="p-2 md:hidden border-t border-gray-200">
              <form onSubmit={handleSearchSubmit} className="flex">
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="w-full px-3 py-2 pl-10 text-sm border border-gray-300 rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setMobileSearchOpen(false)}
                  className="ml-2 p-2 bg-gray-200 rounded-lg"
                >
                  <FiX size={18} />
                </button>
              </form>
            </div>
          )}
        </header>

        {/* Global Search Panel (overlay) */}
        {searchPanelOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
            <div
              className={`w-full max-w-2xl ${
                darkMode ? "bg-gray-800" : "bg-white"
              } rounded-lg shadow-xl overflow-hidden`}
            >
              <div
                className={`p-4 border-b ${
                  darkMode ? "border-gray-700" : "border-gray-200"
                } flex justify-between`}
              >
                <h3
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Search Results
                </h3>
                <button
                  onClick={() => setSearchPanelOpen(false)}
                  className={darkMode ? "text-gray-400" : "text-gray-500"}
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="p-4">
                <div
                  className={`${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  } flex items-center p-2 rounded-lg mb-4`}
                >
                  <FiSearch
                    className={`mx-2 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                    size={20}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for anything..."
                    className={`w-full bg-transparent border-none focus:outline-none ${
                      darkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  />
                  <div
                    className={`ml-2 px-2 py-1 rounded text-xs ${
                      darkMode
                        ? "bg-gray-600 text-gray-300"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    Esc
                  </div>
                </div>

                <div className="flex mb-4 space-x-2">
                  <button
                    className={`px-3 py-1 rounded-full text-xs ${
                      darkMode
                        ? "bg-blue-900 text-blue-300"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    All
                  </button>
                  <button
                    className={`px-3 py-1 rounded-full text-xs ${
                      darkMode
                        ? "bg-gray-700 text-gray-300"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    Products
                  </button>
                  <button
                    className={`px-3 py-1 rounded-full text-xs ${
                      darkMode
                        ? "bg-gray-700 text-gray-300"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    Orders
                  </button>
                  <button
                    className={`px-3 py-1 rounded-full text-xs ${
                      darkMode
                        ? "bg-gray-700 text-gray-300"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    Users
                  </button>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {searchResults.map((result) => (
                    <Link
                      key={result.id}
                      href={result.path}
                      className={`block py-3 px-2 -mx-2 rounded ${
                        darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSearchPanelOpen(false)}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-8 h-8 mr-3 rounded-full flex items-center justify-center ${
                            result.type === "product"
                              ? "bg-green-100 text-green-600"
                              : result.type === "user"
                              ? "bg-blue-100 text-blue-600"
                              : result.type === "order"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-purple-100 text-purple-600"
                          }`}
                        >
                          {result.type === "product" && <FiBox size={16} />}
                          {result.type === "user" && <FiUser size={16} />}
                          {result.type === "order" && (
                            <FiShoppingCart size={16} />
                          )}
                          {result.type === "report" && (
                            <FiBarChart2 size={16} />
                          )}
                        </div>
                        <div>
                          <p
                            className={`text-sm font-medium ${
                              darkMode ? "text-gray-200" : "text-gray-800"
                            }`}
                          >
                            {result.title}
                          </p>
                          <p
                            className={`text-xs ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {result.type.charAt(0).toUpperCase() +
                              result.type.slice(1)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {searchResults.length === 0 && (
                  <div
                    className={`text-center py-8 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <FiSearch className="mx-auto mb-2" size={32} />
                    <p>No results found for "{searchQuery}"</p>
                  </div>
                )}
              </div>

              <div
                className={`p-3 ${
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                } text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                <span className="mr-2">Press</span>
                <span
                  className={`px-1.5 py-0.5 rounded ${
                    darkMode ? "bg-gray-600" : "bg-gray-200"
                  }`}
                >
                  ↑
                </span>
                <span className="mx-1">and</span>
                <span
                  className={`px-1.5 py-0.5 rounded ${
                    darkMode ? "bg-gray-600" : "bg-gray-200"
                  }`}
                >
                  ↓
                </span>
                <span className="mx-1">to navigate,</span>
                <span
                  className={`px-1.5 py-0.5 rounded ${
                    darkMode ? "bg-gray-600" : "bg-gray-200"
                  }`}
                >
                  Enter
                </span>
                <span className="mx-1">to select, and</span>
                <span
                  className={`px-1.5 py-0.5 rounded ${
                    darkMode ? "bg-gray-600" : "bg-gray-200"
                  }`}
                >
                  Esc
                </span>
                <span className="mx-1">to close</span>
              </div>
            </div>
          </div>
        )}

        {/* Help Panel (overlay) */}
        {helpPanelOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
            <div
              className={`w-full max-w-2xl ${
                darkMode ? "bg-gray-800" : "bg-white"
              } rounded-lg shadow-xl overflow-hidden`}
            >
              <div
                className={`p-4 border-b ${
                  darkMode ? "border-gray-700" : "border-gray-200"
                } flex justify-between`}
              >
                <h3
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Help & Support
                </h3>
                <button
                  onClick={() => setHelpPanelOpen(false)}
                  className={darkMode ? "text-gray-400" : "text-gray-500"}
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className={`p-4 rounded-lg border ${
                      darkMode
                        ? "border-gray-700 bg-gray-700"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`p-2 rounded-full ${
                          darkMode ? "bg-blue-900" : "bg-blue-100"
                        } mr-3`}
                      >
                        <FiMessageSquare
                          className={
                            darkMode ? "text-blue-300" : "text-blue-600"
                          }
                          size={20}
                        />
                      </div>
                      <div>
                        <h4
                          className={`font-medium mb-1 ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          Documentation
                        </h4>
                        <p
                          className={`text-sm mb-2 ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Explore guides and documentation to get the most out
                          of your dashboard.
                        </p>
                        <button
                          className={`text-sm font-medium ${
                            darkMode ? "text-blue-400" : "text-blue-600"
                          }`}
                        >
                          View Documentation
                        </button>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-lg border ${
                      darkMode
                        ? "border-gray-700 bg-gray-700"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`p-2 rounded-full ${
                          darkMode ? "bg-green-900" : "bg-green-100"
                        } mr-3`}
                      >
                        <FiMessageSquare
                          className={
                            darkMode ? "text-green-300" : "text-green-600"
                          }
                          size={20}
                        />
                      </div>
                      <div>
                        <h4
                          className={`font-medium mb-1 ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          Contact Support
                        </h4>
                        <p
                          className={`text-sm mb-2 ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Need help? Our support team is ready to assist you.
                        </p>
                        <button
                          className={`text-sm font-medium ${
                            darkMode ? "text-green-400" : "text-green-600"
                          }`}
                        >
                          Contact Support
                        </button>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-lg border ${
                      darkMode
                        ? "border-gray-700 bg-gray-700"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`p-2 rounded-full ${
                          darkMode ? "bg-purple-900" : "bg-purple-100"
                        } mr-3`}
                      >
                        <FiActivity
                          className={
                            darkMode ? "text-purple-300" : "text-purple-600"
                          }
                          size={20}
                        />
                      </div>
                      <div>
                        <h4
                          className={`font-medium mb-1 ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          Tutorials
                        </h4>
                        <p
                          className={`text-sm mb-2 ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Learn how to use the dashboard with step-by-step
                          tutorials.
                        </p>
                        <button
                          className={`text-sm font-medium ${
                            darkMode ? "text-purple-400" : "text-purple-600"
                          }`}
                        >
                          View Tutorials
                        </button>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-lg border ${
                      darkMode
                        ? "border-gray-700 bg-gray-700"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`p-2 rounded-full ${
                          darkMode ? "bg-orange-900" : "bg-orange-100"
                        } mr-3`}
                      >
                        <FiSettings
                          className={
                            darkMode ? "text-orange-300" : "text-orange-600"
                          }
                          size={20}
                        />
                      </div>
                      <div>
                        <h4
                          className={`font-medium mb-1 ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          FAQs
                        </h4>
                        <p
                          className={`text-sm mb-2 ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Find answers to frequently asked questions.
                        </p>
                        <button
                          className={`text-sm font-medium ${
                            darkMode ? "text-orange-400" : "text-orange-600"
                          }`}
                        >
                          View FAQs
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`mt-6 p-4 rounded-lg border ${
                    darkMode
                      ? "border-gray-700 bg-gray-700"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <h4
                    className={`font-medium mb-3 ${
                      darkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Keyboard Shortcuts
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                    <div className="flex justify-between">
                      <span
                        className={`text-sm ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Toggle search
                      </span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          darkMode
                            ? "bg-gray-600 text-gray-300"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        Ctrl+K
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span
                        className={`text-sm ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Toggle sidebar
                      </span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          darkMode
                            ? "bg-gray-600 text-gray-300"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        Ctrl+B
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span
                        className={`text-sm ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Help panel
                      </span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          darkMode
                            ? "bg-gray-600 text-gray-300"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        F1
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span
                        className={`text-sm ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Dark mode
                      </span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          darkMode
                            ? "bg-gray-600 text-gray-300"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        Ctrl+D
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`p-4 ${
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                } text-xs`}
              >
                <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
                  Need more help? Contact our support team at{" "}
                  <span className="font-medium">support@omaliya.com</span>
                </p>
              </div>
            </div>
          </div>
        )}

        <main
          className={`flex-1 overflow-auto p-6 ${
            darkMode ? "bg-gray-900" : "bg-gray-50"
          }`}
        >
          {children}
        </main>

        <footer
          className={`${
            darkMode
              ? "bg-gray-800 border-gray-700 text-gray-400"
              : "bg-white border-gray-200 text-gray-500"
          } border-t py-3 px-6 text-center text-sm`}
        >
          © {new Date().getFullYear()} Omaliya Admin Dashboard •{" "}
          <a href="#" className={darkMode ? "text-blue-400" : "text-blue-600"}>
            Privacy Policy
          </a>{" "}
          •{" "}
          <a href="#" className={darkMode ? "text-blue-400" : "text-blue-600"}>
            Terms of Service
          </a>
        </footer>
      </div>
    </div>
  );
}
