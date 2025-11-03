/**
 * @file order-summary.tsx
 * @description 주문 요약 컴포넌트
 *
 * 주문할 상품 목록과 총 금액을 표시하는 컴포넌트입니다.
 * 장바구니 페이지의 CartSummary 컴포넌트와 유사하지만, 주문 페이지용으로 확장된 버전입니다.
 *
 * @dependencies
 * - types/cart: CartItem 타입
 * - lib/cart: formatPrice 함수
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { CartItem } from "@/types/cart";
import { formatPrice } from "@/lib/cart";
import { Button } from "@/components/ui/button";

interface OrderSummaryProps {
  cartItems: CartItem[];
  totalAmount: number;
  onOrder: () => void;
  isSubmitting?: boolean;
}

export function OrderSummary({
  cartItems,
  totalAmount,
  onOrder,
  isSubmitting = false,
}: OrderSummaryProps) {
  const totalItems = cartItems.length;
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8 sticky top-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">주문 요약</h2>

      {/* 주문 요약 정보 */}
      <div className="space-y-2 mb-6 pb-6 border-b border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">상품 종류</span>
          <span className="text-gray-900 font-medium">{totalItems}개</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">총 수량</span>
          <span className="text-gray-900 font-medium">{totalQuantity}개</span>
        </div>
      </div>

      {/* 상품 목록 */}
      <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0"
          >
            <Link
              href={`/products/${item.product.id}`}
              className="flex-shrink-0"
            >
              <Image
                src={
                  item.product.image_url ||
                  "https://via.placeholder.com/80x80?text=No+Image"
                }
                alt={item.product.name}
                width={80}
                height={80}
                className="rounded-md object-cover"
              />
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/products/${item.product.id}`}>
                <h3 className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                  {item.product.name}
                </h3>
              </Link>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-gray-600">
                  {formatPrice(item.product.price)} × {item.quantity}개
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 총 금액 */}
      <div className="border-t border-gray-200 pt-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">총 결제 금액</span>
          <span className="text-2xl font-bold text-gray-900">
            {formatPrice(totalAmount)}
          </span>
        </div>
      </div>

      {/* 주문하기 버튼 */}
      <Button
        className="w-full h-12 text-base font-semibold"
        size="lg"
        onClick={onOrder}
        disabled={isSubmitting || cartItems.length === 0}
      >
        {isSubmitting ? "주문 처리 중..." : "주문하기"}
      </Button>
    </div>
  );
}

