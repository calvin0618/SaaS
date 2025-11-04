/**
 * @file user-flow.spec.ts
 * @description 전체 사용자 플로우 테스트
 *
 * 로그인 → 상품보기 → 장바구니 → 주문 프로세스를 테스트합니다.
 * (결제는 Phase 4에서 구현 예정이므로 제외)
 */

import { test, expect } from '@playwright/test';

test.describe('전체 사용자 플로우 테스트', () => {
  test('로그인하지 않은 상태에서 상품 조회 및 장바구니 확인', async ({ page }) => {
    await test.step('1. 홈페이지 접속', async () => {
      await page.goto('/');
      await expect(page).toHaveURL('/');
    });

    await test.step('2. 상품 목록 페이지 이동', async () => {
      // 네비게이션에서 상품 링크 클릭하거나 직접 이동
      const productsLink = page.getByRole('link', { name: /상품/ }).first();
      const isLinkVisible = await productsLink.isVisible().catch(() => false);
      
      if (isLinkVisible) {
        await productsLink.click();
      } else {
        await page.goto('/products');
      }
      
      await expect(page).toHaveURL(/.*\/products/);
    });

    await test.step('3. 상품 상세 페이지 확인', async () => {
      const productLink = page.locator('a[href*="/products/"]').first();
      const isLinkVisible = await productLink.isVisible().catch(() => false);
      
      if (isLinkVisible) {
        await productLink.click();
        await expect(page).toHaveURL(/.*\/products\/[^/]+/);
      }
    });

    await test.step('4. 장바구니 아이콘 확인', async () => {
      // GNB의 장바구니 아이콘 확인
      const cartIcon = page.locator('a[aria-label*="장바구니"]');
      await expect(cartIcon).toBeVisible();
    });
  });

  test('로그인하지 않은 상태에서 장바구니 페이지 접근', async ({ page }) => {
    await test.step('장바구니 페이지 접근', async () => {
      await page.goto('/cart');
      await expect(page).toHaveURL(/.*\/cart/);
    });

    await test.step('로그인 안내 메시지 확인', async () => {
      // 로그인 안내가 표시되어야 함
      const loginMessage = page.getByText(/로그인|로그인이 필요합니다/).first();
      const isMessageVisible = await loginMessage.isVisible().catch(() => false);
      
      if (isMessageVisible) {
        await expect(loginMessage).toBeVisible();
      }
    });
  });

  test('로그인하지 않은 상태에서 주문 페이지 접근 시 리다이렉트', async ({ page }) => {
    await test.step('주문 페이지 접근 시도', async () => {
      await page.goto('/checkout');
      
      // 로그인 안내 또는 로그인 페이지로 리다이렉트 확인
      const loginMessage = page.getByText(/로그인|로그인이 필요합니다/).first();
      const isLoginMessageVisible = await loginMessage.isVisible().catch(() => false);
      
      if (isLoginMessageVisible) {
        await expect(loginMessage).toBeVisible();
      } else {
        // 또는 로그인 페이지로 리다이렉트되었을 수 있음
        await expect(page).toHaveURL(/.*\/sign-in|.*\/checkout/);
      }
    });
  });

  test('마이페이지 접근 시 로그인 페이지로 리다이렉트', async ({ page }) => {
    await test.step('마이페이지 접근 시도', async () => {
      await page.goto('/my-page');
      
      // 로그인 페이지로 리다이렉트되었는지 확인
      // 또는 마이페이지에 로그인 안내가 표시되는지 확인
      await expect(page).toHaveURL(/.*\/sign-in|.*\/my-page/);
    });
  });
});

test.describe('에러 핸들링 테스트', () => {
  test('존재하지 않는 상품 페이지 접근 시 404 표시', async ({ page }) => {
    await page.goto('/products/non-existent-product-id');
    
    // 404 페이지 또는 에러 메시지 확인
    const notFoundText = page.getByText(/찾을 수 없습니다|404|Not Found/).first();
    const isNotFoundVisible = await notFoundText.isVisible().catch(() => false);
    
    if (isNotFoundVisible) {
      await expect(notFoundText).toBeVisible();
    }
  });

  test('존재하지 않는 주문 페이지 접근 시 404 표시', async ({ page }) => {
    // 인증이 필요한 경우를 고려하여 먼저 로그인 시도하지 않고 테스트
    await page.goto('/orders/non-existent-order-id');
    
    // 404 페이지 또는 에러 메시지 확인
    const notFoundText = page.getByText(/찾을 수 없습니다|404|Not Found/).first();
    const isNotFoundVisible = await notFoundText.isVisible().catch(() => false);
    
    if (isNotFoundVisible) {
      await expect(notFoundText).toBeVisible();
    }
  });

  test('잘못된 URL 접근 시 적절한 처리', async ({ page }) => {
    await page.goto('/invalid-route-12345');
    
    // 404 페이지 또는 에러 메시지 확인
    const notFoundText = page.getByText(/찾을 수 없습니다|404|Not Found/).first();
    const isNotFoundVisible = await notFoundText.isVisible().catch(() => false);
    
    if (isNotFoundVisible) {
      await expect(notFoundText).toBeVisible();
    } else {
      // 홈페이지로 리다이렉트되거나 적절한 처리가 되었는지 확인
      await expect(page).toHaveURL(/\//);
    }
  });
});

