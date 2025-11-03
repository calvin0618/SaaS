/**
 * @file users.ts
 * @description 사용자 관련 유틸리티 함수
 *
 * Clerk userId (TEXT)를 Supabase users 테이블의 id (UUID)로 변환하는 함수를 제공합니다.
 *
 * @dependencies
 * - @clerk/nextjs/server: Clerk 인증
 * - lib/supabase/server: Supabase 클라이언트
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

/**
 * 현재 로그인한 사용자의 Supabase users 테이블 ID (UUID)를 조회
 * @returns users 테이블의 id (UUID) 또는 null
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    // Clerk 인증 확인
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return null;
    }

    // Supabase 클라이언트 생성
    const supabase = createClerkSupabaseClient();

    // users 테이블에서 clerk_id로 id 조회
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkId)
      .single();

    if (error || !data) {
      console.warn("[getCurrentUserId] 사용자를 찾을 수 없습니다:", error?.message);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error("[getCurrentUserId] 예상치 못한 오류:", error);
    return null;
  }
}

/**
 * Clerk userId로 사용자 정보를 조회하고, 없으면 생성
 * @param clerkId Clerk 사용자 ID
 * @returns users 테이블의 id (UUID) 또는 null
 */
export async function getOrCreateUserId(clerkId: string): Promise<string | null> {
  try {
    const supabase = createClerkSupabaseClient();

    // 기존 사용자 조회
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkId)
      .single();

    if (existingUser) {
      return existingUser.id;
    }

    // 사용자가 없으면 생성 (이름은 임시로 설정)
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        clerk_id: clerkId,
        name: "사용자", // 임시 이름, SyncUserProvider에서 업데이트됨
      })
      .select("id")
      .single();

    if (createError || !newUser) {
      console.error("[getOrCreateUserId] 사용자 생성 실패:", createError);
      return null;
    }

    return newUser.id;
  } catch (error) {
    console.error("[getOrCreateUserId] 예상치 못한 오류:", error);
    return null;
  }
}

