import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@workspace/ui"],
  experimental: {
    externalDir: true,
    serverActions: {
      bodySizeLimit: "128mb",
    },
  },
};

export default nextConfig;
