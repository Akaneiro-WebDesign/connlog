-- 現行DBでトリガーや依存オブジェクトから使用されていない
-- public.set_user_id()を削除する。
-- CASCADEは使用せず、想定外の依存関係がある場合は削除を失敗させる。

BEGIN;

DROP FUNCTION IF EXISTS public.set_user_id() RESTRICT;

COMMIT;

-- Verification:
-- 次のSQLを実行し、NULLが返ることを確認する。
--
-- SELECT to_regprocedure('public.set_user_id()');
