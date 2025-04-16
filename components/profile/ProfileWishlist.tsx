"use client"
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ShoppingCart, X, Eye, AlertCircle, Trash2, ShoppingBag, ChevronLeft, ChevronRight, Heart, Loader2, Star } from 'lucide-react';

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
import { Badge } from "@/components/ui/badge";
import Image from 'next/image';

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
  rating?: number;
  reviewCount?: number;
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
    dateAdded: '2023-10-15',
    rating: 4.5,
    reviewCount: 120
  },
  {
    id: '2',
    name: 'Gentle Cleansing Foam',
    description: 'Sulfate-free cleanser that removes impurities without stripping natural oils',
    price: 34.99,
    image: '/images/products/cleanser.jpg',
    inStock: true,
    category: 'Cleansers',
    dateAdded: '2023-10-10',
    rating: 4.0,
    reviewCount: 80
  },
  {
    id: '3',
    name: 'Overnight Repair Mask',
    description: 'Intensive treatment that works while you sleep to restore skin vitality',
    price: 49.99,
    image: '/images/products/mask.jpg',
    inStock: false,
    category: 'Masks',
    dateAdded: '2023-09-28',
    rating: 3.5,
    reviewCount: 50
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
    dateAdded: '2023-09-20',
    rating: 4.8,
    reviewCount: 200
  }
];

const ProfileWishlist: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(sampleWishlistItems);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  const totalPages = Math.ceil(wishlistItems.length / itemsPerPage);
  const filteredWishlist = wishlistItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
  const handleAddToCart = async (itemId: string) => {
    try {
      setIsAddingToCart(itemId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Item added to cart');
    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setIsAddingToCart(null);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto px-4">
      <Card>
        <CardHeader>
          <CardTitle>Your Wishlist</CardTitle>
          <CardDescription>
            Items you've saved for later
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          {filteredWishlist.length > 0 ? (
            <div className="space-y-4">
              {filteredWishlist.map(product => (
                <div 
                  key={product.id}
                  className="group relative flex flex-col sm:flex-row border rounded-lg overflow-hidden hover:border-purple-200 transition-all"
                >
                  <div className="relative w-full sm:w-36 h-36">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 p-4 flex flex-col">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-base">{product.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 mb-1">
                          {/* Price - show discount if available */}
                          {product.discountedPrice ? (
                            <>
                              <span className="font-semibold text-purple-600">${product.discountedPrice.toFixed(2)}</span>
                              <span className="text-sm text-muted-foreground line-through">${product.price.toFixed(2)}</span>
                            </>
                          ) : (
                            <span className="font-semibold">${product.price.toFixed(2)}</span>
                          )}
                        </div>
                        <div className="flex items-center text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.round(product.rating || 0)
                                  ? "fill-current"
                                  : "text-gray-300 fill-transparent"
                              }`}
                            />
                          ))}
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({product.reviewCount})
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-4 flex flex-wrap gap-2 justify-between items-center">
                      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-none">
                        {product.category}
                      </Badge>
                      
                      <div className="flex gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-rose-500 border-rose-200 hover:bg-rose-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove from wishlist</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove from Wishlist</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove "{product.name}" from your wishlist?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleRemoveFromWishlist(product.id)}
                                className="bg-rose-600 text-white hover:bg-rose-700"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        
                        <Button 
                          size="sm"
                          className="h-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                          onClick={() => handleAddToCart(product.id)}
                          disabled={isAddingToCart === product.id}
                        >
                          {isAddingToCart === product.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
                          )}
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Pagination */}
              {filteredWishlist.length > 0 && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0 border-purple-200"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Previous Page</span>
                    </Button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <Button
                        key={i}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        className={`h-8 w-8 p-0 ${
                          currentPage === i + 1 
                            ? "bg-purple-600 hover:bg-purple-700" 
                            : "border-purple-200 hover:bg-purple-50"
                        }`}
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0 border-purple-200"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Next Page</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Heart className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-medium mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground text-center mb-6">
                Products you love will appear here. Start browsing and add items to your wishlist!
              </p>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Browse Products
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileWishlist;
