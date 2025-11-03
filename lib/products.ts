/**
 * @file products.ts
 * @description 상품 조회 공통 함수
 *
 * 홈페이지와 상품 목록 페이지에서 공통으로 사용하는 상품 조회 로직입니다.
 *
 * @dependencies
 * - lib/supabase/server: Server Component용 Supabase 클라이언트
 * - types/product: Product 타입 정의
 */

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { Product } from "@/types/product";

export type SortOption = "latest" | "name";

export interface GetProductsParams {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: SortOption;
}

export interface GetProductsResult {
  products: Product[];
  totalCount: number;
  page: number;
  totalPages: number;
}

/**
 * 상품 목록 조회
 */
export async function getProducts({
  category,
  search,
  page = 1,
  limit = 12,
  sort = "latest",
}: GetProductsParams = {}): Promise<GetProductsResult> {
  const supabase = createClerkSupabaseClient();

  console.group("[Products] 상품 목록 조회 시작");
  console.log("Supabase 클라이언트 생성 완료");
  console.log("조건:", { category, search, page, limit, sort });

  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("is_active", true);

  // 카테고리 필터링
  if (category && category !== "all") {
    query = query.eq("category", category);
    console.log("카테고리 필터 적용:", category);
  }

  // 검색 기능
  if (search && search.trim()) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    console.log("검색어 적용:", search);
  }

  // 정렬 옵션 적용
  if (sort === "name") {
    query = query.order("name", { ascending: true });
    console.log("정렬: 이름순 (오름차순)");
  } else {
    // 기본값: 최신순
    query = query.order("created_at", { ascending: false });
    console.log("정렬: 최신순 (내림차순)");
  }

  // 페이지네이션
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("[Products] 상품 목록 조회 실패:", error);
    console.groupEnd();

    // products 테이블이 없는 경우 특별 처리
    if (
      error.message?.includes("Could not find the table") ||
      error.message?.includes("relation") ||
      error.code === "PGRST116" ||
      error.code === "42P01"
    ) {
      console.warn("[Products] products 테이블이 아직 생성되지 않았습니다.");
      return {
        products: [],
        totalCount: 0,
        page: 1,
        totalPages: 0,
      };
    }

    throw new Error(`상품 목록을 불러오는데 실패했습니다: ${error.message}`);
  }

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  console.log(`[Products] 상품 ${data?.length || 0}개 조회 완료 (전체 ${totalCount}개)`);
  console.groupEnd();

  return {
    products: data || [],
    totalCount,
    page,
    totalPages,
  };
}

/**
 * 단일 상품 조회
 * @param id 상품 ID
 * @returns 상품 정보 또는 null (상품이 없거나 비활성화된 경우)
 */
export async function getProduct(id: string): Promise<Product | null> {
  const supabase = createClerkSupabaseClient();

  console.group("[Product] 단일 상품 조회 시작");
  console.log("상품 ID:", id);

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error) {
    console.error("[Product] 상품 조회 실패:", error);
    console.groupEnd();

    // 상품이 없거나 비활성화된 경우
    if (error.code === "PGRST116" || error.message?.includes("No rows")) {
      console.warn("[Product] 상품을 찾을 수 없습니다:", id);
      return null;
    }

    throw new Error(`상품을 불러오는데 실패했습니다: ${error.message}`);
  }

  console.log("[Product] 상품 조회 완료:", data?.name);
  console.groupEnd();

  return data;
}

