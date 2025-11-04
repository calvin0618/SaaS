/**
 * @file message.tsx
 * @description 메시지 표시 컴포넌트
 *
 * alert() 대신 사용하는 간단한 메시지 표시 컴포넌트입니다.
 */

"use client";

import { useEffect } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function Message({
  message,
  type = "info",
  onClose,
  autoClose = false,
  duration = 3000,
}: MessageProps) {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const typeConfig = {
    success: {
      className: "bg-green-50 border-green-200 text-green-800",
      icon: CheckCircle2,
    },
    error: {
      className: "bg-red-50 border-red-200 text-red-800",
      icon: AlertCircle,
    },
    info: {
      className: "bg-blue-50 border-blue-200 text-blue-800",
      icon: Info,
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg max-w-md",
        config.className
      )}
      role="alert"
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 text-current opacity-70 hover:opacity-100 transition-opacity"
          aria-label="닫기"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

