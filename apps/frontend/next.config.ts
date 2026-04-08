import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Necessário para o Dockerfile usar output standalone
  output: "standalone",

  images: {
    unoptimized: true,
    remotePatterns: [
      // Desenvolvimento local
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/**",
      },
      // Produção — MinIO via Traefik
      {
        protocol: "https",
        hostname: "storage.vitrine-cg.inovautomatica.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
