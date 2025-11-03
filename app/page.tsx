/**
 * @file page.tsx
 * @description 홈페이지 - 상품 목록 Grid 레이아웃
 *
 * Supabase에서 활성화된 상품 목록을 가져와서 Grid 레이아웃으로 표시합니다.
 * Server Component로 데이터를 fetching하고, 상품 카드 컴포넌트를 사용하여 표시합니다.
 * 
 * 주요 기능:
 * 1. 인기 상품 섹션 표시 (재고량 기준 상위 4개)
 * 2. 카테고리 필터링 기능
 * 3. 상품 목록 Grid 레이아웃 (반응형)
 * 
 * 레이아웃 구조:
 * - 히어로 섹션
 * - 인기 상품 섹션 (조건부 표시)
 * - 전체 상품 섹션 (카테고리 필터 + 상품 그리드)
 *
 * @dependencies
 * - lib/supabase/server: Server Component용 Supabase 클라이언트
 * - lib/products: 상품 조회 공통 함수
 * - components/product-card: 상품 카드 컴포넌트
 * - components/category-filter: 카테고리 필터 컴포넌트
 * - types/product: Product 타입 정의
 */

import { Suspense } from "react";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/product-card";
import { CategoryFilter } from "@/components/category-filter";
import { Product } from "@/types/product";
import { getProducts } from "@/lib/products";

interface HomeProps {
  searchParams: Promise<{ category?: string }>;
}

/**
 * 인기 상품 조회 함수
 * 
 * 현재 선정 기준: 재고량 내림차순 → 최근 생성일 내림차순
 * 상위 4개 상품을 반환합니다.
 * 
 * 향후 개선 가능성:
 * - 주문 데이터(order_items) 기반 판매량 기준
 * - 조회수 기반
 * - 평점 기반
 */
async function getPopularProducts(): Promise<Product[]> {
  const supabase = createClerkSupabaseClient();

  console.group("[Home] 인기 상품 조회 시작");
  console.log("Supabase 클라이언트 생성 완료");

  // 인기 상품 기준: 재고가 많고 최근 생성된 상품 (나중에 판매량 기준으로 변경 가능)
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("stock_quantity", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(4);

  if (error) {
    console.error("[Home] 인기 상품 조회 실패:", error);
    console.groupEnd();
    
    // products 테이블이 없는 경우 특별 처리
    if (error.message?.includes("Could not find the table") || 
        error.message?.includes("relation") ||
        error.code === "PGRST116" || 
        error.code === "42P01") {
      console.warn("[Home] products 테이블이 아직 생성되지 않았습니다.");
      return [];
    }
    
    throw new Error(`인기 상품을 불러오는데 실패했습니다: ${error.message}`);
  }

  console.log(`[Home] 인기 상품 ${data?.length || 0}개 조회 완료`);
  console.groupEnd();

  return data || [];
}

async function getHomeProducts(category?: string): Promise<Product[]> {
  console.group("[Home] 상품 목록 조회 시작");
  
  try {
    const result = await getProducts({
      category: category === "all" ? undefined : category,
      limit: 12,
    });
    
    console.log(`[Home] 상품 ${result.products.length}개 조회 완료`);
    console.groupEnd();
    
    return result.products;
  } catch (error) {
    console.error("[Home] 상품 목록 조회 실패:", error);
    console.groupEnd();
    
    // products 테이블이 없는 경우 특별 처리
    if (
      error instanceof Error &&
      (error.message?.includes("Could not find the table") ||
        error.message?.includes("relation") ||
        error.message?.includes("PGRST116") ||
        error.message?.includes("42P01"))
    ) {
      console.warn("[Home] products 테이블이 아직 생성되지 않았습니다.");
      return [];
    }
    
    throw error;
  }
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const selectedCategory = params.category;
  let products: Product[] = [];
  let popularProducts: Product[] = [];
  let hasError = false;
  let errorMessage = "";

  // 인기 상품과 일반 상품을 병렬로 조회
  try {
    [popularProducts, products] = await Promise.all([
      getPopularProducts(),
      getHomeProducts(selectedCategory),
    ]);
  } catch (error) {
    hasError = true;
    errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    console.error("[Home] 에러 발생:", error);
  }

  return (
    <main className="min-h-[calc(100vh-80px)] px-4 py-8 lg:py-16">
      <div className="w-full max-w-7xl mx-auto">
        {/* 히어로 섹션 */}
        <section className="mb-12 lg:mb-16 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-4">
            의류 쇼핑몰에 오신 것을 환영합니다
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400">
            다양한 스타일의 의류를 만나보세요
          </p>
        </section>

        {/* 에러 메시지 */}
        {hasError && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* 인기 상품 섹션 - "전체 상품" 제목 바로 위에 배치 */}
        {!hasError && popularProducts.length > 0 && (
          <section className="mb-12 lg:mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl lg:text-3xl font-bold">인기 상품</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {popularProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* 전체 상품 섹션 */}
        {!hasError && (
          <section>
            <h1 className="text-3xl font-bold mb-8">전체 상품</h1>
            
            {/* 카테고리 필터 */}
            <Suspense fallback={<div className="mb-6">필터 로딩 중...</div>}>
              <CategoryFilter />
            </Suspense>

            {products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg mb-4">
                  등록된 상품이 없습니다.
                </p>
                <p className="text-sm text-gray-400">
                  상품을 등록하거나 Supabase 대시보드에서 스키마 마이그레이션을 실행해주세요.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
