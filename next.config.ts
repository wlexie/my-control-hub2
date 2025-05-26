import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  /* config options here */

  images: {
    domains: ['flagcdn.com'],
    // You can add other image domains if needed
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