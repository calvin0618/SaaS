/**
 * @file page.tsx
 * @description 주문/결제 페이지
 *
 * 사용자가 배송 정보를 입력하고 주문을 생성하는 페이지입니다.
 * 주문 생성 후 결제 프로세스로 넘어갑니다.
 *
 * 주요 기능:
 * 1. 배송 정보 입력 폼
 * 2. 주문 요약 섹션 (장바구니 상품 목록, 총 금액)
 * 3. 주문 생성 및 결제 프로세스 시작
 *
 * @dependencies
 * - actions/cart/get-cart: 장바구니 조회
 * - actions/orders/create-order: 주문 생성
 * - components/checkout/order-form: 배송 정보 입력 폼
 * - components/checkout/order-summary: 주문 요약 컴포넌트
 */

import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getCart } from "@/actions/cart/get-cart";
import { calculateCartSummary } from "@/lib/cart";
import { OrderForm } from "@/components/checkout/order-form";
import { OrderSummary } from "@/components/checkout/order-summary";
import { CheckoutClient } from "@/components/checkout/checkout-client";

/**
 * 주문/결제 페이지 (Server Component)
 */
export default async function CheckoutPage() {
  console.group("[CheckoutPage] 주문 페이지 로드");

  // 장바구니 데이터 조회
  const cartResult = await getCart();
  const cartItems = cartResult.success ? cartResult.data || [] : [];
  const summary = calculateCartSummary(cartItems);

  console.log("장바구니 아이템 개수:", cartItems.length);
  console.groupEnd();

  // 장바구니가 비어있으면 장바구니 페이지로 리다이렉트
  if (cartItems.length === 0) {
    redirect("/cart");
  }

  return (
    <main className="min-h-[calc(100vh-80px)] px-4 py-8 lg:py-16">
      <div className="w-full max-w-7xl mx-auto">
        {/* 페이지 헤더 */}
        <div className="mb-6 flex items-center gap-4">
          <Link href="/cart">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              장바구니로
            </Button>
          </Link>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
            주문/결제
          </h1>
        </div>

        {/* 로그인 체크 */}
        <SignedOut>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <p className="text-blue-800 mb-4">
              주문을 진행하려면 로그인이 필요합니다.
            </p>
            <Link href="/sign-in">
              <Button>로그인하기</Button>
            </Link>
          </div>
        </SignedOut>

        {/* 메인 콘텐츠 */}
        <SignedIn>
          <Suspense fallback={<div>로딩 중...</div>}>
            <CheckoutClient
              initialCartItems={cartItems}
              initialTotalAmount={summary.totalAmount}
            />
          </Suspense>
        </SignedIn>
      </div>
    </main>
  );
}

