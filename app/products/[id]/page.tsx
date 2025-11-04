/**
 * @file page.tsx
 * @description 상품 상세 페이지
 *
 * 단일 상품의 상세 정보를 표시하는 페이지입니다.
 * 현재 구현: 상단 섹션 (이름, 가격, 재고 상태), 중단 섹션 (설명, 카테고리), 우측 고정 섹션 (장바구니 UI)
 *
 * 주요 기능:
 * 1. 상품 ID로 단일 상품 조회
 * 2. 상품 정보 표시 (이름, 가격, 재고 상태, 설명, 카테고리)
 * 3. 장바구니 담기 UI (수량 선택, 담기 버튼)
 * 4. 에러 핸들링 (상품이 없거나 비활성화된 경우)
 *
 * @dependencies
 * - lib/products: 상품 조회 함수
 * - types/product: Product 타입 정의
 * - next/navigation: 페이지 네비게이션
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProduct } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { AddToCart } from "@/components/add-to-cart";
import { ArrowLeft } from "lucide-react";
import { formatPrice, getCategoryLabel, formatDate } from "@/lib/utils/format";
import { logger } from "@/lib/utils/logger";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * 재고 상태에 따른 UI 표시용 텍스트 및 스타일
 */
function getStockStatus(stockQuantity: number) {
  if (stockQuantity === 0) {
    return {
      text: "품절",
      className: "text-red-600 bg-red-50 border-red-200",
      badgeClassName: "bg-red-500",
    };
  }
  if (stockQuantity < 10) {
    return {
      text: `재고 ${stockQuantity}개 남음`,
      className: "text-orange-600 bg-orange-50 border-orange-200",
      badgeClassName: "bg-orange-500",
    };
  }
  return {
    text: "재고 있음",
    className: "text-green-600 bg-green-50 border-green-200",
    badgeClassName: "bg-green-500",
  };
}

/**
 * 카테고리 값을 한글 레이블로 변환
 * @param category 카테고리 값 (영문)
 * @returns 한글 레이블 또는 "기타" (NULL인 경우)
 */
// getCategoryLabel은 lib/utils/format.ts로 이동

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;

  logger.group("[ProductDetailPage] 상품 상세 페이지 로드");
  logger.log("상품 ID:", id);

  let product = null;
  let hasError = false;
  let errorMessage = "";

  try {
    product = await getProduct(id);
  } catch (error) {
    hasError = true;
    errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    logger.error("[ProductDetailPage] 에러 발생:", error);
  }

  logger.groupEnd();

  // 상품이 없거나 비활성화된 경우 404 페이지 표시
  if (!product && !hasError) {
    notFound();
  }

  // 에러 발생 시 에러 메시지 표시
  if (hasError) {
    return (
      <main className="min-h-[calc(100vh-80px)] px-4 py-8 lg:py-16">
        <div className="w-full max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/products">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                상품 목록으로
              </Button>
            </Link>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              상품을 불러올 수 없습니다
            </h2>
            <p className="text-red-600">{errorMessage}</p>
          </div>
        </div>
      </main>
    );
  }

  // 상품 데이터가 없는 경우 (notFound 호출로 처리되어 도달하지 않지만 타입 안정성을 위해)
  if (!product) {
    notFound();
  }

  // 가격 포맷팅 (공통 함수 사용)
  const formattedPrice = formatPrice(product.price);

  // 재고 상태 정보
  const stockStatus = getStockStatus(product.stock_quantity);

  return (
    <main className="min-h-[calc(100vh-80px)] px-4 py-8 lg:py-16">
      <div className="w-full max-w-7xl mx-auto">
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <Link href="/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              상품 목록으로
            </Button>
          </Link>
        </div>

        {/* 메인 콘텐츠: 좌측 상품 정보 + 우측 고정 장바구니 UI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 좌측: 상품 정보 (2열) */}
          <div className="lg:col-span-2 space-y-6">
            {/* 상품 이미지 섹션 */}
            <section className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8">
              <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={product.image_url ?? "https://via.placeholder.com/600x600?text=No+Image"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 66vw"
                  priority
                />
              </div>
            </section>

            {/* 상단 섹션: 이름, 가격, 재고 상태 */}
            <section className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8">
              {/* 상품명 */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* 가격 */}
              <div className="mb-4">
                <p className="text-4xl lg:text-5xl font-bold text-gray-900">
                  {formattedPrice}
                </p>
              </div>

              {/* 재고 상태 */}
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${stockStatus.className}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${stockStatus.badgeClassName}`}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium">{stockStatus.text}</span>
              </div>
            </section>

            {/* 중단 섹션: 설명, 카테고리 */}
            <section className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8">
              {/* 상품 설명 */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  상품 설명
                </h2>
                {product.description ? (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </p>
                ) : (
                  <p className="text-gray-400 italic">상품 설명이 없습니다.</p>
                )}
              </div>

              {/* 카테고리 */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  카테고리
                </h2>
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium">
                    {getCategoryLabel(product.category)}
                  </span>
                </div>
              </div>
            </section>

            {/* 하단 섹션: 등록일, 수정일 */}
            <section className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                상품 정보
              </h2>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>등록일</span>
                  <span className="text-gray-900">
                    {formatDate(product.created_at)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>수정일</span>
                  <span className="text-gray-900">
                    {formatDate(product.updated_at)}
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* 우측 고정: 장바구니 UI (1열) */}
          <div className="lg:col-span-1">
            <AddToCart
              productId={product.id}
              productName={product.name}
              stockQuantity={product.stock_quantity}
              price={product.price}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

