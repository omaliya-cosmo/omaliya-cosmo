"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { z } from "zod";
import {
  FiSave,
  FiArrowLeft,
  FiImage,
  FiTag,
  FiInfo,
  FiCheckCircle,
} from "react-icons/fi";
import axios from "axios";

// Define Zod schema for category
const categorySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  imageUrl: z.string().url("Enter a valid image URL"),
});

const UpdateCategory = () => {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.categoryId;

  const [formData, setCategory] = useState({
    name: "",
    description: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setCategory((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add useEffect to fetch category data
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/categories/${categoryId}`);
        setCategory(response.data);
      } catch (error) {
        console.error("Error fetching category:", error);
        setError("Failed to load category");
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  // Update handleSubmit for PUT request
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Form Data Before Validation:", formData);
      categorySchema.parse(formData);

      await axios.put(`/api/categories/${categoryId}`, formData);
      router.push("/admin/categories");
    } catch (err: any) {
      console.error("Validation Error:", err);
      setError(err.errors ? err.errors[0].message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: any) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "omaliya"); // Replace with your Cloudinary upload preset

      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/omaliya/image/upload", // Replace with your Cloudinary cloud name
        formData
      );

      setCategory((prev) => ({
        ...prev,
        imageUrl: response.data.secure_url,
      }));
      setUploadSuccess(true);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setLoading(false);
    }
  };

  // Update UI text elements
  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <button
                onClick={() => router.push("/admin/categories")}
                className="hover:text-blue-600 flex items-center"
              >
                <FiArrowLeft className="mr-1" />
                Back to Categories
              </button>
              <span className="mx-2">/</span>
              <span>Edit Category</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Edit Category</h1>
            <p className="text-gray-600 mt-1">Update category information</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={() => router.push("/admin/categories")}
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
      {/* Category Form */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <FiTag className="mr-2 text-blue-500" />
            Edit Category Information
          </h2>
          <p className="text-gray-600 text-sm">
            All fields marked with * are required
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="flex text-gray-700 font-medium mb-2 items-center"
                >
                  <FiTag className="mr-2 text-gray-500" />
                  Category Name <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => handleChange(e)}
                  placeholder="Enter category name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-gray-700 font-medium mb-2 flex items-center"
                >
                  <FiInfo className="mr-2 text-gray-500" />
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={(e) => handleChange(e)}
                  rows={6}
                  placeholder="Enter category description"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label
                  htmlFor="imageUrl"
                  className="block text-gray-700 font-medium mb-2 flex items-center"
                >
                  <FiImage className="mr-2 text-gray-500" />
                  Image
                </label>
                <input
                  type="file"
                  className=""
                  accept="image/*"
                  onChange={handleFileUpload}
                />
                {uploadSuccess && (
                  <p className="mt-2 text-green-600 flex items-center">
                    <FiCheckCircle className="mr-1" /> Upload successful
                  </p>
                )}
                {formData.imageUrl && (
                  <div className="mt-3">
                    <img
                      src={formData.imageUrl}
                      alt="Uploaded"
                      className="w-1/2 object-contain rounded-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/300?text=Image+Error";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => router.push("/admin/categories")}
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
                    Updating...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2 -ml-1" />
                    Update Category
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

export default UpdateCategory;
