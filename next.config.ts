import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },

  experimental: {
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
  },

  images: {
    domains: ["flagcdn.com"],
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination:
          "http://tuma-dev-backend-auth-alb-2099885708.us-east-1.elb.amazonaws.com/api/auth/:path*",
      },
          {
      source: '/api/:path*',
      destination:
        'http://tuma-dev-backend-alb-1553448571.us-east-1.elb.amazonaws.com/api/:path*',
    },
    ];
  },
};

export default nextConfig;
