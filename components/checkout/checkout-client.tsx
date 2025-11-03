/**
 * @file checkout-client.tsx
 * @description 주문/결제 페이지 클라이언트 컴포넌트
 *
 * 주문 폼 제출 및 주문 생성을 처리하는 클라이언트 컴포넌트입니다.
 * Server Component에서 전달받은 장바구니 데이터를 사용합니다.
 *
 * @dependencies
 * - components/checkout/order-form: 배송 정보 입력 폼
 * - components/checkout/order-summary: 주문 요약 컴포넌트
 * - actions/orders/create-order: 주문 생성 Server Action
 */

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { OrderForm, OrderFormValues } from "@/components/checkout/order-form";
import { OrderSummary } from "@/components/checkout/order-summary";
import { CartItem } from "@/types/cart";
import { createOrder } from "@/actions/orders/create-order";

interface CheckoutClientProps {
  initialCartItems: CartItem[];
  initialTotalAmount: number;
}

export function CheckoutClient({
  initialCartItems,
  initialTotalAmount,
}: CheckoutClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (formData: OrderFormValues) => {
    setError(null);

    startTransition(async () => {
      console.group("[CheckoutClient] 주문 생성 시도");
      console.log("배송 정보:", formData);

      // 주문 생성 Server Action 호출
      const result = await createOrder({
        shipping_address: {
          name: formData.name,
          address: formData.address,
          phone: formData.phone,
        },
        order_note: formData.order_note || null,
      });

      if (result.success && result.orderId) {
        console.log("[CheckoutClient] 주문 생성 성공, 주문 ID:", result.orderId);
        console.groupEnd();

        // 주문 완료 페이지로 이동
        // Phase 4에서 결제 프로세스로 변경될 예정
        router.push(`/orders/${result.orderId}`);
      } else {
        console.error("[CheckoutClient] 주문 생성 실패:", result.error);
        console.groupEnd();
        setError(result.error || "주문 생성에 실패했습니다.");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 좌측: 배송 정보 입력 */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            배송 정보
          </h2>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <OrderForm onSubmit={handleSubmit} isSubmitting={isPending} />
        </div>
      </div>

      {/* 우측: 주문 요약 + 주문하기 버튼 */}
      <div>
        <OrderSummary
          cartItems={initialCartItems}
          totalAmount={initialTotalAmount}
          onOrder={() => {
            // OrderForm의 handleSubmit을 트리거하기 위해
            // 폼의 submit 이벤트를 발생시킵니다.
            const formRef = (window as any).__checkoutFormRef;
            if (formRef) {
              formRef.requestSubmit();
            } else {
              const form = document.querySelector("form");
              if (form) {
                form.requestSubmit();
              }
            }
          }}
          isSubmitting={isPending}
        />
      </div>
    </div>
  );
}

