/**
 * @file get-orders.ts
 * @description 사용자별 주문 목록 조회 Server Action
 *
 * 현재 로그인한 사용자의 모든 주문 목록을 조회합니다.
 * 최신순으로 정렬하여 반환합니다.
 *
 * @dependencies
 * - @clerk/nextjs/server: Clerk 인증
 * - lib/supabase/server: Supabase 클라이언트
 * - lib/users: getOrCreateUserId
 * - types/order: Order 타입
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getOrCreateUserId } from "@/lib/users";
import { Order } from "@/types/order";

export interface GetOrdersResult {
  success: boolean;
  data?: Order[];
  error?: string;
}

/**
 * 사용자별 주문 목록 조회
 * @returns 현재 로그인한 사용자의 주문 목록 (최신순 정렬) 또는 에러
 */
export async function getOrders(): Promise<GetOrdersResult> {
  try {
    console.group("[getOrders] 주문 목록 조회 시작");

    // Clerk 인증 확인
    const { userId } = await auth();
    if (!userId) {
      console.warn("[getOrders] 로그인하지 않은 사용자");
      console.groupEnd();
      return {
        success: false,
        error: "로그인이 필요합니다.",
      };
    }

    // Supabase users 테이블의 id (UUID) 조회 또는 생성
    const supabaseUserId = await getOrCreateUserId(userId);
    if (!supabaseUserId) {
      console.error("[getOrders] Supabase 사용자 ID를 찾을 수 없습니다.");
      console.groupEnd();
      return {
        success: false,
        error: "사용자 정보를 확인할 수 없습니다. 다시 로그인해주세요.",
      };
    }

    console.log("[getOrders] Supabase 사용자 ID:", supabaseUserId);

    const supabase = createClerkSupabaseClient();

    // 주문 목록 조회 (최신순 정렬)
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", supabaseUserId) // 본인 주문만 조회
      .order("created_at", { ascending: false }); // 최신순 정렬

    if (ordersError) {
      console.error("[getOrders] 주문 목록 조회 실패:", ordersError);
      console.groupEnd();
      return {
        success: false,
        error: `주문 목록을 불러오는데 실패했습니다: ${ordersError.message}`,
      };
    }

    // 타입 변환 (Supabase 응답을 Order 타입으로)
    const ordersList: Order[] = (orders || []).map((order: any) => ({
      id: order.id,
      user_id: order.user_id,
      order_number: order.order_number,
      total_amount: parseFloat(order.total_amount.toString()),
      status: order.status as Order["status"],
      shipping_address: order.shipping_address,
      shipping_name: order.shipping_name,
      shipping_phone: order.shipping_phone,
      created_at: order.created_at,
      updated_at: order.updated_at,
    }));

    console.log(`[getOrders] 주문 목록 조회 완료: ${ordersList.length}개 주문`);
    console.groupEnd();

    return {
      success: true,
      data: ordersList,
    };
  } catch (error) {
    console.error("[getOrders] 예상치 못한 오류:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

