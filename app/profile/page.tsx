"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileSecurity from "@/components/profile/ProfileSecurity";
import ProfileAddresses from "@/components/profile/ProfileAddresses";
import ProfileOrders from "@/components/profile/ProfileOrders";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Loader2,
  Shield,
  MapPin,
  Package,
  LogOut,
  ChevronRight,
  Mail,
  Phone,
  CreditCard,
  MessageSquare,
  Clock,
  BadgeHelp,
  User,
  Calendar,
  ListOrdered,
  Package2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Review, ProductCategory, CustomerAddress } from "@prisma/client";
import { getCustomerFromToken } from "../actions";
import Header from "@/components/layout/Header";
import { useCart } from "../lib/hooks/CartContext";
import {
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
  Customer as PrismaCustomer,
  Address,
  Product,
  BundleOffer,
  OrderStatus,
} from "@prisma/client";
import { logout } from "../(auth)/actions";

interface OrderItem extends PrismaOrderItem {
  product: Product;
  bundle: BundleOffer;
}

interface Order extends PrismaOrder {
  items: OrderItem[];
  address: Address;
}

interface Customer extends PrismaCustomer {
  reviews: Review[];
  orders: Order[];
  addresses: CustomerAddress[];
}

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("security");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [lastLogin, setLastLogin] = useState("2025-04-10T14:30:00");
  const [userData, setUserData] = useState<Customer>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const { refreshCart } = useCart(); // Assuming you have a CartContext to refresh cart data

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getCustomerFromToken();
        if (!userData) {
          router.push("/login");
          return;
        }
        const response = await fetch(
          `/api/customers/${userData.id}?orders=true&reviews=true&addresses=true`
        );
        const data = await response.json();
        console.log("order response", data);
        setUserData(data);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    // Get tab from URL or use default
    const tabFromUrl = searchParams.get("tab");
    if (
      tabFromUrl &&
      ["security", "addresses", "orders"].includes(tabFromUrl)
    ) {
      setActiveTab(tabFromUrl);
    }

    // Simulate loading user data
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);

    // Create new URL with updated tab parameter
    const params = new URLSearchParams(searchParams);
    params.set("tab", value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Format date to relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return "yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <div className="w-full px-4 py-6 md:py-10 max-w-7xl mx-auto">
        {/* Enhanced Header with User Information and Quick Actions */}
        <div className="bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-lg border shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-purple-300/50">
                <AvatarFallback className="text-lg bg-purple-100 text-purple-600">
                  {userData?.firstName?.[0].toUpperCase()}
                  {userData?.lastName?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl capitalize md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-800 to-pink-700">
                  {userData?.firstName} {userData?.lastName}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    From{" "}
                    {userData?.registeredAt &&
                      new Date(userData.registeredAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-center">
              <Button
                variant="outline"
                size="sm"
                className="text-rose-500 cursor-pointer hover:text-rose-600 hover:bg-rose-50 border-rose-200"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          <Separator className="my-5" />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 text-sm">
            <div className="flex gap-3 items-center">
              <div className="bg-purple-100 p-2 rounded-full">
                <Mail className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{userData?.email}</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <div className="bg-purple-100 p-2 rounded-full">
                <Package2 className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-muted-foreground">Orders</p>
                <p className="font-medium">
                  {userData?.orders?.length || 0} Orders
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <div className="bg-purple-100 p-2 rounded-full">
                <Star className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-muted-foreground">Reviews</p>
                <p className="font-medium">
                  {userData?.reviews?.length || 0} Products Reviewed
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <div className="bg-purple-100 p-2 rounded-full">
                <MapPin className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-muted-foreground">Addresses</p>
                <p className="font-medium">
                  {userData?.addresses.length === null
                    ? "No Address Found"
                    : `${userData?.addresses.length} Addresses Saved`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="w-full flex flex-col items-center justify-center min-h-[80vh]">
            <Loader2 className="h-10 w-10 animate-spin text-purple-600 mb-4" />
            <p className="text-muted-foreground">
              Loading your profile information...
            </p>
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="space-y-2"
          >
            <div className="overflow-x-auto">
              <TabsList className="inline-flex h-auto p-1 rounded-lg bg-muted">
                <TabsTrigger
                  value="security"
                  className="flex items-center gap-2 rounded-md px-3 py-2 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm"
                  data-active={activeTab === "security"}
                >
                  <Shield className="h-4 w-4" />
                  <span>Security</span>
                </TabsTrigger>
                <TabsTrigger
                  value="addresses"
                  className="flex items-center gap-2 rounded-md px-3 py-2 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm"
                  data-active={activeTab === "addresses"}
                >
                  <MapPin className="h-4 w-4" />
                  <span>Addresses</span>
                </TabsTrigger>
                <TabsTrigger
                  value="orders"
                  className="flex items-center gap-2 rounded-md px-3 py-2 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm"
                  data-active={activeTab === "orders"}
                >
                  <Package className="h-4 w-4" />
                  <span>Orders</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="bg-card rounded-lg border shadow-sm">
              <TabsContent value="security" className="p-0 m-0">
                <ProfileSecurity />
              </TabsContent>

              <TabsContent value="addresses" className="p-0 m-0">
                <ProfileAddresses />
              </TabsContent>

              <TabsContent value="orders" className="p-0 m-0">
                {userData ? (
                  <ProfileOrders customer={userData} />
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p>Loading order information...</p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        )}

        <div className="mt-10 bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-lg border shadow-sm p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-lg font-medium">
                Need assistance with your account?
              </h3>
              <p className="text-muted-foreground mt-1">
                Our support team is here to help with any questions.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="gap-2 border-purple-200 hover:bg-purple-50 hover:text-purple-600"
              >
                <BadgeHelp className="h-4 w-4" />
                Help Center
              </Button>
              <Button
                variant="default"
                className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <MessageSquare className="h-4 w-4" />
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
