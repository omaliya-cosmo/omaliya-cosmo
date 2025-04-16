"use client";

import React, { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Pencil, Trash2, Check, X, Search, Home, Briefcase, MapPin, Copy, CheckCircle2, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define address types with icons
const addressTypes = [
  { value: "home", label: "Home", icon: Home },
  { value: "work", label: "Work", icon: Briefcase },
  { value: "other", label: "Other", icon: MapPin },
];

// Validation schema using Zod
const addressSchema = z.object({
  name: z.string().min(1, "Address name is required"),
  type: z.string().default("home"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State/Province is required"),
  zipCode: z.string().min(1, "Zip/Postal code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().min(1, "Phone number is required"),
  isDefault: z.boolean().default(false),
});

interface Address {
  id: string;
  name: string;
  type: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  verified?: boolean;
}

interface AddressFormData extends z.infer<typeof addressSchema> {}

// Sample addresses for initial state
const initialAddresses: Address[] = [
  {
    id: "1",
    name: "Home Address",
    type: "home",
    street: "123 Main Street",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "United States",
    phone: "+1 (555) 123-4567",
    isDefault: true,
    verified: true,
  },
  {
    id: "2",
    name: "Office Address",
    type: "work",
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Create form using react-hook-form with zod validation
  const addForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: "",
      type: "home",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      phone: "",
      isDefault: false,
    }
  });

  // Separate form for editing
  const editForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: "",
      type: "home",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      phone: "",
      isDefault: false,
    }
  });

  // Filter addresses based on search query and filter selection
  const filteredAddresses = useMemo(() => {
    let result = [...addresses];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(addr => 
        addr.name.toLowerCase().includes(query) ||
        addr.street.toLowerCase().includes(query) ||
        addr.city.toLowerCase().includes(query) ||
        addr.state.toLowerCase().includes(query) ||
        addr.zipCode.toLowerCase().includes(query) ||
        addr.country.toLowerCase().includes(query)
      );
    }
    
    // Apply type filter
    if (selectedFilter !== "all") {
      if (selectedFilter === "default") {
        result = result.filter(addr => addr.isDefault);
      } else {
        result = result.filter(addr => addr.type === selectedFilter);
      }
    }
    
    return result;
  }, [addresses, searchQuery, selectedFilter]);

  // Open add address dialog
  const openAddDialog = () => {
    addForm.reset({
      name: "",
      type: "home",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      phone: "",
      isDefault: false,
    });
    setIsAddDialogOpen(true);
  };

  // Open edit address dialog
  const openEditDialog = (address: Address) => {
    setCurrentAddress(address);
    editForm.reset({
      name: address.name,
      type: address.type || "home",
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

  // Copy address to clipboard
  const copyAddressToClipboard = (address: Address) => {
    const formattedAddress = `${address.name}\n${address.street}\n${address.city}, ${address.state} ${address.zipCode}\n${address.country}\n${address.phone}`;
    navigator.clipboard.writeText(formattedAddress).then(() => {
      setIsCopied(address.id);
      toast.success("Address copied to clipboard");
      setTimeout(() => setIsCopied(null), 2000);
    });
  };

  // Add a new address
  const handleAddAddress = async (data: AddressFormData) => {
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newAddress: Address = {
        id: Date.now().toString(),
        ...data,
      };

      // If this is set as default, update other addresses
      if (data.isDefault) {
        const updatedAddresses = addresses.map(addr => ({
          ...addr,
          isDefault: false,
        }));
        setAddresses([...updatedAddresses, newAddress]);
      } else {
        setAddresses([...addresses, newAddress]);
      }

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
    if (!currentAddress) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      let updatedAddresses = addresses.map(addr => {
        if (addr.id === currentAddress.id) {
          return {
            ...addr,
            ...data,
          };
        }
        // If current address is being set as default, remove default from others
        if (data.isDefault && addr.id !== currentAddress.id) {
          return {
            ...addr,
            isDefault: false,
          };
        }
        return addr;
      });

      setAddresses(updatedAddresses);
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
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // If deleting default address, make another one default
      const deletedAddress = addresses.find(addr => addr.id === id);
      let updatedAddresses = addresses.filter(addr => addr.id !== id);
      
      if (deletedAddress?.isDefault && updatedAddresses.length > 0) {
        updatedAddresses[0].isDefault = true;
      }
      
      setAddresses(updatedAddresses);
      toast.success("Address deleted successfully!");
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Set an address as default
  const setDefaultAddress = async (id: string) => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  // Verify address (simulate address verification)
  const verifyAddress = async (id: string) => {
    setIsLoading(true);
    try {
      // Simulate API call for address verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatedAddresses = addresses.map(addr => {
        if (addr.id === id) {
          return {
            ...addr,
            verified: true,
          };
        }
        return addr;
      });
      
      setAddresses(updatedAddresses);
      toast.success("Address verified successfully!");
    } catch (error) {
      console.error("Error verifying address:", error);
      toast.error("Failed to verify address. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Form JSX for add form
  const renderAddressForm = (formType: "add" | "edit") => {
    const form = formType === "add" ? addForm : editForm;
    
    return (
      <div className="space-y-4 py-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Name</FormLabel>
              <FormControl>
                <Input placeholder="Home, Office, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select address type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {addressTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        {React.createElement(type.icon, { className: "h-4 w-4 text-purple-500" })}
                        <span className="text-pink-500">{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="street"
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
            name="zipCode"
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

        <FormField
          control={form.control}
          name="phone"
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

        <FormField
          control={form.control}
          name="isDefault"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 rounded border-gray-300 focus:ring-primary"
                  id={`${formType}-is-default`}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel htmlFor={`${formType}-is-default`}>Set as default address</FormLabel>
              </div>
            </FormItem>
          )}
        />
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Your Addresses</CardTitle>
            <CardDescription>
              Manage your shipping and billing addresses
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Address
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Address</DialogTitle>
                <DialogDescription>
                  Fill in the details of your new address.
                </DialogDescription>
              </DialogHeader>
              <Form {...addForm}>
                <form onSubmit={addForm.handleSubmit(handleAddAddress)}>
                  <ScrollArea className="max-h-[60vh]">
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
        {addresses.length > 0 && (
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search addresses..." 
                  className="pl-9 max-w-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Tabs 
                defaultValue="all" 
                value={selectedFilter}
                onValueChange={setSelectedFilter}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="home" className="flex items-center gap-1">
                    <Home className="h-3 w-3" /> Home
                  </TabsTrigger>
                  <TabsTrigger value="work" className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" /> Work
                  </TabsTrigger>
                  <TabsTrigger value="default" className="flex items-center gap-1">
                    <Check className="h-3 w-3" /> Default
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {filteredAddresses.length === 0 && (
              <div className="text-center py-8 border rounded-lg bg-muted/30">
                <p className="text-muted-foreground">No addresses match your search.</p>
                <Button variant="link" onClick={() => {
                  setSearchQuery("");
                  setSelectedFilter("all");
                }}>
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        )}

        <AnimatePresence>
          {filteredAddresses.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {filteredAddresses.map((address) => (
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
                    className={`${address.isDefault ? "border-primary" : ""} transition-all hover:shadow-md`}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 mb-2">
                            {address.type === "home" && <Home className="h-4 w-4 text-primary" />}
                            {address.type === "work" && <Briefcase className="h-4 w-4 text-primary" />}
                            {address.type === "other" && <MapPin className="h-4 w-4 text-primary" />}
                            <h3 className="font-medium">{address.name}</h3>
                            {address.isDefault && (
                              <Badge variant="outline" className="text-xs bg-primary/10 text-primary">
                                Default
                              </Badge>
                            )}
                            {address.verified && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm">{address.street}</p>
                          <p className="text-sm">
                            {address.city}, {address.state} {address.zipCode}
                          </p>
                          <p className="text-sm">{address.country}</p>
                          <p className="text-sm mt-1">{address.phone}</p>
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
                          
                          {!address.verified && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2"
                              onClick={() => verifyAddress(address.id)}
                              disabled={isLoading}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              <span>Verify</span>
                            </Button>
                          )}
                          
                          <Dialog 
                            open={isEditDialogOpen && currentAddress?.id === address.id} 
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
                                <form onSubmit={editForm.handleSubmit(handleUpdateAddress)}>
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
                                <AlertDialogTitle>Delete Address</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete <span className="font-semibold">{address.name}</span>?
                                  {address.isDefault && (
                                    <div className="mt-2 p-2 bg-amber-50 text-amber-600 rounded-md border border-amber-200">
                                      <span className="font-semibold">Note:</span> This is your default address. 
                                      If deleted, another address will be set as default.
                                    </div>
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteAddress(address.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
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
                              className="flex items-center gap-1 h-8"
                              onClick={() => setDefaultAddress(address.id)}
                              disabled={isLoading}
                            >
                              <Check className="h-3.5 w-3.5" />
                              Set as Default
                            </Button>
                          )}
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
              <p className="text-xl font-semibold mb-2">No addresses found</p>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You haven't added any addresses yet. Add an address to make checkout faster.
              </p>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Your First Address
                </Button>
              </DialogTrigger>
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