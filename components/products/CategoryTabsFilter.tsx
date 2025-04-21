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
        <TabsList className="w-full flex flex-wrap justify-start mb-8 bg-red-808">
          <TabsTrigger
            value=""
            className="rounded-md flex-grow-0 data-[state=active]:bg-purple-600 data-[state=active]:text-white px-8 py-6 text-sm"
          >
            All Categories
          </TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.name.toLowerCase()}
              className="rounded-md flex-grow-0 data-[state=active]:bg-purple-600 data-[state=active]:text-white px-8 py-6 text-sm"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
