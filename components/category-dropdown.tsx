/**
 * @file category-dropdown.tsx
 * @description 카테고리 드롭다운 필터 컴포넌트
 *
 * 상품 목록 페이지에서 카테고리를 드롭다운 형식으로 선택할 수 있는 컴포넌트입니다.
 * SQL 스키마(update_shopping_mall_schema.sql)에 정의된 카테고리 목록을 사용합니다.
 * URL 쿼리 파라미터를 사용하여 필터 상태를 관리합니다.
 *
 * @dependencies
 * - next/navigation: URL 쿼리 파라미터 관리
 * - components/ui/select: shadcn/ui Select 컴포넌트
 */

"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * SQL 스키마에 정의된 카테고리 목록
 * update_shopping_mall_schema.sql의 샘플 데이터 기준
 */
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

export function CategoryDropdown() {
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

    console.group("[CategoryDropdown] 카테고리 변경");
    console.log("선택된 카테고리:", category);
    console.log("현재 경로:", pathname);
    console.log("URL 파라미터:", params.toString());
    console.groupEnd();

    // 현재 경로가 /products면 /products로, 아니면 /로
    const targetPath = pathname === "/products" ? "/products" : "/";
    router.push(`${targetPath}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full sm:w-auto">
      <Select value={currentCategory} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="카테고리 선택" />
        </SelectTrigger>
        <SelectContent>
          {CATEGORIES.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

