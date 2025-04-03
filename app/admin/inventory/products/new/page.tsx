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
} from "react-icons/fi";
import axios from "axios";
import { Product } from "@/types";
import { ProductCategory } from "@/types";

import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

// Update the schema
const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
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
});

const AddProduct = () => {
  const router = useRouter();
  const [formData, setProduct] = useState<Omit<Product, "id">>({
    name: "",
    description: "",
    priceLKR: 0,
    priceUSD: 0,
    discountPriceLKR: null,
    discountPriceUSD: null,
    categoryId: "",
    imageUrls: [],
    stock: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [categories, setCategories] = useState<ProductCategory[]>([]); // State to hold categories data

  useEffect(() => {
    // Fetch categories data
    axios
      .get("/api/categories")
      .then((res) => {
        setCategories(res.data.categories);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

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

      await axios.post("/api/products", formData);
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
              <span>New Product</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              Create New Product
            </h1>
            <p className="text-gray-600 mt-1">
              Add a new product to your inventory
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md shadow-sm"
            >
              {previewMode ? "Edit Form" : "Preview"}
            </button>
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
      {previewMode ? (
        // Product Preview Mode
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Product Preview
            </h2>
            <p className="text-gray-600 text-sm">
              This is how your product will appear to customers
            </p>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/3 md:pr-6 mb-6 md:mb-0">
                <div className="mt-3 bg-gray-100 rounded-md h-48 flex items-center justify-center overflow-hidden">
                  {formData.imageUrls.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {formData.imageUrls.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Uploaded ${index + 1}`}
                          className="h-24 w-24 object-cover rounded-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/300?text=Image+Error";
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6">
                      <FiImage className="text-gray-400 h-10 w-10 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        No images uploaded
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full md:w-2/3">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {formData.name || "Product Name"}
                </h1>

                <div className="flex items-baseline mb-4">
                  <div className="mr-4">
                    <span className="text-2xl font-bold text-gray-900 mr-2">
                      Rs{" "}
                      {formData.priceLKR
                        ? formData.priceLKR.toFixed(2)
                        : "0.00"}
                    </span>
                    {formData.discountPriceLKR && (
                      <span className="text-lg text-gray-500 line-through">
                        Rs {formData.discountPriceLKR.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-gray-900 mr-2">
                      $
                      {formData.priceUSD
                        ? formData.priceUSD.toFixed(2)
                        : "0.00"}
                    </span>
                    {formData.discountPriceUSD && (
                      <span className="text-lg text-gray-500 line-through">
                        ${formData.discountPriceUSD.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-1">
                    Category
                  </h3>
                  <p className="text-gray-700">
                    {
                      categories.find(
                        (category) => category.id === formData.categoryId
                      )?.name
                    }
                  </p>
                </div>

                <div>
                  <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-1">
                    Description
                  </h3>
                  <div
                    className="ql-editor text-gray-700 whitespace-pre-line"
                    dangerouslySetInnerHTML={{
                      __html:
                        formData.description || "No description provided.",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Review your product information before saving
            </p>
            <button
              onClick={() => setPreviewMode(false)}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Edit Product
            </button>
          </div>
        </div>
      ) : (
        // Product Form
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <FiPackage className="mr-2 text-blue-500" />
              Product Information
            </h2>
            <p className="text-gray-600 text-sm">
              All fields marked with * are required
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column - Core product details */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-blue-50 p-4 rounded-md mb-6">
                  <p className="text-sm text-blue-700">
                    Complete the form with accurate product information to
                    ensure customers get the details they need.
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
                    Description <span className="text-red-500 ml-1">*</span>
                  </label>
                  <ReactQuill
                    theme="snow"
                    value={formData.description}
                    onChange={(value) => handleChange(value, "description")}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Include key details about features, materials, dimensions,
                    etc.
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
                      Creating...
                    </>
                  ) : (
                    <>
                      <FiSave className="mr-2 -ml-1" />
                      Create Product
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default AddProduct;
