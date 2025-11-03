/**
 * @file not-found.tsx
 * @description 상품 상세 페이지 404 에러 처리
 *
 * 상품이 없거나 비활성화된 경우 표시되는 페이지입니다.
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ProductNotFound() {
  return (
    <main className="min-h-[calc(100vh-80px)] px-4 py-8 lg:py-16">
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              상품 목록으로
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            상품을 찾을 수 없습니다
          </h1>
          <p className="text-gray-600 mb-8">
            요청하신 상품이 존재하지 않거나 판매 중단되었습니다.
          </p>
          <Link href="/products">
            <Button>상품 목록으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

