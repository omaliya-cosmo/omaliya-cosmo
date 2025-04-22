"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  Copy,
  Loader2,
  MapPin,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCustomerFromToken } from "@/app/actions";

// Define the form data type explicitly
interface AddressFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Validation schema using Zod
const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  addressLine1: z.string().min(1, "Street address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State/Province is required"),
  postalCode: z.string().min(1, "Zip/Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

interface Address {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const countries = [
  "Sri Lanka",
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "India",
  "China",
  "Brazil",
];

const ProfileAddresses: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [customerId, setCustomerId] = useState<string | null>(null);

  // Create form using react-hook-form with zod validation
  const addForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
  });

  // Separate form for editing
  const editForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
  });

  // Load customer data and address on component mount
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setIsLoading(true);
        const customer = await getCustomerFromToken();

        if (customer && customer.id) {
          // Pre-fill add form with customer data
          addForm.reset({
            firstName: customer.firstName || "",
            lastName: customer.lastName || "",
            email: customer.email || "",
            phoneNumber: "",
            addressLine1: "",
            addressLine2: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
          });

          setCustomerId(customer.id);
          // Fetch customer address
          const response = await axios.get(
            `/api/customers/${customer.id}?address=true`
          );
          const customerData = response.data;

          if (customerData && customerData.address) {
            const addressData = customerData.address;
            // Convert address from API to our Address interface
            const customerAddress: Address = {
              id: addressData.id || Date.now().toString(),
              firstName: addressData.firstName || customer.firstName || "",
              lastName: addressData.lastName || customer.lastName || "",
              email: addressData.email || customer.email || "",
              phoneNumber: addressData.phoneNumber || "",
              addressLine1: addressData.addressLine1 || "",
              addressLine2: addressData.addressLine2 || "",
              city: addressData.city || "",
              state: addressData.state || "",
              postalCode: addressData.postalCode || "",
              country: addressData.country || "",
            };

            setAddresses([customerAddress]);
          }
        }
      } catch (error) {
        console.error("Error fetching customer data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerData();
  }, []);

  // Open add address dialog
  const openAddDialog = () => {
    // Check if we have customer data to pre-fill the form
    if (customerId) {
      // Pre-fill the form with the existing customer data
      const existingCustomerInfo = {
        firstName: addForm.getValues().firstName || "",
        lastName: addForm.getValues().lastName || "",
        email: addForm.getValues().email || "",
        phoneNumber: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      };

      addForm.reset(existingCustomerInfo);
    } else {
      // Reset to empty if no customer data
      addForm.reset({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      });
    }
    setIsAddDialogOpen(true);
  };

  // Open edit address dialog
  const openEditDialog = (address: Address) => {
    setCurrentAddress(address);
    editForm.reset({
      firstName: address.firstName,
      lastName: address.lastName,
      email: address.email,
      phoneNumber: address.phoneNumber,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    });
    setIsEditDialogOpen(true);
  };

  // Copy address to clipboard
  const copyAddressToClipboard = (address: Address) => {
    const formattedAddress = `${address.addressLine1}\n${
      address.addressLine2 || ""
    }\n${address.city}, ${address.state} ${address.postalCode}\n${
      address.country
    }\n${address.phoneNumber}`;
    navigator.clipboard.writeText(formattedAddress).then(() => {
      setIsCopied(address.id);
      toast.success("Address copied to clipboard");
      setTimeout(() => setIsCopied(null), 2000);
    });
  };

  // Add a new address
  const handleAddAddress = async (data: AddressFormData) => {
    if (!customerId) {
      toast.error("You must be logged in to add an address");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create address data in format that matches API
      const addressData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
      };

      // Call API to save address to customer
      await axios.post(`/api/customers/${customerId}/address`, addressData);

      // Update local state
      const newAddress: Address = {
        id: Date.now().toString(),
        ...data,
      };

      setAddresses([newAddress]);
      toast.success("Address added successfully!");
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding address:", error);
      toast.error("Failed to add address. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update an existing address
  const handleUpdateAddress = async (data: AddressFormData) => {
    if (!currentAddress || !customerId) return;

    setIsSubmitting(true);

    try {
      // Create address data in format that matches API
      const addressData = {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        email: data.email,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
      };

      // Call API to update address
      await axios.put(`/api/customers/${customerId}/address`, addressData);

      // Update local state
      const updatedAddress = {
        ...currentAddress,
        ...data,
      };

      setAddresses([updatedAddress]);
      toast.success("Address updated successfully!");
      setIsEditDialogOpen(false);
      setCurrentAddress(null);
    } catch (error) {
      console.error("Error updating address:", error);
      toast.error("Failed to update address. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete an address
  const handleDeleteAddress = async (id: string) => {
    if (!customerId) return;

    setIsLoading(true);
    try {
      // Call API to delete address
      await axios.delete(`/api/customers/${customerId}/address`);

      setAddresses([]);
      toast.success("Address deleted successfully!");
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Form JSX for add form
  const renderAddressForm = (formType: "add" | "edit") => {
    const form = formType === "add" ? addForm : editForm;

    return (
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="john.doe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="addressLine1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <Textarea placeholder="123 Main St, Apt #4B" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="addressLine2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line 2</FormLabel>
              <FormControl>
                <Input placeholder="Suite, Unit, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State/Province</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zip/Postal Code</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Your Address</CardTitle>
            <CardDescription>
              Manage your shipping and billing address
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={openAddDialog}
                className="flex items-center gap-2"
                disabled={addresses.length > 0}
              >
                <Plus className="h-4 w-4" />
                {addresses.length > 0 ? "Address Already Added" : "Add Address"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add Address</DialogTitle>
                <DialogDescription>
                  Fill in the details of your address.
                </DialogDescription>
              </DialogHeader>
              <Form {...addForm}>
                <form onSubmit={addForm.handleSubmit(handleAddAddress)}>
                  <ScrollArea className="max-h-[70vh]">
                    {renderAddressForm("add")}
                  </ScrollArea>
                  <DialogFooter className="pt-4 mt-4">
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Add Address
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        <AnimatePresence>
          {addresses.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {addresses.map((address) => (
                <motion.div
                  key={address.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  layout
                >
                  <Card
                    key={address.id}
                    className={`transition-all hover:shadow-md`}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div className="flex flex-col">
                          <p className="text-sm">{address.addressLine1}</p>
                          {address.addressLine2 && (
                            <p className="text-sm">{address.addressLine2}</p>
                          )}
                          <p className="text-sm">
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                          <p className="text-sm">{address.country}</p>
                          <p className="text-sm mt-1">{address.phoneNumber}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 items-center self-end md:self-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => copyAddressToClipboard(address)}
                            disabled={isLoading}
                          >
                            {isCopied === address.id ? (
                              <>
                                <Check className="h-3.5 w-3.5 mr-1 text-green-500" />
                                <span className="text-green-500">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5 mr-1" />
                                <span>Copy</span>
                              </>
                            )}
                          </Button>

                          <Dialog
                            open={
                              isEditDialogOpen &&
                              currentAddress?.id === address.id
                            }
                            onOpenChange={(open) => {
                              if (!open) setIsEditDialogOpen(false);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 h-8"
                                onClick={() => openEditDialog(address)}
                                disabled={isLoading}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>Edit Address</DialogTitle>
                                <DialogDescription>
                                  Update the details of your address.
                                </DialogDescription>
                              </DialogHeader>
                              <Form {...editForm}>
                                <form
                                  onSubmit={editForm.handleSubmit(
                                    handleUpdateAddress
                                  )}
                                >
                                  <ScrollArea className="max-h-[60vh]">
                                    {renderAddressForm("edit")}
                                  </ScrollArea>
                                  <DialogFooter className="pt-4 mt-4">
                                    <DialogClose asChild>
                                      <Button type="button" variant="outline">
                                        Cancel
                                      </Button>
                                    </DialogClose>
                                    <Button
                                      type="submit"
                                      disabled={isSubmitting}
                                      className="gap-2"
                                    >
                                      {isSubmitting ? (
                                        <>
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                          Saving...
                                        </>
                                      ) : (
                                        <>
                                          <Check className="h-4 w-4" />
                                          Save Changes
                                        </>
                                      )}
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 h-8"
                                disabled={isLoading}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Address
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this address?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteAddress(address.id)
                                  }
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="mx-auto w-24 h-24 mb-4 bg-muted rounded-full flex items-center justify-center">
                <MapPin className="h-12 w-12 text-muted-foreground/50" />
              </div>
              <p className="text-xl font-semibold mb-2">No address found</p>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You haven't added an address yet. Add your address to make
                checkout faster.
              </p>
              <Button onClick={openAddDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your Address
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading && (
          <div className="fixed inset-0 bg-black/5 flex items-center justify-center z-50 pointer-events-none">
            <Card className="w-auto h-auto p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span>Processing...</span>
              </div>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileAddresses;
