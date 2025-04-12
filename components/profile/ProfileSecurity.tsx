"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

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
      console.error("Error updating password:", error);
      toast.error("Failed to update password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>
          Update your password and security preferences
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="currentPassword">
                      Current Password
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                      >
                        {showCurrentPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
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
                    <FormLabel htmlFor="newPassword">New Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="confirmPassword">
                      Confirm New Password
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </Form>

        <Separator className="my-6" />

        <div>
          <h3 className="text-lg font-medium mb-2">Reset Password</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Forgot your password? You can request a password reset link to be
            sent to your email address.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast.success("Password reset link sent to your email address!")
            }
          >
            Send Reset Link
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSecurity;
