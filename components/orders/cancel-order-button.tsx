/**
 * @file cancel-order-button.tsx
 * @description 주문 취소 버튼 컴포넌트
 *
 * pending 상태의 주문을 취소할 수 있는 버튼입니다.
 * 클라이언트 컴포넌트로 구현되어 있으며, 취소 후 주문 내역 페이지로 이동합니다.
 *
 * @dependencies
 * - actions/orders/cancel-order: 주문 취소 Server Action
 * - components/ui/button: shadcn/ui 버튼
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { cancelOrder } from "@/actions/orders/cancel-order";

interface CancelOrderButtonProps {
  orderId: string;
}

export function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!confirm("정말로 이 주문을 취소하시겠습니까? 취소된 주문은 복구할 수 없습니다.")) {
      return;
    }

    setIsCancelling(true);
    setError(null);

    try {
      const result = await cancelOrder(orderId);

      if (!result.success) {
        setError(result.error || "주문 취소에 실패했습니다.");
        setIsCancelling(false);
        return;
      }

      // 취소 성공 시 주문 내역 페이지로 이동
      router.push("/my-orders");
      router.refresh();
    } catch (err) {
      console.error("[CancelOrderButton] 주문 취소 오류:", err);
      setError("주문 취소 중 오류가 발생했습니다.");
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        variant="destructive"
        size="sm"
        onClick={handleCancel}
        disabled={isCancelling}
        className="w-full sm:w-auto"
      >
        <XCircle className="w-4 h-4 mr-2" />
        {isCancelling ? "취소 중..." : "주문 취소"}
      </Button>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

