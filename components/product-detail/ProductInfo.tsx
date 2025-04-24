import React from "react";
import { Badge } from "@/components/ui/badge";
import { Star, Check } from "lucide-react";
import { motion } from "framer-motion";

interface ProductInfoProps {
  name: string;
  description: string;
  category?: {
    id: string;
    name: string;
  };
  stock: number;
  rating?: number;
  reviewCount?: number;
}

export default function ProductInfo({
  name,
  description,
  category,
  stock,
  rating = 4.5,
  reviewCount = 24,
}: ProductInfoProps) {
  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, index) => {
      const filled = index < Math.floor(rating);
      const halfFilled = !filled && index < Math.ceil(rating);

      return (
        <Star
          key={index}
          className={`w-4 h-4 ${
            filled || halfFilled
              ? "text-amber-400 fill-amber-400"
              : "text-gray-300"
          }`}
        />
      );
    });
  };

  return (
    <div className="mb-6">
      {/* Category and stock badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        {category && (
          <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 hover:from-purple-200 hover:to-pink-200 border-none">
            {category.name}
          </Badge>
        )}

        {stock > 0 ? (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
          >
            <Check className="h-3 w-3" />
            In Stock
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-500 border-gray-300"
          >
            Out of Stock
          </Badge>
        )}
      </div>

      {/* Product name with gradient */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-800 to-pink-700"
      >
        {name}
      </motion.h1>

      {/* Rating */}
      <div className="flex items-center mb-4">
        <div className="flex mr-2">{renderStars()}</div>
        <span className="text-sm text-gray-600">
          {rating.toFixed(1)} ({reviewCount} reviews)
        </span>
      </div>

      {/* Description */}
      <div className="mb-6">
        <p className="text-gray-700">{description}</p>
      </div>

      {/* Additional product features */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100/50 shadow-sm mb-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-3">
          Key Features
        </h3>
        <ul className="space-y-2">
          <li className="flex items-center">
            <Check className="h-4 w-4 text-purple-600 mr-2" />
            <span className="text-sm">High-quality materials</span>
          </li>
          <li className="flex items-center">
            <Check className="h-4 w-4 text-purple-600 mr-2" />
            <span className="text-sm">Easy and secure payment methods</span>
          </li>
          <li className="flex items-center">
            <Check className="h-4 w-4 text-purple-600 mr-2" />
            <span className="text-sm">Backed by customer satisfaction</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
