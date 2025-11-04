/**
 * @file logger.ts
 * @description 로깅 유틸리티
 *
 * 프로덕션 환경에서 console.log를 제거하고, 개발 환경에서만 로그를 출력합니다.
 */

const isDevelopment = process.env.NODE_ENV === "development";

/**
 * 개발 환경에서만 로그를 출력하는 함수
 */
export const logger = {
  group: (label: string) => {
    if (isDevelopment) {
      console.group(label);
    }
  },
  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd();
    }
  },
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    // 에러는 프로덕션에서도 로깅 (서버 로그 모니터링용)
    console.error(...args);
  },
};

