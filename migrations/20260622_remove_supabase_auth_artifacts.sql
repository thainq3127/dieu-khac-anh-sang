-- Remove Supabase Auth dependent database artifacts after migrating to Auth.js.
--
-- Context:
-- This app no longer runs on Supabase Auth. Some exported/migrated database
-- objects may still call Supabase-only helpers such as auth.uid(), auth.jwt(),
-- or request.jwt.claims. On plain PostgreSQL those objects fail with errors like:
--
--   ERROR: schema "auth" does not exist
--   WHERE: PL/pgSQL function log_activity_trigger() line ... at assignment
--
-- This migration removes those Supabase Auth-dependent triggers, policies, and
-- helper functions. It does not drop CMS data tables.
--
-- Important:
-- pg_proc also contains aggregate/window functions such as array_agg. Calling
-- pg_get_functiondef() on aggregates fails, so this script first materializes
-- only normal functions (prokind = 'f') before scanning function bodies.

begin;

-- ---------------------------------------------------------------------------
-- 1. Record normal functions that still reference Supabase Auth/JWT helpers.
-- ---------------------------------------------------------------------------
create temp table _candidate_normal_functions as
select
  p.oid,
  n.nspname as schema_name,
  p.proname as function_name,
  p.oid::regprocedure as signature
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname not in ('pg_catalog', 'information_schema')
  and p.prokind = 'f';

create temp table _supabase_auth_dependent_functions as
select
  f.oid,
  f.schema_name,
  f.function_name,
  f.signature,
  pg_get_functiondef(f.oid) as definition
from _candidate_normal_functions f
where pg_get_functiondef(f.oid) ilike '%auth.uid%'
   or pg_get_functiondef(f.oid) ilike '%auth.jwt%'
   or pg_get_functiondef(f.oid) ilike '%request.jwt.claim%'
   or pg_get_functiondef(f.oid) ilike '%jwt.claims%';

-- Print what will be affected.
do $$
declare
  r record;
begin
  for r in
    select schema_name, signature
    from _supabase_auth_dependent_functions
    order by schema_name, signature::text
  loop
    raise notice 'Supabase Auth dependent function found: %.%', r.schema_name, r.signature;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Drop triggers that call those functions.
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
begin
  for r in
    select
      t.tgrelid::regclass as table_name,
      t.tgname as trigger_name,
      t.tgfoid::regprocedure as trigger_function
    from pg_trigger t
    join _supabase_auth_dependent_functions f on f.oid = t.tgfoid
    where not t.tgisinternal
    order by t.tgrelid::regclass::text, t.tgname
  loop
    raise notice 'Dropping trigger % on % because it calls %', r.trigger_name, r.table_name, r.trigger_function;
    execute format('drop trigger if exists %I on %s', r.trigger_name, r.table_name);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 3. Drop RLS policies that reference Supabase Auth/JWT helpers.
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
begin
  for r in
    select
      schemaname,
      tablename,
      policyname,
      qual,
      with_check
    from pg_policies
    where coalesce(qual, '') ilike '%auth.uid%'
       or coalesce(qual, '') ilike '%auth.jwt%'
       or coalesce(qual, '') ilike '%request.jwt.claim%'
       or coalesce(qual, '') ilike '%jwt.claims%'
       or coalesce(with_check, '') ilike '%auth.uid%'
       or coalesce(with_check, '') ilike '%auth.jwt%'
       or coalesce(with_check, '') ilike '%request.jwt.claim%'
       or coalesce(with_check, '') ilike '%jwt.claims%'
    order by schemaname, tablename, policyname
  loop
    raise notice 'Dropping RLS policy % on %.%', r.policyname, r.schemaname, r.tablename;
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 4. Disable RLS on app-owned public CMS tables.
--
-- The app now does authorization in the Next.js server layer via Auth.js and
-- server actions. Keeping Supabase-era RLS enabled can deny server-side SQL
-- access after policies are removed.
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
begin
  for r in
    select schemaname, tablename
    from pg_tables
    where schemaname = 'public'
      and tablename in (
        'pages',
        'content_blocks',
        'posts',
        'post_categories',
        'map_locations',
        'location_categories',
        'site_settings',
        'activity_logs'
      )
      and rowsecurity = true
    order by tablename
  loop
    raise notice 'Disabling RLS on %.%', r.schemaname, r.tablename;
    execute format('alter table %I.%I disable row level security', r.schemaname, r.tablename);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 5. Drop known Supabase-era activity logging trigger function.
-- ---------------------------------------------------------------------------
drop function if exists public.log_activity_trigger();

-- ---------------------------------------------------------------------------
-- 6. Drop remaining public functions that still reference Supabase Auth/JWT.
--
-- We intentionally avoid CASCADE. If a function is still depended on by another
-- object, this block reports it instead of dropping unexpected dependencies.
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
begin
  for r in
    select signature
    from _supabase_auth_dependent_functions
    where schema_name = 'public'
      and function_name <> 'log_activity_trigger'
    order by signature::text
  loop
    begin
      raise notice 'Dropping remaining Supabase Auth dependent public function %', r.signature;
      execute format('drop function if exists %s', r.signature);
    exception when others then
      raise notice 'Could not drop function %, reason: %', r.signature, sqlerrm;
    end;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 7. Post-migration verification output.
-- ---------------------------------------------------------------------------
do $$
declare
  remaining_count integer;
begin
  select count(*) into remaining_count
  from _candidate_normal_functions f
  where pg_get_functiondef(f.oid) ilike '%auth.uid%'
     or pg_get_functiondef(f.oid) ilike '%auth.jwt%'
     or pg_get_functiondef(f.oid) ilike '%request.jwt.claim%'
     or pg_get_functiondef(f.oid) ilike '%jwt.claims%';

  if remaining_count > 0 then
    raise notice 'WARNING: % function(s) still reference Supabase Auth/JWT helpers. Run the verification queries below.', remaining_count;
  else
    raise notice 'OK: no remaining functions reference Supabase Auth/JWT helpers.';
  end if;
end $$;

commit;

-- ---------------------------------------------------------------------------
-- Optional verification queries to run after this migration.
-- ---------------------------------------------------------------------------
-- Functions still referencing Supabase Auth/JWT helpers:
-- with candidate_normal_functions as (
--   select
--     p.oid,
--     n.nspname as schema_name,
--     p.proname as function_name,
--     p.oid::regprocedure as signature
--   from pg_proc p
--   join pg_namespace n on n.oid = p.pronamespace
--   where n.nspname not in ('pg_catalog', 'information_schema')
--     and p.prokind = 'f'
-- )
-- select
--   schema_name,
--   function_name,
--   signature,
--   pg_get_functiondef(oid) as definition
-- from candidate_normal_functions
-- where pg_get_functiondef(oid) ilike '%auth.uid%'
--    or pg_get_functiondef(oid) ilike '%auth.jwt%'
--    or pg_get_functiondef(oid) ilike '%request.jwt.claim%'
--    or pg_get_functiondef(oid) ilike '%jwt.claims%'
-- order by schema_name, function_name;
--
-- Remaining custom triggers:
-- select
--   tgrelid::regclass as table_name,
--   tgname as trigger_name,
--   tgfoid::regprocedure as trigger_function,
--   pg_get_triggerdef(oid) as trigger_def
-- from pg_trigger
-- where not tgisinternal
-- order by table_name::text, trigger_name;
--
-- Remaining RLS policies:
-- select *
-- from pg_policies
-- where schemaname = 'public'
-- order by schemaname, tablename, policyname;
--
-- Public tables with RLS still enabled:
-- select schemaname, tablename, rowsecurity, forcerowsecurity
-- from pg_tables
-- where schemaname = 'public'
--   and rowsecurity = true
-- order by tablename;
