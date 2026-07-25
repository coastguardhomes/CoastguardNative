-- Audit table for cleanup-inspecciones-fotos Edge Function runs.
-- Use this to prove the job runs daily and see cleanup outcomes.

create table if not exists public.cleanup_inspecciones_fotos_audit (
  id bigserial primary key,
  ran_at timestamptz not null default now(),
  status text not null check (status in ('success', 'partial', 'error', 'heartbeat')),
  retention_days integer not null,
  cutoff_at timestamptz,
  old_db_rows_found integer not null default 0,
  old_storage_objects_found integer not null default 0,
  storage_deleted_attempted integer not null default 0,
  storage_deleted_success integer not null default 0,
  storage_delete_failed integer not null default 0,
  db_rows_deleted integer not null default 0,
  error_message text
);

create index if not exists idx_cleanup_inspecciones_fotos_audit_ran_at
  on public.cleanup_inspecciones_fotos_audit (ran_at desc);

-- Optional hardening:
-- If you use RLS globally, this keeps table private by default.
alter table public.cleanup_inspecciones_fotos_audit enable row level security;

-- Helpful checks for operations:
-- Last 30 runs
-- select id, ran_at, status, db_rows_deleted, storage_deleted_success, storage_delete_failed
-- from public.cleanup_inspecciones_fotos_audit
-- order by ran_at desc
-- limit 30;

-- Daily summary for the last 30 days
-- select
--   date_trunc('day', ran_at) as day,
--   count(*) as runs,
--   sum(db_rows_deleted) as rows_deleted,
--   sum(storage_deleted_success) as files_deleted,
--   sum(storage_delete_failed) as file_delete_failures
-- from public.cleanup_inspecciones_fotos_audit
-- where ran_at >= now() - interval '30 days'
-- group by 1
-- order by 1 desc;
