/**
 * @file update-stock.ts
 * @description 어드민 재고 관리 Server Action
 *
 * 상품의 재고 수량을 변경합니다. 어드민 권한이 필요합니다.
 *
 * @dependencies
 * - @clerk/nextjs/server: Clerk 인증
 * - lib/supabase/service-role: 관리자 권한 Supabase 클라이언트
 */

"use server";

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { requireAdmin } from "@/lib/admin";

export interface UpdateStockParams {
  productId: string;
  stockQuantity: number;
}

export interface UpdateStockResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * 재고 수량 업데이트
 * @param productId 상품 ID
 * @param stockQuantity 변경할 재고 수량
 * @returns 업데이트 결과
 */
export async function updateStock({
  productId,
  stockQuantity,
}: UpdateStockParams): Promise<UpdateStockResult> {
  try {
    console.group("[updateStock] 재고 수량 변경 시작");
    console.log("상품 ID:", productId);
    console.log("변경할 재고 수량:", stockQuantity);

    // 관리자 권한 확인
    const adminCheck = await requireAdmin();
    if (!adminCheck.success) {
      console.warn("[updateStock] 관리자 권한 없음");
      console.groupEnd();
      return {
        success: false,
        error: adminCheck.error,
      };
    }

    // 유효성 검사
    if (!productId) {
      return {
        success: false,
        error: "상품 ID가 필요합니다.",
      };
    }

    if (stockQuantity < 0) {
      return {
        success: false,
        error: "재고 수량은 0개 이상이어야 합니다.",
      };
    }

    // Supabase 클라이언트 생성 (Service Role - 관리자 권한)
    const supabase = getServiceRoleClient();

    // 상품 존재 확인
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("stock_quantity")
      .eq("id", productId)
      .single();

    if (fetchError || !product) {
      console.error("[updateStock] 상품 조회 실패:", fetchError);
      console.groupEnd();
      return {
        success: false,
        error: "상품을 찾을 수 없습니다.",
      };
    }

    // 재고 수량 업데이트
    const { error } = await supabase
      .from("products")
      .update({ stock_quantity: stockQuantity })
      .eq("id", productId);

    if (error) {
      console.error("[updateStock] 재고 수량 변경 실패:", error);
      console.groupEnd();
      return {
        success: false,
        error: `재고 수량 변경에 실패했습니다: ${error.message}`,
      };
    }

    console.log(
      `[updateStock] 재고 수량 변경 완료: ${product.stock_quantity} → ${stockQuantity}`
    );
    console.groupEnd();

    return {
      success: true,
      message: `재고 수량이 ${stockQuantity}개로 변경되었습니다.`,
    };
  } catch (error) {
    console.error("[updateStock] 예상치 못한 오류:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

