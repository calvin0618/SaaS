# 🛍️ 의류 쇼핑몰 MVP 개발 TODO 리스트

**총 예상 개발 기간: 4주** | **현재 진행 상황: Phase 1-3, 5 완료 ✅, Phase 4 준비 완료**

---

## 🚀 Phase 1: 기본 인프라 (1주) - ✅ 완료

### 프로젝트 초기 설정
- [x] Next.js 프로젝트 셋업 (pnpm 사용)
- [x] TypeScript 설정
- [x] 기본 폴더 구조 생성 (components, pages, lib 등)
- [x] ESLint/Prettier 설정

### 데이터베이스
- [x] Supabase 프로젝트 생성 및 연결 설정
- [x] 데이터베이스 스키마 작성 (products, cart_items, orders, order_items) ⚠️ Supabase 대시보드에서 SQL 실행 필요
- [x] 샘플 데이터 20개 삽입 (전자제품, 의류, 도서, 식품 등) - SQL 파일 준비 완료 및 구현 완료

### 인증 시스템
- [x] Clerk SDK 설치 및 초기 설정
- [x] 환경변수 설정 (.env.local)
- [x] Clerk Provider 설정
- [x] 로그인/회원가입 UI 컴포넌트 생성

### 기본 레이아웃
- [x] 글로벌 레이아웃 컴포넌트 생성
- [x] 헤더/네비게이션 바 구현
- [x] 푸터 컴포넌트 구현
- [x] 반응형 디자인 설정

---

## 📦 Phase 2: 상품 기능 (1주) - ✅ 완료

### 홈페이지
- [x] 메인 페이지 디자인 및 구현
- [x] 히어로 섹션 (배너 이미지/슬로건)
- [x] 상품 목록 표시 (Grid 레이아웃)
- [x] 카테고리별 상품 분류 및 네비게이션
- [x] 인기 상품 섹션 (재고량 기준 상위 4개 표시)

### 상품 목록 페이지 (`/products`)
- [x] 상품 그리드 레이아웃 구현 (반응형: 모바일 1열, 태블릿 2열, 데스크톱 3-4열)
- [x] 상품 카드 컴포넌트 생성 (이미지, 이름, 가격, 카테고리, 재고 상태)
- [x] 페이지네이션 구현 (페이지 번호, 이전/다음 버튼, 페이지 정보 표시)
- [x] 상품 검색 기능 (상품명, 설명 기반 검색)
- [x] 정렬 기능 (최신순, 이름순)

### 카테고리 필터링
- [x] 카테고리별 필터 UI
  - [x] 홈페이지: 버튼 형식 필터 (`CategoryFilter`)
  - [x] 상품 목록 페이지: 드롭다운 형식 필터 (`CategoryDropdown`)
- [x] URL 쿼리 파라미터 처리 (카테고리, 검색어, 정렬, 페이지 번호)
- [x] 필터 상태 관리 (URL 기반 상태 관리)
- [x] 카테고리: 전자제품, 의류, 도서, 식품, 스포츠, 뷰티, 생활/가정 (7개 카테고리)

### 상품 상세 페이지
- [x] 상품 상세 페이지 레이아웃 구현
  - [x] 상품 이미지 섹션 (상단에 위치)
  - [x] 상단 섹션: 이름, 가격, 재고 표시
  - [x] 중단 섹션: 설명, 카테고리 표시
  - [x] 우측 고정 섹션: 장바구니 UI (수량 선택, 담기 버튼)
  - [x] 하단 섹션: 등록일, 수정일 표시
- [x] 상품 이미지 표시 (placeholder 이미지 사용, 이미지 섹션 추가 완료)
- [x] 장바구니 담기 기능
  - [x] 수량 선택 UI (+/- 버튼, 직접 입력)
  - [x] 장바구니 추가 버튼 (로그인 체크, 재고 상태 반영)
  - [x] 장바구니 추가 API 연동 (addToCart Server Action 구현 완료)
  - [x] 장바구니 담기 성공 후 GNB 아이콘 실시간 업데이트 (router.refresh() 구현 완료)

### 어드민 기능 (Supabase 대시보드)
- [x] 상품 등록/수정/삭제 Server Actions 구현
  - [x] 상품 생성 API (createProduct)
  - [x] 상품 수정 API (updateProduct)
  - [x] 상품 삭제 API (deleteProduct)
- [x] 재고 관리 Server Action 구현
  - [x] 재고 수량 변경 API (updateStock)
- [x] 상품 상태 관리 Server Action 구현
  - [x] 상품 활성/비활성 토글 API (toggleProductStatus)
- [x] 관리자 권한 체크 로직 구현 (Clerk 역할 기반)
  - [x] 관리자 권한 확인 유틸리티 (lib/admin.ts)
  - [x] 모든 어드민 Server Actions에 권한 체크 적용
- [x] 어드민 페이지 UI 구현 (/admin/products)
  - [x] 상품 목록 표시 컴포넌트 (ProductList)
  - [x] 상품 생성/수정 폼 컴포넌트 (ProductForm)
  - [x] React Hook Form + Zod 유효성 검사
  - [x] 상품 삭제, 상태 토글, 재고 수량 변경 기능

---

## 🛒 Phase 3: 장바구니 & 주문 (1주) - ✅ 완료

### 장바구니 기능
- [x] GNB 장바구니 아이콘 추가 (장바구니 페이지 링크, 아이템 개수 배지)
  - [x] Navbar에서 getCart()로 장바구니 개수 조회
  - [x] 장바구니 담기 성공 후 router.refresh()로 실시간 업데이트 구현 완료
- [x] 장바구니 페이지 구현 (UI 구조)
  - [x] 장바구니 아이템 목록 표시 (카드 형태)
  - [x] 빈 장바구니 상태 처리
  - [x] 주문 요약 섹션 (총 개수, 총 수량, 총 금액)
  - [x] 로그인 체크 및 안내
- [x] 장바구니 데이터 처리 레이어 구현 (Server Actions)
  - [x] 장바구니 조회 API (getCart) - user_id 기반으로 수정 완료
  - [x] 장바구니 추가 API (addToCart) - 재고 체크, 중복 처리 포함, user_id 기반으로 수정 완료
  - [x] 수량 변경 API (updateCartItemQuantity) - 재고 체크 포함, user_id 기반으로 수정 완료
  - [x] 장바구니 삭제 API (removeCartItem) - user_id 기반으로 수정 완료
  - [x] 장바구니 요약 계산 유틸리티 함수 (calculateCartSummary)
- [x] 장바구니 페이지 데이터 연동 (getCart Server Action)
- [x] 수량 변경 기능 (UI 연동) - CartItemCard 컴포넌트에 구현 완료
- [x] 상품 삭제 기능 (UI 연동) - CartItemCard 컴포넌트에 구현 완료
- [x] 장바구니 합계 계산 (실시간 업데이트) - calculateCartSummary 함수 사용
- [x] 장바구니 아이콘 실시간 업데이트 - router.refresh() 구현 완료 (장바구니 담기 성공 시 자동 갱신)

### 주문 프로세스
- [x] 주문/결제 페이지 구현 (`/checkout`)
  - [x] 장바구니에서 주문하기 버튼 추가 (CartSummary 컴포넌트에 "주문하기" 버튼, `/checkout` 링크)
  - [x] 주문 페이지 레이아웃 (좌측: 배송 정보 입력, 우측: 주문 요약)
- [x] 주문 폼 컴포넌트 생성 (`components/checkout/order-form.tsx`)
  - [x] 배송 정보 입력 폼 (이름, 주소, 연락처) - shipping_address JSONB 필드용
  - [x] 주문 메모 입력 필드 (order_note) - 선택사항
  - [x] 폼 유효성 검사 (React Hook Form + Zod)
    - [x] 이름 필수 검증
    - [x] 주소 필수 검증
    - [x] 연락처 필수 검증 (전화번호 형식)
- [x] 주문 생성 Server Action 구현 (`actions/orders/create-order.ts`)
  - [x] 주문 전 검증 로직
    - [x] 로그인 상태 확인 (user_id 기반)
    - [x] 장바구니 비어있지 않은지 확인
    - [x] 상품 활성화 상태 확인 (is_active)
    - [x] 재고 충분 여부 확인 (stock_quantity >= 요청 수량)
  - [x] 트랜잭션 처리 (데이터 일관성 보장)
    - [x] 주문 ID 생성 (UUID)
    - [x] orders 테이블에 주문 정보 저장
      - [x] user_id (주문자 ID - Supabase users 테이블의 id)
      - [x] order_number (주문 번호)
      - [x] total_amount (총 금액 계산)
      - [x] shipping_address, shipping_name, shipping_phone (별도 컬럼)
      - [x] status ('pending' 기본값)
    - [x] order_items 테이블에 주문 상품 저장 (배치 처리)
      - [x] 각 장바구니 아이템을 order_item으로 변환
      - [x] product_id, quantity, price (주문 시점 가격) 저장
      - [x] 실제 DB 구조에 맞춰 수정 (product_name 컬럼 없음, products 테이블과 JOIN하여 조회)
    - [x] 에러 처리 및 롤백 (order_items 저장 실패 시 orders 삭제)
  - ⚠️ **재고 차감 및 장바구니 비우기는 결제 성공 후에만 수행** (Phase 4에서 confirm-order.ts에서 처리)
- [x] 주문 완료 페이지 구현 (`/orders/[orderId]`)
  - [x] 주문 번호 표시 (order.id)
  - [x] 주문 상세 정보 표시
    - [x] 주문 상품 목록
    - [x] 배송 정보
    - [x] 총 금액
    - [x] 주문 상태 (pending/confirmed 등)
    - [x] 주문 일시 표시
    - [x] 주문 메모 표시 (있는 경우)
  - [x] 마이페이지 또는 홈으로 이동 버튼
  - [x] 404 페이지 구현 (주문을 찾을 수 없을 때)

### 주문 테이블 연동
- [x] orders 테이블에 주문 정보 저장 (create-order.ts에서 구현 완료)
  - [x] user_id (주문자 ID - Supabase users 테이블의 id)
  - [x] order_number (주문 번호)
  - [x] 총 금액 (total_amount)
  - [x] 배송 정보 (이름, 주소, 연락처) - shipping_address, shipping_name, shipping_phone 별도 컬럼
  - [x] 주문 상태 (status: 'pending' 기본값)
  - [x] 주문 일시 (created_at) - 자동 생성
  - [x] 실제 DB 구조에 맞춰 수정 완료 (user_id 기반, 별도 컬럼 구조)
- [x] order_items 테이블에 주문 상품 저장 (create-order.ts에서 구현 완료)
  - [x] order_id (주문 ID 외래키)
  - [x] product_id (상품 ID 외래키)
  - [x] 수량 (quantity)
  - [x] 가격 (price - 주문 시점 가격)
  - [x] 실제 DB 구조 반영 (product_name 컬럼 없음, 조회 시 products 테이블과 JOIN하여 상품명 가져오기)
- [x] 주문 조회 Server Action 구현 (`actions/orders/get-order.ts`)
  - [x] 주문 ID로 주문 정보 조회
  - [x] 주문 상품 목록 조회 (order_items와 products 테이블 JOIN하여 상품명 가져오기)
  - [x] 권한 확인 (본인 주문만 조회 가능)
  - [x] 실제 DB 구조에 맞춰 수정 (order_items에 product_name 없음, products 테이블과 JOIN)
- [ ] 주문 상태 관리 (pending, confirmed, shipped, delivered, cancelled)
  - [ ] 주문 상태 업데이트 Server Action (Phase 4: confirm-order.ts에서 구현 예정)
  - [ ] 어드민 페이지에서 주문 상태 변경 기능 (향후 구현 예정)

---

## 💳 Phase 4: 결제 통합 (1주)

### Toss Payments MCP 연동
- [ ] Toss Payments SDK 설치
- [ ] 결제 위젯 컴포넌트 구현
- [ ] 결제 요청 API 구현
- [ ] 결제 상태 확인 로직

### 테스트 결제 구현
- [ ] 테스트 모드 설정
- [ ] 결제 성공/실패 처리
- [ ] 결제 완료 후 주문 상태 업데이트
- [ ] 결제 내역 저장

### 결제 완료 후 처리
- [ ] 결제 성공 시 주문 확정
- [ ] 결제 실패 시 에러 처리
- [ ] 사용자에게 결제 결과 알림
- [ ] 이메일/알림 시스템 (선택사항)

---

## 👤 Phase 5: 마이페이지 (0.5주) - ✅ 완료

### 주문 내역 조회
- [x] 마이페이지 레이아웃
- [x] 사용자별 주문 목록 API (`actions/orders/get-orders.ts`)
- [x] 주문 목록 표시 컴포넌트 (`app/my-orders/page.tsx`)
- [x] 주문 상태 표시 (배송 현황)

### 주문 상세 보기
- [x] 주문 상세 페이지 (`app/orders/[orderId]/page.tsx`)
- [x] 주문 상품 목록 표시
- [x] 배송 정보 표시
- [x] 주문 메모 표시 (있는 경우만)
- [x] 주문 취소 기능 (pending 상태일 때만 가능, `actions/orders/cancel-order.ts`)

---

## 🧪 Phase 6: 테스트 & 배포 (0.5주)

### 테스트 - ✅ 완료
- [x] 전체 사용자 플로우 테스트 (`tests/e2e/user-flow.spec.ts`)
  - [x] 로그인하지 않은 상태에서 상품 조회 및 장바구니 확인
  - [x] 장바구니 페이지 접근 테스트
  - [x] 주문 페이지 접근 시 리다이렉트 테스트
  - [x] 마이페이지 접근 시 로그인 페이지로 리다이렉트 테스트
- [x] 상품 관련 테스트 (`tests/e2e/products.spec.ts`)
  - [x] 상품 목록 페이지 테스트
  - [x] 상품 검색 기능 테스트
  - [x] 카테고리 필터링 테스트
  - [x] 정렬 기능 테스트
  - [x] 상품 상세 페이지 테스트
- [x] 홈페이지 테스트 (`tests/e2e/homepage.spec.ts`)
  - [x] 페이지 로드 확인
  - [x] 네비게이션 바 확인
  - [x] 인기 상품 섹션 확인
- [x] 반응형 디자인 테스트 (`tests/e2e/responsive-design.spec.ts`)
  - [x] 모바일 화면 테스트 (375px)
  - [x] 태블릿 화면 테스트 (768px)
  - [x] 데스크톱 화면 테스트 (1920px)
- [x] 크로스 브라우저 테스트 (`playwright.config.ts`)
  - [x] Chrome (Chromium) 테스트
  - [x] Firefox 테스트
  - [x] Safari (WebKit) 테스트
  - [x] Mobile Chrome 테스트
  - [x] Mobile Safari 테스트
- [x] 에러 핸들링 테스트 (`tests/e2e/user-flow.spec.ts`)
  - [x] 존재하지 않는 상품 페이지 404 테스트
  - [x] 존재하지 않는 주문 페이지 404 테스트
  - [x] 잘못된 URL 접근 처리 테스트
- [x] 네비게이션 테스트 (`tests/e2e/navigation.spec.ts`)
  - [x] GNB 링크 작동 확인
  - [x] 푸터 표시 확인
  - [x] 반응형 네비게이션 테스트

### 버그 수정 - ✅ 완료
- [x] 발견된 버그 수정
  - [x] alert() 사용을 UI 컴포넌트로 교체 (`components/ui/message.tsx` 생성)
  - [x] checkout-client.tsx의 전역 변수 제거 (React ref 사용으로 개선)
  - [x] 에러 핸들링 개선 (일관된 에러 메시지 표시)
  - [x] 타입 안전성 강화 (forwardRef, useImperativeHandle 사용)
- [x] 성능 최적화
  - [x] 이미지 최적화 (AVIF, WebP 포맷, 캐싱 설정)
  - [x] Next.js 설정 최적화 (압축, 이미지 최적화)
  - [x] console.log를 logger로 교체 (프로덕션에서 제거)
- [x] 코드 리팩토링
  - [x] 가격 포맷팅 함수 공통화 (`lib/utils/format.ts`)
  - [x] 카테고리 라벨 변환 함수 공통화
  - [x] 재고 상태 표시 로직 공통화
  - [x] 날짜 포맷팅 함수 공통화
- [x] 보안 취약점 점검
  - [x] 환경 변수 검증 유틸리티 생성 (`lib/utils/security.ts`, `lib/utils/env.ts`)
  - [x] 민감 정보 노출 방지 (`getSafeErrorMessage`)
  - [x] XSS 취약점 확인 (dangerouslySetInnerHTML 사용 없음 확인)
  - [x] 환경 변수 자동 검증 (앱 시작 시)

### 배포
- [ ] Vercel 프로젝트 생성
- [ ] 환경변수 설정
- [ ] 빌드 및 배포 테스트
- [ ] 도메인 연결 (선택사항)
- [ ] 프로덕션 환경 최적화

---

## 📊 성공 지표 검증

### 정량적 지표 목표
- [ ] 회원가입 수: 최소 50명 ✅ 0/50
- [ ] 실제 테스트 결제 시도: 최소 10건 ✅ 0/10
- [ ] 결제 완료율: 50% 이상 ✅ 0%
- [ ] 장바구니 추가율: 방문자 대비 20% ✅ 0%

### 정성적 지표
- [ ] 사용자 피드백 설문지 준비
- [ ] 기술 스택 안정성 검증 (Clerk + Supabase + Toss Payments)
- [ ] 개선 포인트 문서화

---

## ⚠️ 중요 참고사항

- **Supabase RLS 미사용**: 모든 데이터 접근은 서버사이드에서 처리
- **결제는 테스트 모드만**: 실제 금액 차감되지 않음
- **어드민 기능**: 어드민 페이지 구현 완료 (/admin/products)
- **배송 기능 제외**: 주문 상태 관리만 구현
- **TypeScript 필수**: 모든 컴포넌트와 API에 타입 적용
- **에러 핸들링 철저**: 사용자 경험을 고려한 예외 처리

---

**다음 단계**: 
1. Phase 4: 결제 통합 (Toss Payments) 구현
   - Toss Payments v1 SDK 설치 및 설정
   - 결제 위젯 구현
   - 결제 성공 시 주문 확정 (confirm-order.ts)
2. Phase 5: 마이페이지 (주문 내역 조회)

**Phase 1 진행률**: ✅ 100% 완료
**Phase 2 진행률**: ✅ 100% 완료
**Phase 3 진행률**: ✅ 100% 완료 (장바구니 기능 완료 ✅, 주문 프로세스 구현 완료 ✅, 주문 테이블 연동 완료 ✅)
**Phase 5 진행률**: ✅ 100% 완료 (주문 내역 조회 완료 ✅, 주문 상세 보기 완료 ✅, 주문 취소 기능 완료 ✅)
**Phase 6 진행률**: ✅ 테스트 완료 (배포는 제외)

## 📝 Phase 1~3 구현 완료 요약

### Phase 1: 기본 인프라 ✅ 100% 완료
- ✅ Next.js 15.5.6 + React 19 + TypeScript 설정
- ✅ Clerk 인증 시스템 완전 통합
- ✅ Supabase 데이터베이스 스키마 생성 완료 (products, cart_items, orders, order_items)
- ✅ 기본 레이아웃 및 네비게이션 구현
- ✅ 푸터 컴포넌트 구현

### Phase 2: 상품 기능 ✅ 100% 완료
- ✅ 홈페이지: 히어로 섹션, 인기 상품, 카테고리 필터, 전체 상품 그리드
- ✅ 상품 목록 페이지: 검색, 필터링, 정렬, 페이지네이션
- ✅ 상품 상세 페이지: 이미지 섹션 추가, 상단(이름/가격/재고), 중단(설명/카테고리), 하단(등록일/수정일), 우측(장바구니 UI), 장바구니 담기 기능 및 실시간 업데이트
- ✅ 어드민 페이지: 상품 CRUD 관리 시스템 완전 구현
- ✅ 상품 이미지 표시: placeholder 이미지 처리 및 상세 페이지 이미지 섹션 추가

### Phase 3: 장바구니 & 주문 ✅ 100% 완료
- ✅ 장바구니 데이터 처리 레이어 완료 (Server Actions: getCart, addToCart, updateCartItemQuantity, removeCartItem) - user_id 기반으로 수정 완료
- ✅ 장바구니 페이지 UI 구조 완료 (목록 표시, 빈 상태, 요약 섹션)
- ✅ 장바구니 추가 기능 연동 완료 (add-to-cart 컴포넌트에 Server Action 연동)
- ✅ 장바구니 UI 연동 완료 (수량 변경, 삭제 버튼 활성화 및 Server Action 연동)
- ✅ GNB 장바구니 아이콘 실시간 업데이트 완료 (Navbar에서 getCart() 조회, router.refresh()로 자동 갱신)
- ✅ 주문 프로세스 완료 (주문 폼, 주문 생성 API, 주문 테이블 연동) - 실제 DB 구조에 맞춰 수정 완료
- ✅ 주문 완료 페이지 구현 완료 (order_items와 products 테이블 JOIN하여 상품명 표시)

### Phase 5: 마이페이지 ✅ 100% 완료
- ✅ 마이페이지 레이아웃 구현 완료 (`app/my-page/page.tsx`)
- ✅ 주문 내역 목록 페이지 구현 완료 (`app/my-orders/page.tsx`)
- ✅ 사용자별 주문 목록 조회 Server Action 구현 완료 (`actions/orders/get-orders.ts`)
- ✅ 주문 목록 표시 컴포넌트 구현 완료 (주문 카드 형태)
- ✅ 주문 상태 표시 구현 완료 (결제 대기, 결제 완료, 배송 중, 배송 완료, 취소됨)
- ✅ 주문 상세 페이지 개선 완료 (주문 메모 표시, 마이페이지 링크 추가)
- ✅ 주문 취소 기능 구현 완료 (pending 상태일 때만 가능, `actions/orders/cancel-order.ts`)

### Phase 6: 테스트 ✅ 테스트 완료 (배포는 제외)
- ✅ Playwright 설정 완료 (`playwright.config.ts`)
- ✅ 전체 사용자 플로우 테스트 완료 (`tests/e2e/user-flow.spec.ts`)
- ✅ 상품 관련 테스트 완료 (`tests/e2e/products.spec.ts`)
- ✅ 홈페이지 테스트 완료 (`tests/e2e/homepage.spec.ts`)
- ✅ 반응형 디자인 테스트 완료 (`tests/e2e/responsive-design.spec.ts`)
- ✅ 크로스 브라우저 테스트 완료 (Chrome, Firefox, Safari, Mobile)
- ✅ 에러 핸들링 테스트 완료 (404 페이지, 잘못된 URL 처리)
- ✅ 네비게이션 테스트 완료 (`tests/e2e/navigation.spec.ts`)
