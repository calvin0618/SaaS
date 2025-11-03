/**
 * @file order-form.tsx
 * @description 주문 폼 컴포넌트
 *
 * 배송 정보를 입력받는 폼 컴포넌트입니다.
 * React Hook Form과 Zod를 사용한 유효성 검사를 포함합니다.
 *
 * @dependencies
 * - react-hook-form: 폼 상태 관리
 * - zod: 스키마 검증
 * - @hookform/resolvers: Zod 리졸버
 * - components/ui: shadcn/ui 컴포넌트
 */

"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Zod 스키마 정의
const orderFormSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요.").max(50, "이름은 50자 이하여야 합니다."),
  address: z
    .string()
    .min(5, "주소를 입력해주세요.")
    .max(200, "주소는 200자 이하여야 합니다."),
  phone: z
    .string()
    .min(10, "연락처를 입력해주세요.")
    .regex(/^[0-9-]+$/, "연락처는 숫자와 하이픈(-)만 사용할 수 있습니다."),
  order_note: z.string().max(500, "주문 메모는 500자 이하여야 합니다.").optional().nullable(),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;

interface OrderFormProps {
  onSubmit: (data: OrderFormValues) => void;
  isSubmitting?: boolean;
}

export function OrderForm({ onSubmit, isSubmitting = false }: OrderFormProps) {
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      order_note: null,
    },
  });

  // 외부에서 폼 제출을 트리거하기 위한 ref
  const formRef = React.useRef<HTMLFormElement>(null);

  // 외부에서 제출할 수 있도록 폼 ref를 전역에 노출
  React.useEffect(() => {
    if (formRef.current) {
      (window as any).__checkoutFormRef = formRef.current;
    }
    return () => {
      delete (window as any).__checkoutFormRef;
    };
  }, []);

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* 이름 */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>받는 분 이름 *</FormLabel>
              <FormControl>
                <Input placeholder="홍길동" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 주소 */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>배송 주소 *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="서울시 강남구 테헤란로 123"
                  className="min-h-[100px]"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 연락처 */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>연락처 *</FormLabel>
              <FormControl>
                <Input placeholder="010-1234-5678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 주문 메모 */}
        <FormField
          control={form.control}
          name="order_note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>주문 메모 (선택사항)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="배송 시 요청사항을 입력해주세요."
                  className="min-h-[80px]"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

