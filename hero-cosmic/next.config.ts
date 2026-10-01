import type { NextConfig } from "next";
import path from "path";

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
  // Turbopack (Next.js 16+ default dev bundler): alias "framer" to local stubs
  // so vendored Framer marketplace components load without the Framer runtime.
  turbopack: {
    resolveAlias: {
      framer: './lib/framer-stubs.js',
    },
  },

  // Webpack fallback (used in `next build` production builds)
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        framer: path.resolve(__dirname, 'lib/framer-stubs.js'),
      };
    }
    return config;
  },
};

export default nextConfig;
