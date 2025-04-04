"use client";

import React, { useEffect, useState } from "react";
import { FiTrash2, FiPlus } from "react-icons/fi";
import axios from "axios";

import {
  Product,
  ProductsOnBundles as PrismaProductsOnBundles,
  PromoCode,
} from "@prisma/client";
import { BundleOffer as PrismaBundleOffer } from "@prisma/client";

interface ProductsOnBundles extends PrismaProductsOnBundles {
  product: Product;
}

interface BundleOffer extends PrismaBundleOffer {
  products: ProductsOnBundles[];
}

const SettingsPage = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [bundleOffers, setBundleOffers] = useState<BundleOffer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState("");
  const [newDiscount, setNewDiscount] = useState<number | "">("");
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
  const [newBundle, setNewBundle] = useState({
    bundleName: "",
    productIds: [] as string[],
    originalPriceLKR: 0,
    originalPriceUSD: 0,
    offerPriceLKR: 0,
    offerPriceUSD: 0,
    endDate: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPromoCodes = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/promocodes");
      setPromoCodes(res.data);
    } catch (error) {
      setError("Failed to fetch promo codes");
    } finally {
      setLoading(false);
    }
  };

  const fetchBundleOffers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/bundleoffers");

      setBundleOffers(res.data);
    } catch (error) {
      setError("Failed to fetch bundle offers");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/products");
      setProducts(res.data.products);
      setFilteredProducts(res.data.products);
    } catch (error) {
      alert("Failed to fetch products");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchPromoCodes(),
          fetchBundleOffers(),
          fetchProducts(),
        ]);
      } catch (error) {
        setError("Failed to fetch data");
      }
    };

    fetchData();
  }, []);

  const handleAddPromoCode = async () => {
    if (!newPromoCode || newDiscount === "") {
      alert("Please fill in all fields");
      return;
    }
    try {
      const res = await axios.post("/api/promocodes", {
        code: newPromoCode,
        discountPercentage: newDiscount,
      });
      fetchPromoCodes();
      setNewPromoCode("");
      setNewDiscount("");
      setIsModalOpen(false);
    } catch (error) {
      alert("Failed to add promo code");
    }
  };

  const handleDeletePromoCode = async (id: string) => {
    try {
      await axios.delete(`/api/promocodes/${id}`);
      setPromoCodes(promoCodes.filter((promo) => promo.id !== id));
    } catch (error) {
      alert("Failed to delete promo code");
    }
  };

  const handleAddBundleOffer = async () => {
    try {
      const updatedBundle = {
        ...newBundle,
        originalPriceLKR: Number(newBundle.originalPriceLKR),
        originalPriceUSD: Number(newBundle.originalPriceUSD),
        offerPriceLKR: Number(newBundle.offerPriceLKR),
        offerPriceUSD: Number(newBundle.offerPriceUSD),
        endDate: new Date(newBundle.endDate).toISOString(), // Ensure ISO-8601 format
      };

      const res = await axios.post("/api/bundleoffers", updatedBundle);

      fetchBundleOffers(); // Refresh the bundle offers list

      // Reset the form and close the modal
      setNewBundle({
        bundleName: "",
        productIds: [],
        originalPriceLKR: 0,
        originalPriceUSD: 0,
        offerPriceLKR: 0,
        offerPriceUSD: 0,
        endDate: "",
      });
      setIsBundleModalOpen(false);
    } catch (error) {
      alert("Failed to add bundle offer");
    }
  };

  const handleDeleteBundleOffer = async (id: string) => {
    try {
      await axios.delete(`/api/bundleoffers/${id}`);
      fetchBundleOffers();
    } catch (error) {
      alert("Failed to delete bundle offer");
    }
  };

  const toggleProductSelection = (productId: string) => {
    setNewBundle((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter((id) => id !== productId)
        : [...prev.productIds, productId],
    }));
  };

  const handleSearchProducts = (query: string) => {
    setSearchQuery(query);
    setFilteredProducts(
      products.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  return (
    <>
      {/* Promo Codes Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Promo Codes</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm flex items-center"
          >
            <FiPlus className="mr-2" /> Add Promo Code
          </button>
        </div>

        {loading ? (
          <p className="text-center py-6">Loading...</p>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            <p className="font-medium">{error}</p>
            <button
              onClick={fetchPromoCodes}
              className="mt-2 text-sm text-red-600 underline"
            >
              Try again
            </button>
          </div>
        ) : !promoCodes || promoCodes.length === 0 ? (
          <p className="text-center py-6">No promo codes found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promoCodes?.map((promo: PromoCode) => (
              <div
                key={promo.id}
                className="bg-gray-100 p-4 rounded-lg shadow-md"
              >
                <h2 className="text-lg font-bold text-gray-800">
                  {promo.code}
                </h2>
                <p className="text-sm text-gray-600">
                  Discount: {promo.discountPercentage}%
                </p>
                <button
                  onClick={() => handleDeletePromoCode(promo.id)}
                  className="mt-2 text-red-600 hover:text-red-900 inline-flex items-center"
                >
                  <FiTrash2 className="mr-1" size={16} /> Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/1 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Add New Promo Code
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Promo Code"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={newPromoCode}
                onChange={(e) => setNewPromoCode(e.target.value)}
              />
              <input
                type="number"
                placeholder="Discount Percentage"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={newDiscount}
                onChange={(e) =>
                  setNewDiscount(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />
            </div>
            <div className="flex justify-end mt-6 space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPromoCode}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bundle Offers Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Bundle Offers</h1>
          <button
            onClick={() => setIsBundleModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm flex items-center"
          >
            <FiPlus className="mr-2" /> Add Bundle Offer
          </button>
        </div>
        {loading ? (
          <p className="text-center py-6">Loading...</p>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            <p className="font-medium">{error}</p>
          </div>
        ) : bundleOffers.length === 0 ? (
          <p className="text-center py-6">No bundle offers found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bundleOffers.map((bundle) => (
              <div
                key={bundle.id}
                className="bg-gray-100 p-4 rounded-lg shadow-md"
              >
                <h2 className="text-lg font-bold text-gray-800">
                  {bundle.bundleName}
                </h2>
                <p className="text-sm text-gray-600">
                  Products:{" "}
                  {bundle.products
                    .map((product) => product.product.name)
                    .join(", ")}
                </p>
                <p className="text-sm text-gray-600">
                  Original Price: LKR {bundle.originalPriceLKR} / USD{" "}
                  {bundle.originalPriceUSD}
                </p>
                <p className="text-sm text-gray-600">
                  Offer Price: LKR {bundle.offerPriceLKR} / USD{" "}
                  {bundle.offerPriceUSD}
                </p>
                <p className="text-sm text-gray-600">
                  Ends on: {new Date(bundle.endDate).toLocaleDateString()}
                </p>
                <button
                  onClick={() => handleDeleteBundleOffer(bundle.id)}
                  className="mt-2 text-red-600 hover:text-red-900 inline-flex items-center"
                >
                  <FiTrash2 className="mr-1" size={16} /> Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Bundle Offer Modal */}
      {isBundleModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex mt-16 items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-11/12 overflow-y-auto">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Add New Bundle Offer
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Bundle Name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={newBundle.bundleName}
                onChange={(e) =>
                  setNewBundle({ ...newBundle, bundleName: e.target.value })
                }
              />
              <div>
                <input
                  type="text"
                  placeholder="Search Products"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
                  value={searchQuery}
                  onChange={(e) => handleSearchProducts(e.target.value)}
                />
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={newBundle.productIds.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="mr-2"
                      />
                      <label>{product.name}</label>
                    </div>
                  ))}
                </div>
              </div>
              <input
                type="number"
                placeholder="Original Price (LKR)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={newBundle.originalPriceLKR}
                onChange={(e) =>
                  setNewBundle({
                    ...newBundle,
                    originalPriceLKR: Number(e.target.value),
                  })
                }
              />
              <input
                type="number"
                placeholder="Original Price (USD)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={newBundle.originalPriceUSD}
                onChange={(e) =>
                  setNewBundle({
                    ...newBundle,
                    originalPriceUSD: Number(e.target.value),
                  })
                }
              />
              <input
                type="number"
                placeholder="Offer Price (LKR)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={newBundle.offerPriceLKR}
                onChange={(e) =>
                  setNewBundle({
                    ...newBundle,
                    offerPriceLKR: Number(e.target.value),
                  })
                }
              />
              <input
                type="number"
                placeholder="Offer Price (USD)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={newBundle.offerPriceUSD}
                onChange={(e) =>
                  setNewBundle({
                    ...newBundle,
                    offerPriceUSD: Number(e.target.value),
                  })
                }
              />
              <input
                type="date"
                placeholder="End Date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={newBundle.endDate}
                onChange={(e) =>
                  setNewBundle({ ...newBundle, endDate: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end mt-6 space-x-4">
              <button
                onClick={() => setIsBundleModalOpen(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBundleOffer}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsPage;
