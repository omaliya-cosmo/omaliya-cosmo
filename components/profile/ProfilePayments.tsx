"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import {
  CreditCard,
  Trash2,
  Plus,
  Check,
  Shield,
  Lock,
  Edit,
  AlertCircle,
  CheckCircle,
  Copy,
  Pencil,
  X,
  ChevronDown,
  Loader2,
  Eye,
  EyeOff,
  Calendar,
  PenLine
} from "lucide-react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import {
  Form,
  FormControl,
  FormDescription,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Credit card type definitions and helpers
enum CardType {
  VISA = "visa",
  MASTERCARD = "mastercard",
  AMEX = "amex",
  DISCOVER = "discover",
  JCB = "jcb",
  DINERS = "diners",
  UNKNOWN = "unknown",
}

interface PaymentMethod {
  id: string;
  cardholderName: string;
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cardType: CardType;
  isDefault: boolean;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  lastUsed?: string;
}

// Form schema for adding/editing payment methods
const paymentFormSchema = z.object({
  cardholderName: z.string().min(1, "Cardholder name is required"),
  cardNumber: z
    .string()
    .min(1, "Card number is required")
    .refine((val) => /^[0-9]{13,19}$/.test(val.replace(/\s/g, "")), {
      message: "Invalid card number",
    }),
  expMonth: z.string().min(1, "Month is required"),
  expYear: z.string().min(1, "Year is required"),
  cvc: z
    .string()
    .min(1, "CVC is required")
    .refine((val) => /^[0-9]{3,4}$/.test(val), {
      message: "CVC must be 3 or 4 digits",
    }),
  isDefault: z.boolean().default(false),
  saveForFuture: z.boolean().default(true),
  useAsShippingAddress: z.boolean().optional(),
  billingAddress: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(1, "Zip code is required"),
    country: z.string().min(1, "Country is required"),
  }),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export default function ProfilePayments() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCardId, setCurrentCardId] = useState<string | null>(null);
  const [showCardNumber, setShowCardNumber] = useState<Record<string, boolean>>({});
  const [showCVC, setShowCVC] = useState(false);
  
  // Form for adding/editing payment methods
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      cardholderName: "",
      cardNumber: "",
      expMonth: "",
      expYear: "",
      cvc: "",
      isDefault: false,
      saveForFuture: true,
      billingAddress: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "United States",
      },
    },
  });

  // Load payment methods on component mount
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        // In a real app, fetch from API
        await new Promise((resolve) => setTimeout(resolve, 1200));

        // Sample payment methods
        const methods: PaymentMethod[] = [
          {
            id: "card_1",
            cardholderName: "John Doe",
            cardNumber: "4242424242424242",
            expMonth: "09",
            expYear: "2027",
            cardType: CardType.VISA,
            isDefault: true,
            billingAddress: {
              street: "123 Main St",
              city: "New York",
              state: "NY",
              zipCode: "10001",
              country: "United States",
            },
            lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "card_2",
            cardholderName: "John Doe",
            cardNumber: "5555555555554444",
            expMonth: "12",
            expYear: "2025",
            cardType: CardType.MASTERCARD,
            isDefault: false,
            billingAddress: {
              street: "123 Main St",
              city: "New York",
              state: "NY",
              zipCode: "10001",
              country: "United States",
            },
            lastUsed: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "card_3",
            cardholderName: "John Doe",
            cardNumber: "378282246310005",
            expMonth: "04",
            expYear: "2026",
            cardType: CardType.AMEX,
            isDefault: false,
            billingAddress: {
              street: "456 Park Ave",
              city: "Boston",
              state: "MA",
              zipCode: "02108",
              country: "United States",
            },
          },
        ];

        setPaymentMethods(methods);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading payment methods:", error);
        setIsLoading(false);
        toast.error("Failed to load payment methods");
      }
    };

    loadPaymentMethods();
  }, []);
    // Detect card type from number
  const detectCardType = (cardNumber: string): CardType => {
    const cleanNumber = cardNumber.replace(/\s+/g, '');
    
    if (/^4[0-9]{12}(?:[0-9]{3,6})?$/.test(cleanNumber)) {
      return CardType.VISA;
    } else if (/^5[1-5][0-9]{14}$/.test(cleanNumber)) {
      return CardType.MASTERCARD;
    } else if (/^3[47][0-9]{13}$/.test(cleanNumber)) {
      return CardType.AMEX;
    } else if (/^6(?:011|5[0-9]{2})[0-9]{12}$/.test(cleanNumber)) {
      return CardType.DISCOVER;
    } else if (/^(?:2131|1800|35\d{3})\d{11}$/.test(cleanNumber)) {
      return CardType.JCB;
    } else if (/^3(?:0[0-5]|[68][0-9])[0-9]{11}$/.test(cleanNumber)) {
      return CardType.DINERS;
    }
    
    return CardType.UNKNOWN;
  };

  // Format card number with spaces for display
  const formatCardNumber = (cardNumber: string): string => {
    const cleanNumber = cardNumber.replace(/\s+/g, '');
    const cardType = detectCardType(cleanNumber);
    
    if (cardType === CardType.AMEX) {
      return cleanNumber.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
    }
    
    return cleanNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  // Mask card number for display
  const maskCardNumber = (cardNumber: string): string => {
    const cleanNumber = cardNumber.replace(/\s+/g, '');
    const lastFourDigits = cleanNumber.slice(-4);
    const maskedPart = '•'.repeat(cleanNumber.length - 4);
    
    if (detectCardType(cleanNumber) === CardType.AMEX) {
      return `${maskedPart.slice(0, 4)} ${maskedPart.slice(4, 10)} ${lastFourDigits}`;
    }
    
    const formatted = `${maskedPart.slice(0, 4)} ${maskedPart.slice(4, 8)} ${maskedPart.slice(8, 12)} ${lastFourDigits}`;
    return formatted;
  };

  // Toggle card number visibility
  const toggleCardNumberVisibility = (cardId: string) => {
    setShowCardNumber(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  // Handle add payment method form submission
  const onAddCard = async (values: PaymentFormValues) => {
    try {
      setIsLoading(true);
      
      // In a real app, you would call your API here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCard: PaymentMethod = {
        id: `card_${Date.now()}`,
        cardholderName: values.cardholderName,
        cardNumber: values.cardNumber.replace(/\s+/g, ''),
        expMonth: values.expMonth,
        expYear: values.expYear,
        cardType: detectCardType(values.cardNumber),
        isDefault: values.isDefault,
        billingAddress: values.billingAddress,
      };
      
      // If setting as default, update other cards
      if (values.isDefault) {
        const updatedMethods = paymentMethods.map(method => ({
          ...method,
          isDefault: false
        }));
        setPaymentMethods([...updatedMethods, newCard]);
      } else {
        setPaymentMethods([...paymentMethods, newCard]);
      }
      
      toast.success("Payment method added successfully");
      setIsAddDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error adding payment method:", error);
      toast.error("Failed to add payment method");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit payment method
  const onEditCard = async (values: PaymentFormValues) => {
    if (!currentCardId) return;
    
    try {
      setIsLoading(true);
      
      // In a real app, you would call your API here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedMethods = paymentMethods.map(method => {
        if (method.id === currentCardId) {
          return {
            ...method,
            cardholderName: values.cardholderName,
            expMonth: values.expMonth,
            expYear: values.expYear,
            isDefault: values.isDefault,
            billingAddress: values.billingAddress,
          };
        }
        
        // If current card is set as default, remove default from others
        if (values.isDefault) {
          return {
            ...method,
            isDefault: false
          };
        }
        
        return method;
      });
      
      setPaymentMethods(updatedMethods);
      toast.success("Payment method updated successfully");
      setIsEditMode(false);
      setCurrentCardId(null);
    } catch (error) {
      console.error("Error updating payment method:", error);
      toast.error("Failed to update payment method");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a payment method
  const deletePaymentMethod = async (id: string) => {
    try {
      setIsLoading(true);
      
      // In a real app, you would call your API here
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const isDefault = paymentMethods.find(m => m.id === id)?.isDefault;
      let updatedMethods = paymentMethods.filter(method => method.id !== id);
      
      // If we deleted the default card and have other cards left, make another one default
      if (isDefault && updatedMethods.length > 0) {
        updatedMethods[0].isDefault = true;
      }
      
      setPaymentMethods(updatedMethods);
      toast.success("Payment method removed");
    } catch (error) {
      console.error("Error deleting payment method:", error);
      toast.error("Failed to remove payment method");
    } finally {
      setIsLoading(false);
    }
  };

  // Set a card as default
  const setDefaultMethod = async (id: string) => {
    try {
      setIsLoading(true);
      
      // In a real app, you would call your API here
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedMethods = paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === id
      }));
      
      setPaymentMethods(updatedMethods);
      toast.success("Default payment method updated");
    } catch (error) {
      console.error("Error setting default payment method:", error);
      toast.error("Failed to update default payment method");
    } finally {
      setIsLoading(false);
    }
  };

  // Edit a payment method - opens dialog and populates form
  const editPaymentMethod = (id: string) => {
    const card = paymentMethods.find(method => method.id === id);
    if (!card) return;
    
    form.reset({
      cardholderName: card.cardholderName,
      cardNumber: card.cardNumber, // In real app, this would be retrieved from backend
      expMonth: card.expMonth,
      expYear: card.expYear,
      cvc: "", // Don't prefill CVC for security
      isDefault: card.isDefault,
      saveForFuture: true,
      billingAddress: card.billingAddress || {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "United States",
      }
    });
    
    setCurrentCardId(id);
    setIsEditMode(true);
    setIsAddDialogOpen(true);
  };

  // Get card logo based on type
  const getCardLogo = (type: CardType) => {
    switch (type) {
      case CardType.VISA:
        return (
          <div className="text-[0.65rem] font-bold text-white tracking-wider">
            VISA
          </div>
        );
      case CardType.MASTERCARD:
        return (
          <div className="text-[0.65rem] font-bold text-white tracking-wider">
            MASTERCARD
          </div>
        );
      case CardType.AMEX:
        return (
          <div className="text-[0.65rem] font-bold text-white tracking-wider">
            AMEX
          </div>
        );
      case CardType.DISCOVER:
        return (
          <div className="text-[0.65rem] font-bold text-white tracking-wider">
            DISCOVER
          </div>
        );
      default:
        return (
          <div className="text-[0.65rem] font-bold text-white tracking-wider">
            CARD
          </div>
        );
    }
  };

  // Get card background color based on type
  const getCardColor = (type: CardType) => {
    switch (type) {
      case CardType.VISA:
        return "bg-gradient-to-r from-blue-600 to-blue-800";
      case CardType.MASTERCARD:
        return "bg-gradient-to-r from-red-500 to-orange-500";
      case CardType.AMEX:
        return "bg-gradient-to-r from-sky-500 to-cyan-500";
      case CardType.DISCOVER:
        return "bg-gradient-to-r from-orange-400 to-amber-500";
      case CardType.JCB:
        return "bg-gradient-to-r from-green-600 to-emerald-600";
      case CardType.DINERS:
        return "bg-gradient-to-r from-slate-600 to-slate-800";
      default:
        return "bg-gradient-to-r from-slate-700 to-slate-900";
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage your payment methods for a quicker checkout
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          if (!open) {
            form.reset();
            setIsEditMode(false);
            setCurrentCardId(null);
          }
          setIsAddDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Add Payment Method
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? "Edit Payment Method" : "Add Payment Method"}
              </DialogTitle>
              <DialogDescription>
                {isEditMode 
                  ? "Update your card details and billing information." 
                  : "Enter your card details to save a new payment method."}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(isEditMode ? onEditCard : onAddCard)} className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="cardholderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cardholder Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Card Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="1234 5678 9012 3456" 
                              {...field}
                              disabled={isEditMode} // Don't allow editing card number
                              onChange={(e) => {
                                // Format card number with spaces as user types
                                const val = e.target.value.replace(/\s+/g, '');
                                const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
                                field.onChange(formatted);
                              }}
                              className="pr-10"
                            />
                            {isEditMode ? (
                              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Button 
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                                onClick={() => setShowCVC(!showCVC)}
                              >
                                {showCVC ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiration">Expiration Date</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name="expMonth"
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger id="expMonth">
                                  <SelectValue placeholder="MM" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 12 }, (_, i) => {
                                    const month = (i + 1).toString().padStart(2, '0');
                                    return (
                                      <SelectItem key={month} value={month}>
                                        {month}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="expYear"
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger id="expYear">
                                  <SelectValue placeholder="YY" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 10 }, (_, i) => {
                                    const year = (new Date().getFullYear() + i).toString();
                                    return (
                                      <SelectItem key={year} value={year}>
                                        {year}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="cvc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CVC</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="123" 
                                maxLength={4}
                                type={showCVC ? "text" : "password"}
                                {...field}
                              />
                              <Button 
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                                onClick={() => setShowCVC(!showCVC)}
                              >
                                {showCVC ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Billing Address</h4>
                  
                  <FormField
                    control={form.control}
                    name="billingAddress.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="billingAddress.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="New York" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="billingAddress.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="NY" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="billingAddress.zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input placeholder="10001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="billingAddress.country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="United States">United States</SelectItem>
                              <SelectItem value="Canada">Canada</SelectItem>
                              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                              <SelectItem value="Australia">Australia</SelectItem>
                              <SelectItem value="Germany">Germany</SelectItem>
                              <SelectItem value="France">France</SelectItem>
                              <SelectItem value="Japan">Japan</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="isDefault"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Set as default payment method
                          </FormLabel>
                          <FormDescription>
                            This card will be used by default when checking out
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="saveForFuture"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-1">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Save securely for future payments
                          </FormLabel>
                          <FormDescription>
                            Your card details will be securely encrypted
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <div className="w-full flex flex-col-reverse sm:flex-row justify-between gap-4 sm:gap-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Shield className="h-4 w-4 mr-1.5" />
                      <span>Your payment info is securely encrypted</span>
                    </div>
                    <div className="flex gap-2 sm:justify-end">
                      <DialogClose asChild>
                        <Button type="button" variant="outline">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isEditMode ? "Updating..." : "Adding..."}
                          </>
                        ) : (
                          <>
                            {isEditMode ? "Update" : "Add"} Payment Method
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && !paymentMethods.length ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-[280px] h-[170px] rounded-lg bg-slate-200 animate-pulse" />
                <div className="flex-1 py-2 space-y-4">
                  <div className="h-5 w-36 bg-slate-200 animate-pulse rounded" />
                  <div className="h-4 w-24 bg-slate-200 animate-pulse rounded" />
                  <div className="h-4 w-40 bg-slate-200 animate-pulse rounded" />
                  <div className="pt-3 flex gap-2">
                    <div className="h-9 w-20 bg-slate-200 animate-pulse rounded" />
                    <div className="h-9 w-20 bg-slate-200 animate-pulse rounded" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : paymentMethods.length > 0 ? (
        <div className="space-y-6">
          <AnimatePresence>
            {paymentMethods.map((method) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2 }}
                layout
                className="border rounded-lg p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Credit Card Visual */}
                  <div 
                    className={`w-full sm:w-[280px] h-[170px] rounded-lg ${getCardColor(method.cardType)} p-4 relative overflow-hidden flex flex-col justify-between`}
                  >
                    {/* Card chip and type */}
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-9 bg-yellow-200/80 rounded-md flex items-center justify-center">
                        <div className="w-8 h-6 border-2 border-yellow-600/30 rounded-sm" />
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded">
                        {getCardLogo(method.cardType)}
                      </div>
                    </div>
                    
                    {/* Card number */}
                    <div className="text-white font-mono text-lg tracking-widest my-4 flex items-center">
                      {showCardNumber[method.id] ? (
                        formatCardNumber(method.cardNumber)
                      ) : (
                        maskCardNumber(method.cardNumber)
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-6 w-6 ml-1 text-white opacity-80 hover:opacity-100 hover:text-white"
                        onClick={() => toggleCardNumberVisibility(method.id)}
                      >
                        {showCardNumber[method.id] ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                    
                    {/* Cardholder name and expiry */}
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-white/70 text-xs uppercase tracking-wider">Card Holder</p>
                        <p className="text-white font-medium tracking-wide">{method.cardholderName}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-white/70 text-xs uppercase tracking-wider">Expires</p>
                        <p className="text-white font-medium">{method.expMonth}/{method.expYear.slice(-2)}</p>
                      </div>
                    </div>
                    
                    {/* Abstract decoration */}
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full" />
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-black/10 backdrop-blur-sm rounded-full" />
                  </div>
                  
                  {/* Card details and actions */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          {method.cardType.charAt(0).toUpperCase() + method.cardType.slice(1)} •••• {method.cardNumber.slice(-4)}
                          {method.isDefault && (
                            <Badge variant="outline" className="text-primary border-primary ml-2">Default</Badge>
                          )}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => editPaymentMethod(method.id)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove payment method?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove this card? This action cannot be undone.
                                  {method.isDefault && (
                                    <div className="mt-2 p-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-md">
                                      This is your default payment method. Another card will be set as default if available.
                                    </div>
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deletePaymentMethod(method.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mt-1">
                        Expires {method.expMonth}/{method.expYear}
                      </p>
                      
                      <div className="mt-3 text-sm">
                        <p className="text-muted-foreground">Billing Address:</p>
                        <p>
                          {method.billingAddress?.street}, {method.billingAddress?.city}, {method.billingAddress?.state} {method.billingAddress?.zipCode}
                        </p>
                      </div>
                      
                      {method.lastUsed && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Last used: {format(new Date(method.lastUsed), 'MMMM d, yyyy')}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {!method.isDefault && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setDefaultMethod(method.id)}
                        >
                          <Check className="mr-1.5 h-3.5 w-3.5" />
                          Set as Default
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => editPaymentMethod(method.id)}
                      >
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                        Edit Details
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <CreditCard className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No payment methods</h3>
          <p className="text-muted-foreground mt-1 mb-6 max-w-md mx-auto">
            You haven't added any payment methods yet. Add a payment method to make checkout faster.
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Payment Method
          </Button>
        </div>
      )}

      <Separator className="my-8" />
      
      <div className="flex flex-col sm:flex-row items-start gap-4 justify-between">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-1.5">
            <Shield className="h-4 w-4" /> 
            Payment Security
          </h3>
          <p className="text-muted-foreground mt-1">
            We protect your payment information using industry-leading encryption.
          </p>
        </div>
        
        <Button variant="outline" className="self-start">
          <Lock className="mr-2 h-4 w-4" />
          Manage Security Settings
        </Button>
      </div>
      
      <div className="mt-4 grid sm:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg flex flex-col items-center text-center">
          <Shield className="h-8 w-8 text-primary mb-2" />
          <h4 className="font-medium">Encrypted Storage</h4>
          <p className="text-sm text-muted-foreground">
            Your card details are encrypted and securely stored
          </p>
        </div>
        
        <div className="p-4 border rounded-lg flex flex-col items-center text-center">
          <Lock className="h-8 w-8 text-primary mb-2" />
          <h4 className="font-medium">Secure Payments</h4>
          <p className="text-sm text-muted-foreground">
            All transactions are processed through secure channels
          </p>
        </div>
        
        <div className="p-4 border rounded-lg flex flex-col items-center text-center">
          <AlertCircle className="h-8 w-8 text-primary mb-2" />
          <h4 className="font-medium">Fraud Protection</h4>
          <p className="text-sm text-muted-foreground">
            Advanced fraud monitoring protects your payments
          </p>
        </div>
      </div>
    </div>
  );
}