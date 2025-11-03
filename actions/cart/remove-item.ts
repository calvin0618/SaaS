/**
 * @file remove-item.ts
 * @description 장바구니 아이템 삭제 Server Action
 *
 * 장바구니에서 상품을 삭제합니다.
 *
 * @dependencies
 * - @clerk/nextjs/server: Clerk 인증
 * - lib/supabase/server: Supabase 클라이언트
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getOrCreateUserId } from "@/lib/users";

export interface RemoveItemParams {
  cartItemId: string;
}

export interface RemoveItemResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * 장바구니 아이템 삭제
 * @param cartItemId 장바구니 아이템 ID
 * @returns 삭제 결과
 */
export async function removeCartItem({
  cartItemId,
}: RemoveItemParams): Promise<RemoveItemResult> {
  try {
    console.group("[removeCartItem] 장바구니 아이템 삭제 시작");
    console.log("장바구니 아이템 ID:", cartItemId);

    // Clerk 인증 확인
    const { userId } = await auth();

    if (!userId) {
      console.warn("[removeCartItem] 로그인하지 않은 사용자");
      console.groupEnd();
      return {
        success: false,
        error: "로그인이 필요합니다.",
      };
    }

    // Supabase users 테이블의 id (UUID) 조회 또는 생성
    const supabaseUserId = await getOrCreateUserId(userId);
    if (!supabaseUserId) {
      console.error("[removeCartItem] Supabase 사용자 ID를 찾을 수 없습니다.");
      console.groupEnd();
      return {
        success: false,
        error: "사용자 정보를 확인할 수 없습니다. 다시 로그인해주세요.",
      };
    }

    // Supabase 클라이언트 생성
    const supabase = createClerkSupabaseClient();

    // 장바구니 아이템 삭제
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId)
      .eq("user_id", supabaseUserId);

    if (error) {
      console.error("[removeCartItem] 장바구니 아이템 삭제 실패:", error);
      console.groupEnd();
      return {
        success: false,
        error: `장바구니에서 삭제하는데 실패했습니다: ${error.message}`,
      };
    }

    console.log("[removeCartItem] 장바구니 아이템 삭제 완료");
    console.groupEnd();

    return {
      success: true,
      message: "장바구니에서 삭제되었습니다.",
    };
  } catch (error) {
    console.error("[removeCartItem] 예상치 못한 오류:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

