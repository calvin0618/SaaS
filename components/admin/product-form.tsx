/**
 * @file product-form.tsx
 * @description 어드민 상품 생성/수정 폼 컴포넌트
 *
 * 상품을 생성하거나 수정하는 폼 컴포넌트입니다.
 * React Hook Form과 Zod를 사용한 유효성 검사를 포함합니다.
 *
 * @dependencies
 * - react-hook-form: 폼 상태 관리
 * - zod: 스키마 검증
 * - @hookform/resolvers: Zod 리졸버
 * - actions/admin: 상품 CRUD Server Actions
 * - components/ui: shadcn/ui 컴포넌트
 */

"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Message } from "@/components/ui/message";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product } from "@/types/product";
import { createProduct } from "@/actions/admin/create-product";
import { updateProduct } from "@/actions/admin/update-product";

// Zod 스키마 정의
const productFormSchema = z.object({
  name: z.string().min(1, "상품명을 입력해주세요.").max(200, "상품명은 200자 이하여야 합니다."),
  description: z.string().max(2000, "설명은 2000자 이하여야 합니다.").nullable().optional(),
  price: z
    .number({ required_error: "가격을 입력해주세요." })
    .min(0, "가격은 0원 이상이어야 합니다.")
    .max(999999999, "가격은 999,999,999원 이하여야 합니다."),
  category: z.string().nullable().optional(),
  stock_quantity: z
    .number({ required_error: "재고 수량을 입력해주세요." })
    .int("재고 수량은 정수여야 합니다.")
    .min(0, "재고 수량은 0개 이상이어야 합니다.")
    .max(999999, "재고 수량은 999,999개 이하여야 합니다."),
  is_active: z.boolean().default(true),
  image_url: z.string().url("올바른 URL 형식이 아닙니다.").nullable().optional().or(z.literal("")),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product;
  onSuccess?: () => void;
}

const categories = [
  { value: "electronics", label: "전자제품" },
  { value: "clothing", label: "의류" },
  { value: "books", label: "도서" },
  { value: "food", label: "식품" },
  { value: "sports", label: "스포츠" },
  { value: "beauty", label: "뷰티" },
  { value: "home", label: "생활/가정" },
];

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const isEdit = !!product;
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || 0,
      category: product?.category || null,
      stock_quantity: product?.stock_quantity || 0,
      is_active: product?.is_active ?? true,
      image_url: product?.image_url || "",
    },
  });

  // 상품 정보가 변경되면 폼 업데이트
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description || "",
        price: product.price,
        category: product.category || null,
        stock_quantity: product.stock_quantity,
        is_active: product.is_active,
        image_url: product.image_url || "",
      });
    }
  }, [product, form]);

  const onSubmit = async (values: ProductFormValues) => {
    try {
      if (isEdit && product) {
        // 수정
        const result = await updateProduct({
          id: product.id,
          name: values.name,
          description: values.description || null,
          price: values.price,
          category: values.category || null,
          stock_quantity: values.stock_quantity,
          is_active: values.is_active,
          image_url: values.image_url || null,
        });

        if (result.success) {
          setMessage({
            text: result.message || "상품이 수정되었습니다.",
            type: "success",
          });
          onSuccess?.();
        } else {
          setMessage({
            text: result.error || "상품 수정에 실패했습니다.",
            type: "error",
          });
        }
      } else {
        // 생성
        const result = await createProduct({
          name: values.name,
          description: values.description || null,
          price: values.price,
          category: values.category || null,
          stock_quantity: values.stock_quantity,
          is_active: values.is_active,
          image_url: values.image_url || null,
        });

        if (result.success) {
          setMessage({
            text: "상품이 생성되었습니다.",
            type: "success",
          });
          form.reset();
          onSuccess?.();
        } else {
          setMessage({
            text: result.error || "상품 생성에 실패했습니다.",
            type: "error",
          });
        }
      }
    } catch (error) {
      console.error("상품 저장 실패:", error);
      setMessage({
        text: "상품 저장에 실패했습니다.",
        type: "error",
      });
    }
  };

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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 상품명 */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>상품명 *</FormLabel>
              <FormControl>
                <Input placeholder="상품명을 입력하세요" {...field} />
              </FormControl>
              <FormDescription>상품의 이름을 입력하세요 (최대 200자)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 설명 */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>상품 설명</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="상품 설명을 입력하세요"
                  className="min-h-[100px]"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>상품에 대한 상세 설명을 입력하세요 (선택사항)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 가격 */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>가격 (원) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                    value={field.value || 0}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 재고 수량 */}
          <FormField
            control={form.control}
            name="stock_quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>재고 수량 *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                    value={field.value || 0}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 카테고리 */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>카테고리</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리를 선택하세요" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">카테고리 없음</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>상품의 카테고리를 선택하세요 (선택사항)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 이미지 URL */}
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이미지 URL</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>상품 이미지의 URL을 입력하세요 (선택사항)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 활성 상태 */}
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>판매 상태</FormLabel>
                <FormDescription>상품을 판매할지 여부를 선택하세요</FormDescription>
              </div>
              <FormControl>
                <button
                  type="button"
                  onClick={() => field.onChange(!field.value)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    field.value ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      field.value ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </FormControl>
            </FormItem>
          )}
        />

        {/* 제출 버튼 */}
        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "저장 중..."
              : isEdit
              ? "상품 수정"
              : "상품 생성"}
          </Button>
        </div>
      </form>
    </Form>
    </>
  );
}

