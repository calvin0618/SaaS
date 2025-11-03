/**
 * @file product-sort.tsx
 * @description 상품 정렬 드롭다운 컴포넌트
 *
 * 상품 목록 페이지에서 정렬 옵션을 선택할 수 있는 드롭다운 컴포넌트입니다.
 * 최신순, 이름순 정렬 옵션을 제공합니다.
 * URL 쿼리 파라미터를 사용하여 정렬 상태를 관리합니다.
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

const SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "name", label: "이름순" },
] as const;

export function ProductSort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "latest";

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (sort === "latest") {
      // 기본값이므로 파라미터에서 제거
      params.delete("sort");
    } else {
      params.set("sort", sort);
    }

    // 정렬 변경 시 첫 페이지로
    params.delete("page");

    console.group("[ProductSort] 정렬 변경");
    console.log("선택된 정렬:", sort);
    console.log("현재 경로:", pathname);
    console.log("URL 파라미터:", params.toString());
    console.groupEnd();

    // 현재 경로가 /products면 /products로, 아니면 /로
    const targetPath = pathname === "/products" ? "/products" : "/";
    router.push(`${targetPath}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full sm:w-auto">
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue placeholder="정렬 선택" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

