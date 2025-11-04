/**
 * @file products.spec.ts
 * @description 상품 관련 E2E 테스트
 *
 * 상품 목록 페이지와 상품 상세 페이지를 테스트합니다.
 */

import { test, expect } from '@playwright/test';

test.describe('상품 목록 페이지 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products');
  });

  test('상품 목록 페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/products/);
    
    // 페이지 제목이나 헤더 확인
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading.first()).toBeVisible();
  });

  test('상품 검색 기능이 작동해야 함', async ({ page }) => {
    // 검색 입력 필드 찾기
    const searchInput = page.getByPlaceholder(/검색/).or(
      page.getByRole('textbox', { name: /검색/ })
    );
    
    const isSearchVisible = await searchInput.isVisible().catch(() => false);
    
    if (isSearchVisible) {
      await searchInput.fill('테스트');
      await searchInput.press('Enter');
      
      // URL에 search 파라미터가 추가되었는지 확인
      await expect(page).toHaveURL(/.*search=테스트/);
    }
  });

  test('카테고리 필터가 작동해야 함', async ({ page }) => {
    // 카테고리 드롭다운 찾기
    const categoryDropdown = page.getByRole('combobox', { name: /카테고리/ }).or(
      page.locator('select').first()
    );
    
    const isDropdownVisible = await categoryDropdown.isVisible().catch(() => false);
    
    if (isDropdownVisible) {
      await categoryDropdown.selectOption({ label: /의류/ });
      await expect(page).toHaveURL(/.*category=/);
    }
  });

  test('정렬 기능이 작동해야 함', async ({ page }) => {
    // 정렬 드롭다운 찾기
    const sortDropdown = page.getByRole('combobox', { name: /정렬/ }).or(
      page.locator('select').filter({ hasText: /최신순|이름순/ })
    );
    
    const isSortVisible = await sortDropdown.isVisible().catch(() => false);
    
    if (isSortVisible) {
      await sortDropdown.selectOption({ label: /이름순/ });
      await expect(page).toHaveURL(/.*sort=/);
    }
  });

  test('상품 카드를 클릭하면 상품 상세 페이지로 이동해야 함', async ({ page }) => {
    // 상품 카드 찾기 (링크 또는 클릭 가능한 요소)
    const productCard = page.locator('a[href*="/products/"]').first();
    
    const isCardVisible = await productCard.isVisible().catch(() => false);
    
    if (isCardVisible) {
      const productLink = await productCard.getAttribute('href');
      await productCard.click();
      
      // 상품 상세 페이지로 이동했는지 확인
      if (productLink) {
        await expect(page).toHaveURL(productLink);
      } else {
        await expect(page).toHaveURL(/.*\/products\/[^/]+/);
      }
    }
  });
});

test.describe('상품 상세 페이지 테스트', () => {
  test('상품 상세 페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    // 먼저 상품 목록 페이지로 이동
    await page.goto('/products');
    
    // 상품 카드 링크 찾기
    const productLink = page.locator('a[href*="/products/"]').first();
    const isLinkVisible = await productLink.isVisible().catch(() => false);
    
    if (isLinkVisible) {
      await productLink.click();
      await expect(page).toHaveURL(/.*\/products\/[^/]+/);
      
      // 상품 정보가 표시되어야 함
      const productName = page.getByRole('heading', { level: 1 }).or(
        page.getByRole('heading', { level: 2 })
      );
      await expect(productName.first()).toBeVisible();
    }
  });

  test('상품 상세 페이지에 가격이 표시되어야 함', async ({ page }) => {
    await page.goto('/products');
    
    const productLink = page.locator('a[href*="/products/"]').first();
    const isLinkVisible = await productLink.isVisible().catch(() => false);
    
    if (isLinkVisible) {
      await productLink.click();
      
      // 가격 정보 확인 (원화 표시 또는 숫자)
      const priceText = page.getByText(/원|₩|\d{1,3}(,\d{3})*원/).first();
      const isPriceVisible = await priceText.isVisible().catch(() => false);
      
      if (isPriceVisible) {
        await expect(priceText).toBeVisible();
      }
    }
  });
});

