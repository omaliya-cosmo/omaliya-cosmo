"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileSettings from "@/components/profile/ProfileSettings";
import ProfileSecurity from "@/components/profile/ProfileSecurity";
import ProfileAddresses from "@/components/profile/ProfileAddresses";
import ProfileWishlist from "@/components/profile/ProfileWishlist";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Loader2,
  User,
  Shield,
  MapPin,
  Heart,
  Clock,
  LogOut,
  ChevronRight,
  Bell,
  BadgeHelp,
  Mail,
  Phone,
  CreditCard,
  Package,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import ProfileOrders from "@/components/profile/ProfileOrders";
import ProfileNotifications from "@/components/profile/ProfileNotifications";
import ProfilePayments from "@/components/profile/ProfilePayments";

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("settings");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [lastLogin, setLastLogin] = useState("2025-04-10T14:30:00");

  // For demonstration purposes - add notification count
  const [notificationCount, setNotificationCount] = useState(3);

  useEffect(() => {
    // Get tab from URL or use default
    const tabFromUrl = searchParams.get("tab");
    if (
      tabFromUrl &&
      [
        "settings",
        "security",
        "addresses",
        "wishlist",
        "orders",
        "notifications",
        "payments",
      ].includes(tabFromUrl)
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
    // Handle logout logic
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="h-10 w-10 animate-spin text-purple-600 mb-4" />
        <p className="text-muted-foreground">Loading your profile information...</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-6 md:py-10 max-w-7xl mx-auto">
      {/* Enhanced Header with User Information and Quick Actions */}
      <div className="bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-lg border shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-purple-300/50">
              <AvatarImage src="/placeholder-avatar.jpg" alt="John Doe" />
              <AvatarFallback className="text-lg bg-purple-100 text-purple-600">JD</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-800 to-pink-700">John Doe</h1>
              <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                <Clock className="h-3.5 w-3.5" />
                <span>Last login {formatRelativeTime(lastLogin)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-center">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 border-purple-200 hover:bg-purple-50 hover:text-purple-600 transition-colors"
              onClick={() => handleTabChange("notifications")}
            >
              <Bell className="h-4 w-4" />
              Notifications
              {notificationCount > 0 && (
                <Badge
                  variant="destructive"
                  className="h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {notificationCount}
                </Badge>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-rose-200"
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
              <p className="font-medium">john.doe@example.com</p>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <div className="bg-purple-100 p-2 rounded-full">
              <Phone className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium">+1 (555) 123-4567</p>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <div className="bg-purple-100 p-2 rounded-full">
              <CreditCard className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-muted-foreground">Payment Methods</p>
              <p className="font-medium">3 saved cards</p>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <div className="bg-purple-100 p-2 rounded-full">
              <MapPin className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-muted-foreground">Addresses</p>
              <p className="font-medium">2 saved addresses</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-8"
      >
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex h-auto p-1 rounded-lg bg-muted">

            <TabsTrigger 
              value="settings"
              className="flex items-center gap-2 rounded-md px-3 py-2 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm"
              data-active={activeTab === "settings"}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
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
            <TabsTrigger 
              value="payments" 
              className="flex items-center gap-2 rounded-md px-3 py-2 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm"
              data-active={activeTab === "payments"}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger 
              value="wishlist"
              className="flex items-center gap-2 rounded-md px-3 py-2 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm"
              data-active={activeTab === "wishlist"}
            >
              <CreditCard className="w-4 h-4" />
              <span>Payment Methods</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2 rounded-md px-3 py-2 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm"
              data-active={activeTab === "notifications"}
            >
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
              {notificationCount > 0 && (
                <Badge
                  variant="destructive"
                  className="h-5 w-5 p-0 flex items-center justify-center text-xs ml-1"
                >
                  {notificationCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="wishlist"
              className="flex items-center gap-2 rounded-md px-3 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-muted-foreground"
              data-active={activeTab === "wishlist"}
            >
              <Heart className="h-4 w-4" />
              <span>Wishlist</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="bg-card rounded-lg border shadow-sm">
          <TabsContent value="settings" className="p-0 m-0">
            <div className="p-6 flex flex-col items-center justify-center text-center">
              <User className="h-12 w-12 text-muted-foreground mb-4 opacity-30" />
              <h3 className="text-xl font-medium mb-2">
                Profile Settings Not Available Yet
              </h3>
              <p className="text-muted-foreground max-w-md">
                The ability to manage your profile settings will be coming soon.
                This feature is currently under development.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="security" className="p-0 m-0">
            <ProfileSecurity />
          </TabsContent>

          <TabsContent value="addresses" className="p-0 m-0">
            <ProfileAddresses />
          </TabsContent>

          <TabsContent value="wishlist" className="p-0 m-0">
            <div className="p-6 flex flex-col items-center justify-center text-center">
              <Heart className="h-12 w-12 text-muted-foreground mb-4 opacity-30" />
              <h3 className="text-xl font-medium mb-2">
                Wishlist Not Available Yet
              </h3>
              <p className="text-muted-foreground max-w-md">
                We're working on bringing you a wishlist feature soon. Check
                back later to save your favorite products.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="p-0 m-0">
            <ProfileOrders />
          </TabsContent>

          <TabsContent value="payments" className="p-0 m-0">
            <div className="p-6 flex flex-col items-center justify-center text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground mb-4 opacity-30" />
              <h3 className="text-xl font-medium mb-2">
                Payment Methods Not Available Yet
              </h3>
              <p className="text-muted-foreground max-w-md">
                The ability to manage your payment methods will be coming soon.
                This feature is currently under development.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="p-0 m-0">
            <ProfileNotifications />
          </TabsContent>
        </div>
      </Tabs>

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
            <Button variant="outline" className="gap-2 border-purple-200 hover:bg-purple-50 hover:text-purple-600">
              <BadgeHelp className="h-4 w-4" />
              Help Center
            </Button>
            <Button variant="default" className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <MessageSquare className="h-4 w-4" />
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
