/**
 * @file env.ts
 * @description 환경 변수 검증 및 유틸리티
 *
 * 애플리케이션 시작 시 필수 환경 변수를 검증합니다.
 */

import { validateEnvVars, validatePublicEnvVars } from "./security";

/**
 * 필수 서버 사이드 환경 변수 목록
 */
const REQUIRED_SERVER_ENV_VARS = [
  "CLERK_SECRET_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

/**
 * 필수 클라이언트 사이드 환경 변수 목록
 */
const REQUIRED_PUBLIC_ENV_VARS = [
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

/**
 * 환경 변수 검증 (서버 사이드)
 * 애플리케이션 시작 시 호출되어야 합니다.
 */
export function validateEnvironment(): void {
  try {
    validateEnvVars(REQUIRED_SERVER_ENV_VARS);
    validatePublicEnvVars(REQUIRED_PUBLIC_ENV_VARS);
  } catch (error) {
    // 프로덕션에서는 에러를 던지고, 개발 환경에서는 경고만 출력
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
    console.warn("[Env Validation] 환경 변수 검증 실패:", error);
  }
}

/**
 * 환경 변수 안전하게 가져오기 (기본값 제공)
 */
export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`환경 변수 ${key}가 설정되지 않았습니다.`);
  }
  return value || defaultValue!;
}

