import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileSettings from '@/components/profile/ProfileSettings';
import ProfileSecurity from '@/components/profile/ProfileSecurity';
import ProfileAddresses from '@/components/profile/ProfileAddresses';
import ProfileWishlist from '@/components/profile/ProfileWishlist';

export default function ProfilePage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">My Account</h1>
      
      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-3xl">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings">
          <ProfileSettings />
        </TabsContent>
        
        <TabsContent value="security">
          <ProfileSecurity />
        </TabsContent>
        
        <TabsContent value="addresses">
          <ProfileAddresses />
        </TabsContent>
        
        <TabsContent value="wishlist">
          <ProfileWishlist />
        </TabsContent>
      </Tabs>
    </div>
  );
}