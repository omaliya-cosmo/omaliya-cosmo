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
  FiSettings,
  FiChevronRight,
  FiChevronLeft,
} from "react-icons/fi";
import Image from "next/image";
import { logout } from "./login/actions";
import { getAdminFromToken } from "../actions";
import { Admin } from "@prisma/client";
import { useUser } from "../lib/hooks/UserContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [miniSidebar, setMiniSidebar] = useState(false);
  const [admin, setAdmin] = useState<any>(null);
  const [adminDetails, setAdminDetails] = useState<Admin>();
  const [loading, setLoading] = useState(true);
  const { reloadUserData, userData, isLoading } = useUser();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const adminData = await getAdminFromToken();
        setAdmin(adminData);

        if (adminData?.id) {
          const response = await fetch(`/api/admin/${adminData.id}`);
          if (response.ok) {
            const data = await response.json();
            setAdminDetails(data.admin);
          }
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const isLoginPage = pathname?.startsWith("/admin/login") || false;

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
        { name: "All Orders", path: "/admin/orders" },
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
  ];

  const handleLogout = async () => {
    reloadUserData();
    logout();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMiniSidebar = () => {
    setMiniSidebar(!miniSidebar);
  };

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

    useState(() => {
      if (isSubItemActive) {
        setExpanded(true);
      }
    });

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
    <>
      {!isLoginPage && (
        <div className="flex h-screen bg-gray-50">
          {!sidebarOpen && (
            <button
              className="fixed top-4 left-4 p-2 rounded-md bg-white shadow-md z-30 lg:hidden"
              onClick={toggleSidebar}
              aria-label="Open sidebar"
            >
              <FiMenu size={20} />
            </button>
          )}

          <div
            className={`
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        ${miniSidebar ? "lg:w-20" : "lg:w-64"}
        fixed inset-y-0 left-0 z-30 transition duration-300 transform
        bg-white shadow-lg
        lg:translate-x-0 lg:static lg:inset-0 border-r
      `}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 mr-2 bg-blue-500 rounded-md flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">O</span>
                </div>
                {!miniSidebar && (
                  <h1 className="text-xl font-semibold text-gray-800">
                    Omaliya
                  </h1>
                )}
              </div>
              <div className="flex">
                <button
                  onClick={toggleMiniSidebar}
                  className="p-1 rounded-md hidden lg:block hover:bg-gray-100"
                >
                  <FiChevronLeft
                    className={`transform transition-transform ${
                      miniSidebar ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <button
                  onClick={toggleSidebar}
                  className="p-1 rounded-md lg:hidden hover:bg-gray-100"
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
              </div>

              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <FiLogOut className="mr-3 text-gray-500" size={20} />
                  {!miniSidebar && <span>Logout</span>}
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="z-10 bg-white border-gray-200 border-b">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center">
                  <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-md lg:hidden hover:bg-gray-100"
                  >
                    <FiMenu size={24} className="text-gray-600" />
                  </button>

                  <div className="hidden md:flex ml-4 items-center">
                    {breadcrumbs.map((crumb, index) => (
                      <React.Fragment key={crumb.path}>
                        {index > 0 && (
                          <FiChevronRight
                            size={16}
                            className="mx-2 text-gray-400"
                          />
                        )}
                        <Link
                          href={crumb.path}
                          className={`text-sm ${
                            index === breadcrumbs.length - 1
                              ? "text-gray-800 font-medium"
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
                  <Link
                    href="/admin/settings"
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                  >
                    <FiSettings size={22} />
                  </Link>

                  <div className="flex items-center space-x-2">
                    {loading ? (
                      <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse"></div>
                    ) : adminDetails?.image ? (
                      <div className="w-9 h-9 relative rounded-full overflow-hidden">
                        <Image
                          src={adminDetails.image}
                          alt={adminDetails.username || "Admin"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                        {adminDetails?.username?.charAt(0) ||
                          admin?.email?.charAt(0) ||
                          "A"}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-800">
                      {adminDetails?.username ||
                        admin?.email?.split("@")[0] ||
                        "Admin"}
                    </span>
                  </div>
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-auto p-6 bg-gray-50">
              {children}
            </main>

            <footer className="bg-white border-gray-200 text-gray-500 border-t py-3 px-6 text-center text-sm">
              © {new Date().getFullYear()} Omaliya Admin Dashboard •{" "}
              <a href="#" className="text-blue-600">
                Privacy Policy
              </a>{" "}
              •{" "}
              <a href="#" className="text-blue-600">
                Terms of Service
              </a>
            </footer>
          </div>
        </div>
      )}
      {isLoginPage && children}
    </>
  );
}
