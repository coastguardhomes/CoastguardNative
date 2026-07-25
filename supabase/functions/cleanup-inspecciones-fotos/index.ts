import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

const RETENTION_DAYS = 60;
const PHOTOS_BUCKET = "inspecciones";
const PHOTO_TABLE = "fotos_inspeccion";
const AUDIT_TABLE = "cleanup_inspecciones_fotos_audit";
const DELETE_CHUNK_SIZE = 100;

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function extractPathFromUrl(url: string, bucket: string): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const path = parsed.pathname;

    const markers = [
      `/storage/v1/object/public/${bucket}/`,
      `/storage/v1/object/sign/${bucket}/`,
      `/storage/v1/object/authenticated/${bucket}/`,
    ];

    for (const marker of markers) {
      const index = path.indexOf(marker);
      if (index !== -1) {
        const objectPath = path.slice(index + marker.length);
        return decodeURIComponent(objectPath);
      }
    }

    return null;
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response("Missing Authorization header", { status: 401 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response("Missing required environment variables", { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  async function writeAuditLog(payload: {
    status: "success" | "partial" | "error";
    cutoff_at: string | null;
    old_db_rows_found?: number;
    old_storage_objects_found?: number;
    storage_deleted_attempted?: number;
    storage_deleted_success?: number;
    storage_delete_failed?: number;
    db_rows_deleted?: number;
    error_message?: string | null;
  }) {
    const { error } = await supabase.from(AUDIT_TABLE).insert({
      ran_at: new Date().toISOString(),
      status: payload.status,
      retention_days: RETENTION_DAYS,
      cutoff_at: payload.cutoff_at,
      old_db_rows_found: payload.old_db_rows_found ?? 0,
      old_storage_objects_found: payload.old_storage_objects_found ?? 0,
      storage_deleted_attempted: payload.storage_deleted_attempted ?? 0,
      storage_deleted_success: payload.storage_deleted_success ?? 0,
      storage_delete_failed: payload.storage_delete_failed ?? 0,
      db_rows_deleted: payload.db_rows_deleted ?? 0,
      error_message: payload.error_message ?? null,
    });

    if (error) {
      console.error("Failed to write cleanup audit log:", error);
    }
  }

  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
  const cutoffIso = cutoff.toISOString();

  try {
    const { data: oldPhotoRows, error: oldPhotoRowsError } = await supabase
      .from(PHOTO_TABLE)
      .select("id, url, created_at")
      .lt("created_at", cutoffIso);

    if (oldPhotoRowsError) {
      console.error("Error reading old photo rows:", oldPhotoRowsError);
      await writeAuditLog({
        status: "error",
        cutoff_at: cutoffIso,
        error_message: oldPhotoRowsError.message,
      });
      return new Response(JSON.stringify({ error: oldPhotoRowsError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data: oldStorageObjects, error: oldStorageObjectsError } = await supabase
      .schema("storage")
      .from("objects")
      .select("name, created_at")
      .eq("bucket_id", PHOTOS_BUCKET)
      .lt("created_at", cutoffIso);

    if (oldStorageObjectsError) {
      console.error("Error reading old storage objects:", oldStorageObjectsError);
      await writeAuditLog({
        status: "error",
        cutoff_at: cutoffIso,
        old_db_rows_found: oldPhotoRows?.length ?? 0,
        error_message: oldStorageObjectsError.message,
      });
      return new Response(JSON.stringify({ error: oldStorageObjectsError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const pathsFromDb = (oldPhotoRows ?? [])
      .map((row) => extractPathFromUrl(row.url, PHOTOS_BUCKET))
      .filter((value): value is string => Boolean(value));

    const pathsFromBucket = (oldStorageObjects ?? []).map((obj) => obj.name).filter(Boolean);

    const uniquePaths = [...new Set([...pathsFromDb, ...pathsFromBucket])];

    let deletedFromStorage = 0;
    let storageDeleteErrors = 0;

    for (const batch of chunkArray(uniquePaths, DELETE_CHUNK_SIZE)) {
      const { error } = await supabase.storage.from(PHOTOS_BUCKET).remove(batch);
      if (error) {
        storageDeleteErrors += batch.length;
        console.error("Error deleting storage batch:", error);
      } else {
        deletedFromStorage += batch.length;
      }
    }

    const { error: deleteRowsError, count: deletedRowsCount } = await supabase
      .from(PHOTO_TABLE)
      .delete({ count: "exact" })
      .lt("created_at", cutoffIso);

    if (deleteRowsError) {
      console.error("Error deleting old photo rows:", deleteRowsError);
      await writeAuditLog({
        status: "error",
        cutoff_at: cutoffIso,
        old_db_rows_found: oldPhotoRows?.length ?? 0,
        old_storage_objects_found: oldStorageObjects?.length ?? 0,
        storage_deleted_attempted: uniquePaths.length,
        storage_deleted_success: deletedFromStorage,
        storage_delete_failed: storageDeleteErrors,
        error_message: deleteRowsError.message,
      });
      return new Response(JSON.stringify({ error: deleteRowsError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    await writeAuditLog({
      status: storageDeleteErrors > 0 ? "partial" : "success",
      cutoff_at: cutoffIso,
      old_db_rows_found: oldPhotoRows?.length ?? 0,
      old_storage_objects_found: oldStorageObjects?.length ?? 0,
      storage_deleted_attempted: uniquePaths.length,
      storage_deleted_success: deletedFromStorage,
      storage_delete_failed: storageDeleteErrors,
      db_rows_deleted: deletedRowsCount ?? 0,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        retention_days: RETENTION_DAYS,
        cutoff: cutoffIso,
        old_db_rows_found: oldPhotoRows?.length ?? 0,
        old_storage_objects_found: oldStorageObjects?.length ?? 0,
        storage_deleted_attempted: uniquePaths.length,
        storage_deleted_success: deletedFromStorage,
        storage_delete_failed: storageDeleteErrors,
        db_rows_deleted: deletedRowsCount ?? 0,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Unhandled cleanup error:", error);
    await writeAuditLog({
      status: "error",
      cutoff_at: cutoffIso,
      error_message: error instanceof Error ? error.message : "Unhandled cleanup error",
    });
    return new Response(JSON.stringify({ error: "Unhandled cleanup error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
