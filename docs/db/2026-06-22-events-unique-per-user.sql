-- Change events uniqueness from global event_id to per-user event_id.
--
-- Before:
--   UNIQUE (event_id)
--
-- After:
--   UNIQUE (user_id, event_id)
--
-- This allows different users to register the same connpass event,
-- while still preventing the same user from registering the same event twice.

begin;

alter table public.events
drop constraint if exists events_event_id_key;

alter table public.events
add constraint events_user_id_event_id_key
unique (user_id, event_id);

commit;

-- Verification:
--
-- select
--   c.conname,
--   c.contype,
--   pg_get_constraintdef(c.oid) as definition
-- from pg_constraint c
-- join pg_class t
--   on c.conrelid = t.oid
-- join pg_namespace n
--   on t.relnamespace = n.oid
-- where
--   n.nspname = 'public'
--   and t.relname = 'events'
-- order by c.conname;
