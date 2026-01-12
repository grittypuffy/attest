import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/:path*", // Proxy to Backend
      },
      {
        source: "/rpc",
        destination: "http://127.0.0.1:8545", // Proxy to Blockchain Node
      },
      {
        source: "/rpc/:path*",
        destination: "http://127.0.0.1:8545/:path*", // Proxy to Blockchain Node
      },
    ];
  },
};

export default nextConfig;
