"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

enum ProductTag {
  NEW_ARRIVALS = "NEW_ARRIVALS",
  BEST_SELLERS = "BEST_SELLERS",
  SPECIAL_DEALS = "SPECIAL_DEALS",
  GIFT_SETS = "GIFT_SETS",
  TRENDING_NOW = "TRENDING_NOW",
}

// Define tag display names
const tagDisplayNames: Record<string, string> = {
  [ProductTag.NEW_ARRIVALS]: "New Arrivals",
  [ProductTag.BEST_SELLERS]: "Best Sellers",
  [ProductTag.SPECIAL_DEALS]: "Special Deals",
  [ProductTag.GIFT_SETS]: "Gift Sets",
  [ProductTag.TRENDING_NOW]: "Trending Now",
};

interface TagTabsFilterProps {
  currentTag?: string;
  onTagChange: (tag: string | undefined) => void;
}

export default function TagTabsFilter({
  currentTag,
  onTagChange,
}: TagTabsFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Handle tab change and update URL
  const handleTabChange = (value: string) => {
    // For "all", pass undefined to clear tag filter
    const newTag = value === "" ? undefined : value;
    onTagChange(newTag);

    // Update URL search params
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "") {
      params.set("feature", value);
    } else {
      params.delete("feature");
    }

    // Update the URL without reloading the page
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mb-6 bg-white rounded-lg shadow-sm p-2">
      <h3 className="text-sm font-medium text-gray-600 mb-2 px-2">Features</h3>
      <Tabs
        defaultValue={currentTag || ""}
        value={currentTag || ""}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="w-full flex flex-wrap justify-start mb-2 p-1">
          <TabsTrigger
            value=""
            className="rounded-md flex-grow-0 data-[state=active]:bg-purple-600 data-[state=active]:text-white px-4 py-2 text-sm"
          >
            All Features
          </TabsTrigger>

          {Object.values(ProductTag).map((tag) => (
            <TabsTrigger
              key={tag}
              value={tag}
              className="rounded-md flex-grow-0 data-[state=active]:bg-purple-600 data-[state=active]:text-white px-4 py-2 text-sm"
            >
              {tagDisplayNames[tag]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
