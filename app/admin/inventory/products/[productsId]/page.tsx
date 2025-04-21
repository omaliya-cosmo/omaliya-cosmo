"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import {
  FiSave,
  FiArrowLeft,
  FiImage,
  FiDollarSign,
  FiTag,
  FiInfo,
  FiCheckCircle,
  FiPackage,
  FiX,
} from "react-icons/fi";
import axios from "axios";
import { Product, ProductTag } from "@prisma/client";
import { ProductCategory } from "@/types";

// Import Tiptap
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

// Update the schema
const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  fullDescription: z.string().optional(),
  priceLKR: z.number().positive("Enter a valid price"),
  priceUSD: z.number().positive("Enter a valid price"),
  discountPriceLKR: z
    .number()
    .positive("Enter a valid discount price")
    .nullable(),
  discountPriceUSD: z
    .number()
    .positive("Enter a valid discount price")
    .nullable(),
  categoryId: z.string().nonempty("Category is required"),
  imageUrls: z.array(z.string().url("Enter a valid image URL")),
  stock: z.number().int().nonnegative("Stock must be a non-negative integer"),
  tags: z.array(z.nativeEnum(ProductTag)).optional(),
});

const EditProduct = ({ params }: { params: { productsId: string } }) => {
  const router = useRouter();
  const [formData, setProduct] = useState<
    Omit<Product, "id" | "createdAt" | "updatedAt">
  >({
    name: "",
    description: "",
    fullDescription: "",
    priceLKR: 0,
    priceUSD: 0,
    discountPriceLKR: null,
    discountPriceUSD: null,
    categoryId: "",
    imageUrls: [],
    stock: 0,
    tags: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [categories, setCategories] = useState<ProductCategory[]>([]); // State to hold categories data

  // Configure Tiptap editor for full description
  const editor = useEditor({
    extensions: [StarterKit],
    content: formData.fullDescription || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setProduct((prev) => ({ ...prev, fullDescription: html }));
    },
  });

  useEffect(() => {
    // Fetch product data
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/products/${params.productsId}`);
        setProduct(response.data);

        // Update Tiptap editor content when product data is loaded
        if (editor && response.data.fullDescription) {
          editor.commands.setContent(response.data.fullDescription);
        }
      } catch (err: any) {
        setError(err.message);
      }
    };

    // Fetch categories data
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/categories");
        setCategories(response.data.categories);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchProduct();
    fetchCategories();
  }, [params.productsId, editor]);

  const handleChange = (e: any, fieldName?: string) => {
    if (fieldName) {
      setProduct((prev) => ({
        ...prev,
        [fieldName]: e,
      }));
    } else {
      const { name, value, type, checked } = e.target;
      setProduct((prev) => ({
        ...prev,
        [name]:
          type === "checkbox"
            ? checked
            : type === "number"
            ? value === ""
              ? null
              : parseFloat(value)
            : value,
      }));
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Form Data Before Validation:", formData); // Debugging
      productSchema.parse(formData); // Validate formData

      await axios.put(`/api/products/${params.productsId}`, formData);
      router.push("/admin/products");
    } catch (err: any) {
      console.error("Validation Error:", err);
      setError(err.errors ? err.errors[0].message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: any) => {
    const files = event.target.files; // Get all selected files
    if (!files || files.length === 0) return;

    setLoading(true);
    setUploadSuccess(false);

    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "omaliya"); // Replace with your Cloudinary upload preset

        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/omaliya/image/upload", // Replace with your Cloudinary cloud name
          formData
        );
        uploadedUrls.push(response.data.secure_url);
      }

      setProduct((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...uploadedUrls], // Append new URLs to the existing array
      }));
      setUploadSuccess(true);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Page header with breadcrumb */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <button
                onClick={() => router.push("/admin/products")}
                className="hover:text-blue-600 flex items-center"
              >
                <FiArrowLeft className="mr-1" />
                Back to Products
              </button>
              <span className="mx-2">/</span>
              <span>Edit Product</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Edit Product</h1>
            <p className="text-gray-600 mt-1">Update product information</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={() => router.push("/admin/products")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md shadow-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}
      {/* Product Form */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <FiPackage className="mr-2 text-blue-500" />
            Edit Product Information
          </h2>
          <p className="text-gray-600 text-sm">
            Update the product details below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Core product details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-blue-50 p-4 rounded-md mb-6">
                <p className="text-sm text-blue-700">
                  Complete the form with accurate product information to ensure
                  customers get the details they need.
                </p>
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-gray-700 font-medium mb-2 flex items-center"
                >
                  <FiTag className="mr-2 text-gray-500" />
                  Product Name <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Choose a clear, specific product name (50-60 characters)
                </p>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-gray-700 font-medium mb-2 flex items-center"
                >
                  <FiInfo className="mr-2 text-gray-500" />
                  Short Description <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={(e) => handleChange(e)}
                  rows={3}
                  placeholder="Enter a brief description of the product"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter a short summary of the product (displayed in product
                  listings)
                </p>
              </div>

              <div>
                <label
                  htmlFor="fullDescription"
                  className="block text-gray-700 font-medium mb-2 flex items-center"
                >
                  <FiInfo className="mr-2 text-gray-500" />
                  Full Description <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="border border-gray-300 rounded-md min-h-[200px]">
                  <EditorContent
                    editor={editor}
                    className="prose max-w-none p-4"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Provide detailed information about the product features,
                  benefits, and specifications
                </p>
              </div>

              <div>
                <label
                  htmlFor="tags"
                  className="block text-gray-700 font-medium mb-2 flex items-center"
                >
                  <FiTag className="mr-2 text-gray-500" />
                  Product Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {Object.values(ProductTag).map((tag) => (
                    <div
                      key={tag}
                      onClick={() => {
                        setProduct((prev) => {
                          const currentTags = (prev.tags as ProductTag[]) || [];
                          return {
                            ...prev,
                            tags: currentTags.includes(tag)
                              ? currentTags.filter((t) => t !== tag)
                              : [...currentTags, tag],
                          };
                        });
                      }}
                      className={`cursor-pointer px-3 py-1 rounded-full text-sm font-medium ${
                        (formData.tags as ProductTag[])?.includes(tag)
                          ? "bg-blue-100 text-blue-800 border border-blue-300"
                          : "bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200"
                      }`}
                    >
                      {tag.replace(/_/g, " ")}
                    </div>
                  ))}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Select appropriate tags to help customers find your product
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="priceLKR"
                    className="block text-gray-700 font-medium mb-2 flex items-center"
                  >
                    <FiDollarSign className="mr-2 text-gray-500" />
                    Price (LKR) <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">LKR</span>
                    </div>
                    <input
                      type="number"
                      id="priceLKR"
                      name="priceLKR"
                      value={formData.priceLKR}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="priceUSD"
                    className="block text-gray-700 font-medium mb-2 flex items-center"
                  >
                    <FiDollarSign className="mr-2 text-gray-500" />
                    Price (USD) <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      type="number"
                      id="priceUSD"
                      name="priceUSD"
                      value={formData.priceUSD}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Existing price fields */}
                <div>
                  <label
                    htmlFor="discountPriceLKR"
                    className="block text-gray-700 font-medium mb-2 flex items-center"
                  >
                    <FiDollarSign className="mr-2 text-gray-500" />
                    Discount Price (LKR)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">LKR</span>
                    </div>
                    <input
                      type="number"
                      id="discountPriceLKR"
                      name="discountPriceLKR"
                      value={formData.discountPriceLKR || ""}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="discountPriceUSD"
                    className="block text-gray-700 font-medium mb-2 flex items-center"
                  >
                    <FiDollarSign className="mr-2 text-gray-500" />
                    Discount Price (USD)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      type="number"
                      id="discountPriceUSD"
                      name="discountPriceUSD"
                      value={formData.discountPriceUSD || ""}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="stock"
                    className="block text-gray-700 font-medium mb-2 flex items-center"
                  >
                    <FiPackage className="mr-2 text-gray-500" />
                    Stock <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    placeholder="Enter stock quantity"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Specify the number of items available in stock
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="category"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Category <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    id="category"
                    name="categoryId" // Match the key in formData
                    value={formData.categoryId}
                    onChange={(e) => handleChange(e)} // Update categoryId in formData
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Right column - Image and availability */}
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="imageUrl"
                  className="block text-gray-700 font-medium mb-2 flex items-center"
                >
                  <FiImage className="mr-2 text-gray-500" />
                  Image URL
                </label>

                <input
                  type="file"
                  className=""
                  accept="image/*"
                  multiple // Allow multiple file selection
                  onChange={handleFileUpload}
                />
                {uploadSuccess && (
                  <p className="mt-2 text-green-600 flex items-center">
                    <FiCheckCircle className="mr-1" /> Upload successful
                  </p>
                )}

                <div className="mt-3 rounded-md flex items-center justify-center">
                  {formData.imageUrls && formData.imageUrls.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {formData.imageUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Product preview ${index + 1}`}
                            className="h-full w-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://via.placeholder.com/300?text=Image+Error";
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setProduct((prev) => ({
                                ...prev,
                                imageUrls: prev.imageUrls.filter(
                                  (_, i) => i !== index
                                ),
                              }));
                            }}
                            className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl hover:bg-red-600"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6">
                      <FiImage className="text-gray-400 h-10 w-10 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        Image previews will appear here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => router.push("/admin/products")}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2 -ml-1" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditProduct;
