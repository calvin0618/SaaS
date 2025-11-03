/**
 * @file create-order.ts
 * @description 주문 생성 Server Action
 *
 * 장바구니 아이템을 기반으로 주문을 생성합니다.
 * 주문은 status='pending' 상태로 생성되며, 재고 차감 및 장바구니 비우기는 결제 성공 후에만 수행됩니다.
 *
 * 주요 처리:
 * 1. 주문 전 검증 (로그인, 장바구니, 재고 확인)
 * 2. orders 테이블에 주문 저장 (status='pending')
 * 3. order_items 테이블에 주문 상품 저장
 *
 * ⚠️ 중요: 재고 차감 및 장바구니 비우기는 이 함수에서 하지 않습니다.
 * 결제 성공 후 confirm-order.ts에서 처리합니다.
 *
 * @dependencies
 * - @clerk/nextjs/server: Clerk 인증
 * - lib/supabase/server: Supabase 클라이언트
 * - actions/cart/get-cart: 장바구니 조회
 * - types/order: CreateOrderParams 타입
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getOrCreateUserId } from "@/lib/users";
import { getCart } from "@/actions/cart/get-cart";
import { CreateOrderParams } from "@/types/order";

export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

/**
 * 주문 생성
 * @param params 배송 정보 및 주문 메모
 * @returns 주문 ID 또는 에러
 */
export async function createOrder(
  params: CreateOrderParams
): Promise<CreateOrderResult> {
  try {
    console.group("[createOrder] 주문 생성 시작");
    console.log("배송 정보:", params.shipping_address);
    console.log("주문 메모:", params.order_note);

    // 1. 로그인 상태 확인
    const { userId } = await auth();
    if (!userId) {
      console.warn("[createOrder] 로그인하지 않은 사용자");
      console.groupEnd();
      return { success: false, error: "로그인이 필요합니다." };
    }

    console.log("[createOrder] Clerk 사용자 ID:", userId);

    // Supabase users 테이블의 id (UUID) 조회 또는 생성
    const supabaseUserId = await getOrCreateUserId(userId);
    if (!supabaseUserId) {
      console.error("[createOrder] Supabase 사용자 ID를 찾을 수 없습니다.");
      console.groupEnd();
      return {
        success: false,
        error: "사용자 정보를 확인할 수 없습니다. 다시 로그인해주세요.",
      };
    }

    console.log("[createOrder] Supabase 사용자 ID:", supabaseUserId);

    // 2. 장바구니 조회
    const cartResult = await getCart();
    if (!cartResult.success || !cartResult.data || cartResult.data.length === 0) {
      console.warn("[createOrder] 장바구니가 비어있음");
      console.groupEnd();
      return { success: false, error: "장바구니가 비어있습니다." };
    }

    const cartItems = cartResult.data;
    console.log(`[createOrder] 장바구니 아이템 ${cartItems.length}개 확인`);

    // 3. 상품 활성화 상태 및 재고 확인
    for (const item of cartItems) {
      if (!item.product.is_active) {
        console.warn(`[createOrder] 비활성화된 상품: ${item.product.name}`);
        console.groupEnd();
        return {
          success: false,
          error: `"${item.product.name}" 상품은 현재 구매할 수 없습니다.`,
        };
      }

      if (item.product.stock_quantity < item.quantity) {
        console.warn(
          `[createOrder] 재고 부족: ${item.product.name}, 요청 수량: ${item.quantity}, 재고: ${item.product.stock_quantity}`
        );
        console.groupEnd();
        return {
          success: false,
          error: `"${item.product.name}" 상품의 재고가 부족합니다. (남은 재고: ${item.product.stock_quantity}개)`,
        };
      }
    }

    // 4. 총 금액 계산
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    console.log(`[createOrder] 총 금액: ${totalAmount}원`);

    // 5. Supabase 클라이언트 생성
    const supabase = createClerkSupabaseClient();

    // 6. 트랜잭션 처리 (orders 저장 → order_items 저장)
    // Supabase에서는 트랜잭션을 직접 지원하지 않으므로 순차적으로 처리
    // 에러 발생 시 롤백 처리

    // 6-1. orders 테이블에 주문 저장
    // 실제 DB 구조: shipping_address (TEXT), shipping_name (TEXT), shipping_phone (TEXT)
    // order_number는 필수 (TEXT NOT NULL)
    const orderNumber = `ORDER-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: supabaseUserId,
        order_number: orderNumber,
        total_amount: totalAmount,
        status: "pending", // ⚠️ 초기값은 pending
        shipping_address: params.shipping_address.address,
        shipping_name: params.shipping_address.name,
        shipping_phone: params.shipping_address.phone,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("[createOrder] 주문 저장 실패:", orderError);
      console.groupEnd();
      return {
        success: false,
        error: `주문 생성에 실패했습니다: ${orderError?.message || "알 수 없는 오류"}`,
      };
    }

    const orderId = order.id;
    console.log("[createOrder] 주문 생성 완료, 주문 ID:", orderId);

    // 6-2. order_items 테이블에 주문 상품 저장 (배치 처리)
    // 실제 DB 구조: product_name 컬럼 없음 (product_id만 저장)
    const orderItemsData = cartItems.map((item) => ({
      order_id: orderId,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.product.price, // 주문 시점 가격 저장
    }));

    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItemsData);

    if (orderItemsError) {
      console.error("[createOrder] 주문 상품 저장 실패:", orderItemsError);
      
      // 롤백: 주문 삭제
      await supabase.from("orders").delete().eq("id", orderId);
      
      console.groupEnd();
      return {
        success: false,
        error: `주문 상품 저장에 실패했습니다: ${orderItemsError.message}`,
      };
    }

    console.log(`[createOrder] 주문 상품 ${orderItemsData.length}개 저장 완료`);
    console.log("[createOrder] 주문 생성 성공, 주문 ID:", orderId);
    console.groupEnd();

    return {
      success: true,
      orderId,
    };
  } catch (error) {
    console.error("[createOrder] 예상치 못한 오류:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

