/**
 * @file update-quantity.ts
 * @description 장바구니 아이템 수량 변경 Server Action
 *
 * 장바구니에 담긴 상품의 수량을 변경합니다.
 * 재고 범위 내에서만 변경 가능합니다.
 *
 * @dependencies
 * - @clerk/nextjs/server: Clerk 인증
 * - lib/supabase/server: Supabase 클라이언트
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getOrCreateUserId } from "@/lib/users";

export interface UpdateQuantityParams {
  cartItemId: string;
  quantity: number;
}

export interface UpdateQuantityResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * 장바구니 아이템 수량 변경
 * @param cartItemId 장바구니 아이템 ID
 * @param quantity 변경할 수량
 * @returns 변경 결과
 */
export async function updateCartItemQuantity({
  cartItemId,
  quantity,
}: UpdateQuantityParams): Promise<UpdateQuantityResult> {
  try {
    console.group("[updateCartItemQuantity] 수량 변경 시작");
    console.log("장바구니 아이템 ID:", cartItemId);
    console.log("변경할 수량:", quantity);

    // Clerk 인증 확인
    const { userId } = await auth();

    if (!userId) {
      console.warn("[updateCartItemQuantity] 로그인하지 않은 사용자");
      console.groupEnd();
      return {
        success: false,
        error: "로그인이 필요합니다.",
      };
    }

    // Supabase users 테이블의 id (UUID) 조회 또는 생성
    const supabaseUserId = await getOrCreateUserId(userId);
    if (!supabaseUserId) {
      console.error("[updateCartItemQuantity] Supabase 사용자 ID를 찾을 수 없습니다.");
      console.groupEnd();
      return {
        success: false,
        error: "사용자 정보를 확인할 수 없습니다. 다시 로그인해주세요.",
      };
    }

    // 수량 유효성 검사
    if (quantity <= 0) {
      return {
        success: false,
        error: "수량은 1개 이상이어야 합니다.",
      };
    }

    // Supabase 클라이언트 생성
    const supabase = createClerkSupabaseClient();

    // 장바구니 아이템 조회 (상품 정보 포함)
    const { data: cartItem, error: fetchError } = await supabase
      .from("cart_items")
      .select("product_id, quantity")
      .eq("id", cartItemId)
      .eq("user_id", supabaseUserId)
      .single();

    if (fetchError || !cartItem) {
      console.error("[updateCartItemQuantity] 장바구니 아이템 조회 실패:", fetchError);
      console.groupEnd();
      return {
        success: false,
        error: "장바구니 아이템을 찾을 수 없습니다.",
      };
    }

    // 상품 재고 확인
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("stock_quantity, is_active")
      .eq("id", cartItem.product_id)
      .single();

    if (productError || !product) {
      console.error("[updateCartItemQuantity] 상품 조회 실패:", productError);
      console.groupEnd();
      return {
        success: false,
        error: "상품을 찾을 수 없습니다.",
      };
    }

    if (!product.is_active) {
      return {
        success: false,
        error: "판매 중단된 상품입니다.",
      };
    }

    if (quantity > product.stock_quantity) {
      return {
        success: false,
        error: `재고가 부족합니다. (최대 ${product.stock_quantity}개까지 선택 가능)`,
      };
    }

    // 수량 업데이트
    const { error: updateError } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", cartItemId)
      .eq("user_id", supabaseUserId);

    if (updateError) {
      console.error("[updateCartItemQuantity] 수량 업데이트 실패:", updateError);
      console.groupEnd();
      return {
        success: false,
        error: `수량 변경에 실패했습니다: ${updateError.message}`,
      };
    }

    console.log(`[updateCartItemQuantity] 수량 변경 완료: ${cartItem.quantity} → ${quantity}`);
    console.groupEnd();

    return {
      success: true,
      message: "수량이 변경되었습니다.",
    };
  } catch (error) {
    console.error("[updateCartItemQuantity] 예상치 못한 오류:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

