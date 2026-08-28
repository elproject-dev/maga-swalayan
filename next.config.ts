import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  turbopack: {},
  /* config options here */
};

// @ts-ignore - next-pwa plugin has a slightly outdated NextConfig type signature in IDE, but not always during build
export default withPWA(nextConfig);
