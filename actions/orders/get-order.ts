/**
 * @file get-order.ts
 * @description 주문 조회 Server Action
 *
 * 주문 ID로 주문 정보와 주문 상품 목록을 조회합니다.
 *
 * @dependencies
 * - @clerk/nextjs/server: Clerk 인증
 * - lib/supabase/server: Supabase 클라이언트
 * - types/order: Order, OrderItem, OrderWithItems 타입
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getOrCreateUserId } from "@/lib/users";
import { OrderWithItems, OrderItem } from "@/types/order";

export interface GetOrderResult {
  success: boolean;
  data?: OrderWithItems;
  error?: string;
}

/**
 * 주문 조회
 * @param orderId 주문 ID
 * @returns 주문 정보 및 주문 상품 목록 또는 에러
 */
export async function getOrder(
  orderId: string
): Promise<GetOrderResult> {
  try {
    console.group("[getOrder] 주문 조회 시작");
    console.log("주문 ID:", orderId);

    // Clerk 인증 확인
    const { userId } = await auth();
    if (!userId) {
      console.warn("[getOrder] 로그인하지 않은 사용자");
      console.groupEnd();
      return {
        success: false,
        error: "로그인이 필요합니다.",
      };
    }

    // Supabase users 테이블의 id (UUID) 조회 또는 생성
    const supabaseUserId = await getOrCreateUserId(userId);
    if (!supabaseUserId) {
      console.error("[getOrder] Supabase 사용자 ID를 찾을 수 없습니다.");
      console.groupEnd();
      return {
        success: false,
        error: "사용자 정보를 확인할 수 없습니다. 다시 로그인해주세요.",
      };
    }

    const supabase = createClerkSupabaseClient();

    // 주문 정보 조회
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("user_id", supabaseUserId) // 본인 주문만 조회 가능
      .single();

    if (orderError || !order) {
      console.error("[getOrder] 주문 조회 실패:", orderError);
      console.groupEnd();
      
      if (orderError?.code === "PGRST116" || orderError?.message?.includes("No rows")) {
        return {
          success: false,
          error: "주문을 찾을 수 없습니다.",
        };
      }

      return {
        success: false,
        error: `주문 조회에 실패했습니다: ${orderError?.message || "알 수 없는 오류"}`,
      };
    }

    // 주문 상품 목록 조회 (products 테이블과 JOIN하여 상품명 가져오기)
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select(`
        id,
        order_id,
        product_id,
        quantity,
        price,
        created_at,
        products (
          id,
          name,
          image_url
        )
      `)
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    if (itemsError) {
      console.error("[getOrder] 주문 상품 조회 실패:", itemsError);
      console.groupEnd();
      return {
        success: false,
        error: `주문 상품 조회에 실패했습니다: ${itemsError.message}`,
      };
    }

    // order_items와 products JOIN 결과를 OrderItem 타입으로 변환
    const transformedItems: OrderItem[] = (orderItems || []).map((item: any) => {
      const product = Array.isArray(item.products) ? item.products[0] : item.products;
      return {
        id: item.id,
        order_id: item.order_id,
        product_id: item.product_id,
        product_name: product?.name || "상품명 없음", // products 테이블에서 가져온 상품명
        quantity: item.quantity,
        price: item.price,
        created_at: item.created_at,
      };
    });

    const orderWithItems: OrderWithItems = {
      ...order,
      items: transformedItems,
    };

    console.log(`[getOrder] 주문 조회 완료: ${orderWithItems.items.length}개 상품`);
    console.groupEnd();

    return {
      success: true,
      data: orderWithItems,
    };
  } catch (error) {
    console.error("[getOrder] 예상치 못한 오류:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

