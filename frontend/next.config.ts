import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore - Turbopack root isolation to prevent it from finding E:\src\middleware.ts
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
