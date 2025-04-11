"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Bell, Mail, Globe, Moon, Sun } from 'lucide-react';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Settings {
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
    productUpdates: boolean;
    orderStatus: boolean;
  };
  preferences: {
    language: string;
    theme: 'light' | 'dark' | 'system';
    currency: string;
  };
  privacy: {
    dataCollection: boolean;
    profileVisibility: boolean;
    activityTracking: boolean;
  };
}

const ProfileSettings: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    notifications: {
      email: true,
      push: true,
      marketing: false,
      productUpdates: true,
      orderStatus: true,
    },
    preferences: {
      language: 'english',
      theme: 'system',
      currency: 'usd',
    },
    privacy: {
      dataCollection: true,
      profileVisibility: true,
      activityTracking: false,
    },
  });

  const [activeTab, setActiveTab] = useState('notifications');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle toggle changes
  const handleToggle = (category: keyof Settings, setting: string, checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: checked
      }
    }));

    toast.success(`Setting updated successfully`);
  };

  // Handle select changes
  const handleSelectChange = (category: keyof Settings, setting: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));

    toast.success(`${setting.charAt(0).toUpperCase() + setting.slice(1)} updated to ${value}`);
  };

  // Handle account deletion
  const handleAccountDeletion = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    setIsDeleting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Account scheduled for deletion. You will receive a confirmation email.');
      setIsDeleteDialogOpen(false);
      setDeleteConfirmText('');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to process account deletion. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Notification settings content
  const notificationsContent = (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-medium">Email Notifications</h3>
            <p className="text-sm text-muted-foreground">Receive email updates about your account activity</p>
          </div>
          <Switch
            checked={settings.notifications.email}
            onCheckedChange={(checked) => handleToggle('notifications', 'email', checked)}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-medium">Push Notifications</h3>
            <p className="text-sm text-muted-foreground">Receive push notifications on your mobile device</p>
          </div>
          <Switch
            checked={settings.notifications.push}
            onCheckedChange={(checked) => handleToggle('notifications', 'push', checked)}
          />
        </div>
      </div>

      <Separator />

      <h3 className="font-medium">Notification Categories</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-sm font-medium">Marketing</h4>
            <p className="text-sm text-muted-foreground">Receive emails about new products, offers and promotions</p>
          </div>
          <Switch
            checked={settings.notifications.marketing}
            onCheckedChange={(checked) => handleToggle('notifications', 'marketing', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-sm font-medium">Product Updates</h4>
            <p className="text-sm text-muted-foreground">Get notified when products you like are updated or back in stock</p>
          </div>
          <Switch
            checked={settings.notifications.productUpdates}
            onCheckedChange={(checked) => handleToggle('notifications', 'productUpdates', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-sm font-medium">Order Status</h4>
            <p className="text-sm text-muted-foreground">Updates about your orders, shipping and delivery</p>
          </div>
          <Switch
            checked={settings.notifications.orderStatus}
            onCheckedChange={(checked) => handleToggle('notifications', 'orderStatus', checked)}
          />
        </div>
      </div>
    </div>
  );

  // Preferences content
  const preferencesContent = (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-col space-y-2">
          <h3 className="font-medium">Language</h3>
          <p className="text-sm text-muted-foreground mb-1">Select your preferred language for the application interface</p>
          <Select 
            value={settings.preferences.language} 
            onValueChange={(value) => handleSelectChange('preferences', 'language', value)}
          >
            <SelectTrigger className="w-full sm:w-72">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="spanish">Spanish</SelectItem>
              <SelectItem value="french">French</SelectItem>
              <SelectItem value="german">German</SelectItem>
              <SelectItem value="japanese">Japanese</SelectItem>
              <SelectItem value="chinese">Chinese</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex flex-col space-y-2">
          <h3 className="font-medium">Theme</h3>
          <p className="text-sm text-muted-foreground mb-1">Choose your preferred color theme</p>
          <Select 
            value={settings.preferences.theme} 
            onValueChange={(value) => handleSelectChange('preferences', 'theme', value as 'light' | 'dark' | 'system')}
          >
            <SelectTrigger className="w-full sm:w-72">
              <SelectValue placeholder="Select Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light" className="flex items-center">
                <div className="flex items-center">
                  <Sun className="h-4 w-4 mr-2" />
                  <span>Light</span>
                </div>
              </SelectItem>
              <SelectItem value="dark" className="flex items-center">
                <div className="flex items-center">
                  <Moon className="h-4 w-4 mr-2" />
                  <span>Dark</span>
                </div>
              </SelectItem>
              <SelectItem value="system">Use System Settings</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex flex-col space-y-2">
          <h3 className="font-medium">Currency</h3>
          <p className="text-sm text-muted-foreground mb-1">Select your preferred currency for prices</p>
          <Select 
            value={settings.preferences.currency} 
            onValueChange={(value) => handleSelectChange('preferences', 'currency', value)}
          >
            <SelectTrigger className="w-full sm:w-72">
              <SelectValue placeholder="Select Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usd">USD ($) - US Dollar</SelectItem>
              <SelectItem value="eur">EUR (€) - Euro</SelectItem>
              <SelectItem value="gbp">GBP (£) - British Pound</SelectItem>
              <SelectItem value="jpy">JPY (¥) - Japanese Yen</SelectItem>
              <SelectItem value="cad">CAD ($) - Canadian Dollar</SelectItem>
              <SelectItem value="aud">AUD ($) - Australian Dollar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  // Privacy content
  const privacyContent = (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-medium">Data Collection</h3>
            <p className="text-sm text-muted-foreground">Allow us to collect anonymous usage data to improve our services</p>
          </div>
          <Switch
            checked={settings.privacy.dataCollection}
            onCheckedChange={(checked) => handleToggle('privacy', 'dataCollection', checked)}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-medium">Profile Visibility</h3>
            <p className="text-sm text-muted-foreground">Allow other users to see your public profile and reviews</p>
          </div>
          <Switch
            checked={settings.privacy.profileVisibility}
            onCheckedChange={(checked) => handleToggle('privacy', 'profileVisibility', checked)}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-medium">Activity Tracking</h3>
            <p className="text-sm text-muted-foreground">Allow tracking of your browsing activity to personalize recommendations</p>
          </div>
          <Switch
            checked={settings.privacy.activityTracking}
            onCheckedChange={(checked) => handleToggle('privacy', 'activityTracking', checked)}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h3 className="font-medium text-red-600">Danger Zone</h3>
        <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data</p>
        
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">Delete Account</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Account</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <p className="text-sm font-medium mb-2">
                Please type "DELETE" to confirm:
              </p>
              <input
                className="w-full border p-2 rounded text-sm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
              />
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleAccountDeletion}
                disabled={isDeleting}
              >
                {isDeleting ? "Processing..." : "Delete Account"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>
          Manage your account settings and preferences
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="notifications" className="space-y-4">
            {notificationsContent}
          </TabsContent>
          
          <TabsContent value="preferences" className="space-y-4">
            {preferencesContent}
          </TabsContent>
          
          <TabsContent value="privacy" className="space-y-4">
            {privacyContent}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
