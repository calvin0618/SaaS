/**
 * @file format.ts
 * @description 포맷팅 관련 유틸리티 함수
 *
 * 가격, 날짜, 카테고리 등의 포맷팅을 위한 공통 함수들을 제공합니다.
 */

/**
 * 가격 포맷팅 (천 단위 콤마, 원화 표시)
 * @param amount 금액
 * @returns 포맷팅된 금액 문자열 (예: "₩10,000")
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount);
}

/**
 * 카테고리 라벨 변환 (영문 → 한글)
 * @param category 카테고리 코드
 * @returns 한글 카테고리명
 */
export function getCategoryLabel(category: string | null): string {
  const categoryMap: Record<string, string> = {
    electronics: "전자제품",
    clothing: "의류",
    books: "도서",
    food: "식품",
    sports: "스포츠",
    beauty: "뷰티",
    home: "생활/가정",
  };

  if (!category) {
    return "기타";
  }

  return categoryMap[category] || category;
}

/**
 * 재고 상태 텍스트 반환
 * @param stockQuantity 재고 수량
 * @returns 재고 상태 텍스트 또는 null
 */
export function getStockStatusText(stockQuantity: number): string | null {
  if (stockQuantity === 0) {
    return "품절";
  }
  if (stockQuantity > 0 && stockQuantity < 10) {
    return `재고 ${stockQuantity}개 남음`;
  }
  return null;
}

/**
 * 날짜 포맷팅 (한국어 형식)
 * @param date 날짜 문자열 또는 Date 객체
 * @param options 포맷 옵션
 * @returns 포맷팅된 날짜 문자열
 */
export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  }).format(dateObj);
}

/**
 * 날짜/시간 포맷팅 (한국어 형식)
 * @param date 날짜 문자열 또는 Date 객체
 * @returns 포맷팅된 날짜/시간 문자열
 */
export function formatDateTime(date: string | Date): string {
  return formatDate(date, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

