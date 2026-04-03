import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "storage.vitrine-cg.com.br",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
