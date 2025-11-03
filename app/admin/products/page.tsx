/**
 * @file page.tsx
 * @description 어드민 상품 관리 페이지
 *
 * 관리자만 접근 가능한 상품 관리 페이지입니다.
 * 상품 목록 조회, 생성, 수정, 삭제 기능을 제공합니다.
 *
 * @dependencies
 * - actions/admin/get-all-products: 모든 상품 조회
 * - lib/admin: 관리자 권한 체크
 * - components/admin/product-form: 상품 생성/수정 폼
 * - components/admin/product-list: 상품 목록
 */

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { getAllProducts } from "@/actions/admin/get-all-products";
import { ProductList } from "@/components/admin/product-list";

export default async function AdminProductsPage() {
  // 관리자 권한 확인
  const adminCheck = await requireAdmin();
  if (!adminCheck.success) {
    redirect("/");
  }

  // 모든 상품 조회
  const productsResult = await getAllProducts();
  const products = productsResult.success ? productsResult.data || [] : [];

  return (
    <main className="min-h-[calc(100vh-80px)] px-4 py-8 lg:py-16">
      <div className="w-full max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold mb-2">상품 관리</h1>
          <p className="text-gray-600">상품을 생성, 수정, 삭제할 수 있습니다.</p>
        </div>

        <ProductList initialProducts={products} />
      </div>
    </main>
  );
}

