/**
 * @file app/my-orders/page.tsx
 * @description 주문 내역 목록 페이지
 *
 * 현재 로그인한 사용자의 모든 주문 내역을 목록 형태로 표시하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 사용자별 주문 목록 조회
 * 2. 주문 목록 카드 형태로 표시
 * 3. 주문 상태 표시 (배송 현황)
 * 4. 주문 상세 페이지로 이동
 *
 * @dependencies
 * - actions/orders/get-orders: 주문 목록 조회
 * - lib/cart: formatPrice 함수
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Clock, Package, Truck, XCircle } from "lucide-react";
import { getOrders } from "@/actions/orders/get-orders";
import { formatPrice, formatDate } from "@/lib/utils/format";
import { Order } from "@/types/order";

export const metadata: Metadata = {
  title: "주문 내역",
  description: "주문 내역을 확인할 수 있는 페이지입니다.",
};

/**
 * 주문 상태에 따른 배지 컴포넌트
 * (app/orders/[orderId]/page.tsx와 동일한 컴포넌트)
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
      icon: Truck,
    },
    delivered: {
      label: "배송 완료",
      className: "bg-gray-50 text-gray-700 border-gray-200",
      icon: Package,
    },
    cancelled: {
      label: "취소됨",
      className: "bg-red-50 text-red-700 border-red-200",
      icon: XCircle,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${config.className}`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
}

/**
 * 주문 카드 컴포넌트
 */
function OrderCard({ order }: { order: Order }) {
  const orderDate = formatDate(order.created_at);

  return (
    <Link
      href={`/orders/${order.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* 좌측: 주문 정보 */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                주문번호: {order.order_number}
              </h3>
              <p className="text-sm text-gray-500">{orderDate}</p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
          
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              <span className="font-medium">배송지:</span> {order.shipping_address}
            </p>
            <p>
              <span className="font-medium">수령인:</span> {order.shipping_name}
            </p>
          </div>
        </div>

        {/* 우측: 금액 및 상세보기 */}
        <div className="flex flex-col items-end gap-3">
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">총 결제금액</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(order.total_amount)}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <span>상세보기</span>
          </Button>
        </div>
      </div>
    </Link>
  );
}

/**
 * 빈 주문 목록 컴포넌트
 */
function EmptyOrders() {
  return (
    <div className="text-center py-16">
      <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        주문 내역이 없습니다
      </h3>
      <p className="text-gray-600 mb-6">
        아직 주문한 상품이 없습니다.
      </p>
      <Button asChild>
        <Link href="/products">상품 둘러보기</Link>
      </Button>
    </div>
  );
}

export default async function MyOrdersPage() {
  // 로그인 확인
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // 주문 목록 조회
  const ordersResult = await getOrders();

  if (!ordersResult.success) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Link href="/my-page">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              마이페이지로 돌아가기
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">주문 내역</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">
            {ordersResult.error || "주문 내역을 불러오는데 실패했습니다."}
          </p>
        </div>
      </div>
    );
  }

  const orders = ordersResult.data || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* 헤더 */}
      <div className="mb-6">
        <Link href="/my-page">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            마이페이지로 돌아가기
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">주문 내역</h1>
        <p className="text-gray-600">
          총 {orders.length}개의 주문이 있습니다.
        </p>
      </div>

      {/* 주문 목록 */}
      {orders.length === 0 ? (
        <EmptyOrders />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

