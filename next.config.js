/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["res.cloudinary.com", "fakestoreapi.com"],
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
