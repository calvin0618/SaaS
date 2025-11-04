/**
 * @file order.ts
 * @description 주문 관련 TypeScript 타입 정의
 *
 * Supabase orders 테이블과 order_items 테이블의 스키마와 일치하는 타입을 정의합니다.
 */

/**
 * 주문 정보 타입 (orders 테이블)
 * 실제 DB 구조에 맞춰 수정: shipping_address, shipping_name, shipping_phone이 별도 컬럼
 */
export interface Order {
  id: string;
  user_id: string; // Supabase users 테이블의 id (UUID)
  order_number: string;
  total_amount: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  shipping_address: string; // TEXT
  shipping_name: string; // TEXT
  shipping_phone: string; // TEXT
  order_note?: string | null; // 주문 메모 (선택사항)
  created_at: string;
  updated_at: string;
}

/**
 * 주문 상품 타입 (order_items 테이블)
 * 실제 DB 구조: product_name 컬럼 없음, products 테이블과 JOIN하여 상품명 가져옴
 */
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string; // products 테이블에서 JOIN하여 가져온 상품명
  quantity: number;
  price: number;
  created_at: string;
}

/**
 * 주문 상세 타입 (Order + OrderItem[])
 */
export interface OrderWithItems extends Order {
  items: OrderItem[];
}

/**
 * 주문 생성 파라미터 타입
 */
export interface CreateOrderParams {
  shipping_address: {
    name: string;
    address: string;
    phone: string;
  };
  order_note?: string | null;
}

