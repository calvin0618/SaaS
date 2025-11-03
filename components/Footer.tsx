/**
 * @file Footer.tsx
 * @description 사이트 하단 푸터 컴포넌트
 *
 * 사이트의 하단 네비게이션, 저작권 정보, 링크를 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 사이트 링크 네비게이션
 * 2. 저작권 정보 표시
 * 3. 반응형 디자인
 *
 * @dependencies
 * - next/link: 페이지 네비게이션
 */

import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* 회사 정보 */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-900">
              의류 쇼핑몰
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              다양한 스타일의 의류를 만나보세요
            </p>
          </div>

          {/* 빠른 링크 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
              빠른 링크
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  홈
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  상품 목록
                </Link>
              </li>
            </ul>
          </div>

          {/* 고객 지원 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
              고객 지원
            </h4>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-gray-600">이메일: support@example.com</span>
              </li>
              <li>
                <span className="text-sm text-gray-600">전화: 1588-0000</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 저작권 */}
        <div className="border-t border-gray-200 pt-8 mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              © {currentYear} 의류 쇼핑몰. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-600">
              <Link
                href="/terms"
                className="hover:text-gray-900 transition-colors"
              >
                이용약관
              </Link>
              <Link
                href="/privacy"
                className="hover:text-gray-900 transition-colors"
              >
                개인정보처리방침
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

