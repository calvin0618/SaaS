/**
 * @file category-filter.tsx
 * @description 카테고리 필터 버튼 컴포넌트
 *
 * 홈페이지에서 상품을 카테고리별로 필터링할 수 있는 버튼 컴포넌트입니다.
 * URL 쿼리 파라미터를 사용하여 필터 상태를 관리합니다.
 *
 * @dependencies
 * - next/navigation: URL 쿼리 파라미터 관리
 * - components/ui/button: shadcn/ui 버튼 컴포넌트
 */

"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "all", label: "전체" },
  { value: "electronics", label: "전자제품" },
  { value: "clothing", label: "의류" },
  { value: "books", label: "도서" },
  { value: "food", label: "식품" },
  { value: "sports", label: "스포츠" },
  { value: "beauty", label: "뷰티" },
  { value: "home", label: "생활/가정" },
] as const;

export function CategoryFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "all";

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }

    // 검색 또는 페이지네이션 파라미터는 유지하되, 카테고리 변경 시 첫 페이지로
    params.delete("page");

    console.group("[CategoryFilter] 카테고리 변경");
    console.log("선택된 카테고리:", category);
    console.log("현재 경로:", pathname);
    console.log("URL 파라미터:", params.toString());
    console.groupEnd();

    // 현재 경로가 /products면 /products로, 아니면 /로
    const targetPath = pathname === "/products" ? "/products" : "/";
    router.push(`${targetPath}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {CATEGORIES.map((category) => (
        <Button
          key={category.value}
          variant={currentCategory === category.value ? "default" : "outline"}
          size="sm"
          onClick={() => handleCategoryChange(category.value)}
          className={cn(
            "transition-colors",
            currentCategory === category.value &&
              "bg-blue-600 text-white hover:bg-blue-700"
          )}
        >
          {category.label}
        </Button>
      ))}
    </div>
  );
}

