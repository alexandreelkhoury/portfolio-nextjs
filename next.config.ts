import type { NextConfig } from "next";

const nextConfig : NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.aceternity.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
