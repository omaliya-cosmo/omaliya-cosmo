import React from "react";
import Link from "next/link";
import {
  FiPackage,
  FiCheck,
  FiAlertCircle,
  FiStar,
  FiAward,
  FiHeart,
  FiShield,
  FiTruck,
} from "react-icons/fi";
import { ProductCategory } from "@prisma/client";

interface ProductInfoProps {
  name: string;
  category?: ProductCategory;
  stock: number;
  rating?: number;
  reviewCount?: number;
  onWishlistToggle?: () => void;
  isWishlisted?: boolean;
}

const Badge: React.FC<{ text: string; color: string }> = ({ text, color }) => (
  <span
    className={`px-3 py-1 bg-${color}-100 text-${color}-800 text-xs font-semibold rounded hover:bg-${color}-200 transition-colors`}
  >
    {text}
  </span>
);

const Rating: React.FC<{ rating?: number; reviewCount?: number }> = ({
  rating,
  reviewCount,
}) => (
  <div className="flex items-center group p-2 rounded-lg">
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          className={
            star <= Math.round(rating || 0)
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300"
          }
          size={18}
        />
      ))}
    </div>
    <div className="ml-2 text-sm text-gray-600">
      <span className="font-medium">{rating}</span>
      <span className="mx-1">·</span>
      <Link href="#reviews" className="hover:text-indigo-600 hover:underline">
        {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
      </Link>
    </div>
  </div>
);

const StockStatus: React.FC<{ stock: number }> = ({ stock }) => {
  const getStockStatusColor = () => {
    if (stock > 10) return "text-green-500";
    if (stock > 0) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border border-gray-200 rounded-md p-3">
      <div className={`flex items-center ${getStockStatusColor()}`}>
        {stock > 0 ? (
          <>
            <FiCheck className="mr-2" size={18} />
            <span className="font-medium">
              {stock > 10
                ? "In Stock"
                : stock > 5
                ? "Limited Stock"
                : "Low Stock - Order Soon"}
            </span>
          </>
        ) : (
          <>
            <FiAlertCircle className="mr-2" size={18} />
            <span className="font-medium">Out of Stock</span>
          </>
        )}
      </div>
      {stock > 0 && (
        <div className="text-sm text-gray-600">
          <FiPackage className="inline mr-1" />
          <span>
            {stock} {stock === 1 ? "unit" : "units"} available
          </span>
        </div>
      )}
    </div>
  );
};

const ProductInfo: React.FC<ProductInfoProps> = ({
  name,
  category,
  stock,
  rating,
  reviewCount,
  onWishlistToggle,
  isWishlisted = false,
}) => {
  return (
    <div className="space-y-6">
      {/* Product Badges */}
      <div className="flex flex-wrap gap-2">
        {[
          { text: "Fan Favorite", color: "yellow" },
          { text: "Premium Pick", color: "purple" },
          { text: "Limited Release", color: "red" },
        ].map((badge) => (
          <Badge key={badge.text} text={badge.text} color={badge.color} />
        ))}
      </div>

      {/* Header: Title and Wishlist */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
          {name}
        </h1>
        <button
          onClick={onWishlistToggle}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Add to wishlist"
        >
          <FiHeart
            className={`w-6 h-6 ${
              isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"
            }`}
          />
        </button>
      </div>

      {/* Rating and Category Section */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <Rating rating={rating} reviewCount={reviewCount} />
          </div>
          {category?.name && (
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium">
                {category.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stock Status */}
      <StockStatus stock={stock} />
    </div>
  );
};

export default ProductInfo;
