/**
 * @file cancel-order.ts
 * @description 주문 취소 Server Action
 *
 * pending 상태의 주문만 취소할 수 있습니다.
 * 취소된 주문의 status는 'cancelled'로 변경됩니다.
 *
 * @dependencies
 * - @clerk/nextjs/server: Clerk 인증
 * - lib/supabase/server: Supabase 클라이언트
 * - lib/users: getOrCreateUserId
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getOrCreateUserId } from "@/lib/users";

export interface CancelOrderResult {
  success: boolean;
  error?: string;
}

/**
 * 주문 취소
 * @param orderId 주문 ID
 * @returns 취소 성공 여부 또는 에러
 */
export async function cancelOrder(orderId: string): Promise<CancelOrderResult> {
  try {
    console.group("[cancelOrder] 주문 취소 시작");
    console.log("주문 ID:", orderId);

    // Clerk 인증 확인
    const { userId } = await auth();
    if (!userId) {
      console.warn("[cancelOrder] 로그인하지 않은 사용자");
      console.groupEnd();
      return {
        success: false,
        error: "로그인이 필요합니다.",
      };
    }

    // Supabase users 테이블의 id (UUID) 조회 또는 생성
    const supabaseUserId = await getOrCreateUserId(userId);
    if (!supabaseUserId) {
      console.error("[cancelOrder] Supabase 사용자 ID를 찾을 수 없습니다.");
      console.groupEnd();
      return {
        success: false,
        error: "사용자 정보를 확인할 수 없습니다. 다시 로그인해주세요.",
      };
    }

    const supabase = createClerkSupabaseClient();

    // 1. 주문 조회 및 권한 확인
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, status, user_id")
      .eq("id", orderId)
      .eq("user_id", supabaseUserId) // 본인 주문만 취소 가능
      .single();

    if (orderError || !order) {
      console.error("[cancelOrder] 주문 조회 실패:", orderError);
      console.groupEnd();
      return {
        success: false,
        error: "주문을 찾을 수 없습니다.",
      };
    }

    // 2. 주문 상태 확인 (pending 상태만 취소 가능)
    if (order.status !== "pending") {
      console.warn("[cancelOrder] 취소 불가능한 주문 상태:", order.status);
      console.groupEnd();
      return {
        success: false,
        error: `취소할 수 없는 주문입니다. (현재 상태: ${order.status === "cancelled" ? "이미 취소됨" : "처리 중"})`,
      };
    }

    // 3. 주문 상태를 'cancelled'로 변경
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", orderId)
      .eq("user_id", supabaseUserId);

    if (updateError) {
      console.error("[cancelOrder] 주문 취소 실패:", updateError);
      console.groupEnd();
      return {
        success: false,
        error: `주문 취소에 실패했습니다: ${updateError.message}`,
      };
    }

    console.log("[cancelOrder] 주문 취소 완료");
    console.groupEnd();

    return {
      success: true,
    };
  } catch (error) {
    console.error("[cancelOrder] 예상치 못한 오류:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

