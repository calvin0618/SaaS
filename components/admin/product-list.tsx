/**
 * @file product-list.tsx
 * @description 어드민 상품 목록 컴포넌트
 *
 * 상품 목록을 표시하고, 생성/수정/삭제 기능을 제공하는 클라이언트 컴포넌트입니다.
 *
 * @dependencies
 * - actions/admin: 상품 CRUD Server Actions
 * - components/admin/product-form: 상품 생성/수정 폼
 * - types/product: Product 타입
 */

"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { ProductForm } from "./product-form";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { Message } from "@/components/ui/message";
import {
  deleteProduct,
  type DeleteProductResult,
} from "@/actions/admin/delete-product";
import { toggleProductStatus } from "@/actions/admin/toggle-product-status";
import { updateStock } from "@/actions/admin/update-stock";
import { getAllProducts } from "@/actions/admin/get-all-products";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ProductListProps {
  initialProducts: Product[];
}

export function ProductList({ initialProducts }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // 상품 목록 새로고침
  const refreshProducts = async () => {
    setIsLoading(true);
    try {
      const result = await getAllProducts();
      if (result.success && result.data) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error("상품 목록 새로고침 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 상품 삭제
  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`"${productName}" 상품을 정말 삭제하시겠습니까?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const result: DeleteProductResult = await deleteProduct({ id: productId });
      if (result.success) {
        setMessage({
          text: result.message || "상품이 삭제되었습니다.",
          type: "success",
        });
        await refreshProducts();
      } else {
        setMessage({
          text: result.error || "상품 삭제에 실패했습니다.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("상품 삭제 실패:", error);
      setMessage({
        text: "상품 삭제에 실패했습니다.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 상품 상태 토글
  const handleToggleStatus = async (product: Product) => {
    setIsLoading(true);
    try {
      const result = await toggleProductStatus({
        productId: product.id,
        isActive: !product.is_active,
      });
      if (result.success) {
        await refreshProducts();
      } else {
        setMessage({
          text: result.error || "상품 상태 변경에 실패했습니다.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("상품 상태 변경 실패:", error);
      setMessage({
        text: "상품 상태 변경에 실패했습니다.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 재고 수량 변경
  const handleUpdateStock = async (productId: string, newStock: number) => {
    if (newStock < 0) {
      setMessage({
        text: "재고 수량은 0개 이상이어야 합니다.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateStock({
        productId,
        stockQuantity: newStock,
      });
      if (result.success) {
        await refreshProducts();
      } else {
        setMessage({
          text: result.error || "재고 수량 변경에 실패했습니다.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("재고 수량 변경 실패:", error);
      setMessage({
        text: "재고 수량 변경에 실패했습니다.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // formatPrice와 getCategoryLabel은 lib/utils/format.ts의 공통 함수 사용

  return (
    <>
      {message && (
        <Message
          message={message.text}
          type={message.type}
          onClose={() => setMessage(null)}
          autoClose={true}
          duration={3000}
        />
      )}
      <div className="space-y-6">
        {/* 상단 액션 버튼 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-gray-600" />
          <span className="text-gray-600">
            총 {products.length}개 상품
          </span>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              상품 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>새 상품 추가</DialogTitle>
            </DialogHeader>
            <ProductForm
              onSuccess={() => {
                setIsCreateModalOpen(false);
                refreshProducts();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* 상품 목록 테이블 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  상품명
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  카테고리
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  가격
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  재고
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  상태
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  등록일
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    등록된 상품이 없습니다.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      {product.description && (
                        <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                          {product.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {getCategoryLabel(product.category)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        value={product.stock_quantity}
                        onChange={(e) => {
                          const newStock = parseInt(e.target.value, 10);
                          if (!isNaN(newStock)) {
                            handleUpdateStock(product.id, newStock);
                          }
                        }}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleStatus(product)}
                        disabled={isLoading}
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          product.is_active
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        } transition-colors disabled:opacity-50`}
                      >
                        {product.is_active ? "활성" : "비활성"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(product.created_at, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsEditModalOpen(true);
                          }}
                          disabled={isLoading}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={isLoading}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 수정 모달 */}
      {selectedProduct && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>상품 수정</DialogTitle>
            </DialogHeader>
            <ProductForm
              product={selectedProduct}
              onSuccess={() => {
                setIsEditModalOpen(false);
                setSelectedProduct(null);
                refreshProducts();
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
    </>
  );
}

