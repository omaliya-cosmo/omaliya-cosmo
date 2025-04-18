"use client";

import React, { useEffect, useState } from "react";
import { FiTrash2, FiPlus, FiUpload, FiThumbsUp, FiEye } from "react-icons/fi";
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

interface Videos {
  id: string;
  title: string;
  videoUrl: string;
  thumbnail: string | null;
  likes: number;
  views: number;
  platform: string;
}

const SettingsPage = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [bundleOffers, setBundleOffers] = useState<BundleOffer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [videos, setVideos] = useState<Videos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPromoData, setNewPromoData] = useState({
    code: "",
    discount: "" as number | "",
  });
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
  const [newBundle, setNewBundle] = useState({
    bundleName: "",
    productIds: [] as string[],
    originalPriceLKR: "" as number | "",
    originalPriceUSD: "" as number | "",
    offerPriceLKR: "" as number | "",
    offerPriceUSD: "" as number | "",
    endDate: "",
    imageUrl: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [newVideo, setNewVideo] = useState({
    title: "",
    videoUrl: "",
    thumbnail: "",
    likes: 0,
    views: 0,
    platform: "YouTube",
  });
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoThumbnailPreview, setVideoThumbnailPreview] = useState<
    string | null
  >(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

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

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/videos");
      setVideos(res.data);
    } catch (error) {
      setError("Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchPromoCodes(),
          fetchBundleOffers(),
          fetchProducts(),
          fetchVideos(),
        ]);
      } catch (error) {
        setError("Failed to fetch data");
      }
    };

    fetchData();
  }, []);

  const uploadImageToCloudinary = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "omaliya");

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/omaliya/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (data.secure_url) {
        setNewBundle({ ...newBundle, imageUrl: data.secure_url });
        setImagePreview(data.secure_url);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string);
        }
      };
      fileReader.readAsDataURL(file);

      uploadImageToCloudinary(file);
    }
  };

  const uploadThumbnailToCloudinary = async (file: File) => {
    setUploadingThumbnail(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "omaliya");

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/omaliya/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (data.secure_url) {
        setNewVideo({ ...newVideo, thumbnail: data.secure_url });
        setVideoThumbnailPreview(data.secure_url);
      }
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      alert("Failed to upload thumbnail. Please try again.");
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        if (e.target?.result) {
          setVideoThumbnailPreview(e.target.result as string);
        }
      };
      fileReader.readAsDataURL(file);

      uploadThumbnailToCloudinary(file);
    }
  };

  const handleAddPromoCode = async () => {
    if (!newPromoData.code || newPromoData.discount === "") {
      alert("Please fill in all fields");
      return;
    }
    try {
      const res = await axios.post("/api/promocodes", {
        code: newPromoData.code,
        discountPercentage: newPromoData.discount,
      });
      fetchPromoCodes();
      setNewPromoData({ code: "", discount: "" });
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
      if (
        !newBundle.bundleName ||
        newBundle.productIds.length === 0 ||
        !newBundle.endDate
      ) {
        alert("Please fill in all required fields");
        return;
      }

      const bundleData = {
        bundleName: newBundle.bundleName,
        productIds: newBundle.productIds,
        originalPriceLKR: Number(newBundle.originalPriceLKR),
        originalPriceUSD: Number(newBundle.originalPriceUSD),
        offerPriceLKR: Number(newBundle.offerPriceLKR),
        offerPriceUSD: Number(newBundle.offerPriceUSD),
        endDate: new Date(newBundle.endDate).toISOString(),
        imageUrl: newBundle.imageUrl,
      };

      const res = await axios.post("/api/bundleoffers", bundleData);

      if (res.status === 201) {
        fetchBundleOffers();

        setNewBundle({
          bundleName: "",
          productIds: [],
          originalPriceLKR: "" as number | "",
          originalPriceUSD: "" as number | "",
          offerPriceLKR: "" as number | "",
          offerPriceUSD: "" as number | "",
          endDate: "",
          imageUrl: "",
        });
        setIsBundleModalOpen(false);
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        alert(
          `Validation error: ${JSON.stringify(error.response.data.details)}`
        );
      } else {
        alert("Failed to add bundle offer");
      }
      console.error("Error adding bundle offer:", error);
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

  const handleAddVideo = async () => {
    if (!newVideo.title || !newVideo.videoUrl || !newVideo.platform) {
      alert("Please fill in all required fields");
      return;
    }
    try {
      await axios.post("/api/videos", {
        title: newVideo.title,
        videoUrl: newVideo.videoUrl,
        thumbnail: newVideo.thumbnail || null,
        likes: Number(newVideo.likes),
        views: Number(newVideo.views),
        platform: newVideo.platform,
      });
      fetchVideos();
      setNewVideo({
        title: "",
        videoUrl: "",
        thumbnail: "",
        likes: 0,
        views: 0,
        platform: "YouTube",
      });
      setVideoThumbnailPreview(null);
      setIsVideoModalOpen(false);
    } catch (error) {
      alert("Failed to add video");
    }
  };

  const handleDeleteVideo = async (id: string) => {
    try {
      await axios.delete(`/api/videos/${id}`);
      setVideos(videos.filter((video) => video.id !== id));
    } catch (error) {
      alert("Failed to delete video");
    }
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
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Add New Promo Code
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Promo Code"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={newPromoData.code}
                onChange={(e) =>
                  setNewPromoData({ ...newPromoData, code: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Discount Percentage"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={newPromoData.discount}
                onChange={(e) =>
                  setNewPromoData({
                    ...newPromoData,
                    discount:
                      e.target.value === "" ? "" : Number(e.target.value),
                  })
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
                {bundle.imageUrl && (
                  <div className="mb-3">
                    <img
                      src={bundle.imageUrl}
                      alt={bundle.bundleName}
                      className="w-full h-48 object-cover rounded-md"
                    />
                  </div>
                )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Add New Bundle Offer
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="col-span-1 sm:col-span-2">
                <input
                  type="text"
                  placeholder="Bundle Name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={newBundle.bundleName}
                  onChange={(e) =>
                    setNewBundle({ ...newBundle, bundleName: e.target.value })
                  }
                />
              </div>

              {/* Add Image Upload Field */}
              <div className="col-span-1 sm:col-span-2">
                <div className="border-dashed border-2 border-gray-300 rounded-lg p-4 text-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mx-auto h-40 object-contain mb-2"
                      />
                      <button
                        onClick={() => {
                          setImagePreview(null);
                          setNewBundle({ ...newBundle, imageUrl: "" });
                        }}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <>
                      <label
                        htmlFor="bundleImage"
                        className="cursor-pointer flex flex-col items-center justify-center"
                      >
                        <FiUpload className="text-gray-400 text-4xl mb-2" />
                        <span className="text-gray-500">
                          {uploading ? "Uploading..." : "Upload Bundle Image"}
                        </span>
                      </label>
                      <input
                        id="bundleImage"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                        disabled={uploading}
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="col-span-1 sm:col-span-2">
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
              <div className="col-span-1 sm:col-span-2">
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

      {/* Video Links Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Video Links</h1>
          <button
            onClick={() => setIsVideoModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm flex items-center"
          >
            <FiPlus className="mr-2" /> Add Video Link
          </button>
        </div>

        {loading ? (
          <p className="text-center py-6">Loading...</p>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            <p className="font-medium">{error}</p>
          </div>
        ) : !videos || videos.length === 0 ? (
          <p className="text-center py-6">No videos found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-gray-100 p-4 rounded-lg shadow-md"
              >
                {video.thumbnail && (
                  <div className="mb-3">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-40 object-cover rounded-md"
                    />
                  </div>
                )}
                <h2 className="text-lg font-bold text-gray-800">
                  {video.title}
                </h2>
                <p className="text-sm text-gray-600 mb-2">
                  Platform: {video.platform}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                  <span className="flex items-center">
                    <FiThumbsUp className="mr-1" /> {video.likes}
                  </span>
                  <span className="flex items-center">
                    <FiEye className="mr-1" /> {video.views}
                  </span>
                </div>
                <a
                  href={video.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline break-all"
                >
                  {video.videoUrl}
                </a>
                <button
                  onClick={() => handleDeleteVideo(video.id)}
                  className="mt-2 text-red-600 hover:text-red-900 inline-flex items-center"
                >
                  <FiTrash2 className="mr-1" size={16} /> Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Add New Video Link
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Video Title *"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={newVideo.title}
                onChange={(e) =>
                  setNewVideo({ ...newVideo, title: e.target.value })
                }
              />
              <input
                type="url"
                placeholder="Video URL *"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={newVideo.videoUrl}
                onChange={(e) =>
                  setNewVideo({ ...newVideo, videoUrl: e.target.value })
                }
              />

              <div className="border-dashed border-2 border-gray-300 rounded-lg p-4 text-center">
                {videoThumbnailPreview ? (
                  <div className="relative">
                    <img
                      src={videoThumbnailPreview}
                      alt="Thumbnail Preview"
                      className="mx-auto h-40 object-contain mb-2"
                    />
                    <button
                      onClick={() => {
                        setVideoThumbnailPreview(null);
                        setNewVideo({ ...newVideo, thumbnail: "" });
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <>
                    <label
                      htmlFor="videoThumbnail"
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      <FiUpload className="text-gray-400 text-4xl mb-2" />
                      <span className="text-gray-500">
                        {uploadingThumbnail
                          ? "Uploading..."
                          : "Upload Thumbnail (Optional)"}
                      </span>
                    </label>
                    <input
                      id="videoThumbnail"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleThumbnailChange}
                      disabled={uploadingThumbnail}
                    />
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Platform *
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={newVideo.platform}
                    onChange={(e) =>
                      setNewVideo({ ...newVideo, platform: e.target.value })
                    }
                  >
                    <option value="YouTube">YouTube</option>
                    <option value="Vimeo">Vimeo</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Likes
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Likes"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={newVideo.likes}
                    onChange={(e) =>
                      setNewVideo({
                        ...newVideo,
                        likes: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Views
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Views"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={newVideo.views}
                    onChange={(e) =>
                      setNewVideo({
                        ...newVideo,
                        views: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-4">
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddVideo}
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
