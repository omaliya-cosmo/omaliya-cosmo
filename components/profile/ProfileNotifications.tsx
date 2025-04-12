"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  CheckCheck,
  Clock,
  CreditCard,
  Filter,
  Info,
  Package,
  Percent,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, parseISO, formatDistanceToNow } from "date-fns";

type NotificationType =
  | "order"
  | "delivery"
  | "promotion"
  | "payment"
  | "account"
  | "system";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  dateTime: string;
  isRead: boolean;
  link?: string;
  data?: Record<string, any>;
}

export default function ProfileNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      // In a real app, fetch from API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const dummyNotifications: Notification[] = [
        {
          id: "1",
          type: "delivery",
          title: "Your order has been delivered",
          description: "Order #38492 has been delivered to your address.",
          dateTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          isRead: false,
          link: "/orders/38492",
          data: {
            orderId: "38492",
          },
        },
        {
          id: "2",
          type: "promotion",
          title: "Promotion: 20% off all cosmetics",
          description: "Limited time offer! Use code COSMO20 at checkout.",
          dateTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          link: "/promotions/cosmo20",
          data: {
            promoCode: "COSMO20",
            expiryDate: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        },
        {
          id: "3",
          type: "payment",
          title: "New payment method added",
          description: "You added a new credit card ending in 4382.",
          dateTime: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000
          ).toISOString(),
          isRead: true,
          link: "/profile?tab=security",
        },
        {
          id: "4",
          type: "order",
          title: "Order confirmed",
          description:
            "Your order #39201 has been confirmed and is being processed.",
          dateTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          isRead: false,
          link: "/orders/39201",
          data: {
            orderId: "39201",
            items: 3,
          },
        },
        {
          id: "5",
          type: "account",
          title: "Welcome to Omaliya!",
          description:
            "Thank you for creating an account. Start exploring our products now.",
          dateTime: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          isRead: true,
          link: "/products",
        },
        {
          id: "6",
          type: "system",
          title: "Privacy Policy Update",
          description:
            "We've updated our privacy policy. Please review the changes.",
          dateTime: new Date(
            Date.now() - 14 * 24 * 60 * 60 * 1000
          ).toISOString(),
          isRead: true,
          link: "/privacy-policy",
        },
      ];

      setNotifications(dummyNotifications);
      setIsLoading(false);
    };

    fetchNotifications();
  }, []);

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case "order":
        return <ShoppingBag className="h-4 w-4" />;
      case "delivery":
        return <Truck className="h-4 w-4" />;
      case "promotion":
        return <Percent className="h-4 w-4" />;
      case "payment":
        return <CreditCard className="h-4 w-4" />;
      case "account":
        return <Bell className="h-4 w-4" />;
      case "system":
        return <Info className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case "order":
        return "border-blue-500";
      case "delivery":
        return "border-green-500";
      case "promotion":
        return "border-amber-500";
      case "payment":
        return "border-purple-500";
      case "account":
        return "border-sky-500";
      case "system":
        return "border-slate-500";
      default:
        return "border-muted";
    }
  };

  const formatRelativeTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "Invalid date";
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    // Apply type filter
    if (activeFilter !== "all" && activeFilter !== "unread") {
      if (notif.type !== activeFilter) return false;
    }

    // Apply unread filter
    if (activeFilter === "unread" && notif.isRead) {
      return false;
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        notif.title.toLowerCase().includes(query) ||
        notif.description.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="default" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </h2>
          <p className="text-muted-foreground mt-1">
            Stay updated on your orders and account activity
          </p>
        </div>

        <div className="flex items-center gap-2 self-end">
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={markAllAsRead}
            disabled={!notifications.some((n) => !n.isRead)}
          >
            <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
            Mark all as read
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by type</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setActiveFilter("all")}>
                All notifications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveFilter("unread")}>
                Unread only
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActiveFilter("order")}>
                <ShoppingBag className="h-3.5 w-3.5 mr-2" /> Orders
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveFilter("delivery")}>
                <Truck className="h-3.5 w-3.5 mr-2" /> Deliveries
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveFilter("promotion")}>
                <Percent className="h-3.5 w-3.5 mr-2" /> Promotions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveFilter("payment")}>
                <CreditCard className="h-3.5 w-3.5 mr-2" /> Payments
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveFilter("account")}>
                <Bell className="h-3.5 w-3.5 mr-2" /> Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveFilter("system")}>
                <Info className="h-3.5 w-3.5 mr-2" /> System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search notifications..."
          className="pl-9 max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Separator className="my-4" />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 border rounded-lg">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-1/5" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredNotifications.length > 0 ? (
        <AnimatePresence initial={false}>
          <div className="space-y-4">
            {activeFilter !== "all" && (
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="text-sm text-muted-foreground">
                  {activeFilter === "unread"
                    ? `Showing ${
                        filteredNotifications.length
                      } unread notification${
                        filteredNotifications.length !== 1 ? "s" : ""
                      }`
                    : `Showing ${
                        filteredNotifications.length
                      } ${activeFilter} notification${
                        filteredNotifications.length !== 1 ? "s" : ""
                      }`}
                </p>
                {activeFilter !== "all" && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-muted-foreground"
                    onClick={() => setActiveFilter("all")}
                  >
                    Clear filter
                  </Button>
                )}
              </div>
            )}

            {filteredNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 p-4 rounded-lg border-l-4 ${
                  notification.isRead
                    ? "border-l-muted bg-background"
                    : getTypeColor(notification.type) + " bg-muted/20"
                } border relative`}
              >
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    notification.isRead ? "bg-muted" : "bg-primary/10"
                  }`}
                >
                  {getTypeIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3
                      className={`font-medium text-base ${
                        !notification.isRead ? "text-primary" : ""
                      }`}
                    >
                      {notification.title}
                    </h3>
                    <div className="flex items-center gap-1">
                      {!notification.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(notification.dateTime)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.description}
                  </p>
                  {notification.data?.promoCode && (
                    <div className="mt-2 flex items-center">
                      <Badge variant="outline" className="font-mono text-xs">
                        {notification.data.promoCode}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-2">
                        Expires{" "}
                        {format(
                          parseISO(notification.data.expiryDate),
                          "MMM dd"
                        )}
                      </span>
                    </div>
                  )}
                  <div className="mt-2 pt-1 flex gap-2">
                    {notification.link && (
                      <Button variant="ghost" size="sm" className="h-8 text-xs">
                        View details
                      </Button>
                    )}
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 absolute top-3 right-3 text-muted-foreground hover:text-foreground"
                  onClick={() => deleteNotification(notification.id)}
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="sr-only">Delete</span>
                </Button>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Bell className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-medium mb-2">No notifications</h3>
          <p className="text-muted-foreground max-w-sm">
            {searchQuery
              ? `We couldn't find any notifications matching "${searchQuery}".`
              : activeFilter !== "all"
              ? `You don't have any ${
                  activeFilter === "unread" ? "unread" : activeFilter
                } notifications.`
              : "You don't have any notifications right now. We'll notify you when something important happens."}
          </p>
          {(searchQuery || activeFilter !== "all") && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("all");
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
