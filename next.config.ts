import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "via.placeholder.com" }, // placeholder
      { protocol: "https", hostname: "**.supabase.co" }, // 향후 Supabase Storage 이미지 허용
    ],
    // 이미지 최적화 설정
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // 프로덕션 빌드 최적화
  compress: true,
  // React Strict Mode (개발 환경에서만 활성화)
  reactStrictMode: process.env.NODE_ENV === "development",
};

export default nextConfig;
