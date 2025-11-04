import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "마이페이지",
  description: "주문 내역 및 개인 정보를 확인할 수 있는 마이페이지입니다.",
};

/**
 * @file app/my-page/page.tsx
 * @description 마이페이지 메인 페이지
 *
 * 사용자의 주문 내역 및 개인 정보를 표시하는 페이지입니다.
 * 현재는 기본 구조만 구현되어 있으며, 향후 주문 내역 조회 기능이 추가될 예정입니다.
 *
 * @dependencies
 * - @clerk/nextjs/server: 인증 확인
 */

export default async function MyPage() {
  // 로그인 확인
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">마이페이지</h1>
        <p className="text-gray-600 mt-2">
          주문 내역 및 개인 정보를 확인할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 주문 내역 섹션 */}
        <Link
          href="/my-orders"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow block"
        >
          <h2 className="text-xl font-semibold mb-4">주문 내역</h2>
          <p className="text-gray-500 mb-4">
            주문 내역을 확인하고 관리할 수 있습니다.
          </p>
          <div className="text-blue-600 font-medium">
            주문 내역 보기 →
          </div>
        </Link>

        {/* 개인 정보 섹션 (향후 구현 예정) */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">개인 정보</h2>
          <p className="text-gray-500">
            개인 정보 관리 기능은 곧 추가될 예정입니다.
          </p>
        </div>

        {/* 기타 섹션 (향후 구현 예정) */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">기타</h2>
          <p className="text-gray-500">
            추가 기능은 곧 제공될 예정입니다.
          </p>
        </div>
      </div>
    </div>
  );
}

