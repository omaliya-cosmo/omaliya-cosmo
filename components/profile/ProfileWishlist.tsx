"use client"
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ShoppingCart, X, Eye, AlertCircle } from 'lucide-react';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface WishlistItem {
  id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  image: string;
  inStock: boolean;
  category: string;
  dateAdded: string;
}

// Sample wishlist items data
const sampleWishlistItems: WishlistItem[] = [
  {
    id: '1',
    name: 'Skin Revival Serum',
    description: 'Advanced formula with hyaluronic acid for deep hydration and skin renewal',
    price: 79.99,
    discountedPrice: 59.99,
    image: '/images/products/serum.jpg',
    inStock: true,
    category: 'Serums',
    dateAdded: '2023-10-15'
  },
  {
    id: '2',
    name: 'Gentle Cleansing Foam',
    description: 'Sulfate-free cleanser that removes impurities without stripping natural oils',
    price: 34.99,
    image: '/images/products/cleanser.jpg',
    inStock: true,
    category: 'Cleansers',
    dateAdded: '2023-10-10'
  },
  {
    id: '3',
    name: 'Overnight Repair Mask',
    description: 'Intensive treatment that works while you sleep to restore skin vitality',
    price: 49.99,
    image: '/images/products/mask.jpg',
    inStock: false,
    category: 'Masks',
    dateAdded: '2023-09-28'
  },
  {
    id: '4',
    name: 'Brightening Eye Cream',
    description: 'Targets dark circles and puffiness with vitamin C and peptides',
    price: 45.99,
    discountedPrice: 38.99,
    image: '/images/products/eye-cream.jpg',
    inStock: true,
    category: 'Eye Care',
    dateAdded: '2023-09-20'
  }
];

const ProfileWishlist: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(sampleWishlistItems);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  // Handle remove from wishlist
  const handleRemoveFromWishlist = async (itemId: string) => {
    try {
      setIsLoading((prev) => ({ ...prev, [itemId]: true }));
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setWishlistItems(wishlistItems.filter(item => item.id !== itemId));
      toast.success('Item removed from wishlist');
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
      toast.error('Failed to remove item from wishlist');
    } finally {
      setIsLoading((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  // Handle add to cart
  const handleAddToCart = async (item: WishlistItem) => {
    try {
      const itemId = item.id;
      setIsLoading((prev) => ({ ...prev, [itemId]: true }));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`${item.name} added to cart`);
      // In a real implementation, you might want to add the item to the cart
      // state/context and optionally remove it from the wishlist
    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setIsLoading((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  // Handle view product details
  const handleViewProduct = (itemId: string) => {
    // In a real implementation, this would navigate to the product detail page
    console.log(`Viewing product details for item ${itemId}`);
    // Example: router.push(`/product/${itemId}`);
  };

  // Function to format price
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Wishlist</CardTitle>
        <CardDescription>
          Items you've saved for later
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        {wishlistItems.length > 0 ? (
          <div className="space-y-6">
            {wishlistItems.map((item) => (
              <div 
                key={item.id} 
                className="flex flex-col sm:flex-row items-start gap-4 p-4 border rounded-md relative"
              >
                <div 
                  className="w-full sm:w-24 h-24 bg-gray-100 rounded-md overflow-hidden relative"
                  style={{ 
                    backgroundImage: `url(${item.image})`, 
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {!item.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="destructive" className="text-xs">
                        Out of Stock
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h3 className="font-medium text-base">{item.name}</h3>
                    <div className="flex items-center gap-2">
                      {item.discountedPrice ? (
                        <>
                          <span className="text-muted-foreground line-through text-sm">
                            {formatPrice(item.price)}
                          </span>
                          <span className="font-medium text-red-600">
                            {formatPrice(item.discountedPrice)}
                          </span>
                        </>
                      ) : (
                        <span className="font-medium">
                          {formatPrice(item.price)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="mt-1 mb-2">
                    {item.category}
                  </Badge>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {item.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => handleViewProduct(item.id)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View Details</span>
                    </Button>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.inStock || isLoading[item.id]}
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      <span>
                        {isLoading[item.id] ? 'Adding...' : 'Add to Cart'}
                      </span>
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Remove</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove from Wishlist</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove "{item.name}" from your wishlist?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveFromWishlist(item.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {isLoading[item.id] ? 'Removing...' : 'Remove'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                <div className="absolute top-2 right-2 sm:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <svg 
                          width="15" 
                          height="15" 
                          viewBox="0 0 15 15" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                        >
                          <path 
                            d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" 
                            fill="currentColor" 
                            fillRule="evenodd" 
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewProduct(item.id)}>
                        <Eye className="h-3.5 w-3.5 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleAddToCart(item)}
                        disabled={!item.inStock}
                      >
                        <ShoppingCart className="h-3.5 w-3.5 mr-2" />
                        Add to Cart
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleRemoveFromWishlist(item.id)}
                        className="text-red-600"
                      >
                        <X className="h-3.5 w-3.5 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Browse our products and add items to your wishlist to save them for later.
            </p>
            <Button>
              Browse Products
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileWishlist;
