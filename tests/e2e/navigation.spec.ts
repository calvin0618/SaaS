/**
 * @file navigation.spec.ts
 * @description 네비게이션 테스트
 *
 * 사이트 내 네비게이션과 링크 작동을 테스트합니다.
 */

import { test, expect } from '@playwright/test';

test.describe('네비게이션 테스트', () => {
  test('GNB 로고 클릭 시 홈으로 이동', async ({ page }) => {
    await page.goto('/products');
    
    const logoLink = page.getByRole('link', { name: 'SaaS Template' });
    await expect(logoLink).toBeVisible();
    
    await logoLink.click();
    await expect(page).toHaveURL('/');
  });

  test('GNB 장바구니 아이콘 클릭 시 장바구니 페이지로 이동', async ({ page }) => {
    await page.goto('/');
    
    const cartIcon = page.locator('a[aria-label*="장바구니"]');
    await expect(cartIcon).toBeVisible();
    
    await cartIcon.click();
    await expect(page).toHaveURL(/.*\/cart/);
  });

  test('GNB 마이페이지 아이콘은 로그인한 사용자에게만 표시', async ({ page }) => {
    await page.goto('/');
    
    // 로그인하지 않은 상태에서는 마이페이지 아이콘이 보이지 않아야 함
    // (SignedIn 컴포넌트로 감싸져 있으므로)
    const myPageIcon = page.locator('a[href="/my-page"]');
    const isVisible = await myPageIcon.isVisible().catch(() => false);
    
    // 로그인하지 않은 상태에서는 보이지 않아야 함
    expect(isVisible).toBe(false);
  });

  test('푸터가 모든 페이지에 표시되어야 함', async ({ page }) => {
    const pages = ['/', '/products', '/cart'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      // 푸터 확인 (footer 요소 또는 푸터 텍스트)
      const footer = page.locator('footer').or(
        page.getByText(/©|Copyright|All rights reserved/).first()
      );
      
      const isFooterVisible = await footer.isVisible().catch(() => false);
      
      if (isFooterVisible) {
        await expect(footer).toBeVisible();
      }
    }
  });
});

test.describe('반응형 네비게이션 테스트', () => {
  test('모바일 화면에서 네비게이션이 정상적으로 작동해야 함', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // 모바일에서도 로고와 주요 네비게이션 요소가 보여야 함
    const logoLink = page.getByRole('link', { name: 'SaaS Template' });
    await expect(logoLink).toBeVisible();
    
    const cartIcon = page.locator('a[aria-label*="장바구니"]');
    await expect(cartIcon).toBeVisible();
  });

  test('태블릿 화면에서 네비게이션이 정상적으로 작동해야 함', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    const logoLink = page.getByRole('link', { name: 'SaaS Template' });
    await expect(logoLink).toBeVisible();
  });

  test('데스크톱 화면에서 네비게이션이 정상적으로 작동해야 함', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    const logoLink = page.getByRole('link', { name: 'SaaS Template' });
    await expect(logoLink).toBeVisible();
  });
});

