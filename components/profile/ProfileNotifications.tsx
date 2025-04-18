"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Bell, Mail, Tag, Package, Megaphone, Smartphone, Check, X, Clock, AlertCircle } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

interface NotificationSetting {
  id: string;
  type: string;
  title: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'order' | 'promo' | 'account' | 'system';
  read: boolean;
}

const ProfileNotifications: React.FC = () => {
  // Notification preferences
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationSetting[]>([
    {
      id: "orders",
      type: "order",
      title: "Order updates",
      description: "Receive notifications about your orders status and delivery updates",
      email: true,
      push: true,
      sms: false
    },
    {
      id: "promos",
      type: "promo",
      title: "Promotions & deals",
      description: "Stay informed about sales, discounts and special offers",
      email: true,
      push: false,
      sms: false
    },
    {
      id: "account",
      type: "account",
      title: "Account activity",
      description: "Get important updates about your account and security",
      email: true,
      push: true,
      sms: true
    },
    {
      id: "product-updates",
      type: "system",
      title: "Product updates",
      description: "Learn about new products, features and recommendations",
      email: true,
      push: false,
      sms: false
    },
  ]);

  // Recent notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "Order shipped",
      message: "Your order #12345 has been shipped and will arrive in 3-5 business days.",
      date: "2025-04-15T10:30:00",
      type: "order",
      read: false
    },
    {
      id: "2",
      title: "Special offer",
      message: "Enjoy 25% off on all skincare products this weekend. Use code: SKINCARE25",
      date: "2025-04-14T08:15:00",
      type: "promo",
      read: false
    },
    {
      id: "3",
      title: "Password changed",
      message: "Your account password was recently changed. If you didn't make this change, please contact customer support.",
      date: "2025-04-12T14:45:00",
      type: "account",
      read: true
    },
    {
      id: "4",
      title: "New feature available",
      message: "You can now save multiple payment methods for faster checkout.",
      date: "2025-04-10T11:20:00",
      type: "system",
      read: true
    },
    {
      id: "5",
      title: "Order delivered",
      message: "Your order #12230 has been delivered. Enjoy your products!",
      date: "2025-04-08T16:55:00",
      type: "order",
      read: true
    },
  ]);

  const [activeTab, setActiveTab] = useState('all');
  const [emailFrequency, setEmailFrequency] = useState('immediate');

  // Toggle notification channel
  const toggleNotificationChannel = (id: string, channel: 'email' | 'push' | 'sms') => {
    setNotificationPreferences(preferences =>
      preferences.map(pref =>
        pref.id === id ? { ...pref, [channel]: !pref[channel] } : pref
      )
    );
    
    toast.success(`Notification preference updated`);
  };

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
    
    toast.success("Notification marked as read");
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    toast.success("All notifications marked as read");
  };

  // Delete notification
  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
    toast.success("Notification removed");
  };

  // Filter notifications based on active tab
  const filteredNotifications = activeTab === 'all'
    ? notifications
    : notifications.filter(notification => notification.type === activeTab);

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return "yesterday";
    } else {
      return date.toLocaleDateString("en-US", { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Manage your notification preferences and view recent notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recent" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recent" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Recent Notifications</TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Notification Preferences</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent" className="space-y-6">
            <div className="flex justify-between items-center">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="overflow-x-auto pb-2">
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="all" className="data-[state=active]:bg-purple-600/10 data-[state=active]:text-purple-700">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="order" className="data-[state=active]:bg-purple-600/10 data-[state=active]:text-purple-700">
                      <Package className="h-4 w-4 mr-1" />
                      Orders
                    </TabsTrigger>
                    <TabsTrigger value="promo" className="data-[state=active]:bg-purple-600/10 data-[state=active]:text-purple-700">
                      <Tag className="h-4 w-4 mr-1" />
                      Promotions
                    </TabsTrigger>
                    <TabsTrigger value="account" className="data-[state=active]:bg-purple-600/10 data-[state=active]:text-purple-700">
                      <Bell className="h-4 w-4 mr-1" />
                      Account
                    </TabsTrigger>
                    <TabsTrigger value="system" className="data-[state=active]:bg-purple-600/10 data-[state=active]:text-purple-700">
                      <Megaphone className="h-4 w-4 mr-1" />
                      System
                    </TabsTrigger>
                  </TabsList>
                </div>
              </Tabs>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={markAllAsRead}
                className="whitespace-nowrap border-purple-200 hover:bg-purple-50 hover:text-purple-700"
              >
                <Check className="h-4 w-4 mr-1" />
                Mark all as read
              </Button>
            </div>
            
            <div className="space-y-4">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`border rounded-lg p-4 ${notification.read ? 'bg-card' : 'bg-purple-50 border-purple-100'}`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full mt-1 ${
                          notification.type === 'order' ? 'bg-blue-100 text-blue-600' : 
                          notification.type === 'promo' ? 'bg-amber-100 text-amber-600' :
                          notification.type === 'account' ? 'bg-purple-100 text-purple-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {notification.type === 'order' && <Package className="h-4 w-4" />}
                          {notification.type === 'promo' && <Tag className="h-4 w-4" />}
                          {notification.type === 'account' && <Bell className="h-4 w-4" />}
                          {notification.type === 'system' && <Megaphone className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-base">{notification.title}</h4>
                            {!notification.read && (
                              <Badge variant="default" className="bg-purple-600 text-white">New</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm mt-1">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-2 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatRelativeTime(notification.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <Button 
                            onClick={() => markAsRead(notification.id)} 
                            variant="ghost" 
                            size="sm"
                            className="h-8 text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                          >
                            <Check className="h-4 w-4" />
                            <span className="sr-only">Mark as read</span>
                          </Button>
                        )}
                        <Button 
                          onClick={() => deleteNotification(notification.id)} 
                          variant="ghost" 
                          size="sm"
                          className="h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="rounded-full bg-muted p-4">
                    <Bell className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">No notifications</h3>
                  <p className="mt-2 text-sm text-muted-foreground text-center">
                    You don't have any {activeTab !== 'all' ? activeTab : ''} notifications at the moment.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="preferences" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Email Digest Frequency</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Choose how often you'd like to receive email notifications
                </p>
                <RadioGroup 
                  defaultValue={emailFrequency}
                  onValueChange={setEmailFrequency}
                  className="flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="immediate" id="immediate" className="border-purple-200 text-purple-600"/>
                    <Label htmlFor="immediate">Send immediately (as they happen)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="daily" id="daily" className="border-purple-200 text-purple-600"/>
                    <Label htmlFor="daily">Daily digest</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekly" id="weekly" className="border-purple-200 text-purple-600" />
                    <Label htmlFor="weekly">Weekly digest</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Separator className="my-6" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Notification Channels</h3>
                  <div className="flex text-sm">
                    <span className="w-20 text-center font-medium text-purple-600">Email</span>
                    <span className="w-20 text-center font-medium text-purple-600">Push</span>
                    <span className="w-20 text-center font-medium text-purple-600">SMS</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {notificationPreferences.map((preference) => (
                    <div 
                      key={preference.id} 
                      className="flex items-center justify-between border-b pb-4 last:border-0"
                    >
                      <div>
                        <h4 className="font-medium">{preference.title}</h4>
                        <p className="text-sm text-muted-foreground">{preference.description}</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-20 flex justify-center">
                          <Switch 
                            checked={preference.email} 
                            onCheckedChange={() => toggleNotificationChannel(preference.id, 'email')}
                            className="data-[state=checked]:bg-purple-600"
                          />
                        </div>
                        <div className="w-20 flex justify-center">
                          <Switch 
                            checked={preference.push} 
                            onCheckedChange={() => toggleNotificationChannel(preference.id, 'push')}
                            className="data-[state=checked]:bg-purple-600"
                          />
                        </div>
                        <div className="w-20 flex justify-center">
                          <Switch 
                            checked={preference.sms} 
                            onCheckedChange={() => toggleNotificationChannel(preference.id, 'sms')}
                            className="data-[state=checked]:bg-purple-600"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-900">Privacy Note</h4>
                    <p className="text-sm text-purple-700 mt-1">
                      You can opt-out of non-essential communications at any time. 
                      Account-related notifications for security and order processing cannot be disabled.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProfileNotifications;
