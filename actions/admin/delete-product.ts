/**
 * @file delete-product.ts
 * @description 어드민 상품 삭제 Server Action
 *
 * 상품을 데이터베이스에서 완전히 삭제합니다. 어드민 권한이 필요합니다.
 * 주의: 삭제된 상품은 복구할 수 없습니다.
 *
 * @dependencies
 * - @clerk/nextjs/server: Clerk 인증
 * - lib/supabase/service-role: 관리자 권한 Supabase 클라이언트
 */

"use server";

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { requireAdmin } from "@/lib/admin";

export interface DeleteProductParams {
  id: string;
}

export interface DeleteProductResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * 상품 삭제
 * @param id 상품 ID
 * @returns 삭제 결과
 */
export async function deleteProduct({
  id,
}: DeleteProductParams): Promise<DeleteProductResult> {
  try {
    console.group("[deleteProduct] 상품 삭제 시작");
    console.log("상품 ID:", id);

    // 관리자 권한 확인
    const adminCheck = await requireAdmin();
    if (!adminCheck.success) {
      console.warn("[deleteProduct] 관리자 권한 없음");
      console.groupEnd();
      return {
        success: false,
        error: adminCheck.error,
      };
    }

    // 상품 ID 유효성 검사
    if (!id) {
      return {
        success: false,
        error: "상품 ID가 필요합니다.",
      };
    }

    // Supabase 클라이언트 생성 (Service Role - 관리자 권한)
    const supabase = getServiceRoleClient();

    // 장바구니나 주문에 연관된 상품인지 확인 (선택적)
    // 여기서는 바로 삭제하지만, 실제로는 CASCADE 정책에 따라 자동 삭제됨

    // 상품 삭제
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("[deleteProduct] 상품 삭제 실패:", error);
      console.groupEnd();
      return {
        success: false,
        error: `상품 삭제에 실패했습니다: ${error.message}`,
      };
    }

    console.log("[deleteProduct] 상품 삭제 완료");
    console.groupEnd();

    return {
      success: true,
      message: "상품이 삭제되었습니다.",
    };
  } catch (error) {
    console.error("[deleteProduct] 예상치 못한 오류:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

