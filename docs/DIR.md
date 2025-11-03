# 🏗️ 쇼핑몰 MVP 프로젝트 구조

```
📁 test-mall/
├── 📄 .eslintrc.json (ESLint 설정)
├── 📄 .gitignore (Git 무시 파일)
├── 📄 .prettierrc (Prettier 설정)
├── 📄 next-env.d.ts (Next.js 타입 정의)
├── 📄 next.config.js (Next.js 설정)
├── 📄 package.json (프로젝트 의존성 및 스크립트)
├── 📄 postcss.config.js (PostCSS 설정)
├── 📄 README.md (프로젝트 설명)
├── 📄 tailwind.config.js (Tailwind CSS 설정)
├── 📄 tsconfig.json (TypeScript 설정)
├── 📁 Docs/
│   └── 📁 reference/
│       ├── 📄 DIR.md (현재 파일 - 프로젝트 구조)
│       ├── 📄 mermaid.md (사용자 플로우 다이어그램)
│       ├── 📄 PRD.md (제품 요구사항 문서)
│       └── 📄 TODO.md (개발 TODO 리스트)
├── 📁 app/ (Next.js App Router)
│   ├── 📄 globals.css (전역 스타일)
│   ├── 📄 layout.tsx (루트 레이아웃 - Clerk Provider 포함)
│   └── 📄 page.tsx (홈페이지)
├── 📁 components/ (React 컴포넌트)
│   ├── 📁 home/ (홈페이지 컴포넌트)
│   │   ├── 📄 Categories.tsx (카테고리 그리드)
│   │   ├── 📄 FeaturedProducts.tsx (추천 상품)
│   │   └── 📄 Hero.tsx (히어로 섹션)
│   └── 📁 layout/ (레이아웃 컴포넌트)
│       ├── 📄 Footer.tsx (푸터)
│       └── 📄 Header.tsx (헤더 - Clerk 인증 포함)
├── 📁 lib/ (유틸리티 및 설정)
│   ├── 📄 supabase.ts (Supabase 클라이언트 및 헬퍼 함수)
│   └── 📄 utils.ts (유틸리티 함수 - 가격 포맷팅 등)
├── 📁 supabase/ (데이터베이스)
│   └── 📁 migrations/
│       └── 📄 update_shopping_mall_schema.sql (데이터베이스 스키마)
└── 📁 types/ (TypeScript 타입 정의)
    └── 📄 database.ts (데이터베이스 관련 타입)
```

## 📋 파일별 역할 설명

### 🔧 설정 파일들
- **package.json**: 프로젝트 의존성, 스크립트, 메타데이터
- **tsconfig.json**: TypeScript 컴파일러 설정
- **next.config.js**: Next.js 프레임워크 설정
- **tailwind.config.js**: Tailwind CSS 커스터마이징
- **postcss.config.js**: PostCSS 설정
- **.eslintrc.json**: 코드 품질 검사 규칙
- **.prettierrc**: 코드 포맷터 설정

### 🎨 프론트엔드 (Next.js App Router)
- **app/layout.tsx**: 전체 앱의 루트 레이아웃, Clerk Provider 포함
- **app/page.tsx**: 메인 홈페이지
- **app/globals.css**: 전역 CSS 스타일

### 🧩 컴포넌트
- **components/layout/**: 공통 레이아웃 컴포넌트
  - Header: 네비게이션 및 Clerk 인증 UI
  - Footer: 사이트 정보 및 링크
- **components/home/**: 홈페이지 전용 컴포넌트
  - Hero: 메인 배너 섹션
  - Categories: 상품 카테고리 그리드 (7개 카테고리)
  - FeaturedProducts: 추천 상품 표시 (Supabase 연동)

### 🔗 백엔드 통합
- **lib/supabase.ts**: Supabase 클라이언트 및 데이터베이스 쿼리 함수
- **lib/utils.ts**: 공통 유틸리티 함수 (가격 포맷팅, 클래스명 등)
- **types/database.ts**: 데이터베이스 스키마 타입 정의

### 📚 문서화
- **Docs/reference/**: 프로젝트 관련 문서
  - PRD.md: 제품 요구사항 문서
  - TODO.md: 개발 진행 상황 및 계획
  - mermaid.md: 사용자 플로우 다이어그램

### 🗄️ 데이터베이스
- **supabase/migrations/**: 데이터베이스 스키마 마이그레이션 파일

## 🎯 개발 단계별 파일 추가 예정

### ✅ Phase 1: 기본 인프라 (완료)
- Next.js 프로젝트 셋업 및 설정 파일들
- Clerk 인증 준비 및 레이아웃 구성
- Supabase 데이터베이스 스키마 및 클라이언트
- 기본 컴포넌트 및 스타일링

### 🔄 Phase 2: 상품 기능 (다음 단계)
```
app/
├── products/
│   ├── page.tsx (상품 목록 - 필터링/정렬)
│   └── [id]/
│       └── page.tsx (상품 상세 - 옵션 선택)
└── categories/
    ├── page.tsx (카테고리 목록)
    └── [slug]/
        └── page.tsx (카테고리별 상품)
components/
├── products/
│   ├── ProductCard.tsx (상품 카드 컴포넌트)
│   ├── ProductGrid.tsx (상품 그리드)
│   └── ProductFilters.tsx (필터 컴포넌트)
└── ui/
    ├── Button.tsx (공통 버튼)
    ├── Input.tsx (입력 필드)
    └── Select.tsx (셀렉트 박스)
```

### 📋 Phase 3: 장바구니 & 주문
```
app/
├── cart/
│   └── page.tsx (장바구니)
├── checkout/
│   └── page.tsx (결제 페이지)
└── orders/
    └── page.tsx (주문 내역)
components/
├── cart/
│   ├── CartItem.tsx
│   ├── CartSummary.tsx
│   └── CartEmpty.tsx
└── checkout/
    ├── OrderForm.tsx
    ├── ShippingForm.tsx
    └── PaymentForm.tsx
lib/
├── hooks/
│   ├── useCart.ts (장바구니 상태 관리)
│   └── useAuth.ts (인증 상태 관리)
└── validations/
    └── order.ts (주문 폼 검증)
```

### 💳 Phase 4: 결제 통합
```
app/
├── api/
│   ├── cart/
│   │   ├── route.ts (장바구니 CRUD)
│   │   └── [id]/route.ts
│   ├── orders/
│   │   ├── route.ts (주문 생성)
│   │   └── [id]/route.ts (주문 조회)
│   ├── payment/
│   │   └── route.ts (결제 처리)
│   └── webhook/
│       └── toss/
│           └── route.ts (결제 웹훅)
└── lib/
    ├── toss-payments.ts (결제 SDK 래퍼)
    └── payment.ts (결제 헬퍼 함수)
```

### 👤 Phase 5: 마이페이지
```
app/
├── profile/
│   └── page.tsx (프로필 설정)
├── orders/
│   ├── page.tsx (주문 목록)
│   └── [id]/
│       └── page.tsx (주문 상세)
└── settings/
    └── page.tsx (계정 설정)
components/
├── profile/
│   ├── ProfileForm.tsx
│   └── OrderHistory.tsx
└── orders/
    ├── OrderCard.tsx
    └── OrderDetails.tsx
```

## 🚀 시작하기

```bash
# 1. 의존성 설치
pnpm install

# 2. 환경변수 설정 (.env.local 파일 생성)
# Clerk: https://clerk.com 에서 프로젝트 생성 후 키 획득
# Supabase: https://supabase.com 에서 프로젝트 생성 후 URL/키 획득
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 3. Supabase 스키마 적용
# supabase/migrations/update_shopping_mall_schema.sql 파일의 내용을
# Supabase 대시보드의 SQL Editor에서 실행

# 4. 개발 서버 실행
pnpm dev
```

## 📊 현재 개발 상태

- ✅ **Phase 1**: 기본 인프라 구축 완료
  - Next.js + TypeScript + Tailwind CSS 설정
  - Clerk 인증 준비 및 UI 컴포넌트
  - Supabase 데이터베이스 스키마 및 클라이언트
  - 반응형 레이아웃 및 기본 컴포넌트

- 🔄 **Phase 2**: 상품 기능 개발 예정
  - 상품 목록/상세 페이지
  - 카테고리 필터링
  - 상품 검색 기능

---

**마지막 업데이트**: 2024년 10월 31일
**현재 진행**: Phase 1 완료, Phase 2 준비 중
