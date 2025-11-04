/**
 * @file page.tsx
 * @description 장바구니 페이지
 *
 * 사용자의 장바구니에 담긴 상품들을 표시하고 관리하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 장바구니 아이템 목록 표시
 * 2. 수량 변경 기능
 * 3. 상품 삭제 기능
 * 4. 장바구니 합계 계산
 * 5. 주문하기 버튼
 *
 * TODO: 실제 장바구니 데이터 API 연동 필요
 *
 * @dependencies
 * - types/cart: CartItem 타입 정의
 * - components/ui: shadcn/ui 컴포넌트
 */

import { Suspense } from "react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { getCart } from "@/actions/cart/get-cart";
import { calculateCartSummary } from "@/lib/cart";
import { CartItemCard } from "@/components/cart-item-card";
import { CartItem } from "@/types/cart";
import { formatPrice } from "@/lib/utils/format";
import { logger } from "@/lib/utils/logger";

/**
 * 빈 장바구니 컴포넌트
 */
function EmptyCart() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-12 lg:p-16 text-center">
      <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        장바구니가 비어있습니다
      </h2>
      <p className="text-gray-600 mb-8">
        장바구니에 담긴 상품이 없습니다.
      </p>
      <Link href="/products">
        <Button size="lg">쇼핑 계속하기</Button>
      </Link>
    </div>
  );
}

/**
 * 주문 요약 컴포넌트
 */
function CartSummary({
  totalItems,
  totalQuantity,
  totalAmount,
}: {
  totalItems: number;
  totalQuantity: number;
  totalAmount: number;
}) {
  const formattedTotal = formatPrice(totalAmount);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8 sticky top-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">주문 요약</h2>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">상품 총 개수</span>
          <span className="text-gray-900 font-medium">{totalItems}개</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">총 수량</span>
          <span className="text-gray-900 font-medium">{totalQuantity}개</span>
        </div>
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">총 금액</span>
            <span className="text-2xl font-bold text-gray-900">
              {formattedTotal}
            </span>
          </div>
        </div>
      </div>

      <SignedIn>
        <Link href="/checkout" className="block">
          <Button
            className="w-full h-12 text-base font-semibold"
            size="lg"
            disabled={totalItems === 0}
          >
            주문하기
          </Button>
        </Link>
      </SignedIn>

      <SignedOut>
        <Link href="/sign-in" className="block">
          <Button
            variant="outline"
            className="w-full h-12 text-base font-semibold"
            size="lg"
          >
            로그인하여 주문하기
          </Button>
        </Link>
      </SignedOut>
    </div>
  );
}

export default async function CartPage() {
  logger.group("[CartPage] 장바구니 페이지 로드");

  // 장바구니 데이터 조회
  const cartResult = await getCart();
  const cartItems = cartResult.success ? cartResult.data || [] : [];
  
  // 장바구니 요약 계산
  const summary = calculateCartSummary(cartItems);

  logger.log("장바구니 아이템 개수:", cartItems.length);
  logger.groupEnd();

  return (
    <main className="min-h-[calc(100vh-80px)] px-4 py-8 lg:py-16">
      <div className="w-full max-w-7xl mx-auto">
        {/* 페이지 헤더 */}
        <div className="mb-6 flex items-center gap-4">
          <Link href="/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              상품 목록으로
            </Button>
          </Link>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
            장바구니
          </h1>
        </div>

        {/* 로그인 체크 */}
        <SignedOut>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <p className="text-blue-800 mb-4">
              장바구니 기능을 사용하려면 로그인이 필요합니다.
            </p>
            <Link href="/sign-in">
              <Button>로그인하기</Button>
            </Link>
          </div>
        </SignedOut>

        {/* 메인 콘텐츠 */}
        <SignedIn>
          {cartItems.length === 0 ? (
            <EmptyCart />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 좌측: 장바구니 아이템 목록 (2열) */}
              <div className="lg:col-span-2 space-y-4">
                <Suspense fallback={<div>장바구니 로딩 중...</div>}>
                  {cartItems.map((item: CartItem) => (
                    <CartItemCard key={item.id} item={item} />
                  ))}
                </Suspense>
              </div>

              {/* 우측 고정: 주문 요약 (1열) */}
              <div className="lg:col-span-1">
                <CartSummary
                  totalItems={summary.totalItems}
                  totalQuantity={summary.totalQuantity}
                  totalAmount={summary.totalAmount}
                />
              </div>
            </div>
          )}
        </SignedIn>
      </div>
    </main>
  );
}

