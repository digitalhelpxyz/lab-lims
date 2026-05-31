// Supabase Storage integration — Manus S3 proxy ki jagah
import { createClient } from "@supabase/supabase-js";
import { ENV } from "./_core/env";

function getSupabaseClient() {
  if (!ENV.supabaseUrl || !ENV.supabaseKey) {
    throw new Error("Supabase config missing: set SUPABASE_URL and SUPABASE_SERVICE_KEY");
  }
  return createClient(ENV.supabaseUrl, ENV.supabaseKey);
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const supabase = getSupabaseClient();
  const key = appendHashSuffix(relKey.replace(/^\/+/, ""));

  const buffer = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);

  const { error } = await supabase.storage
    .from(ENV.supabaseBucket)
    .upload(key, buffer, { contentType, upsert: false });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage
    .from(ENV.supabaseBucket)
    .getPublicUrl(key);

  return { key, url: urlData.publicUrl };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const supabase = getSupabaseClient();
  const key = relKey.replace(/^\/+/, "");

  const { data, error } = await supabase.storage
    .from(ENV.supabaseBucket)
    .createSignedUrl(key, 3600); // 1 hour

  if (error) throw new Error(`Supabase signed URL failed: ${error.message}`);
  return data.signedUrl;
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const supabase = getSupabaseClient();
  const key = relKey.replace(/^\/+/, "");
  const { data } = supabase.storage.from(ENV.supabaseBucket).getPublicUrl(key);
  return { key, url: data.publicUrl };
}
