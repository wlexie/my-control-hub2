import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  /* config options here */

  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },

  images: {
    domains: ['flagcdn.com'],
    // You can add other image domai needed
  },
  // Add the typescript block here
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

export default nextConfig;