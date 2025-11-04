/**
 * @file test-data.ts
 * @description 테스트용 데이터
 *
 * E2E 테스트에서 사용할 테스트 데이터를 정의합니다.
 */

/**
 * 테스트용 상품 데이터
 */
export const TEST_PRODUCTS = {
  valid: {
    name: '테스트 상품',
    description: '테스트용 상품 설명',
    price: 10000,
    category: '의류',
    stock_quantity: 10,
  },
};

/**
 * 테스트용 주문 데이터
 */
export const TEST_ORDER = {
  shipping_name: '테스트 사용자',
  shipping_address: '서울시 강남구 테스트동 123-45',
  shipping_phone: '010-1234-5678',
  order_note: '테스트 주문 메모',
};

/**
 * 테스트 환경 설정
 */
export const TEST_CONFIG = {
  baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
  timeout: 30000,
};

