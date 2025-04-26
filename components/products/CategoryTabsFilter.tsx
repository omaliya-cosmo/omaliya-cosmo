"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCategory } from "@prisma/client";
import axios from "axios";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface CategoryTabsFilterProps {
  currentCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryTabsFilter({
  currentCategory,
  onCategoryChange,
}: CategoryTabsFilterProps) {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Fetch categories from API
    axios
      .get("/api/categories")
      .then((res) => {
        setCategories(res.data.categories);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err.message);
      });
  }, []);

  // Handle tab change and update URL
  const handleTabChange = (value: string) => {
    onCategoryChange(value);

    // Update URL search params
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("category", value);
    } else {
      params.delete("category");
    }

    // Update the URL without reloading the page
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="rounded-lg mx-6">
      <Tabs
        defaultValue={currentCategory || ""}
        value={currentCategory}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="w-full flex flex-wrap justify-start mb-8 bg-red-808 overflow-x-auto tabs-list-container">
          <TabsTrigger
            value=""
            className="rounded-md flex-grow-0 data-[state=active]:bg-purple-600 data-[state=active]:text-white px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-6 text-xs sm:text-sm whitespace-nowrap"
          >
            All Categories
          </TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.name.toLowerCase()}
              className="rounded-md flex-grow-0 data-[state=active]:bg-purple-600 data-[state=active]:text-white px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-6 text-xs sm:text-sm whitespace-nowrap"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      
      <style jsx global>{`
        /* Hide scrollbar but keep functionality */
        .overflow-x-auto::-webkit-scrollbar {
          display: none;
        }
        
        .overflow-x-auto {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Add scroll snap for better mobile experience */
        @media (max-width: 640px) {
          .tabs-list-container {
            scroll-snap-type: x mandatory;
            position: relative;
          }
          
          [role="tab"] {
            scroll-snap-align: start;
            min-width: auto;
          }
        }
        
        /* Desktop enhancements - removed scrolling */
        @media (min-width: 1024px) {
          .tabs-list-container {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            justify-content: flex-start;
            padding-bottom: 0.5rem;
            overflow-x: visible !important; /* Remove horizontal scroll */
            overflow: visible;
            max-width: 100%;
          }
          
          [role="tab"] {
            transition: all 0.2s ease;
            flex-shrink: 1;
          }
          
          [role="tab"]:hover:not([data-state="active"]) {
            background-color: rgba(124, 58, 237, 0.05);
            transform: translateY(-1px);
          }
        }
        
        /* Better spacing for larger screens */
        @media (min-width: 1280px) {
          .tabs-list-container {
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}
