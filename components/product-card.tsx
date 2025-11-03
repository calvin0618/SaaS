/**
 * @file product-card.tsx
 * @description 상품 카드 컴포넌트
 *
 * 상품 정보를 카드 형태로 표시하는 컴포넌트입니다.
 * 클릭 시 상품 상세 페이지로 이동합니다.
 *
 * @dependencies
 * - next/link: 페이지 네비게이션
 * - types/product: Product 타입 정의
 */

import Link from "next/link";
import { Product } from "@/types/product";
import Image from "next/image";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // 가격 포맷팅 (천 단위 콤마)
  const formattedPrice = new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(product.price);

  // 기본 이미지 URL (스키마상 image_url 컬럼이 없으므로 placeholder 사용)
  const imageUrl =
    product.image_url ?? "https://via.placeholder.com/400x400?text=No+Image";

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      {/* 상품 이미지 */}
      <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* 상품 정보 */}
      <div className="p-4">
        {/* 카테고리 (NULL 가능) */}
        <p className="text-sm text-gray-500 mb-1">
          {product.category ?? "기타"}
        </p>

        {/* 상품명 */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* 가격 */}
        <p className="text-xl font-bold text-gray-900">{formattedPrice}</p>

        {/* 재고 상태 */}
        {product.stock_quantity === 0 && (
          <p className="text-sm text-red-500 mt-2">품절</p>
        )}
        {product.stock_quantity > 0 && product.stock_quantity < 10 && (
          <p className="text-sm text-orange-500 mt-2">
            재고 {product.stock_quantity}개 남음
          </p>
        )}
      </div>
    </Link>
  );
}

