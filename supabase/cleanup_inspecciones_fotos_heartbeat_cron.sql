-- Heartbeat job for cleanup-inspecciones-fotos automation.
-- Purpose: prove scheduler execution independently from function execution.

create extension if not exists pg_cron;

-- Ensure heartbeat status is accepted even if the original table/check already existed.
do $$
begin
  if exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where c.conname = 'cleanup_inspecciones_fotos_audit_status_check'
      and n.nspname = 'public'
      and t.relname = 'cleanup_inspecciones_fotos_audit'
  ) then
    alter table public.cleanup_inspecciones_fotos_audit
      drop constraint cleanup_inspecciones_fotos_audit_status_check;
  end if;

  alter table public.cleanup_inspecciones_fotos_audit
    add constraint cleanup_inspecciones_fotos_audit_status_check
    check (status in ('success', 'partial', 'error', 'heartbeat'));
exception
  when duplicate_object then null;
end $$;

-- Remove previous heartbeat job if it exists.
select cron.unschedule('cleanup-inspecciones-fotos-heartbeat-daily')
where exists (
  select 1
  from cron.job
  where jobname = 'cleanup-inspecciones-fotos-heartbeat-daily'
);

-- Run 5 minutes before the cleanup function job (default 03:00 in cron script).
select
  cron.schedule(
    'cleanup-inspecciones-fotos-heartbeat-daily',
    '55 2 * * *',
    $$
    insert into public.cleanup_inspecciones_fotos_audit (
      ran_at,
      status,
      retention_days,
      cutoff_at,
      old_db_rows_found,
      old_storage_objects_found,
      storage_deleted_attempted,
      storage_deleted_success,
      storage_delete_failed,
      db_rows_deleted,
      error_message
    )
    values (
      now(),
      'heartbeat',
      60,
      now() - interval '60 days',
      0,
      0,
      0,
      0,
      0,
      0,
      'Scheduler heartbeat before cleanup function trigger'
    );
    $$
  );

-- Suggested diagnostics:
-- 1) Last 20 audit rows
-- select id, ran_at, status, error_message
-- from public.cleanup_inspecciones_fotos_audit
-- order by ran_at desc
-- limit 20;

-- 2) Heartbeat rows that were not followed by function run in 30 minutes
-- select h.id, h.ran_at
-- from public.cleanup_inspecciones_fotos_audit h
-- where h.status = 'heartbeat'
--   and h.ran_at >= now() - interval '30 days'
--   and not exists (
--     select 1
--     from public.cleanup_inspecciones_fotos_audit f
--     where f.status in ('success', 'partial', 'error')
--       and f.ran_at >= h.ran_at
--       and f.ran_at < h.ran_at + interval '30 minutes'
--   )
-- order by h.ran_at desc;
