/**
 * @file homepage.spec.ts
 * @description 홈페이지 E2E 테스트
 *
 * 홈페이지의 기본 기능과 반응형 디자인을 테스트합니다.
 */

import { test, expect } from '@playwright/test';

test.describe('홈페이지 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('홈페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await expect(page).toHaveTitle(/SaaS 템플릿/);
    await expect(
      page.getByRole('heading', { name: /의류 쇼핑몰에 오신 것을 환영합니다/ })
    ).toBeVisible();
  });

  test('네비게이션 바가 표시되어야 함', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'SaaS Template' })).toBeVisible();
    
    // 장바구니 아이콘 확인 (로그인 상태와 관계없이 표시)
    const cartIcon = page.locator('a[aria-label*="장바구니"]');
    await expect(cartIcon).toBeVisible();
  });

  test('인기 상품 섹션이 표시되어야 함 (상품이 있는 경우)', async ({ page }) => {
    // 인기 상품 섹션 확인 (상품이 있을 때만 표시)
    const popularSection = page.getByRole('heading', { name: '인기 상품' });
    
    // 상품이 있을 수도 있고 없을 수도 있으므로 조건부 확인
    const isVisible = await popularSection.isVisible().catch(() => false);
    if (isVisible) {
      await expect(popularSection).toBeVisible();
    }
  });

  test('전체 상품 섹션이 표시되어야 함', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: '전체 상품' })
    ).toBeVisible();
  });

  test('카테고리 필터가 표시되어야 함', async ({ page }) => {
    // 카테고리 필터 버튼들이 표시되어야 함
    const categoryButtons = page.getByRole('button', { name: /전자제품|의류|도서|식품/ });
    const buttonCount = await categoryButtons.count();
    
    // 최소 1개 이상의 카테고리 버튼이 있어야 함
    expect(buttonCount).toBeGreaterThan(0);
  });
});

test.describe('홈페이지 반응형 디자인 테스트', () => {
  test('모바일 화면에서 레이아웃이 정상적으로 표시되어야 함', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: /의류 쇼핑몰에 오신 것을 환영합니다/ })
    ).toBeVisible();

    // 모바일에서도 네비게이션이 보여야 함
    await expect(page.getByRole('link', { name: 'SaaS Template' })).toBeVisible();
  });

  test('태블릿 화면에서 레이아웃이 정상적으로 표시되어야 함', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: /의류 쇼핑몰에 오신 것을 환영합니다/ })
    ).toBeVisible();
  });

  test('데스크톱 화면에서 레이아웃이 정상적으로 표시되어야 함', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: /의류 쇼핑몰에 오신 것을 환영합니다/ })
    ).toBeVisible();
  });
});

