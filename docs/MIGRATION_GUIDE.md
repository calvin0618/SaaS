# 🔧 데이터베이스 마이그레이션 가이드

## 문제 상황

코드에서는 `cart_items`와 `orders` 테이블의 `clerk_id` 컬럼을 사용하지만, 실제 데이터베이스에는 `user_id` 컬럼만 있어 에러가 발생합니다.

## 해결 방법

`supabase/migrations/fix_cart_items_clerk_id.sql` 파일의 SQL을 Supabase 대시보드에서 실행하세요.

## 실행 단계

### 1. Supabase 대시보드 접속
- Supabase 프로젝트 대시보드 접속
- 좌측 메뉴에서 **SQL Editor** 클릭

### 2. SQL 실행
- `supabase/migrations/fix_cart_items_clerk_id.sql` 파일의 내용 전체를 복사
- SQL Editor에 붙여넣기
- **RUN** 버튼 클릭하여 실행

### 3. 실행 결과 확인
SQL 실행 후 마지막 부분의 확인 쿼리가 테이블 구조를 보여줍니다. 다음과 같이 표시되면 성공입니다:

**cart_items 테이블:**
- `clerk_id` (TEXT, NOT NULL) ✅

**orders 테이블:**
- `clerk_id` (TEXT, NOT NULL) ✅

## 마이그레이션 내용

### cart_items 테이블
- ✅ `clerk_id` 컬럼 추가 (TEXT, NOT NULL)
- ✅ 기존 데이터 마이그레이션 (user_id → clerk_id)
- ✅ UNIQUE 제약 조건 추가 (clerk_id, product_id)
- ✅ 인덱스 추가 (clerk_id)

### orders 테이블
- ✅ `clerk_id` 컬럼 추가 (TEXT, NOT NULL)
- ✅ 기존 데이터 마이그레이션 (user_id → clerk_id)
- ✅ 인덱스 추가 (clerk_id)

## 안전성

- **데이터가 없는 경우**: 안전하게 실행됩니다.
- **데이터가 있는 경우**: `user_id`를 통해 `users` 테이블의 `clerk_id`를 자동으로 매핑합니다.

## 실행 후

마이그레이션 실행 후:
1. 개발 서버 재시작 (필요시)
2. 장바구니 담기 기능 테스트
3. 주문 생성 기능 테스트

## 문제 발생 시

에러가 발생하면:
1. Supabase 대시보드의 Logs 확인
2. SQL Editor의 에러 메시지 확인
3. 필요시 롤백 (마이그레이션 전 상태로 복구)

