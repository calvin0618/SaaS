import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { getCart } from "@/actions/cart/get-cart";

/**
 * 장바구니 아이콘 컴포넌트
 * 
 * GNB에 표시되는 장바구니 아이콘입니다.
 * 클릭 시 장바구니 페이지로 이동하며, 장바구니 아이템 개수를 배지로 표시합니다.
 */
function CartIcon({ itemCount = 0 }: { itemCount?: number }) {
  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
      aria-label={`장바구니 (${itemCount}개 아이템)`}
    >
      <ShoppingCart className="w-6 h-6 text-gray-700" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}

const Navbar = async () => {
  // 장바구니 아이템 개수 조회 (로그인한 사용자만)
  let cartItemCount = 0;
  try {
    const cartResult = await getCart();
    if (cartResult.success && cartResult.data) {
      cartItemCount = cartResult.data.length;
    }
  } catch (error) {
    // 에러 발생 시 0으로 처리 (로그인하지 않은 사용자거나 에러 발생)
    console.warn("[Navbar] 장바구니 조회 실패:", error);
  }

  return (
    <header className="flex justify-between items-center p-4 gap-4 h-16 max-w-7xl mx-auto">
      <Link href="/" className="text-2xl font-bold">
        SaaS Template
      </Link>
      <div className="flex gap-4 items-center">
        {/* 장바구니 아이콘 - 로그인 상태와 관계없이 항상 표시 */}
        <CartIcon itemCount={cartItemCount} />
        
        <SignedOut>
          <SignInButton mode="modal">
            <Button>로그인</Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
};

export default Navbar;
