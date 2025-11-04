# 테스트 가이드

이 프로젝트는 Playwright를 사용한 E2E 테스트를 포함합니다.

## 테스트 실행

### 첫 번째 실행 전 설정

1. Playwright 브라우저 설치:
```bash
pnpm exec playwright install
```

2. 환경 변수 설정 (필요한 경우):
```bash
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000
```

### 테스트 실행 명령어

```bash
# 모든 테스트 실행
pnpm test:e2e

# UI 모드로 실행 (테스트 실행을 시각적으로 확인)
pnpm test:e2e:ui

# 헤드 모드로 실행 (브라우저가 열린 상태로 실행)
pnpm test:e2e:headed

# 디버그 모드로 실행
pnpm test:e2e:debug
```

## 테스트 구조

```
tests/
├── e2e/                    # E2E 테스트
│   ├── homepage.spec.ts    # 홈페이지 테스트
│   ├── products.spec.ts    # 상품 관련 테스트
│   ├── user-flow.spec.ts   # 전체 사용자 플로우 테스트
│   ├── navigation.spec.ts  # 네비게이션 테스트
│   └── responsive-design.spec.ts  # 반응형 디자인 테스트
└── fixtures/               # 테스트 데이터
    └── test-data.ts
```

## 테스트 범위

### ✅ 구현된 테스트

1. **홈페이지 테스트**
   - 페이지 로드 확인
   - 네비게이션 바 확인
   - 인기 상품 섹션 확인
   - 반응형 디자인 테스트

2. **상품 관련 테스트**
   - 상품 목록 페이지
   - 상품 검색 기능
   - 카테고리 필터링
   - 정렬 기능
   - 상품 상세 페이지

3. **전체 사용자 플로우 테스트**
   - 로그인하지 않은 상태에서 상품 조회
   - 장바구니 접근
   - 주문 페이지 접근
   - 마이페이지 접근

4. **네비게이션 테스트**
   - GNB 링크 작동 확인
   - 푸터 표시 확인
   - 반응형 네비게이션

5. **에러 핸들링 테스트**
   - 404 페이지 처리
   - 잘못된 URL 접근 처리

6. **반응형 디자인 테스트**
   - 모바일 (375px)
   - 태블릿 (768px)
   - 데스크톱 (1920px)

7. **크로스 브라우저 테스트**
   - Chrome (Chromium)
   - Firefox
   - Safari (WebKit)

## 주의사항

- **결제 기능은 제외**: Phase 4에서 구현 예정이므로 테스트에서 제외되었습니다.
- **인증 테스트**: Clerk 인증은 실제 테스트 계정을 사용하거나 모킹이 필요할 수 있습니다.
- **데이터 의존성**: 테스트는 실제 데이터베이스 데이터에 의존하므로, 테스트 데이터가 필요할 수 있습니다.

## 테스트 실행 전 확인사항

1. 개발 서버가 실행 중이어야 합니다 (`pnpm dev`)
2. 환경 변수가 올바르게 설정되어 있어야 합니다
3. Supabase 데이터베이스에 테스트 데이터가 있어야 합니다

## CI/CD 통합

CI 환경에서 테스트를 실행할 때는 다음 환경 변수를 설정하세요:

```bash
PLAYWRIGHT_TEST_BASE_URL=https://your-app.vercel.app
CI=true
```

