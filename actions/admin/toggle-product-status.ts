/**
 * @file toggle-product-status.ts
 * @description 어드민 상품 상태 관리 Server Action
 *
 * 상품의 활성/비활성 상태를 변경합니다. 어드민 권한이 필요합니다.
 *
 * @dependencies
 * - @clerk/nextjs/server: Clerk 인증
 * - lib/supabase/service-role: 관리자 권한 Supabase 클라이언트
 */

"use server";

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { requireAdmin } from "@/lib/admin";

export interface ToggleProductStatusParams {
  productId: string;
  isActive: boolean;
}

export interface ToggleProductStatusResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * 상품 상태 변경 (활성/비활성)
 * @param productId 상품 ID
 * @param isActive 활성화 여부
 * @returns 상태 변경 결과
 */
export async function toggleProductStatus({
  productId,
  isActive,
}: ToggleProductStatusParams): Promise<ToggleProductStatusResult> {
  try {
    console.group("[toggleProductStatus] 상품 상태 변경 시작");
    console.log("상품 ID:", productId);
    console.log("변경할 상태:", isActive ? "활성화" : "비활성화");

    // 관리자 권한 확인
    const adminCheck = await requireAdmin();
    if (!adminCheck.success) {
      console.warn("[toggleProductStatus] 관리자 권한 없음");
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

    // Supabase 클라이언트 생성 (Service Role - 관리자 권한)
    const supabase = getServiceRoleClient();

    // 상품 존재 확인 및 현재 상태 조회
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("is_active")
      .eq("id", productId)
      .single();

    if (fetchError || !product) {
      console.error("[toggleProductStatus] 상품 조회 실패:", fetchError);
      console.groupEnd();
      return {
        success: false,
        error: "상품을 찾을 수 없습니다.",
      };
    }

    // 이미 같은 상태면 변경하지 않음
    if (product.is_active === isActive) {
      return {
        success: true,
        message: `상품이 이미 ${isActive ? "활성화" : "비활성화"}되어 있습니다.`,
      };
    }

    // 상품 상태 업데이트
    const { error } = await supabase
      .from("products")
      .update({ is_active: isActive })
      .eq("id", productId);

    if (error) {
      console.error("[toggleProductStatus] 상품 상태 변경 실패:", error);
      console.groupEnd();
      return {
        success: false,
        error: `상품 상태 변경에 실패했습니다: ${error.message}`,
      };
    }

    console.log(
      `[toggleProductStatus] 상품 상태 변경 완료: ${product.is_active} → ${isActive}`
    );
    console.groupEnd();

    return {
      success: true,
      message: `상품이 ${isActive ? "활성화" : "비활성화"}되었습니다.`,
    };
  } catch (error) {
    console.error("[toggleProductStatus] 예상치 못한 오류:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

