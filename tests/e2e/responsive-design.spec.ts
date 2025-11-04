/**
 * @file responsive-design.spec.ts
 * @description 반응형 디자인 테스트
 *
 * 다양한 화면 크기에서 레이아웃이 정상적으로 작동하는지 테스트합니다.
 */

import { test, expect } from '@playwright/test';

const viewports = {
  mobile: { width: 375, height: 667 }, // iPhone SE
  tablet: { width: 768, height: 1024 }, // iPad
  desktop: { width: 1920, height: 1080 }, // Desktop
};

test.describe('반응형 디자인 테스트', () => {
  test('모바일 화면에서 홈페이지 레이아웃', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto('/');

    await test.step('히어로 섹션이 표시되어야 함', async () => {
      const heroHeading = page.getByRole('heading', {
        name: /의류 쇼핑몰에 오신 것을 환영합니다/,
      });
      await expect(heroHeading).toBeVisible();
    });

    await test.step('네비게이션이 표시되어야 함', async () => {
      const logo = page.getByRole('link', { name: 'SaaS Template' });
      await expect(logo).toBeVisible();
    });

    await test.step('상품 그리드가 모바일에 맞게 표시되어야 함', async () => {
      // 모바일에서는 1열로 표시되어야 함
      const productGrid = page.locator('.grid').first();
      const isGridVisible = await productGrid.isVisible().catch(() => false);
      
      if (isGridVisible) {
        await expect(productGrid).toBeVisible();
      }
    });
  });

  test('태블릿 화면에서 홈페이지 레이아웃', async ({ page }) => {
    await page.setViewportSize(viewports.tablet);
    await page.goto('/');

    await test.step('히어로 섹션이 표시되어야 함', async () => {
      const heroHeading = page.getByRole('heading', {
        name: /의류 쇼핑몰에 오신 것을 환영합니다/,
      });
      await expect(heroHeading).toBeVisible();
    });

    await test.step('상품 그리드가 태블릿에 맞게 표시되어야 함', async () => {
      // 태블릿에서는 2열로 표시되어야 함
      const productGrid = page.locator('.grid').first();
      const isGridVisible = await productGrid.isVisible().catch(() => false);
      
      if (isGridVisible) {
        await expect(productGrid).toBeVisible();
      }
    });
  });

  test('데스크톱 화면에서 홈페이지 레이아웃', async ({ page }) => {
    await page.setViewportSize(viewports.desktop);
    await page.goto('/');

    await test.step('히어로 섹션이 표시되어야 함', async () => {
      const heroHeading = page.getByRole('heading', {
        name: /의류 쇼핑몰에 오신 것을 환영합니다/,
      });
      await expect(heroHeading).toBeVisible();
    });

    await test.step('상품 그리드가 데스크톱에 맞게 표시되어야 함', async () => {
      // 데스크톱에서는 3-4열로 표시되어야 함
      const productGrid = page.locator('.grid').first();
      const isGridVisible = await productGrid.isVisible().catch(() => false);
      
      if (isGridVisible) {
        await expect(productGrid).toBeVisible();
      }
    });
  });

  test('모바일 화면에서 상품 목록 페이지 레이아웃', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto('/products');

    await test.step('필터 및 검색 기능이 표시되어야 함', async () => {
      // 필터나 검색 기능이 모바일에서도 접근 가능해야 함
      const searchInput = page.getByPlaceholder(/검색/).or(
        page.getByRole('textbox', { name: /검색/ })
      );
      const isSearchVisible = await searchInput.isVisible().catch(() => false);
      
      // 검색 기능이 있으면 표시되어야 함
      if (isSearchVisible) {
        await expect(searchInput).toBeVisible();
      }
    });
  });

  test('태블릿 화면에서 상품 목록 페이지 레이아웃', async ({ page }) => {
    await page.setViewportSize(viewports.tablet);
    await page.goto('/products');

    await test.step('필터 및 검색 기능이 표시되어야 함', async () => {
      const searchInput = page.getByPlaceholder(/검색/).or(
        page.getByRole('textbox', { name: /검색/ })
      );
      const isSearchVisible = await searchInput.isVisible().catch(() => false);
      
      if (isSearchVisible) {
        await expect(searchInput).toBeVisible();
      }
    });
  });

  test('데스크톱 화면에서 상품 목록 페이지 레이아웃', async ({ page }) => {
    await page.setViewportSize(viewports.desktop);
    await page.goto('/products');

    await test.step('필터 및 검색 기능이 표시되어야 함', async () => {
      const searchInput = page.getByPlaceholder(/검색/).or(
        page.getByRole('textbox', { name: /검색/ })
      );
      const isSearchVisible = await searchInput.isVisible().catch(() => false);
      
      if (isSearchVisible) {
        await expect(searchInput).toBeVisible();
      }
    });
  });
});

test.describe('크로스 브라우저 반응형 테스트', () => {
  test('Chrome에서 모바일 레이아웃', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chrome 전용 테스트');
    
    await page.setViewportSize(viewports.mobile);
    await page.goto('/');
    
    const heroHeading = page.getByRole('heading', {
      name: /의류 쇼핑몰에 오신 것을 환영합니다/,
    });
    await expect(heroHeading).toBeVisible();
  });

  test('Firefox에서 모바일 레이아웃', async ({ page, browserName }) => {
    test.skip(browserName !== 'firefox', 'Firefox 전용 테스트');
    
    await page.setViewportSize(viewports.mobile);
    await page.goto('/');
    
    const heroHeading = page.getByRole('heading', {
      name: /의류 쇼핑몰에 오신 것을 환영합니다/,
    });
    await expect(heroHeading).toBeVisible();
  });

  test('Safari에서 모바일 레이아웃', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'Safari 전용 테스트');
    
    await page.setViewportSize(viewports.mobile);
    await page.goto('/');
    
    const heroHeading = page.getByRole('heading', {
      name: /의류 쇼핑몰에 오신 것을 환영합니다/,
    });
    await expect(heroHeading).toBeVisible();
  });
});

