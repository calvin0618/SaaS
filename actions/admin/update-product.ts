/**
 * @file update-product.ts
 * @description 어드민 상품 수정 Server Action
 *
 * 기존 상품 정보를 수정합니다. 어드민 권한이 필요합니다.
 *
 * @dependencies
 * - @clerk/nextjs/server: Clerk 인증
 * - lib/supabase/service-role: 관리자 권한 Supabase 클라이언트
 */

"use server";

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { requireAdmin } from "@/lib/admin";

export interface UpdateProductParams {
  id: string;
  name?: string;
  description?: string | null;
  price?: number;
  category?: string | null;
  stock_quantity?: number;
  is_active?: boolean;
  image_url?: string | null;
}

export interface UpdateProductResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * 상품 수정
 * @param params 수정할 상품 정보
 * @returns 수정 결과
 */
export async function updateProduct(
  params: UpdateProductParams
): Promise<UpdateProductResult> {
  try {
    console.group("[updateProduct] 상품 수정 시작");
    console.log("상품 ID:", params.id);
    console.log("수정 정보:", params);

    // 관리자 권한 확인
    const adminCheck = await requireAdmin();
    if (!adminCheck.success) {
      console.warn("[updateProduct] 관리자 권한 없음");
      console.groupEnd();
      return {
        success: false,
        error: "error" in adminCheck ? adminCheck.error : "관리자 권한이 필요합니다.",
      };
    }

    // 상품 ID 유효성 검사
    if (!params.id) {
      return {
        success: false,
        error: "상품 ID가 필요합니다.",
      };
    }

    // 수정할 데이터 구성 (undefined 필드는 제외)
    const updateData: Record<string, any> = {};

    if (params.name !== undefined) {
      if (params.name.trim() === "") {
        return {
          success: false,
          error: "상품명은 비어있을 수 없습니다.",
        };
      }
      updateData.name = params.name.trim();
    }

    if (params.description !== undefined) {
      updateData.description = params.description?.trim() || null;
    }

    if (params.price !== undefined) {
      if (params.price < 0) {
        return {
          success: false,
          error: "가격은 0원 이상이어야 합니다.",
        };
      }
      updateData.price = params.price;
    }

    if (params.category !== undefined) {
      updateData.category = params.category || null;
    }

    if (params.stock_quantity !== undefined) {
      if (params.stock_quantity < 0) {
        return {
          success: false,
          error: "재고 수량은 0개 이상이어야 합니다.",
        };
      }
      updateData.stock_quantity = params.stock_quantity;
    }

    if (params.is_active !== undefined) {
      updateData.is_active = params.is_active;
    }

    if (params.image_url !== undefined) {
      updateData.image_url = params.image_url || null;
    }

    // 수정할 데이터가 없으면 에러
    if (Object.keys(updateData).length === 0) {
      return {
        success: false,
        error: "수정할 정보가 없습니다.",
      };
    }

    // Supabase 클라이언트 생성 (Service Role - 관리자 권한)
    const supabase = getServiceRoleClient();

    // 상품 수정
    const { error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", params.id);

    if (error) {
      console.error("[updateProduct] 상품 수정 실패:", error);
      console.groupEnd();
      return {
        success: false,
        error: `상품 수정에 실패했습니다: ${error.message}`,
      };
    }

    console.log("[updateProduct] 상품 수정 완료");
    console.groupEnd();

    return {
      success: true,
      message: "상품이 수정되었습니다.",
    };
  } catch (error) {
    console.error("[updateProduct] 예상치 못한 오류:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

