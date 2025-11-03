/**
 * @file product.ts
 * @description 상품 관련 TypeScript 타입 정의
 *
 * Supabase products 테이블의 스키마와 일치하는 타입을 정의합니다.
 */

/**
 * 상품 정보 타입
 */
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  // 스키마 변경: image_url 컬럼 제거됨 (옵션 필드로 유지하여 하위호환)
  image_url?: string | null;
  // 스키마 변경: category 는 NULL 허용
  category: string | null;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 상품 카드에 표시할 최소 정보 타입
 */
export interface ProductCard {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
}

