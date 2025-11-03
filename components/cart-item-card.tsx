/**
 * @file cart-item-card.tsx
 * @description 장바구니 아이템 카드 컴포넌트
 *
 * 장바구니에 담긴 개별 상품을 표시하고 수량 변경/삭제 기능을 제공하는 컴포넌트입니다.
 *
 * @dependencies
 * - actions/cart: 장바구니 수량 변경/삭제 Server Actions
 * - components/ui: shadcn/ui 컴포넌트
 * - types/cart: CartItem 타입
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";
import { updateCartItemQuantity } from "@/actions/cart/update-quantity";
import { removeCartItem } from "@/actions/cart/remove-item";
import { CartItem } from "@/types/cart";

interface CartItemCardProps {
  item: CartItem;
}

export function CartItemCard({ item }: CartItemCardProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formattedPrice = new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(item.product.price);

  const subtotal = item.product.price * quantity;
  const formattedSubtotal = new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(subtotal);

  // 수량 증가
  const handleIncrease = async () => {
    const newQuantity = quantity + 1;
    if (newQuantity > item.product.stock_quantity) {
      alert(`재고가 부족합니다. (최대 ${item.product.stock_quantity}개)`);
      return;
    }

    setIsUpdating(true);
    try {
      const result = await updateCartItemQuantity({
        cartItemId: item.id,
        quantity: newQuantity,
      });

      if (result.success) {
        setQuantity(newQuantity);
        router.refresh(); // 장바구니 페이지 새로고침
      } else {
        alert(result.error || "수량 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("수량 변경 실패:", error);
      alert("수량 변경에 실패했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  // 수량 감소
  const handleDecrease = async () => {
    if (quantity <= 1) return;

    const newQuantity = quantity - 1;
    setIsUpdating(true);
    try {
      const result = await updateCartItemQuantity({
        cartItemId: item.id,
        quantity: newQuantity,
      });

      if (result.success) {
        setQuantity(newQuantity);
        router.refresh();
      } else {
        alert(result.error || "수량 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("수량 변경 실패:", error);
      alert("수량 변경에 실패했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  // 장바구니에서 삭제
  const handleDelete = async () => {
    if (!confirm(`"${item.product.name}" 상품을 장바구니에서 삭제하시겠습니까?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await removeCartItem({ cartItemId: item.id });

      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "상품 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("상품 삭제 실패:", error);
      alert("상품 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* 상품 이미지 */}
        <Link
          href={`/products/${item.product.id}`}
          className="flex-shrink-0 w-full lg:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden"
        >
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            {item.product.image_url ? (
              <img
                src={item.product.image_url}
                alt={item.product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ShoppingCart className="w-12 h-12" />
            )}
          </div>
        </Link>

        {/* 상품 정보 */}
        <div className="flex-1 flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <Link
              href={`/products/${item.product.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {item.product.name}
            </Link>
            <p className="text-gray-600 mt-1">{formattedPrice}</p>
          </div>

          {/* 수량 조절 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">수량</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDecrease}
                  disabled={quantity <= 1 || isUpdating || isDeleting}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-medium">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleIncrease}
                  disabled={
                    quantity >= item.product.stock_quantity ||
                    isUpdating ||
                    isDeleting
                  }
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* 소계 */}
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">소계</p>
              <p className="text-lg font-bold text-gray-900">
                {formattedSubtotal}
              </p>
            </div>

            {/* 삭제 버튼 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isUpdating || isDeleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              {isDeleting ? (
                "삭제 중..."
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-1" />
                  삭제
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

