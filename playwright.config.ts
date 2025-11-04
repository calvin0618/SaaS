import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 설정 파일
 * 
 * E2E 테스트를 위한 기본 설정입니다.
 * 
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  /* 테스트 실행 옵션 */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  /* 리포트 설정 */
  reporter: 'html',
  
  /* 공유 설정 */
  use: {
    /* Base URL */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    
    /* 브라우저 컨텍스트 옵션 */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    
    /* 타임아웃 설정 */
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  /* 프로젝트별 브라우저 설정 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    /* 모바일 테스트 */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* 개발 서버 실행 설정 */
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});

