/**
 * @file product-pagination.tsx
 * @description 상품 목록 페이지네이션 컴포넌트
 *
 * 상품 목록 페이지 하단에 표시되는 페이지네이션 컴포넌트입니다.
 * 
 * 주요 기능:
 * 1. 이전/다음 버튼으로 페이지 이동
 * 2. 페이지 번호 클릭으로 직접 이동
 * 3. 현재 페이지 주변 + 첫/마지막 페이지 표시
 * 4. 생략 표시(...)로 긴 페이지 리스트 처리
 * 5. 페이지 정보 표시 (현재 범위 / 전체 개수)
 * 6. URL 파라미터 유지 (검색어, 카테고리 필터)
 * 7. 반응형 디자인 지원
 *
 * @dependencies
 * - next/link: 페이지 네비게이션
 * - next/navigation: URL 쿼리 파라미터 관리
 * - components/ui/button: shadcn/ui 버튼 컴포넌트
 * - lucide-react: 아이콘 (ChevronLeft, ChevronRight)
 */

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export function ProductPagination({
  currentPage,
  totalPages,
  totalCount,
}: ProductPaginationProps) {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "all";
  const search = searchParams.get("search") || "";

  // URL 파라미터 생성 헬퍼
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (category !== "all") {
      params.set("category", category);
    }
    if (search) {
      params.set("search", search);
    }
    if (page > 1) {
      params.set("page", page.toString());
    }
    const queryString = params.toString();
    return `/products${queryString ? `?${queryString}` : ""}`;
  };

  // 페이지 번호 배열 생성 (현재 페이지 주변 + 첫/마지막 페이지)
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5; // 최대 표시할 페이지 수

    if (totalPages <= maxVisible) {
      // 전체 페이지가 적으면 모두 표시
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // 항상 첫 페이지 표시
    pages.push(1);

    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    // 현재 페이지가 시작에 가까우면
    if (currentPage <= 3) {
      end = Math.min(4, totalPages - 1);
    }

    // 현재 페이지가 끝에 가까우면
    if (currentPage >= totalPages - 2) {
      start = Math.max(2, totalPages - 3);
    }

    // 생략 표시 추가
    if (start > 2) {
      pages.push("ellipsis");
    }

    // 중간 페이지들 추가
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // 생략 표시 추가
    if (end < totalPages - 1) {
      pages.push("ellipsis");
    }

    // 항상 마지막 페이지 표시
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  // 페이지 정보 표시 (예: "1-12 / 총 45개")
  const startItem = (currentPage - 1) * 12 + 1;
  const endItem = Math.min(currentPage * 12, totalCount);

  console.group("[ProductPagination] 페이지네이션 렌더링");
  console.log("현재 페이지:", currentPage);
  console.log("전체 페이지:", totalPages);
  console.log("전체 상품 수:", totalCount);
  console.groupEnd();

  if (totalPages <= 1) {
    return null; // 페이지가 1개 이하면 표시하지 않음
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      {/* 페이지 정보 */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2 text-sm text-gray-600">
        <p className="text-center sm:text-left">
          {startItem}-{endItem} / 총 {totalCount.toLocaleString()}개
        </p>
        <p className="text-center sm:text-right">
          페이지 {currentPage} / {totalPages}
        </p>
      </div>

      {/* 페이지네이션 컨트롤 */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {/* 이전 버튼 */}
        {currentPage > 1 ? (
          <Link href={createPageUrl(currentPage - 1)}>
            <Button variant="outline" size="sm">
              <ChevronLeft className="w-4 h-4 mr-1" />
              이전
            </Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="w-4 h-4 mr-1" />
            이전
          </Button>
        )}

        {/* 페이지 번호 */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((pageNum, index) => {
            if (pageNum === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-gray-400"
                  aria-hidden="true"
                >
                  ...
                </span>
              );
            }

            return (
              <Link key={pageNum} href={createPageUrl(pageNum)}>
                <Button
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  className={
                    currentPage === pageNum
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : ""
                  }
                >
                  {pageNum}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* 다음 버튼 */}
        {currentPage < totalPages ? (
          <Link href={createPageUrl(currentPage + 1)}>
            <Button variant="outline" size="sm">
              다음
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" disabled>
            다음
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}

