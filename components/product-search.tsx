/**
 * @file product-search.tsx
 * @description 상품 검색 컴포넌트
 *
 * 상품명 또는 설명으로 검색할 수 있는 검색 바 컴포넌트입니다.
 *
 * @dependencies
 * - next/navigation: URL 쿼리 파라미터 관리
 * - components/ui/input: shadcn/ui 입력 컴포넌트
 * - components/ui/button: shadcn/ui 버튼 컴포넌트
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, FormEvent } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProductSearchProps {
  currentCategory?: string;
}

export function ProductSearch({ currentCategory = "all" }: ProductSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") || "";
  const [searchValue, setSearchValue] = useState(currentSearch);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (currentCategory !== "all") {
      params.set("category", currentCategory);
    }
    if (searchValue.trim()) {
      params.set("search", searchValue.trim());
    }
    params.set("page", "1"); // 검색 시 첫 페이지로

    console.group("[ProductSearch] 검색 실행");
    console.log("검색어:", searchValue);
    console.log("URL 파라미터:", params.toString());
    console.groupEnd();

    router.push(`/products?${params.toString()}`);
  };

  const handleClear = () => {
    setSearchValue("");
    const params = new URLSearchParams();
    if (currentCategory !== "all") {
      params.set("category", currentCategory);
    }
    router.push(`/products?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
        <Input
          type="text"
          placeholder="상품명 또는 설명으로 검색..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchValue && (
          <button
            type="button"
            onClick={() => setSearchValue("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <Button type="submit">검색</Button>
      {currentSearch && (
        <Button type="button" variant="outline" onClick={handleClear}>
          초기화
        </Button>
      )}
    </form>
  );
}

