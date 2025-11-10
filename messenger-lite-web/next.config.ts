import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "192.168.31.152",
        port: "7000", // optional
        pathname: "/**", // allow all paths
      },
      {
        protocol: "http",
        hostname: "10.81.100.28",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "messenger-lite-ijbp.onrender.com",
        pathname: "/**", // allow all paths
      },
    ],
    domains: ["192.168.31.152", "192.168.1.102", "localhost"],
  },
};

export default nextConfig;
