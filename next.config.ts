import type { NextConfig } from "next";

const nextConfig : NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.aceternity.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};
// next.config.js
module.exports = {
  images: {
    domains: ['assets.aceternity.com'],
  },
}
export default nextConfig;
