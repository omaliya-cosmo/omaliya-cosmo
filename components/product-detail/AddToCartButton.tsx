"use client";
import React, { useState, useEffect } from "react";
import { 
  FiShoppingCart, 
  FiHeart, 
  FiCheck, 
  FiShare2, 
  FiCreditCard,
  FiFacebook,
  FiTwitter,
  FiMail
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { Product } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";

interface AddToCartButtonProps {
  product: Product;
  quantity: number;
  currency: "LKR" | "USD";
}

// Toast notification component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-5 right-5 p-4 rounded-md shadow-lg z-50 flex items-center ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
      } text-white`}
    >
      {type === 'success' ? <FiCheck className="mr-2" /> : null}
      {message}
    </motion.div>
  );
};

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  quantity,
  currency,
}) => {
  const [addedToCart, setAddedToCart] = useState(false);
  const [addedToWishlist, setAddedToWishlist] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' } | null>(null);
  
  // Check if product is in stock and validate quantity
  const isInStock = product.stock > 0;
  const isQuantityValid = quantity <= product.stock;

  // Handle adding to cart
  const handleAddToCart = () => {
    if (!isInStock || !isQuantityValid) {
      setToast({
        show: true,
        message: !isInStock ? "This product is out of stock" : "Requested quantity exceeds available stock",
        type: 'error'
      });
      return;
    }
    
    // In a real implementation, this would interact with a cart context or API
    console.log("Adding to cart:", {
      productId: product.id,
      quantity,
      price: currency === "LKR" ? product.priceLKR : product.priceUSD,
    });
    
    // Show success message
    setAddedToCart(true);
    setToast({
      show: true,
      message: `${quantity} ${quantity === 1 ? 'item' : 'items'} added to your cart`,
      type: 'success'
    });
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Handle buy now (add to cart and redirect to checkout)

  const handleBuyNow = () => {
    if (!isInStock || !isQuantityValid) {
      setToast({
        show: true,
        message: !isInStock ? "This product is out of stock" : "Requested quantity exceeds available stock",
        type: 'error'
      });
      return;
    }
    
    // First add to cart
    console.log("Adding to cart for immediate checkout:", {
      productId: product.id,
      quantity,
      price: currency === "LKR" ? product.priceLKR : product.priceUSD,
    });
    
    // Then redirect to checkout (implement actual redirect in a real app)
    console.log("Redirecting to checkout...");
    setToast({
      show: true,
      message: "Redirecting to checkout...",
      type: 'success'
    });
    
    // In a real app, you would redirect to checkout page
    // window.location.href = "/checkout";

  };

  const handleAddToWishlist = () => {
    // Toggle wishlist state
    setAddedToWishlist(!addedToWishlist);

    setToast({
      show: true,
      message: !addedToWishlist 
        ? "Added to your wishlist" 
        : "Removed from your wishlist",
      type: 'success'
    });
  };

  // Main share function
  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
  };

  // Social sharing functions
  const shareViaFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
    setShowShareOptions(false);
  };
  
  const shareViaTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${product.name}`)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
    setShowShareOptions(false);
  };
  
  const shareViaWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`Check out ${product.name}: ${window.location.href}`)}`;
    window.open(url, '_blank');
    setShowShareOptions(false);
  };
  
  const shareViaEmail = () => {
    const url = `mailto:?subject=${encodeURIComponent(`Check out this product: ${product.name}`)}&body=${encodeURIComponent(`I thought you might be interested in this product:\n\n${product.name}\n\n${product.description}\n\n${window.location.href}`)}`;
    window.location.href = url;
    setShowShareOptions(false);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setToast({
      show: true,
      message: "Link copied to clipboard!",
      type: 'success'
    });
    setShowShareOptions(false);
  };

  return (
    <div className="space-y-4">
      {/* Toast notifications */}
      <AnimatePresence>
        {toast?.show && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
      
      {/* Main action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Add to Cart button */}
        <motion.button
          onClick={handleAddToCart}
          disabled={!isInStock || addedToCart || !isQuantityValid}
          whileTap={{ scale: 0.95 }}
          className={`flex-1 flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            !isInStock || !isQuantityValid
              ? "bg-gray-400 cursor-not-allowed"
              : addedToCart
              ? "bg-green-600 hover:bg-green-700"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {!isInStock ? (
            "Out of Stock"
          ) : !isQuantityValid ? (
            "Exceeds Available Stock"
          ) : addedToCart ? (
            <>
              <FiCheck className="mr-2" />
              Added to Cart
            </>
          ) : (
            <>
              <FiShoppingCart className="mr-2" />
              Add to Cart
            </>
          )}
        </motion.button>

        {/* Buy Now button */}
        <motion.button
          onClick={handleBuyNow}
          disabled={!isInStock || !isQuantityValid}
          whileTap={{ scale: 0.95 }}
          className={`flex-1 flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
            !isInStock || !isQuantityValid ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FiCreditCard className="mr-2" />
          Buy Now
        </motion.button>
      </div>

      {/* Secondary actions */}
      <div className="flex gap-3">
        {/* Wishlist button */}
        <motion.button
          onClick={handleAddToWishlist}
          whileTap={{ scale: 0.95 }}
          className={`flex-1 flex items-center justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            addedToWishlist
              ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 focus:ring-red-500"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-indigo-500"
          }`}
          title={addedToWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <FiHeart

            className={`mr-2 ${addedToWishlist ? "fill-red-600 text-red-600" : ""}`}

          />
          {addedToWishlist ? "Saved" : "Save to Wishlist"}
        </motion.button>

        {/* Share button */}
        <motion.div className="relative">
          <motion.button
            onClick={handleShare}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            title="Share Product"
          >
            <FiShare2 className="mr-2" />
            Share
          </motion.button>
          
          {/* Share options dropdown */}
          {showShareOptions && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200"
            >
              <button 
                onClick={shareViaFacebook}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
              >
                <FiFacebook className="mr-2 text-blue-600" />
                Facebook
              </button>
              <button 
                onClick={shareViaTwitter}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
              >
                <FiTwitter className="mr-2 text-blue-400" />
                Twitter
              </button>
              <button 
                onClick={shareViaWhatsApp}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
              >
                <FaWhatsapp className="mr-2 text-green-500" />
                WhatsApp
              </button>
              <button 
                onClick={shareViaEmail}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
              >
                <FiMail className="mr-2 text-gray-500" />
                Email
              </button>
              <button 
                onClick={copyToClipboard}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
              >
                <FiCheck className="mr-2 text-green-500" />
                Copy Link
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Stock warning */}
      {isInStock && product.stock < 5 && (
        <p className="text-sm text-red-600 font-medium flex items-center">
          <svg className="w-4 h-4 mr-1 fill-current" viewBox="0 0 24 24">
            <path d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z" />
          </svg>
          Only {product.stock} left in stock - order soon!
        </p>
      )}

      {/* Extra product information */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <FiCheck className="text-green-500 mr-2" />
            <span>Secure checkout</span>
          </div>
          <div className="flex items-center">
            <FiCheck className="text-green-500 mr-2" />
            <span>Free shipping on orders over Rs 5,000</span>
          </div>
          <div className="flex items-center">
            <FiCheck className="text-green-500 mr-2" />
            <span>30-day money-back guarantee</span>
          </div>
        </div>
      </div>
      
      {/* Product tags */}
      {product.tags && product.tags.length > 0 && (
        <div className="pt-4">
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag, index) => (
              <span 
                key={index}
                className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddToCartButton;
