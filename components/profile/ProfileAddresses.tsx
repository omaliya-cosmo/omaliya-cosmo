"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

interface AddressFormData {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

interface AddressFormErrors {
  name?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
}

// Sample addresses for initial state
const initialAddresses: Address[] = [
  {
    id: "1",
    name: "Home Address",
    street: "123 Main Street",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "United States",
    phone: "+1 (555) 123-4567",
    isDefault: true,
  },
  {
    id: "2",
    name: "Office Address",
    street: "456 Business Ave",
    city: "Boston",
    state: "MA",
    zipCode: "02108",
    country: "United States",
    phone: "+1 (555) 987-6543",
    isDefault: false,
  },
];

const countries = [
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
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<AddressFormData>({
    name: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
    isDefault: false,
  });
  const [errors, setErrors] = useState<AddressFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (errors[name as keyof AddressFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Handle select changes
  const handleSelectChange = (value: string, fieldName: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    // Clear error when field is edited
    if (errors[fieldName as keyof AddressFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: undefined,
      }));
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: AddressFormErrors = {};

    if (!formData.name) {
      newErrors.name = "Name is required";
    }

    if (!formData.street) {
      newErrors.street = "Street address is required";
    }

    if (!formData.city) {
      newErrors.city = "City is required";
    }

    if (!formData.state) {
      newErrors.state = "State/Province is required";
    }

    if (!formData.zipCode) {
      newErrors.zipCode = "Zip/Postal code is required";
    }

    if (!formData.country) {
      newErrors.country = "Country is required";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[0-9\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      phone: "",
      isDefault: false,
    });
    setErrors({});
  };

  // Open add address dialog
  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  // Open edit address dialog
  const openEditDialog = (address: Address) => {
    setCurrentAddress(address);
    setFormData({
      name: address.name,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phone: address.phone,
      isDefault: address.isDefault,
    });
    setIsEditDialogOpen(true);
  };

  // Close dialogs
  const closeAddDialog = () => setIsAddDialogOpen(false);
  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setCurrentAddress(null);
  };

  // Add a new address
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newAddress: Address = {
        id: Date.now().toString(),
        ...formData,
      };

      // If this is set as default, update other addresses
      if (formData.isDefault) {
        const updatedAddresses = addresses.map(addr => ({
          ...addr,
          isDefault: false,
        }));
        setAddresses([...updatedAddresses, newAddress]);
      } else {
        setAddresses([...addresses, newAddress]);
      }
      
      toast.success("Address added successfully!");
      closeAddDialog();
      resetForm();
    } catch (error) {
      console.error("Error adding address:", error);
      toast.error("Failed to add address. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update an existing address
  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !currentAddress) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let updatedAddresses = addresses.map(addr => {
        if (addr.id === currentAddress.id) {
          return {
            ...addr,
            ...formData,
          };
        }
        // If current address is being set as default, remove default from others
        if (formData.isDefault && addr.id !== currentAddress.id) {
          return {
            ...addr,
            isDefault: false,
          };
        }
        return addr;
      });
      
      setAddresses(updatedAddresses);
      toast.success("Address updated successfully!");
      closeEditDialog();
    } catch (error) {
      console.error("Error updating address:", error);
      toast.error("Failed to update address. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete an address
  const handleDeleteAddress = async (id: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAddresses(addresses.filter(addr => addr.id !== id));
      toast.success("Address deleted successfully!");
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address. Please try again.");
    }
  };

  // Set an address as default
  const setDefaultAddress = async (id: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedAddresses = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === id,
      }));
      
      setAddresses(updatedAddresses);
      toast.success("Default address updated!");
    } catch (error) {
      console.error("Error setting default address:", error);
      toast.error("Failed to set default address. Please try again.");
    }
  };

  // Form JSX shared between add and edit forms
  const addressFormFields = (
    <div className="space-y-4 py-2">
      <FormItem>
        <FormLabel htmlFor="name">Address Name</FormLabel>
        <FormControl>
          <Input
            id="name"
            name="name"
            placeholder="Home, Office, etc."
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? "border-red-500" : ""}
          />
        </FormControl>
        {errors.name && (
          <FormMessage className="text-red-500">{errors.name}</FormMessage>
        )}
      </FormItem>

      <FormItem>
        <FormLabel htmlFor="street">Street Address</FormLabel>
        <FormControl>
          <Textarea
            id="street"
            name="street"
            placeholder="123 Main St, Apt #4B"
            value={formData.street}
            onChange={handleChange}
            className={errors.street ? "border-red-500" : ""}
          />
        </FormControl>
        {errors.street && (
          <FormMessage className="text-red-500">{errors.street}</FormMessage>
        )}
      </FormItem>

      <div className="grid grid-cols-2 gap-4">
        <FormItem>
          <FormLabel htmlFor="city">City</FormLabel>
          <FormControl>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={errors.city ? "border-red-500" : ""}
            />
          </FormControl>
          {errors.city && (
            <FormMessage className="text-red-500">{errors.city}</FormMessage>
          )}
        </FormItem>

        <FormItem>
          <FormLabel htmlFor="state">State/Province</FormLabel>
          <FormControl>
            <Input
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className={errors.state ? "border-red-500" : ""}
            />
          </FormControl>
          {errors.state && (
            <FormMessage className="text-red-500">{errors.state}</FormMessage>
          )}
        </FormItem>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormItem>
          <FormLabel htmlFor="zipCode">Zip/Postal Code</FormLabel>
          <FormControl>
            <Input
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              className={errors.zipCode ? "border-red-500" : ""}
            />
          </FormControl>
          {errors.zipCode && (
            <FormMessage className="text-red-500">{errors.zipCode}</FormMessage>
          )}
        </FormItem>

        <FormItem>
          <FormLabel htmlFor="country">Country</FormLabel>
          <Select
            value={formData.country}
            onValueChange={(value) => handleSelectChange(value, "country")}
          >
            <SelectTrigger className={errors.country ? "border-red-500" : ""}>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.country && (
            <FormMessage className="text-red-500">{errors.country}</FormMessage>
          )}
        </FormItem>
      </div>

      <FormItem>
        <FormLabel htmlFor="phone">Phone Number</FormLabel>
        <FormControl>
          <Input
            id="phone"
            name="phone"
            placeholder="+1 (555) 123-4567"
            value={formData.phone}
            onChange={handleChange}
            className={errors.phone ? "border-red-500" : ""}
          />
        </FormControl>
        {errors.phone && (
          <FormMessage className="text-red-500">{errors.phone}</FormMessage>
        )}
      </FormItem>

      <div className="flex items-center space-x-2 pt-2">
        <input
          type="checkbox"
          id="isDefault"
          name="isDefault"
          checked={formData.isDefault}
          onChange={handleCheckboxChange}
          className="h-4 w-4"
        />
        <label htmlFor="isDefault" className="text-sm">
          Set as default address
        </label>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Addresses</CardTitle>
        <CardDescription>
          Manage your shipping and billing addresses
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        <div className="flex justify-end mb-4">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Address
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add New Address</DialogTitle>
                <DialogDescription>
                  Fill in the details of your new address.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddAddress}>
                {addressFormFields}
                <DialogFooter className="pt-4">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Adding..." : "Add Address"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {addresses.length > 0 ? (
          <div className="space-y-4">
            {addresses.map((address) => (
              <Card key={address.id} className={address.isDefault ? "border-primary" : ""}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{address.name}</h3>
                        {address.isDefault && (
                          <Badge variant="outline" className="text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm mt-1">{address.street}</p>
                      <p className="text-sm">
                        {address.city}, {address.state} {address.zipCode}
                      </p>
                      <p className="text-sm">{address.country}</p>
                      <p className="text-sm mt-1">{address.phone}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Dialog open={isEditDialogOpen && currentAddress?.id === address.id} onOpenChange={(open) => {
                        if (!open) closeEditDialog();
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => openEditDialog(address)}
                          >
                            <Pencil className="h-3 w-3" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px]">
                          <DialogHeader>
                            <DialogTitle>Edit Address</DialogTitle>
                            <DialogDescription>
                              Update the details of your address.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleUpdateAddress}>
                            {addressFormFields}
                            <DialogFooter className="pt-4">
                              <DialogClose asChild>
                                <Button type="button" variant="outline">
                                  Cancel
                                </Button>
                              </DialogClose>
                              <Button 
                                type="submit"
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? "Saving..." : "Save Changes"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Address</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this address? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteAddress(address.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      {!address.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={() => setDefaultAddress(address.id)}
                        >
                          <Check className="h-3 w-3" />
                          Set as Default
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              You haven't added any addresses yet.
            </p>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog}>
                Add Your First Address
              </Button>
            </DialogTrigger>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileAddresses;
