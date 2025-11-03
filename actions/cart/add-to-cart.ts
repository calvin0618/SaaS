/**
 * @file add-to-cart.ts
 * @description 장바구니에 상품 추가 Server Action
 *
 * 현재 로그인한 사용자의 장바구니에 상품을 추가합니다.
 * 이미 장바구니에 있는 경우 수량을 증가시킵니다 (UNIQUE 제약 활용).
 *
 * @dependencies
 * - @clerk/nextjs/server: Clerk 인증
 * - lib/supabase/server: Supabase 클라이언트
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getOrCreateUserId } from "@/lib/users";

export interface AddToCartParams {
  productId: string;
  quantity: number;
}

export interface AddToCartResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * 장바구니에 상품 추가
 * @param productId 상품 ID
 * @param quantity 수량
 * @returns 추가 결과
 */
export async function addToCart({
  productId,
  quantity,
}: AddToCartParams): Promise<AddToCartResult> {
  try {
    console.group("[addToCart] 장바구니 추가 시작");
    console.log("상품 ID:", productId);
    console.log("수량:", quantity);

    // Clerk 인증 확인
    const { userId } = await auth();

    if (!userId) {
      console.warn("[addToCart] 로그인하지 않은 사용자");
      console.groupEnd();
      return {
        success: false,
        error: "로그인이 필요합니다.",
      };
    }

    console.log("[addToCart] Clerk 사용자 ID:", userId);

    // Supabase users 테이블의 id (UUID) 조회 또는 생성
    const supabaseUserId = await getOrCreateUserId(userId);
    if (!supabaseUserId) {
      console.error("[addToCart] Supabase 사용자 ID를 찾을 수 없습니다.");
      console.groupEnd();
      return {
        success: false,
        error: "사용자 정보를 확인할 수 없습니다. 다시 로그인해주세요.",
      };
    }

    console.log("[addToCart] Supabase 사용자 ID:", supabaseUserId);

    // 수량 유효성 검사
    if (quantity <= 0) {
      return {
        success: false,
        error: "수량은 1개 이상이어야 합니다.",
      };
    }

    // Supabase 클라이언트 생성
    const supabase = createClerkSupabaseClient();

    // 상품 재고 확인
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("stock_quantity, is_active")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      console.error("[addToCart] 상품 조회 실패:", productError);
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

    if (product.stock_quantity < quantity) {
      return {
        success: false,
        error: `재고가 부족합니다. (최대 ${product.stock_quantity}개까지 선택 가능)`,
      };
    }

    // 장바구니에 추가 (이미 있으면 수량 증가)
    // UNIQUE(user_id, product_id) 제약으로 인해 upsert 사용
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("quantity")
      .eq("user_id", supabaseUserId)
      .eq("product_id", productId)
      .single();

    let finalQuantity = quantity;
    if (existingItem) {
      // 이미 장바구니에 있는 경우 기존 수량에 추가
      finalQuantity = existingItem.quantity + quantity;

      // 재고 초과 확인
      if (finalQuantity > product.stock_quantity) {
        return {
          success: false,
          error: `재고가 부족합니다. (최대 ${product.stock_quantity}개까지 가능, 현재 장바구니: ${existingItem.quantity}개)`,
        };
      }

      // 수량 업데이트
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: finalQuantity })
        .eq("user_id", supabaseUserId)
        .eq("product_id", productId);

      if (updateError) {
        console.error("[addToCart] 수량 업데이트 실패:", updateError);
        console.groupEnd();
        return {
          success: false,
          error: `장바구니 수량 업데이트에 실패했습니다: ${updateError.message}`,
        };
      }

      console.log(`[addToCart] 기존 아이템 수량 증가: ${existingItem.quantity} → ${finalQuantity}`);
    } else {
      // 새로 추가
      const { error: insertError } = await supabase
        .from("cart_items")
        .insert({
          user_id: supabaseUserId,
          product_id: productId,
          quantity,
        });

      if (insertError) {
        console.error("[addToCart] 장바구니 추가 실패:", insertError);
        console.groupEnd();
        return {
          success: false,
          error: `장바구니에 추가하는데 실패했습니다: ${insertError.message}`,
        };
      }

      console.log("[addToCart] 새 아이템 추가 완료");
    }

    console.log("[addToCart] 장바구니 추가 완료");
    console.groupEnd();

    return {
      success: true,
      message: "장바구니에 추가되었습니다.",
    };
  } catch (error) {
    console.error("[addToCart] 예상치 못한 오류:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

