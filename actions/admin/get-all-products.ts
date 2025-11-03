/**
 * @file get-all-products.ts
 * @description 어드민 상품 목록 조회 Server Action
 *
 * 관리자용으로 모든 상품을 조회합니다 (비활성 상품 포함).
 *
 * @dependencies
 * - @clerk/nextjs/server: Clerk 인증
 * - lib/supabase/service-role: 관리자 권한 Supabase 클라이언트
 * - lib/admin: 관리자 권한 체크
 */

"use server";

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { requireAdmin } from "@/lib/admin";
import { Product } from "@/types/product";

export interface GetAllProductsResult {
  success: boolean;
  data?: Product[];
  error?: string;
}

/**
 * 모든 상품 조회 (관리자용, 비활성 상품 포함)
 * @returns 상품 목록
 */
export async function getAllProducts(): Promise<GetAllProductsResult> {
  try {
    console.group("[getAllProducts] 상품 목록 조회 시작 (관리자)");

    // 관리자 권한 확인
    const adminCheck = await requireAdmin();
    if (!adminCheck.success) {
      console.warn("[getAllProducts] 관리자 권한 없음");
      console.groupEnd();
      return {
        success: false,
        error: adminCheck.error,
      };
    }

    // Supabase 클라이언트 생성 (Service Role - 관리자 권한)
    const supabase = getServiceRoleClient();

    // 모든 상품 조회 (is_active 필터 없음)
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getAllProducts] 상품 목록 조회 실패:", error);
      console.groupEnd();
      return {
        success: false,
        error: `상품 목록을 불러오는데 실패했습니다: ${error.message}`,
      };
    }

    console.log(`[getAllProducts] 상품 ${data?.length || 0}개 조회 완료`);
    console.groupEnd();

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error("[getAllProducts] 예상치 못한 오류:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

