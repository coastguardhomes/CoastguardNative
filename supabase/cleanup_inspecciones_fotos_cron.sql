-- Daily cleanup for old inspection photos and their DB rows.
-- This schedules the Edge Function cleanup-inspecciones-fotos to run once per day.
-- Retention policy is implemented in the function (60 days).

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Remove previous job if it already exists.
select cron.unschedule('cleanup-inspecciones-fotos-daily')
where exists (
  select 1
  from cron.job
  where jobname = 'cleanup-inspecciones-fotos-daily'
);

-- IMPORTANT:
-- Replace these placeholders before running:
--   <PROJECT-REF>               e.g. abcdefghijklmnop
--   <SUPABASE_SERVICE_ROLE_KEY> from project settings

select
  cron.schedule(
    'cleanup-inspecciones-fotos-daily',
    '0 3 * * *',
    $$
    select
      net.http_post(
        url := 'https://<PROJECT-REF>.functions.supabase.co/cleanup-inspecciones-fotos',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer <SUPABASE_SERVICE_ROLE_KEY>'
        ),
        body := '{}'::jsonb
      ) as request_id;
    $$
  );

-- Optional: verify active cron jobs
-- select jobid, jobname, schedule, active from cron.job order by jobid desc;
