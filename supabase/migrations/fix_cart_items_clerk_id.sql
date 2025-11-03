-- ==========================================
-- cart_items 및 orders 테이블에 clerk_id 컬럼 추가
-- 기존 user_id 기반 스키마를 clerk_id 기반으로 변경
-- 
-- ⚠️ 중요: 이 마이그레이션은 Supabase 대시보드의 SQL Editor에서 실행해야 합니다.
-- 실행 순서:
-- 1. Supabase 대시보드 접속
-- 2. SQL Editor 열기
-- 3. 아래 SQL 전체를 복사하여 실행
-- ==========================================

-- ==========================================
-- PART 1: cart_items 테이블 마이그레이션
-- ==========================================

-- 1-1. cart_items 테이블에 clerk_id 컬럼 추가
ALTER TABLE public.cart_items 
ADD COLUMN IF NOT EXISTS clerk_id TEXT;

-- 1-2. 기존 데이터 마이그레이션 (user_id를 통해 users 테이블의 clerk_id 가져오기)
-- 참고: 현재 데이터가 없으면 이 UPDATE는 아무것도 변경하지 않습니다.
UPDATE public.cart_items
SET clerk_id = (SELECT clerk_id FROM public.users WHERE id = cart_items.user_id)
WHERE clerk_id IS NULL AND user_id IS NOT NULL;

-- 1-3. clerk_id를 NOT NULL로 설정
-- 데이터가 없는 경우 안전하게 실행됩니다.
ALTER TABLE public.cart_items
ALTER COLUMN clerk_id SET NOT NULL;

-- 1-4. 기존 UNIQUE 제약 조건 제거 (user_id 기반이 있다면)
ALTER TABLE public.cart_items
DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_key;

-- 1-5. 새로운 UNIQUE 제약 조건 추가 (clerk_id, product_id)
ALTER TABLE public.cart_items
DROP CONSTRAINT IF EXISTS cart_items_clerk_id_product_id_key;

ALTER TABLE public.cart_items
ADD CONSTRAINT cart_items_clerk_id_product_id_key UNIQUE (clerk_id, product_id);

-- 1-6. 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_cart_items_clerk_id ON public.cart_items(clerk_id);

-- ==========================================
-- PART 2: orders 테이블 마이그레이션
-- ==========================================

-- 2-1. orders 테이블에 clerk_id 컬럼 추가
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS clerk_id TEXT;

-- 2-2. 기존 데이터 마이그레이션 (user_id를 통해 users 테이블의 clerk_id 가져오기)
UPDATE public.orders
SET clerk_id = (SELECT clerk_id FROM public.users WHERE id = orders.user_id)
WHERE clerk_id IS NULL AND user_id IS NOT NULL;

-- 2-3. clerk_id를 NOT NULL로 설정
ALTER TABLE public.orders
ALTER COLUMN clerk_id SET NOT NULL;

-- 2-4. 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_orders_clerk_id ON public.orders(clerk_id);

-- ==========================================
-- PART 3: 마이그레이션 확인
-- ==========================================

-- cart_items 테이블 구조 확인
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'cart_items'
ORDER BY ordinal_position;

-- orders 테이블 구조 확인
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'orders'
ORDER BY ordinal_position;

