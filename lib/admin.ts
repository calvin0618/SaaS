/**
 * @file admin.ts
 * @description 어드민 권한 체크 유틸리티
 *
 * Clerk를 사용하여 관리자 권한을 확인하는 함수들입니다.
 * Clerk의 organization role 또는 session claims를 확인합니다.
 *
 * @dependencies
 * - @clerk/nextjs/server: Clerk 인증
 */

import { auth, clerkClient } from "@clerk/nextjs/server";

/**
 * 관리자 권한 확인
 * @returns 관리자 여부
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return false;
    }

    // 방법 1: Clerk Organization Role 확인
    // Clerk 대시보드에서 Organization을 설정하고 "admin" 역할을 부여한 경우
    const { orgRole } = await auth();
    if (orgRole === "admin" || orgRole === "org:admin") {
      return true;
    }

    // 방법 2: Clerk Session Claims 확인
    // Clerk 대시보드에서 Session Token에 커스텀 claim을 추가한 경우
    const { sessionClaims } = await auth();
    if (sessionClaims?.metadata?.role === "admin") {
      return true;
    }

    // 방법 3: 환경변수로 관리자 이메일 목록 설정 (개발 환경용)
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
    if (adminEmails.length > 0) {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const userEmail = user.emailAddresses[0]?.emailAddress;
      if (userEmail && adminEmails.includes(userEmail)) {
        return true;
      }
    }

    // 기본값: 개발 환경에서는 모든 로그인한 사용자를 관리자로 처리
    // 프로덕션에서는 위의 방법 중 하나를 사용해야 합니다.
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[isAdmin] 개발 환경: 모든 로그인한 사용자를 관리자로 처리합니다."
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error("[isAdmin] 권한 확인 오류:", error);
    return false;
  }
}

/**
 * 관리자 권한 확인 및 에러 반환
 * @returns 관리자 여부 또는 에러 메시지
 */
export async function requireAdmin(): Promise<
  | { success: true }
  | { success: false; error: string }
> {
  const admin = await isAdmin();

  if (!admin) {
    return {
      success: false,
      error: "관리자 권한이 필요합니다.",
    };
  }

  return { success: true };
}

