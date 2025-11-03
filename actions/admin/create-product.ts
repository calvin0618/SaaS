/**
 * @file create-product.ts
 * @description 어드민 상품 생성 Server Action
 *
 * 새로운 상품을 생성합니다. 어드민 권한이 필요합니다.
 *
 * @dependencies
 * - @clerk/nextjs/server: Clerk 인증
 * - lib/supabase/service-role: 관리자 권한 Supabase 클라이언트
 * - types/product: Product 타입 정의
 */

"use server";

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { requireAdmin } from "@/lib/admin";

export interface CreateProductParams {
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  stock_quantity: number;
  is_active?: boolean;
  image_url?: string | null;
}

export interface CreateProductResult {
  success: boolean;
  data?: { id: string };
  error?: string;
}

/**
 * 상품 생성
 * @param params 상품 정보
 * @returns 생성 결과
 */
export async function createProduct(
  params: CreateProductParams
): Promise<CreateProductResult> {
  try {
    console.group("[createProduct] 상품 생성 시작");
    console.log("상품 정보:", params);

    // 관리자 권한 확인
    const adminCheck = await requireAdmin();
    if (!adminCheck.success) {
      console.warn("[createProduct] 관리자 권한 없음");
      console.groupEnd();
      return {
        success: false,
        error: adminCheck.error,
      };
    }

    // 입력값 유효성 검사
    if (!params.name || params.name.trim() === "") {
      return {
        success: false,
        error: "상품명을 입력해주세요.",
      };
    }

    if (params.price < 0) {
      return {
        success: false,
        error: "가격은 0원 이상이어야 합니다.",
      };
    }

    if (params.stock_quantity < 0) {
      return {
        success: false,
        error: "재고 수량은 0개 이상이어야 합니다.",
      };
    }

    // Supabase 클라이언트 생성 (Service Role - 관리자 권한)
    const supabase = getServiceRoleClient();

    // 상품 생성
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: params.name.trim(),
        description: params.description?.trim() || null,
        price: params.price,
        category: params.category || null,
        stock_quantity: params.stock_quantity,
        is_active: params.is_active ?? true,
        image_url: params.image_url || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[createProduct] 상품 생성 실패:", error);
      console.groupEnd();
      return {
        success: false,
        error: `상품 생성에 실패했습니다: ${error.message}`,
      };
    }

    console.log("[createProduct] 상품 생성 완료:", data?.id);
    console.groupEnd();

    return {
      success: true,
      data: { id: data.id },
    };
  } catch (error) {
    console.error("[createProduct] 예상치 못한 오류:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

