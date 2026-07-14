-- ConnLog: events / tags の所有者認可を user_id 基準へ統一する
--
-- 背景:
-- events と tags の既存RLSは、複数の所有者カラムをOR条件で判定していた。
-- カラム同士の一致を保証するDB制約がなかったため、
-- user_idと旧所有者カラムが異なる混在行を作成できる可能性があった。
--
-- 方針:
-- 1. user_idを必須化する
-- 2. 旧所有者カラムとuser_idの一致をDB制約で保証する
-- 3. RLS認可をauth.uid() = user_idへ統一する
-- 4. ポリシーの対象をauthenticatedロールへ限定する

BEGIN;

-- ---------------------------------------------------------------------------
-- 所有者カラムの整合性制約
-- ---------------------------------------------------------------------------

ALTER TABLE public.events
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.tags
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.events
  ADD CONSTRAINT events_owner_columns_match_user_id_check
  CHECK (
    created_by IS NOT NULL
    AND owner_id IS NOT NULL
    AND created_by = user_id
    AND owner_id = user_id::text
  );

ALTER TABLE public.tags
  ADD CONSTRAINT tags_owner_columns_match_user_id_check
  CHECK (
    owner_id IS NOT NULL
    AND created_by_id IS NOT NULL
    AND owner_id = user_id
    AND created_by_id = user_id
  );

-- ---------------------------------------------------------------------------
-- events RLS
-- ---------------------------------------------------------------------------

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS
  "Users can select their own events"
  ON public.events;

DROP POLICY IF EXISTS
  "Users can insert their own events"
  ON public.events;

DROP POLICY IF EXISTS
  "Users can update their own events"
  ON public.events;

DROP POLICY IF EXISTS
  "Users can delete their own events"
  ON public.events;

CREATE POLICY "Users can select their own events"
  ON public.events
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own events"
  ON public.events
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own events"
  ON public.events
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own events"
  ON public.events
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- tags RLS
-- ---------------------------------------------------------------------------

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS
  "Users can manage their own tags"
  ON public.tags;

DROP POLICY IF EXISTS
  "Users can select their own tags"
  ON public.tags;

DROP POLICY IF EXISTS
  "Users can insert their own tags"
  ON public.tags;

DROP POLICY IF EXISTS
  "Users can update their own tags"
  ON public.tags;

DROP POLICY IF EXISTS
  "Users can delete their own tags"
  ON public.tags;

CREATE POLICY "Users can select their own tags"
  ON public.tags
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own tags"
  ON public.tags
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own tags"
  ON public.tags
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own tags"
  ON public.tags
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

COMMIT;
