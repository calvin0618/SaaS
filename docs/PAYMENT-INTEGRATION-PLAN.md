# 💳 Phase 4: 결제 통합 상세 계획서

**작성일**: 2025-01-XX  
**목표**: Toss Payments v1을 사용한 테스트 결제 구현 (DB 스키마 변경 없음)

---

## 📋 목차

1. [Toss Payments v1/v2 차이점 검증](#toss-payments-차이점-검증)
2. [결제 흐름 설계](#결제-흐름-설계)
3. [기술 구현 계획](#기술-구현-계획)
4. [데이터베이스 처리](#데이터베이스-처리)
5. [에러 처리 및 사용자 안내](#에러-처리-및-사용자-안내)
6. [추가 고려사항](#추가-고려사항)

---

## 🔍 Toss Payments 차이점 검증

### v1 vs v2 비교

**Toss Payments v1 (구 버전)**:
- ✅ **사업자 등록 불필요**: 개인 개발자도 테스트 가능
- ✅ **간단한 통합**: JavaScript 위젯 기반 통합
- ✅ **테스트 환경 지원**: 테스트 카드로 간편하게 검증 가능
- ⚠️ **제한된 기능**: 최신 결제 수단 일부 미지원 가능
- ⚠️ **유지보수**: 향후 v2로 마이그레이션 필요할 수 있음

**Toss Payments v2 (신 버전)**:
- ❌ **사업자 등록 필요**: 법인 또는 개인사업자 등록 필수
- ✅ **최신 기능**: 다양한 결제 수단 및 최신 기능 지원
- ✅ **향후 지원**: 장기적으로 더 나은 지원 예상
- ⚠️ **복잡한 통합**: 더 많은 설정 및 인증 필요

### ✅ v1 선택 검증 결과

**현재 프로젝트 상황에 v1이 적합한 이유**:
1. ✅ **MVP 단계**: 빠른 시장 검증이 목표이므로 사업자 등록 없이 시작 가능
2. ✅ **테스트 결제 목표**: 실제 결제가 아닌 테스트만 필요하므로 v1으로 충분
3. ✅ **간단한 통합**: v1의 간단한 위젯 방식이 MVP에 적합
4. ✅ **빠른 개발**: 사업자 등록 절차 없이 바로 개발 시작 가능

**결론**: ✅ v1 사용이 현재 목표에 적합합니다.

---

## 🔄 결제 흐름 설계

### 전체 사용자 플로우

```
1. 장바구니 페이지 (`/cart`)
   └─> "결제하기" 버튼 클릭
        ↓
2. 결제 페이지 (`/checkout`)
   ├─> 배송 정보 입력 (이름, 주소, 연락처)
   ├─> 주문 요약 확인 (상품 목록, 총 금액)
   └─> "결제하기" 버튼 클릭
        ↓
3. 주문 생성 (Server Action: `createOrder`)
   ├─> 주문 검증 (로그인, 장바구니, 재고 확인)
   ├─> orders 테이블에 주문 저장 (status='pending')
   ├─> order_items 테이블에 주문 상품 저장
   └─> 주문 ID 반환
        ↓
4. Toss Payments 결제 위젯 열기
   ├─> 결제 요청 생성 (orderId, amount 전달)
   └─> 결제창 표시 (Toss Payments 위젯)
        ↓
5. 테스트 카드 입력
   ├─> 카드 번호: 1234-5678-9012-3456
   ├─> 유효기간: 12/34
   ├─> CVC: 123
   └─> 비밀번호: 12**
        ↓
6. 결제 승인/거절
   ├─> ✅ 성공 시
   │   ├─> orders.status = 'confirmed' 업데이트
   │   ├─> 장바구니 비우기 (cart_items 삭제)
   │   ├─> 재고 차감 (products.stock_quantity 업데이트)
   │   └─> 주문 완료 페이지로 이동 (`/orders/[orderId]`)
   │
   └─> ❌ 실패 시
       ├─> 에러 메시지 표시
       └─> 결제 페이지 유지 (재시도 가능)
```

### 상세 단계별 처리

#### 단계 1: 장바구니 → 결제 페이지 이동
- **위치**: `app/cart/page.tsx`의 `CartSummary` 컴포넌트
- **액션**: "결제하기" 버튼 추가
- **조건**: 
  - 로그인 상태 확인 (`SignedIn` 컴포넌트)
  - 장바구니 비어있지 않음 (`cartItems.length > 0`)
- **이동**: `/checkout` 페이지로 이동

#### 단계 2: 결제 페이지 (`/checkout`)
- **위치**: `app/checkout/page.tsx` (신규 생성)
- **기능**:
  1. 배송 정보 입력 폼
     - 이름 (필수)
     - 주소 (필수): 시/도, 시/군/구, 상세주소
     - 연락처 (필수): 전화번호 형식 검증
     - 주문 메모 (선택사항)
  2. 주문 요약 섹션
     - 장바구니 상품 목록 표시
     - 총 금액 표시
     - `CartSummary` 컴포넌트 재사용 또는 확장
  3. 결제하기 버튼
     - 폼 유효성 검사 통과 시 활성화
     - 클릭 시 주문 생성 및 결제 위젯 열기

#### 단계 3: 주문 생성 (Server Action)
- **위치**: `actions/orders/create-order.ts` (신규 생성)
- **처리 순서**:
  1. 검증 로직
     - 로그인 상태 확인 (`auth()`)
     - 장바구니 조회 (`getCart()`)
     - 각 상품의 활성화 상태 및 재고 확인
  2. 트랜잭션 시작 (Supabase 클라이언트)
  3. orders 테이블 저장
     ```typescript
     {
       clerk_id: userId,
       total_amount: calculatedTotal,
       status: 'pending', // ⚠️ 초기값은 pending
       shipping_address: {
         name: string,
         address: string,
         phone: string
       },
       order_note: string | null
     }
     ```
  4. order_items 테이블 배치 저장
  5. 주문 ID 반환 (`orderId: string`)

**⚠️ 중요**: 이 단계에서는 아직 재고 차감 및 장바구니 비우기를 하지 않습니다.
- 재고 차감 및 장바구니 비우기는 **결제 성공 후**에만 진행합니다.

#### 단계 4: Toss Payments 결제 위젯 열기
- **위치**: `components/checkout/payment-widget.tsx` (신규 생성)
- **라이브러리**: `@tosspayments/payment-widget` 또는 Toss Payments v1 JavaScript SDK
- **필수 정보**:
  - `clientKey`: Toss Payments 클라이언트 키 (환경변수)
  - `customerKey`: 사용자 고유 ID (Clerk userId 사용 가능)
  - `amount`: 결제 금액
  - `orderId`: 주문 ID
- **위젯 렌더링**: 
  - 결제 페이지 내 iframe 또는 모달 형태로 표시
  - 또는 Toss Payments 결제창으로 리다이렉트

#### 단계 5: 테스트 카드 입력

**⚠️ 중요**: 아래 정보는 예시이며, Toss Payments 공식 문서에서 정확한 테스트 카드 정보 확인 필수

##### Toss Payments 공식 테스트 카드 정보

**성공 시나리오 테스트 카드**:
- 카드 번호: `1234-5678-9012-3456` (예시, 공식 문서 확인 필요)
- 유효기간: 미래 날짜 (예: `12/34` 또는 현재 기준 2년 후)
- CVC: `123`
- 카드 비밀번호: `12**` (첫 2자리만 입력)

**실패 시나리오 테스트 카드** (에러 처리 테스트용):
- 카드 번호: Toss Payments에서 제공하는 실패 테스트 카드 번호
- 거절 코드: 각종 에러 코드 테스트용 카드

##### 테스트 시나리오별 카드

1. **정상 결제 성공**
   - 일반 테스트 카드 사용
   - 모든 정보 올바르게 입력

2. **카드 거절 테스트**
   - 거절용 테스트 카드 사용
   - 에러 코드 확인

3. **잔액 부족 테스트**
   - 잔액 부족용 테스트 카드 사용

**📌 참고 자료**:
- Toss Payments 개발자 센터: https://developers.tosspayments.com/
- 테스트 카드 정보: 개발자 센터의 "테스트 카드" 섹션 확인
- 샌드박스 환경 가이드: 공식 문서 참조

#### 단계 6: 결제 결과 처리

**✅ 성공 시**:
- **Server Action**: `actions/orders/confirm-order.ts` (신규 생성)
- **처리 내용**:
  1. `orders.status = 'confirmed'` 업데이트
  2. 재고 차감 (`products.stock_quantity` 감소)
  3. 장바구니 비우기 (`cart_items` 삭제)
  4. 성공 응답 반환
- **UI 처리**:
  - 주문 완료 페이지로 이동 (`/orders/[orderId]`)

**❌ 실패 시**:
- 에러 메시지 표시 (Toss Payments 에러 코드 기반)
- 결제 페이지 유지 (재시도 가능)
- 주문은 `pending` 상태로 유지

---

## 🛠️ 기술 구현 계획

### 1. 패키지 설치

#### 방법 1: npm 패키지 (권장)
```bash
# Toss Payments v1 SDK
pnpm add @tosspayments/payment-widget

# 또는 Toss Payments JavaScript SDK (버전 확인 필요)
# 공식 문서에서 정확한 패키지명 확인 필수
```

#### 방법 2: CDN 방식
```html
<!-- HTML에 직접 추가 -->
<script src="https://js.tosspayments.com/v1/payment"></script>
```

**⚠️ 중요**: Toss Payments 공식 문서에서 v1의 정확한 패키지명 및 CDN URL 확인 필요

#### SDK 설치 확인
- Toss Payments 공식 문서: https://docs.tosspayments.com/
- v1 가이드 섹션 확인
- 지원 종료 일정 확인 (향후 마이그레이션 계획 수립용)

### 2. 환경변수 설정

`.env.local` 파일에 추가:
```env
# Toss Payments
NEXT_PUBLIC_TOSS_CLIENT_KEY=pk_test_...  # 클라이언트 키 (공개 키)
TOSS_SECRET_KEY=sk_test_...              # 시크릿 키 (서버 전용)
```

### 3. 파일 구조

```
app/
  checkout/
    page.tsx                    # 결제 페이지 (배송 정보 + 주문 요약)
    success/
      page.tsx                  # 결제 성공 페이지 (선택사항)

components/
  checkout/
    order-form.tsx              # 배송 정보 입력 폼
    payment-widget.tsx          # Toss Payments 결제 위젯 래퍼
    order-summary.tsx           # 주문 요약 컴포넌트

actions/
  orders/
    create-order.ts             # 주문 생성 (status='pending')
    confirm-order.ts             # 결제 성공 후 주문 확정 (status='confirmed')
    get-order.ts                # 주문 조회 (선택사항)

lib/
  toss-payments/
    client.ts                   # Toss Payments 클라이언트 설정 (선택사항)
```

### 4. 주요 컴포넌트 상세

#### `app/checkout/page.tsx`
- **역할**: 결제 페이지 메인
- **구조**:
  ```tsx
  <main>
    <div className="grid grid-cols-1 lg:grid-cols-2">
      {/* 좌측: 배송 정보 입력 */}
      <OrderForm />
      
      {/* 우측: 주문 요약 + 결제 버튼 */}
      <OrderSummary />
    </div>
  </main>
  ```

#### `components/checkout/payment-widget.tsx`
- **역할**: Toss Payments 결제 위젯 래퍼
- **기능**:
  - Toss Payments SDK 초기화
  - 결제 요청 생성
  - 결제 성공/실패 콜백 처리
- **Props**:
  ```typescript
  {
    orderId: string;
    amount: number;
    customerKey: string; // Clerk userId
    onSuccess: (paymentKey: string) => void;
    onError: (error: Error) => void;
  }
  ```

#### `actions/orders/create-order.ts`
- **역할**: 주문 생성 (결제 전)
- **반환값**:
  ```typescript
  {
    success: boolean;
    orderId?: string;
    error?: string;
  }
  ```

#### `actions/orders/confirm-order.ts`
- **역할**: 결제 성공 후 주문 확정
- **처리 순서**:
  1. **결제 검증** (⚠️ 필수): Toss Payments 서버 API로 결제 정보 조회 및 검증
     - paymentKey와 orderId로 결제 정보 조회
     - orderId 일치 확인
     - 결제 금액 일치 확인
     - 결제 상태 확인 (DONE)
  2. **트랜잭션 시작**
  3. **orders.status = 'confirmed' 업데이트**
  4. **재고 차감**
  5. **장바구니 비우기**
  6. **트랜잭션 커밋**
- **반환값**:
  ```typescript
  {
    success: boolean;
    error?: string;
  }
  ```
- **보안**: 모든 검증을 통과한 경우에만 주문 확정 처리

---

## 💾 데이터베이스 처리

### 주문 생성 시 (status='pending')

```sql
-- 1. orders 테이블에 주문 저장
INSERT INTO orders (clerk_id, total_amount, status, shipping_address, order_note)
VALUES (
  'clerk_user_id',
  150000.00,
  'pending',  -- ⚠️ 초기값은 pending
  '{"name": "홍길동", "address": "서울시...", "phone": "010-1234-5678"}',
  '문 앞에 놓아주세요'
);

-- 2. order_items 테이블에 주문 상품 저장
INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
VALUES 
  ('order_uuid', 'product_uuid_1', '상품명1', 2, 50000.00),
  ('order_uuid', 'product_uuid_2', '상품명2', 1, 50000.00);

-- ⚠️ 재고 차감 및 장바구니 비우기는 아직 하지 않음
```

### 결제 성공 시 (status='confirmed')

```sql
-- 1. 주문 상태 업데이트
UPDATE orders 
SET status = 'confirmed', updated_at = now()
WHERE id = 'order_uuid' AND clerk_id = 'clerk_user_id';

-- 2. 재고 차감
UPDATE products
SET stock_quantity = stock_quantity - order_items.quantity
FROM order_items
WHERE products.id = order_items.product_id 
  AND order_items.order_id = 'order_uuid';

-- 3. 장바구니 비우기
DELETE FROM cart_items
WHERE clerk_id = 'clerk_user_id';
```

### 결제 실패 시

- 주문은 `pending` 상태로 유지
- 재고 차감 및 장바구니 비우기는 하지 않음
- 사용자가 재시도하거나 주문을 취소할 수 있도록 유지

### 트랜잭션 처리

**⚠️ 중요**: `confirm-order.ts`에서는 트랜잭션을 사용하여 데이터 일관성을 보장해야 합니다.

```typescript
// 의사코드
BEGIN TRANSACTION;
  UPDATE orders SET status = 'confirmed' WHERE ...;
  UPDATE products SET stock_quantity = ... WHERE ...;
  DELETE FROM cart_items WHERE ...;
COMMIT;

// 에러 발생 시
ROLLBACK;
```

---

## ✅ 결제 검증 프로세스 (서버 사이드 필수)

### 왜 서버 사이드 검증이 필요한가?

**⚠️ 보안 위험**: 클라이언트에서만 결제 성공을 확인하면, 위조된 요청으로 주문을 확정할 수 있습니다.

### 검증 프로세스

#### 1. 결제 완료 후 클라이언트에서 받은 정보
```typescript
{
  paymentKey: string;  // Toss Payments에서 발급한 결제 키
  orderId: string;     // 주문 생성 시 전달한 주문 ID
  amount: number;      // 결제 금액
}
```

#### 2. 서버에서 Toss Payments API 호출하여 검증

```typescript
// actions/orders/confirm-order.ts

import { TossPayments } from '@tosspayments/server-sdk'; // 예시

async function verifyPayment(paymentKey: string, orderId: string, expectedAmount: number) {
  // Toss Payments 서버 API로 결제 정보 조회
  const tossPayments = new TossPayments({
    secretKey: process.env.TOSS_SECRET_KEY!
  });
  
  const payment = await tossPayments.payment.getPaymentData(paymentKey);
  
  // 검증 1: 주문 ID 일치 확인
  if (payment.orderId !== orderId) {
    throw new Error("주문 ID 불일치: 결제 정보가 올바르지 않습니다.");
  }
  
  // 검증 2: 결제 금액 일치 확인
  if (payment.totalAmount !== expectedAmount) {
    throw new Error("결제 금액 불일치: 결제 정보가 올바르지 않습니다.");
  }
  
  // 검증 3: 결제 상태 확인
  if (payment.status !== 'DONE') {
    throw new Error(`결제 미완료: 현재 상태는 ${payment.status}입니다.`);
  }
  
  // 검증 4: 주문자 확인 (clerk_id)
  // payment.customerId 또는 payment.metadata에서 clerk_id 확인 필요
  // Toss Payments API 응답 구조에 따라 조정
  
  return {
    isValid: true,
    paymentData: payment
  };
}
```

#### 3. 검증 통과 후에만 주문 확정

```typescript
export async function confirmOrder({
  orderId,
  paymentKey,
}: ConfirmOrderParams): Promise<ConfirmOrderResult> {
  try {
    // 1. 주문 조회 (현재 상태 확인)
    const order = await getOrder(orderId);
    
    if (!order) {
      return { success: false, error: "주문을 찾을 수 없습니다." };
    }
    
    if (order.status !== 'pending') {
      return { success: false, error: "이미 처리된 주문입니다." };
    }
    
    // 2. 결제 검증 (⚠️ 필수)
    const verification = await verifyPayment(paymentKey, orderId, order.total_amount);
    
    if (!verification.isValid) {
      return { success: false, error: "결제 검증에 실패했습니다." };
    }
    
    // 3. 트랜잭션 시작
    const supabase = createClerkSupabaseClient();
    
    // 4. 주문 상태 업데이트, 재고 차감, 장바구니 비우기
    // (트랜잭션으로 처리)
    
    return { success: true };
  } catch (error) {
    // 에러 처리
  }
}
```

### Toss Payments API 호출 방법

#### 방법 1: @tosspayments/server-sdk 사용 (권장)
```bash
pnpm add @tosspayments/server-sdk
```

```typescript
import { TossPayments } from '@tosspayments/server-sdk';

const tossPayments = new TossPayments({
  secretKey: process.env.TOSS_SECRET_KEY!
});
```

#### 방법 2: 직접 HTTP API 호출
```typescript
const response = await fetch(`https://api.tosspayments.com/v1/payments/${paymentKey}`, {
  method: 'GET',
  headers: {
    'Authorization': `Basic ${Buffer.from(process.env.TOSS_SECRET_KEY + ':').toString('base64')}`,
    'Content-Type': 'application/json'
  }
});

const payment = await response.json();
```

**⚠️ 중요**: Toss Payments 공식 문서에서 정확한 API 엔드포인트 및 인증 방법 확인 필요

---

## ⚠️ 에러 처리 및 사용자 안내

### 에러 코드 매핑 테이블

Toss Payments 에러 코드를 사용자 친화적 메시지로 변환:

| Toss Payments 에러 코드 | 사용자 메시지 | 처리 방법 |
|------------------------|--------------|----------|
| `INVALID_CARD` | 카드 정보를 확인해주세요. | 재시도 유도 |
| `CARD_NOT_SUPPORTED` | 지원하지 않는 카드입니다. | 다른 카드 사용 안내 |
| `INSUFFICIENT_BALANCE` | 카드 잔액이 부족합니다. | 잔액 확인 안내 |
| `PAYMENT_CANCELLED` | 결제가 취소되었습니다. | 재시도 가능 |
| `NETWORK_ERROR` | 네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요. | 재시도 유도 |
| `TIMEOUT` | 결제 요청 시간이 초과되었습니다. | 재시도 유도 |
| `INVALID_REQUEST` | 결제 정보가 올바르지 않습니다. | 결제 페이지로 돌아가기 |
| `AUTHENTICATION_FAILED` | 인증에 실패했습니다. | 재시도 또는 고객센터 안내 |
| `SERVER_ERROR` | 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요. | 재시도 유도 |

### 결제 실패 시나리오

1. **카드 승인 거절**
   - Toss Payments 에러 코드: `INVALID_CARD`, `CARD_NOT_SUPPORTED`, `INSUFFICIENT_BALANCE` 등
   - 에러 메시지: 위 에러 코드 매핑 테이블 참조
   - 액션: 결제 페이지 유지, 재시도 가능
   - UI: 에러 메시지를 상단 배너로 표시

2. **네트워크 오류**
   - Toss Payments 에러 코드: `NETWORK_ERROR`, `TIMEOUT`
   - 에러 메시지: "결제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
   - 액션: 주문은 `pending` 상태 유지, 재시도 가능
   - UI: 재시도 버튼 표시

3. **재고 부족** (결제 성공 후 확인)
   - 에러 메시지: "재고가 부족하여 주문을 처리할 수 없습니다."
   - 액션: 주문 취소 처리 필요 (향후 구현)
   - UI: 장바구니 페이지로 리다이렉트, 재고 부족 상품 안내

4. **주문 검증 실패** (주문 생성 전)
   - 에러 메시지: "주문 정보를 확인할 수 없습니다. 장바구니를 다시 확인해주세요."
   - 액션: 장바구니 페이지로 리다이렉트

5. **결제 검증 실패** (서버 사이드)
   - 에러 메시지: "결제 정보를 확인할 수 없습니다. 고객센터로 문의해주세요."
   - 액션: 주문은 `pending` 상태 유지, 고객센터 안내
   - 로깅: 상세 에러 로그 기록 (보안 고려)

6. **서버 에러**
   - Toss Payments 에러 코드: `SERVER_ERROR`, `INVALID_REQUEST`
   - 에러 메시지: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
   - 액션: 재시도 가능, 로그 기록

### 사용자 안내 메시지 위치

- **결제 페이지**: 에러 발생 시 상단에 배너 형태로 표시
- **결제 위젯**: Toss Payments 자체 에러 메시지 표시
- **주문 완료 페이지**: 성공 메시지 및 주문 정보 표시

---

## ⏰ 주문 타임아웃 처리 방안

### 문제 상황

결제 페이지에서 주문을 생성한 후 (`status='pending'`), 사용자가 결제를 완료하지 않고 페이지를 떠나는 경우:
- 주문은 `pending` 상태로 남아있음
- 재고는 아직 차감되지 않았지만, 주문이 존재하여 다른 사용자의 주문에 영향을 줄 수 있음

### 해결 방안

#### 방안 1: 주문 만료 시간 설정 (권장)

**구현 방법**:
1. orders 테이블에 `expires_at` 컬럼 추가 (현재는 스키마 변경 안 하므로 구현하지 않음)
2. 주문 생성 시 만료 시간 계산 (예: 30분 후)
3. 결제 페이지에서 만료 시간 표시
4. 만료된 주문은 자동 취소 처리 (향후 구현)

**현재 구현 범위에서는**:
- 주문 생성 시 만료 시간을 메모리에 저장하지 않고, 클라이언트에서 만료 안내만 표시
- 또는 `created_at` 기준으로 30분 경과 시 만료 안내

#### 방안 2: 결제 진행 중 플래그

**구현 방법**:
```typescript
// orders 테이블에 is_paying 플래그 추가 (스키마 변경 불가)
// 대신 클라이언트 상태로 관리하거나, 별도 테이블 사용하지 않음

// 현재 구현: 결제 위젯이 열려있는 동안은 결제 진행 중으로 간주
```

#### 방안 3: 정기적 만료 주문 정리 (향후 구현)

**구현 방법**:
- Cron Job 또는 Supabase Edge Function으로 주기적 실행
- `created_at` 기준으로 30분 경과한 `pending` 주문 조회
- 자동으로 `status='cancelled'`로 변경

**현재 구현 범위에서는**:
- 주문 생성 시 사용자에게 "결제는 30분 내에 완료해주세요" 안내 메시지 표시
- 결제 페이지에 타이머 표시 (선택사항)

### 사용자 안내

**결제 페이지에 표시할 안내**:
```
⚠️ 주문 생성 후 30분 내에 결제를 완료해주세요.
30분이 경과하면 주문이 자동으로 취소될 수 있습니다.
```

**주문 완료 페이지에서는**:
- 주문이 정상적으로 확정되었음을 명확히 표시
- 만료 걱정 없음 안내

---

## 💡 추가 고려사항

### 1. 결제 페이지에 표시할 정보

#### 배송 정보 입력 섹션
- ✅ 이름 입력 필드
- ✅ 주소 입력 필드 (시/도, 시/군/구 드롭다운 + 상세주소)
- ✅ 연락처 입력 필드 (전화번호 형식 검증)
- ✅ 주문 메모 (선택사항, textarea)

#### 주문 요약 섹션
- ✅ 장바구니 상품 목록
  - 상품 이미지 (또는 placeholder)
  - 상품명
  - 수량
  - 단가
  - 소계
- ✅ 총 금액
  - 상품 합계
  - 배송비 (현재는 0원 또는 향후 추가 가능)
  - 총 결제 금액 (강조 표시)
- ✅ "결제하기" 버튼

#### 결제 진행 상태 표시 (선택사항)
- 로딩 상태: "결제 진행 중..."
- 결제 완료: "결제 완료! 주문이 접수되었습니다."

### 2. 보안 체크리스트

#### 환경변수 보안
- ✅ **클라이언트 키**: `NEXT_PUBLIC_TOSS_CLIENT_KEY` (공개 가능)
- ✅ **시크릿 키**: `TOSS_SECRET_KEY` (서버 전용, 절대 클라이언트에 노출 금지)
- ✅ **환경변수 검증**: 서버 시작 시 필수 환경변수 존재 확인
- ✅ **Git 보안**: `.env.local`은 `.gitignore`에 포함 확인

#### 결제 검증 보안
- ✅ **서버 사이드 검증**: 결제 성공 후 반드시 서버에서 Toss Payments API로 검증
- ✅ **주문 ID 검증**: 결제 요청 시 전달한 orderId와 결제 완료 후 받은 orderId 일치 확인
- ✅ **결제 금액 검증**: 결제 금액이 주문 금액과 일치하는지 확인
- ✅ **결제 상태 검증**: 결제 상태가 'DONE'인지 확인
- ✅ **주문자 확인**: 결제 요청한 사용자와 주문자(clerk_id) 일치 확인

#### 통신 보안
- ✅ **HTTPS 필수**: 모든 결제 관련 통신은 HTTPS 사용
- ✅ **Toss Payments API**: 공식 API 엔드포인트만 사용 (피싱 방지)
- ✅ **에러 메시지**: 보안 관련 에러 메시지는 상세 정보 노출 금지

#### 데이터 보안
- ✅ **카드 정보 저장 금지**: 카드 정보는 절대 서버에 저장하지 않음
- ✅ **결제 키 저장**: paymentKey는 주문 확정 시에만 사용하고 저장하지 않음
- ✅ **로그 보안**: 결제 관련 로그에 민감 정보 포함 금지

#### 트랜잭션 보안
- ✅ **원자성 보장**: 주문 확정 시 트랜잭션 사용하여 일관성 보장
- ✅ **중복 결제 방지**: 동일 orderId로 여러 번 확정 시도 방지
- ✅ **동시성 제어**: 동시에 같은 주문에 대한 결제 요청 처리 방지

#### 코드 보안
- ✅ **에러 핸들링**: 모든 에러를 적절히 처리하여 정보 노출 방지
- ✅ **입력 검증**: 모든 사용자 입력 검증 (배송 정보 등)
- ✅ **SQL 인젝션 방지**: Supabase 클라이언트 사용으로 자동 방지
- ✅ **XSS 방지**: React의 기본 XSS 방지 기능 활용

### 3. 테스트 시나리오

1. ✅ 정상 결제 플로우
   - 장바구니 → 결제 페이지 → 테스트 카드 입력 → 승인 → 주문 완료

2. ✅ 결제 실패 시나리오
   - 카드 거절 → 에러 메시지 표시 → 재시도 가능

3. ✅ 주문 검증 실패
   - 장바구니 비어있음 → 에러 → 장바구니로 리다이렉트
   - 재고 부족 → 에러 → 장바구니로 리다이렉트

4. ✅ 네트워크 오류
   - 결제 중 네트워크 끊김 → 에러 메시지 → 재시도 가능

### 4. 향후 확장 가능성

- ⚠️ **결제 내역 저장**: 현재는 orders 테이블만 사용하지만, 향후 `payments` 테이블 추가 가능
- ⚠️ **결제 취소/환불**: 현재는 구현하지 않지만, 스키마에 `cancelled` 상태가 있으므로 향후 확장 가능
- ⚠️ **결제 수단 다양화**: v1에서 지원하는 다른 결제 수단 추가 가능 (계좌이체, 가상계좌 등)

### 5. 성능 최적화

- ✅ **결제 위젯 로딩**: 동적 import 사용 (`next/dynamic`)
- ✅ **주문 생성 최적화**: 트랜잭션 사용으로 일관성 보장
- ✅ **재고 업데이트**: 배치 업데이트로 성능 향상

---

## 📝 구현 체크리스트

### Phase 4-1: 환경 설정
- [ ] Toss Payments 계정 생성 및 테스트 키 발급
- [ ] 패키지 설치 (`@tosspayments/payment-widget` 또는 v1 SDK)
- [ ] 환경변수 설정 (`.env.local`)

### Phase 4-2: 주문 생성 구현
- [ ] `actions/orders/create-order.ts` 구현
- [ ] 주문 검증 로직 (로그인, 장바구니, 재고 확인)
- [ ] orders 테이블 저장 (status='pending')
- [ ] order_items 테이블 저장

### Phase 4-3: 결제 페이지 구현
- [ ] `app/checkout/page.tsx` 생성
- [ ] `components/checkout/order-form.tsx` 생성 (배송 정보 입력)
- [ ] `components/checkout/order-summary.tsx` 생성 (주문 요약)
- [ ] `components/checkout/payment-widget.tsx` 생성 (Toss Payments 위젯)

### Phase 4-4: 결제 처리 구현
- [ ] Toss Payments 위젯 초기화 및 결제 요청
- [ ] 결제 성공 콜백 처리
- [ ] `actions/orders/confirm-order.ts` 구현
  - [ ] orders.status = 'confirmed' 업데이트
  - [ ] 재고 차감
  - [ ] 장바구니 비우기
- [ ] 결제 실패 에러 처리

### Phase 4-5: 주문 완료 페이지
- [ ] `app/orders/[orderId]/page.tsx` 생성
- [ ] 주문 정보 표시
- [ ] 주문 상태 표시 (confirmed)

### Phase 4-6: 통합 및 테스트
- [ ] 전체 플로우 테스트 (장바구니 → 결제 → 완료)
- [ ] 결제 실패 시나리오 테스트
- [ ] 에러 핸들링 테스트
- [ ] 반응형 디자인 테스트

---

## 🔗 참고 자료

### Toss Payments 공식 문서
- **메인 문서**: https://docs.tosspayments.com/
- **개발자 센터**: https://developers.tosspayments.com/
- **v1 가이드**: 공식 문서에서 v1 섹션 확인
- **API 레퍼런스**: https://docs.tosspayments.com/reference
- **테스트 카드 정보**: 개발자 센터의 "테스트 카드" 섹션

### Toss Payments 서버 SDK
- **npm 패키지**: `@tosspayments/server-sdk` (정확한 패키지명 확인 필요)
- **GitHub**: Toss Payments 공식 GitHub 저장소 확인

### 보안 관련
- **PCI DSS**: 카드 정보 처리 보안 표준 (직접 카드 정보 저장하지 않으므로 적용 범위 확인)
- **Toss Payments 보안 가이드**: 공식 문서의 보안 섹션

### Next.js 통합
- **Next.js Server Actions**: Server Actions를 통한 서버 사이드 검증
- **환경변수 관리**: Next.js 환경변수 문서

### Supabase 트랜잭션
- **Supabase 트랜잭션 가이드**: PostgreSQL 트랜잭션 사용 방법
- **에러 처리**: Supabase 에러 핸들링 모범 사례

---

**다음 단계**: 이 계획서를 바탕으로 Phase 4 구현을 시작합니다.

