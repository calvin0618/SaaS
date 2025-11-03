/**
 * @file page.tsx
 * @description 주문 완료 페이지
 *
 * 주문이 생성된 후 주문 상세 정보를 표시하는 페이지입니다.
 * 현재는 주문 생성 직후 표시되며, Phase 4에서 결제 완료 후에도 사용됩니다.
 *
 * 주요 기능:
 * 1. 주문 번호 표시
 * 2. 주문 상품 목록 표시
 * 3. 배송 정보 표시
 * 4. 총 금액 표시
 * 5. 주문 상태 표시 (pending 또는 confirmed)
 *
 * @dependencies
 * - actions/orders/get-order: 주문 조회
 * - lib/cart: formatPrice 함수
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import { getOrder } from "@/actions/orders/get-order";
import { formatPrice } from "@/lib/cart";

interface OrderPageProps {
  params: Promise<{ orderId: string }>;
}

/**
 * 주문 상태에 따른 배지 컴포넌트
 */
function OrderStatusBadge({
  status,
}: {
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
}) {
  const statusConfig = {
    pending: {
      label: "결제 대기",
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
      icon: Clock,
    },
    confirmed: {
      label: "결제 완료",
      className: "bg-green-50 text-green-700 border-green-200",
      icon: CheckCircle2,
    },
    shipped: {
      label: "배송 중",
      className: "bg-blue-50 text-blue-700 border-blue-200",
      icon: CheckCircle2,
    },
    delivered: {
      label: "배송 완료",
      className: "bg-gray-50 text-gray-700 border-gray-200",
      icon: CheckCircle2,
    },
    cancelled: {
      label: "취소됨",
      className: "bg-red-50 text-red-700 border-red-200",
      icon: CheckCircle2,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${config.className}`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { orderId } = await params;

  console.group("[OrderPage] 주문 상세 페이지 로드");
  console.log("주문 ID:", orderId);

  // 주문 조회
  const orderResult = await getOrder(orderId);

  if (!orderResult.success || !orderResult.data) {
    console.error("[OrderPage] 주문 조회 실패:", orderResult.error);
    console.groupEnd();
    notFound();
  }

  const order = orderResult.data;

  console.log("[OrderPage] 주문 조회 완료:", order.id);
  console.groupEnd();

  return (
    <main className="min-h-[calc(100vh-80px)] px-4 py-8 lg:py-16">
      <div className="w-full max-w-4xl mx-auto">
        {/* 페이지 헤더 */}
        <div className="mb-6 flex items-center gap-4">
          <Link href="/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              상품 목록으로
            </Button>
          </Link>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
            주문 완료
          </h1>
        </div>

        {/* 주문 완료 메시지 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              주문이 접수되었습니다
            </h2>
          </div>
          <p className="text-gray-600 mb-4">
            주문 번호: <span className="font-mono font-semibold">{order.order_number || order.id}</span>
          </p>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* 주문 상품 목록 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">주문 상품</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
              >
                <Image
                  src="https://via.placeholder.com/80x80?text=No+Image"
                  alt={item.product_name}
                  width={80}
                  height={80}
                  className="rounded-md object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                    {item.product_name}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-600">
                      {formatPrice(item.price)} × {item.quantity}개
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 배송 정보 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">배송 정보</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">받는 분</span>
              <span className="text-gray-900 font-medium">
                {order.shipping_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">연락처</span>
              <span className="text-gray-900 font-medium">
                {order.shipping_phone}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">배송 주소</span>
              <span className="text-gray-900 font-medium text-right max-w-[70%]">
                {order.shipping_address}
              </span>
            </div>
          </div>
        </div>


        {/* 주문 요약 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">주문 요약</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">주문 일시</span>
              <span className="text-gray-900">
                {new Date(order.created_at).toLocaleString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">총 결제 금액</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-4">
          <Link href="/products" className="flex-1">
            <Button variant="outline" className="w-full" size="lg">
              쇼핑 계속하기
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button className="w-full" size="lg">
              홈으로
            </Button>
          </Link>
        </div>

        {/* 주문 상태 안내 */}
        {order.status === "pending" && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ 결제 대기 중입니다. 결제를 완료하면 주문이 확정됩니다.
              <br />
              (Phase 4에서 결제 기능이 추가되면 여기서 결제할 수 있습니다)
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

