/**
 * @file add-to-cart.tsx
 * @description 장바구니 담기 UI 컴포넌트
 *
 * 상품 상세 페이지의 우측 고정 섹션에 표시되는 장바구니 담기 UI입니다.
 * 수량 선택 및 장바구니 담기 버튼을 제공합니다.
 *
 * 주요 기능:
 * 1. 수량 선택 (1 ~ 재고량)
 * 2. 장바구니 담기 버튼
 * 3. 재고 상태에 따른 버튼 활성화/비활성화
 * 4. 로그인 상태 확인
 *
 * TODO: 실제 장바구니 추가 API 연동
 *
 * @dependencies
 * - @clerk/nextjs: 로그인 상태 확인
 * - components/ui/button: shadcn/ui 버튼 컴포넌트
 * - components/ui/input: shadcn/ui 입력 컴포넌트
 * - lucide-react: 아이콘
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { addToCart } from "@/actions/cart/add-to-cart";

interface AddToCartProps {
  productId: string;
  productName: string;
  stockQuantity: number;
  price: number;
}

export function AddToCart({
  productId,
  productName,
  stockQuantity,
  price,
}: AddToCartProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // 수량 증가
  const handleIncrease = () => {
    if (quantity < stockQuantity) {
      setQuantity(quantity + 1);
    }
  };

  // 수량 감소
  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // 수량 직접 입력
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= stockQuantity) {
      setQuantity(value);
    } else if (value > stockQuantity) {
      setQuantity(stockQuantity);
    } else if (value < 1) {
      setQuantity(1);
    }
  };

  // 장바구니 담기
  const handleAddToCart = async () => {
    setIsLoading(true);
    
    try {
      console.group("[AddToCart] 장바구니 담기 시도");
      console.log("상품 ID:", productId);
      console.log("상품명:", productName);
      console.log("수량:", quantity);
      console.log("재고:", stockQuantity);
      
      // 장바구니 추가 Server Action 호출
      const result = await addToCart({
        productId,
        quantity,
      });
      
      if (result.success) {
        console.log("[AddToCart] 장바구니 담기 완료");
        console.groupEnd();
        
        // Navbar의 장바구니 개수 업데이트를 위해 페이지 새로고침
        router.refresh();
        
        alert(result.message || `${productName} ${quantity}개가 장바구니에 추가되었습니다.`);
      } else {
        console.error("[AddToCart] 장바구니 담기 실패:", result.error);
        console.groupEnd();
        alert(result.error || "장바구니 담기에 실패했습니다.");
      }
      
    } catch (error) {
      console.error("[AddToCart] 장바구니 담기 예외 발생:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";
      alert(`장바구니 담기에 실패했습니다: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const isOutOfStock = stockQuantity === 0;
  const maxQuantity = stockQuantity;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8 sticky top-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">장바구니</h2>

      {/* 수량 선택 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          수량
        </label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleDecrease}
            disabled={quantity <= 1 || isOutOfStock}
            className="h-10 w-10"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Input
            type="number"
            min={1}
            max={maxQuantity}
            value={quantity}
            onChange={handleQuantityChange}
            disabled={isOutOfStock}
            className="w-20 text-center"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleIncrease}
            disabled={quantity >= maxQuantity || isOutOfStock}
            className="h-10 w-10"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {!isOutOfStock && (
          <p className="text-xs text-gray-500 mt-2">
            최대 {maxQuantity}개까지 선택 가능
          </p>
        )}
      </div>

      {/* 총 금액 */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">총 금액</span>
          <span className="text-2xl font-bold text-gray-900">
            {(price * quantity).toLocaleString("ko-KR")}원
          </span>
        </div>
      </div>

      {/* 장바구니 담기 버튼 */}
      <SignedIn>
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isLoading}
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          {isLoading ? (
            <>
              <span className="mr-2">처리 중...</span>
            </>
          ) : isOutOfStock ? (
            "품절"
          ) : (
            <>
              <ShoppingCart className="w-5 h-5 mr-2" />
              장바구니 담기
            </>
          )}
        </Button>
      </SignedIn>

      <SignedOut>
        <SignInButton mode="modal">
          <Button
            variant="outline"
            className="w-full h-12 text-base font-semibold"
            size="lg"
          >
            로그인하여 장바구니 담기
          </Button>
        </SignInButton>
      </SignedOut>
    </div>
  );
}

