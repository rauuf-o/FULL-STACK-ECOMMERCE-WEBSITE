import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io", pathname: "/f/**" },
      { protocol: "https", hostname: "*.ufs.sh", pathname: "/f/**" },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
    minimumCacheTTL: 60, // helps reduce repeated slow fetches
  },
  reactCompiler: true,
};

export default nextConfig;
