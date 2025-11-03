import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "via.placeholder.com" }, // placeholder
      { protocol: "https", hostname: "**.supabase.co" }, // 향후 Supabase Storage 이미지 허용
    ],
  },
};

export default nextConfig;
