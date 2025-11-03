/**
 * @file not-found.tsx
 * @description 주문을 찾을 수 없을 때 표시되는 404 페이지
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function OrderNotFound() {
  return (
    <main className="min-h-[calc(100vh-80px)] px-4 py-8 lg:py-16">
      <div className="w-full max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">주문을 찾을 수 없습니다</h1>
        <p className="text-gray-600 mb-8">
          요청하신 주문 정보를 찾을 수 없습니다.
          <br />
          주문 번호를 확인하시거나 다시 시도해주세요.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/products">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              상품 목록으로
            </Button>
          </Link>
          <Link href="/">
            <Button>홈으로</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

