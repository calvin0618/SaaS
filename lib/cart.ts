/**
 * @file cart.ts
 * @description 장바구니 관련 유틸리티 함수
 *
 * 장바구니 데이터를 처리하는 공통 함수들을 제공합니다.
 *
 * @dependencies
 * - types/cart: CartItem, CartSummary 타입 정의
 */

import { CartItem, CartSummary } from "@/types/cart";

/**
 * 장바구니 요약 정보 계산
 * @param cartItems 장바구니 아이템 목록
 * @returns 장바구니 요약 정보
 */
export function calculateCartSummary(cartItems: CartItem[]): CartSummary {
  const totalItems = cartItems.length;
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return {
    totalItems,
    totalQuantity,
    totalAmount,
  };
}

/**
 * 금액 포맷팅 (천 단위 콤마)
 * @deprecated 이 함수는 lib/utils/format.ts의 formatPrice를 사용하세요.
 * @param amount 금액
 * @returns 포맷팅된 금액 문자열
 */
export function formatPrice(amount: number): string {
  // 하위 호환성을 위해 유지하되, 새로운 함수를 사용
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount);
}

