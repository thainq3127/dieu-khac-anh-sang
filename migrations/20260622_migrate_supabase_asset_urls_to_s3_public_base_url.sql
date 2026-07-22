-- Migrate stored Supabase Storage asset URLs to storage object paths.
--
-- The database should store only object keys/paths such as:
--   uploads/example.jpg
--   migrated/culture-space.jpg
--
-- It should NOT store full public URLs such as:
--   https://hysbamxjgtlxpznkeffa.supabase.co/storage/v1/object/public/media/uploads/example.jpg
--   https://asset.vanhoacham.vrtour.vn/media/uploads/example.jpg
--
-- Run this only after files have been copied into MinIO bucket `media`, preserving
-- the object key after `/media/`.
--
-- Usage for old Supabase URLs:
--   psql "$DATABASE_URL" \
--     -v asset_base_url_to_strip='https://hysbamxjgtlxpznkeffa.supabase.co/storage/v1/object/public/media' \
--     -f migrations/20260622_migrate_supabase_asset_urls_to_s3_public_base_url.sql
--
-- If the database already contains full MinIO public URLs, run again with:
--   psql "$DATABASE_URL" \
--     -v asset_base_url_to_strip='https://asset.vanhoacham.vrtour.vn/media' \
--     -f migrations/20260622_migrate_supabase_asset_urls_to_s3_public_base_url.sql
--
-- Do not include a trailing slash in asset_base_url_to_strip.

\set ON_ERROR_STOP on

begin;

create temp table _asset_url_migration_config as
select regexp_replace(:'asset_base_url_to_strip', '/+$', '') as base_url;

do $$
declare
  base text;
begin
  select base_url into base from _asset_url_migration_config;

  if base is null or base = '' then
    raise exception 'asset_base_url_to_strip is required. Pass it with psql -v asset_base_url_to_strip=...';
  end if;

  raise notice 'Asset base URL to strip: %', base;
end $$;

create temp table _asset_url_candidate_columns as
>>>>>>> c4a9f1a3d46c57144e0035d9ce27c604a9606858
select
  c.table_schema,
  c.table_name,
  c.column_name,
<<<<<<< HEAD
  c.data_type
=======
  c.data_type,
  c.udt_name
>>>>>>> c4a9f1a3d46c57144e0035d9ce27c604a9606858
from information_schema.columns c
join information_schema.tables t
  on t.table_schema = c.table_schema
 and t.table_name = c.table_name
where c.table_schema = 'public'
  and t.table_type = 'BASE TABLE'
<<<<<<< HEAD
  and c.is_generated = 'NEVER'
  and c.data_type in ('text', 'character varying', 'character', 'json', 'jsonb')
order by c.table_schema, c.table_name, c.ordinal_position;

do $$
declare
  cfg record;
  col record;
  matched_rows bigint;
begin
  select * into cfg from _asset_url_migration_config;

  for col in
    select * from _asset_url_migration_columns
    order by table_schema, table_name, column_name
  loop
    execute format(
      'select count(*) from %I.%I where %I::text like $1',
      col.table_schema,
      col.table_name,
      col.column_name
    )
    into matched_rows
    using '%' || cfg.old_base_url || '%';

    update _asset_url_migration_columns
       set before_old_count = matched_rows
     where table_schema = col.table_schema
       and table_name = col.table_name
       and column_name = col.column_name;
  end loop;
end $$;

do $$
declare
  col record;
begin
  for col in
    select *
    from _asset_url_migration_columns
    where before_old_count > 0
    order by table_schema, table_name, column_name
  loop
    raise notice 'Before migration: %.% column % contains % row(s) with old asset URL',
      col.table_schema,
      col.table_name,
      col.column_name,
      col.before_old_count;
  end loop;

  if not exists (select 1 from _asset_url_migration_columns where before_old_count > 0) then
    raise notice 'Before migration: no rows containing old asset URL were found in public text/json/jsonb columns';
  end if;
end $$;

do $$
declare
  cfg record;
  col record;
  replacement_expression text;
  affected_rows bigint;
begin
  select * into cfg from _asset_url_migration_config;

  for col in
    select *
    from _asset_url_migration_columns
    where before_old_count > 0
    order by table_schema, table_name, column_name
  loop
    replacement_expression := case col.data_type
      when 'jsonb' then format('replace(%I::text, $1, $2)::jsonb', col.column_name)
      when 'json' then format('replace(%I::text, $1, $2)::json', col.column_name)
      else format('replace(%I::text, $1, $2)', col.column_name)
    end;

    execute format(
      'update %I.%I set %I = %s where %I::text like $3',
      col.table_schema,
      col.table_name,
      col.column_name,
      replacement_expression,
      col.column_name
    )
    using cfg.old_base_url, cfg.new_base_url, '%' || cfg.old_base_url || '%';

    get diagnostics affected_rows = row_count;

    update _asset_url_migration_columns
       set updated_rows = affected_rows
     where table_schema = col.table_schema
       and table_name = col.table_name
       and column_name = col.column_name;

    raise notice 'Updated %.% column %: % row(s)',
      col.table_schema,
      col.table_name,
      col.column_name,
      affected_rows;
  end loop;
end $$;

do $$
declare
  cfg record;
  col record;
  old_rows bigint;
  new_rows bigint;
  remaining_old bigint;
  total_new bigint;
begin
  select * into cfg from _asset_url_migration_config;

  for col in
    select * from _asset_url_migration_columns
    order by table_schema, table_name, column_name
  loop
    execute format(
      'select count(*) from %I.%I where %I::text like $1',
      col.table_schema,
      col.table_name,
      col.column_name
    )
    into old_rows
    using '%' || cfg.old_base_url || '%';

    execute format(
      'select count(*) from %I.%I where %I::text like $1',
      col.table_schema,
      col.table_name,
      col.column_name
    )
    into new_rows
    using '%' || cfg.new_base_url || '%';

    update _asset_url_migration_columns
       set after_old_count = old_rows,
           after_new_count = new_rows
     where table_schema = col.table_schema
       and table_name = col.table_name
       and column_name = col.column_name;
  end loop;

  select coalesce(sum(after_old_count), 0), coalesce(sum(after_new_count), 0)
    into remaining_old, total_new
  from _asset_url_migration_columns;

  raise notice 'After migration: % old asset URL row occurrence(s) remain in scanned columns', remaining_old;
  raise notice 'After migration: % new asset URL row occurrence(s) exist in scanned columns', total_new;

  if remaining_old > 0 then
    raise exception 'Old Supabase asset URLs remain after migration';
  end if;
end $$;

select
  table_schema,
  table_name,
  column_name,
  data_type,
  before_old_count,
  updated_rows,
  after_old_count,
  after_new_count
from _asset_url_migration_columns
where before_old_count > 0
   or updated_rows > 0
   or after_old_count > 0
   or after_new_count > 0
order by table_schema, table_name, column_name;

commit;
=======
  and (
    c.data_type in ('text', 'character varying', 'character', 'json', 'jsonb')
    or c.udt_name in ('text', 'varchar', 'bpchar', 'json', 'jsonb')
  )
order by c.table_schema, c.table_name, c.ordinal_position;

create temp table _asset_url_migration_before as
select
  table_schema text,
  table_name text,
  column_name text,
  data_type text,
  match_count bigint
with no data;

do $$
declare
  r record;
  base text;
  matched bigint;
begin
  select base_url into base from _asset_url_migration_config;

  for r in select * from _asset_url_candidate_columns loop
    execute format(
      'select count(*) from %I.%I where %I is not null and %I::text like %L',
      r.table_schema,
      r.table_name,
      r.column_name,
      r.column_name,
      '%' || base || '/%'
    ) into matched;

    if matched > 0 then
      insert into _asset_url_migration_before(table_schema, table_name, column_name, data_type, match_count)
      values (r.table_schema, r.table_name, r.column_name, r.data_type, matched);
      raise notice 'Found % row(s) containing full asset URL in %.%', matched, r.table_name, r.column_name;
    end if;
  end loop;
end $$;

create temp table _asset_url_migration_updates as
select
  table_schema text,
  table_name text,
  column_name text,
  data_type text,
  updated_rows bigint
with no data;

do $$
declare
  r record;
  base text;
  affected bigint;
  update_sql text;
begin
  select base_url into base from _asset_url_migration_config;

  for r in select * from _asset_url_migration_before loop
    if r.data_type in ('json', 'jsonb') then
      update_sql := format(
        'update %I.%I set %I = replace(%I::text, %L, '''')::%s where %I is not null and %I::text like %L',
        r.table_schema,
        r.table_name,
        r.column_name,
        r.column_name,
        base || '/',
        r.data_type,
        r.column_name,
        r.column_name,
        '%' || base || '/%'
      );
    else
      update_sql := format(
        'update %I.%I set %I = replace(%I::text, %L, '''') where %I is not null and %I::text like %L',
        r.table_schema,
        r.table_name,
        r.column_name,
        r.column_name,
        base || '/',
        r.column_name,
        r.column_name,
        '%' || base || '/%'
      );
    end if;

    execute update_sql;
    get diagnostics affected = row_count;

    insert into _asset_url_migration_updates(table_schema, table_name, column_name, data_type, updated_rows)
    values (r.table_schema, r.table_name, r.column_name, r.data_type, affected);
    raise notice 'Updated % row(s) in %.%', affected, r.table_name, r.column_name;
  end loop;
end $$;

do $$
declare
  base text;
  remaining bigint := 0;
  matched bigint;
  r record;
begin
  select base_url into base from _asset_url_migration_config;

  for r in select * from _asset_url_candidate_columns loop
    execute format(
      'select count(*) from %I.%I where %I is not null and %I::text like %L',
      r.table_schema,
      r.table_name,
      r.column_name,
      r.column_name,
      '%' || base || '/%'
    ) into matched;

    remaining := remaining + matched;
    if matched > 0 then
      raise notice 'WARNING: % full URL row(s) still remain in %.%', matched, r.table_name, r.column_name;
    end if;
  end loop;

  if remaining > 0 then
    raise exception 'Asset URL path migration incomplete: % full URL row(s) still remain in scanned columns.', remaining;
  end if;

  raise notice 'OK: scanned public text/json columns no longer contain this asset base URL.';
end $$;

do $$
declare
  old_matches bigint;
  updated_rows bigint;
begin
  select coalesce(sum(match_count), 0) into old_matches
  from _asset_url_migration_before;

  select coalesce(sum(updated_rows), 0) into updated_rows
  from _asset_url_migration_updates;

  raise notice 'Asset URL path migration summary: matched row count total before migration = %, updated row count total = %', old_matches, updated_rows;
end $$;

commit;

-- Optional post-run check:
-- select 'content_blocks.content' as location, count(*) from public.content_blocks where content::text like '%supabase.co/storage/v1/object/public/media%'
-- union all
-- select 'content_blocks.audio_url', count(*) from public.content_blocks where coalesce(audio_url, '') like '%supabase.co/storage/v1/object/public/media%'
-- union all
-- select 'pages.seo_image', count(*) from public.pages where coalesce(seo_image, '') like '%supabase.co/storage/v1/object/public/media%'
-- union all
-- select 'pages.audio_url', count(*) from public.pages where coalesce(audio_url, '') like '%supabase.co/storage/v1/object/public/media%'
-- union all
-- select 'posts.cover_image', count(*) from public.posts where coalesce(cover_image, '') like '%supabase.co/storage/v1/object/public/media%'
-- union all
-- select 'posts.content', count(*) from public.posts where content::text like '%supabase.co/storage/v1/object/public/media%'
-- union all
-- select 'site_settings.value', count(*) from public.site_settings where value::text like '%supabase.co/storage/v1/object/public/media%';
>>>>>>> c4a9f1a3d46c57144e0035d9ce27c604a9606858
