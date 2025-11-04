/**
 * @file security.ts
 * @description 보안 관련 유틸리티 함수
 *
 * 환경 변수 검증 및 보안 관련 유틸리티를 제공합니다.
 */

/**
 * 필수 환경 변수 검증
 * @param envVars 검증할 환경 변수 이름 배열
 * @throws Error 환경 변수가 없을 경우
 */
export function validateEnvVars(envVars: string[]): void {
  const missing: string[] = [];

  for (const envVar of envVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `필수 환경 변수가 누락되었습니다: ${missing.join(", ")}`
    );
  }
}

/**
 * 클라이언트 사이드 환경 변수 검증
 * @param envVars 검증할 NEXT_PUBLIC_ 환경 변수 이름 배열
 * @throws Error 환경 변수가 없을 경우
 */
export function validatePublicEnvVars(envVars: string[]): void {
  const missing: string[] = [];

  for (const envVar of envVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `필수 공개 환경 변수가 누락되었습니다: ${missing.join(", ")}`
    );
  }
}

/**
 * 민감한 정보가 포함된 문자열인지 확인
 * @param str 확인할 문자열
 * @returns 민감한 정보 포함 여부
 */
export function containsSensitiveInfo(str: string): boolean {
  const sensitivePatterns = [
    /password/i,
    /secret/i,
    /key/i,
    /token/i,
    /api[_-]?key/i,
    /bearer/i,
    /authorization/i,
  ];

  return sensitivePatterns.some((pattern) => pattern.test(str));
}

/**
 * 안전한 에러 메시지 생성 (민감 정보 제거)
 * @param error 에러 객체
 * @returns 안전한 에러 메시지
 */
export function getSafeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // 민감한 정보가 포함된 메시지는 일반화
    if (containsSensitiveInfo(error.message)) {
      return "알 수 없는 오류가 발생했습니다.";
    }
    return error.message;
  }
  return "알 수 없는 오류가 발생했습니다.";
}

