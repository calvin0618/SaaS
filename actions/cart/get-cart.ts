/**
 * @file get-cart.ts
 * @description 장바구니 조회 Server Action
 *
 * 현재 로그인한 사용자의 장바구니 아이템 목록을 조회합니다.
 * cart_items와 products 테이블을 JOIN하여 상품 정보를 함께 반환합니다.
 *
 * @dependencies
 * - @clerk/nextjs/server: Clerk 인증
 * - lib/supabase/server: Supabase 클라이언트
 * - types/cart: CartItem 타입 정의
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getOrCreateUserId } from "@/lib/users";
import { CartItem } from "@/types/cart";

/**
 * 장바구니 조회
 * @returns 장바구니 아이템 목록 또는 에러
 */
export async function getCart(): Promise<{
  success: boolean;
  data?: CartItem[];
  error?: string;
}> {
  try {
    console.group("[getCart] 장바구니 조회 시작");

    // Clerk 인증 확인
    const { userId } = await auth();

    if (!userId) {
      console.warn("[getCart] 로그인하지 않은 사용자");
      console.groupEnd();
      return {
        success: false,
        error: "로그인이 필요합니다.",
      };
    }

    console.log("[getCart] Clerk 사용자 ID:", userId);

    // Supabase users 테이블의 id (UUID) 조회 또는 생성
    const supabaseUserId = await getOrCreateUserId(userId);
    if (!supabaseUserId) {
      console.error("[getCart] Supabase 사용자 ID를 찾을 수 없습니다.");
      console.groupEnd();
      return {
        success: false,
        error: "사용자 정보를 확인할 수 없습니다. 다시 로그인해주세요.",
      };
    }

    console.log("[getCart] Supabase 사용자 ID:", supabaseUserId);

    // Supabase 클라이언트 생성
    const supabase = createClerkSupabaseClient();

    // 장바구니 아이템 조회 (products 테이블 JOIN)
    const { data, error } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        user_id,
        product_id,
        quantity,
        created_at,
        updated_at,
        products (
          id,
          name,
          description,
          price,
          image_url,
          category,
          stock_quantity,
          is_active,
          created_at,
          updated_at
        )
      `
      )
      .eq("user_id", supabaseUserId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getCart] 장바구니 조회 실패:", error);
      console.groupEnd();
      return {
        success: false,
        error: `장바구니를 불러오는데 실패했습니다: ${error.message}`,
      };
    }

    // 타입 변환
    const cartItems: CartItem[] =
      data?.map((item: any) => {
        // Supabase JOIN 결과: products는 단일 객체 또는 배열일 수 있음
        const product = Array.isArray(item.products)
          ? item.products[0]
          : item.products;

        if (!product) {
          console.warn(`[getCart] 상품 정보 없음: product_id=${item.product_id}`);
          return null;
        }

        return {
          id: item.id,
          clerk_id: userId, // Clerk userId를 유지 (타입 호환성)
          product_id: item.product_id,
          quantity: item.quantity,
          created_at: item.created_at,
          updated_at: item.updated_at,
          product,
        };
      })
      .filter((item): item is CartItem => item !== null) || [];

    console.log(`[getCart] 장바구니 ${cartItems.length}개 아이템 조회 완료`);
    console.groupEnd();

    return {
      success: true,
      data: cartItems,
    };
  } catch (error) {
    console.error("[getCart] 예상치 못한 오류:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

