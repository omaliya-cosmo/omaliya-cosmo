"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2, Shield, AlertTriangle, CheckCircle, Smartphone, LogOut } from 'lucide-react';
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Validation schema for password change
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

const ProfileSecurity: React.FC = () => {
  const form = useForm<PasswordFormData>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const validateForm = (values: PasswordFormData) => {
    let valid = true;

    if (!values.currentPassword) {
      form.setError("currentPassword", {
        message: "Current password is required",
      });
      valid = false;
    }

    if (!values.newPassword) {
      form.setError("newPassword", { message: "New password is required" });
      valid = false;
    } else if (values.newPassword.length < 8) {
      form.setError("newPassword", {
        message: "Password must be at least 8 characters",
      });
      valid = false;
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        values.newPassword
      )
    ) {
      form.setError("newPassword", {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      });
      valid = false;
    }

    if (!values.confirmPassword) {
      form.setError("confirmPassword", {
        message: "Please confirm your password",
      });
      valid = false;
    } else if (values.confirmPassword !== values.newPassword) {
      form.setError("confirmPassword", {
        message: "The passwords do not match",
      });
      valid = false;
    }

    return valid;
  };

  const onSubmit = async (values: PasswordFormData) => {
    if (!validateForm(values)) {
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Password updated successfully!");

      form.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Failed to change password:", error);
      toast.error("Failed to change password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle 2FA
  const handleToggle2FA = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setTwoFactorEnabled(!twoFactorEnabled);
      toast.success(twoFactorEnabled 
        ? "Two-factor authentication disabled" 
        : "Two-factor authentication enabled");
    } catch (error) {
      console.error("Failed to toggle 2FA:", error);
      toast.error("Failed to update two-factor authentication settings.");
    }
  };

  // Logout from all devices
  const handleLogoutAllDevices = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Successfully logged out from all devices");
    } catch (error) {
      console.error("Failed to logout from devices:", error);
      toast.error("Failed to logout from all devices. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>
          Manage your password and security settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Password Change Section */}
        <div>
          <h3 className="text-lg font-medium mb-4">Change Password</h3>
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(handlePasswordChange)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="Enter current password"
                          type={showCurrentPassword ? "text" : "password"}
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="Enter new password"
                          type={showNewPassword ? "text" : "password"}
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                    <FormDescription className="text-xs text-gray-500">
                      Password should be at least 8 characters and include uppercase, lowercase, number, and special character.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="Confirm new password"
                          type={showConfirmPassword ? "text" : "password"}
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </form>
          </Form>
        </div>

        <Separator />

        {/* Two-factor authentication */}
        <div>
          <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="two-factor">Two-factor authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                id="two-factor" 
                checked={twoFactorEnabled} 
                onCheckedChange={handleToggle2FA}
                className="data-[state=checked]:bg-purple-600"
              />
              <span className={`text-sm font-medium ${twoFactorEnabled ? 'text-purple-600' : 'text-muted-foreground'}`}>
                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
          {twoFactorEnabled && (
            <div className="mt-4 p-4 bg-purple-50 text-purple-700 rounded-md flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0" />
              <p className="text-sm">
                Two-factor authentication is enabled on your account. You'll need to enter a code from your authenticator app when signing in.
              </p>
            </div>
          )}
          {!twoFactorEnabled && (
            <div className="mt-4 p-4 bg-amber-50 text-amber-700 border border-amber-200 rounded-md flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <p className="text-sm">
                Two-factor authentication is disabled. We recommend enabling this feature to better secure your account.
              </p>
            </div>
          )}
          {twoFactorEnabled && (
            <div className="mt-4">
              <Button variant="outline" className="flex items-center gap-2 text-purple-600 border-purple-200 hover:bg-purple-50">
                <Smartphone className="h-4 w-4" />
                Configure Authenticator App
              </Button>
            </div>
          )}
        </div>

        <Separator />

        {/* Active Sessions & Logout */}
        <div>
          <h3 className="text-lg font-medium mb-4">Sessions & Login Activity</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">
                You're currently logged in on these devices:
              </p>
              <div className="border rounded-md">
                <div className="p-3 border-b flex items-center justify-between">
                  <div>
                    <p className="font-medium">Current Session</p>
                    <p className="text-xs text-muted-foreground">
                      Windows · Chrome · New York, USA
                    </p>
                  </div>
                  <div className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                    Active now
                  </div>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Mobile App</p>
                    <p className="text-xs text-muted-foreground">
                      iOS · iPhone 12 · Last active 2 days ago
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 border-rose-200 text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout from all devices
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Logout from all devices?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will end all your active sessions. You'll need to login again on all your devices.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogoutAllDevices}
                    className="bg-rose-600 hover:bg-rose-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Yes, logout everywhere"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Separator />

        {/* Login Security Section */}
        <div>
          <h3 className="text-lg font-medium mb-4">Security Recommendations</h3>
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-md flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-purple-900">Your account is well-protected</p>
                <p className="text-sm text-purple-700 mt-0.5">
                  You've taken all recommended security measures for your account.
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-purple-200 text-purple-700 hover:bg-purple-50">
              Security Checkup
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSecurity;
