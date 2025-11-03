/**
 * @file page.tsx
 * @description 상품 목록 페이지
 *
 * 상품 목록을 그리드 레이아웃으로 표시하는 페이지입니다.
 * 카테고리 필터링(드롭다운), 검색, 정렬, 페이지네이션 기능을 지원합니다.
 *
 * 주요 기능:
 * 1. 상품 검색 (상품명, 설명)
 * 2. 카테고리 필터링 (드롭다운)
 * 3. 정렬 (최신순, 이름순)
 * 4. 페이지네이션
 *
 * @dependencies
 * - lib/products: 상품 조회 공통 함수
 * - components/product-card: 상품 카드 컴포넌트
 * - components/category-dropdown: 카테고리 드롭다운 필터 컴포넌트
 * - components/product-search: 상품 검색 컴포넌트
 * - components/product-sort: 상품 정렬 드롭다운 컴포넌트
 * - components/product-pagination: 페이지네이션 컴포넌트
 * - components/ui/button: shadcn/ui 버튼 컴포넌트
 */

import { Suspense } from "react";
import Link from "next/link";
import { getProducts, SortOption } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { CategoryDropdown } from "@/components/category-dropdown";
import { ProductSearch } from "@/components/product-search";
import { ProductSort } from "@/components/product-sort";
import { ProductPagination } from "@/components/product-pagination";
import { Button } from "@/components/ui/button";

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    page?: string;
    sort?: string;
  }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const category = params.category || "all";
  const search = params.search || "";
  const page = parseInt(params.page || "1", 10);
  const sort = (params.sort || "latest") as SortOption;

  let result;
  let hasError = false;
  let errorMessage = "";

  try {
    result = await getProducts({
      category: category === "all" ? undefined : category,
      search: search || undefined,
      page,
      limit: 12,
      sort,
    });
  } catch (error) {
    hasError = true;
    errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    console.error("[ProductsPage] 에러 발생:", error);
    result = {
      products: [],
      totalCount: 0,
      page: 1,
      totalPages: 0,
    };
  }

  const { products, totalCount, page: currentPage, totalPages } = result;

  return (
    <main className="min-h-[calc(100vh-80px)] px-4 py-8 lg:py-16">
      <div className="w-full max-w-7xl mx-auto">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">상품 목록</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            총 {totalCount}개의 상품이 있습니다.
          </p>
        </div>

        {/* 에러 메시지 */}
        {hasError && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* 검색 및 필터 섹션 */}
        <div className="mb-8 space-y-4">
          {/* 검색 바 */}
          <div className="flex-1">
            <Suspense fallback={<div className="h-10 bg-gray-100 rounded animate-pulse" />}>
              <ProductSearch currentCategory={category} />
            </Suspense>
          </div>

          {/* 카테고리 및 정렬 드롭다운 */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 카테고리 드롭다운 */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                카테고리:
              </label>
              <Suspense fallback={<div className="h-10 w-[200px] bg-gray-100 rounded animate-pulse" />}>
                <CategoryDropdown />
              </Suspense>
            </div>

            {/* 정렬 드롭다운 */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                정렬:
              </label>
              <Suspense fallback={<div className="h-10 w-[150px] bg-gray-100 rounded animate-pulse" />}>
                <ProductSort />
              </Suspense>
            </div>
          </div>
        </div>

        {/* 상품 그리드 */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-4">
              {search
                ? `"${search}"에 대한 검색 결과가 없습니다.`
                : "등록된 상품이 없습니다."}
            </p>
            {search && (
              <Link href="/products">
                <Button variant="outline">전체 상품 보기</Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 mb-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* 페이지네이션 - 페이지 하단 */}
            <ProductPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
            />
          </>
        )}
      </div>
    </main>
  );
}

