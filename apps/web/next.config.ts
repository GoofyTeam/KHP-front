import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@workspace/ui"],
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
