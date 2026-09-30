import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1', 'localhost', '::1'],

  // Enable gzip/brotli compression for all responses
  compress: true,

  // Image optimization — serve webp/avif automatically from next/image
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days browser cache
  },

  // Disable x-powered-by header (minor security + byte savings)
  poweredByHeader: false,
};

export default nextConfig;
