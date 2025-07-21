import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/**",
        search: "?alt=media",
      },
      {
        protocol: "https",
        hostname: "www.thebluealliance.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
