import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

/** Public bucket for AI-generated thumbnails (ClickBoost + Thumbnail Engine). */
export const THUMBNAIL_STORAGE_BUCKET = "generated-thumbnails";

let bucketReady: Promise<void> | null = null;

function extensionFromContentType(contentType: string): string {
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("gif")) return "gif";
  return "png";
}

/**
 * Prefer service-role client (bypasses storage RLS) when key is configured.
 * Falls back to the authenticated user client.
 */
function getStorageClient(userClient: SupabaseClient): SupabaseClient {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      return createAdminClient();
    } catch {
      return userClient;
    }
  }
  return userClient;
}

async function ensureBucket(client: SupabaseClient): Promise<void> {
  if (!bucketReady) {
    bucketReady = (async () => {
      try {
        const { data: buckets } = await client.storage.listBuckets();
        const exists = buckets?.some((b) => b.id === THUMBNAIL_STORAGE_BUCKET);
        if (!exists) {
          const { error } = await client.storage.createBucket(THUMBNAIL_STORAGE_BUCKET, {
            public: true,
            fileSizeLimit: 12 * 1024 * 1024,
          });
          // ignore "already exists" races
          if (error && !/already exists|duplicate/i.test(error.message)) {
            console.warn("[persistRemoteImage] createBucket:", error.message);
          }
        }
      } catch (err) {
        console.warn("[persistRemoteImage] ensureBucket:", err);
      }
    })();
  }
  await bucketReady;
}

/**
 * Download a remote (often temporary) image URL and re-upload to Supabase Storage
 * so history / reloads keep working after SiliconFlow CDN links expire.
 *
 * Returns the permanent public URL. Throws if download or upload fails.
 */
export async function persistRemoteImage(
  userClient: SupabaseClient,
  userId: string,
  remoteUrl: string,
  folder: "clickbait" | "thumbnail-engine" | string = "clickbait"
): Promise<string> {
  const res = await fetch(remoteUrl, {
    signal: AbortSignal.timeout(45000),
  });
  if (!res.ok) {
    throw new Error(`Failed to download generated image (${res.status})`);
  }

  const contentType = (res.headers.get("content-type") || "image/png")
    .split(";")[0]
    .trim();
  const ext = extensionFromContentType(contentType);
  const buffer = Buffer.from(await res.arrayBuffer());

  if (buffer.length < 100) {
    throw new Error("Downloaded image is empty or invalid");
  }

  const storage = getStorageClient(userClient);
  await ensureBucket(storage);

  const filePath = `${userId}/${folder}/${randomUUID()}.${ext}`;

  const { error: uploadError } = await storage.storage
    .from(THUMBNAIL_STORAGE_BUCKET)
    .upload(filePath, buffer, {
      contentType,
      upsert: false,
      cacheControl: "31536000",
    });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  const {
    data: { publicUrl },
  } = storage.storage.from(THUMBNAIL_STORAGE_BUCKET).getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Best-effort persist: on failure logs and returns the original temporary URL
 * so generation still succeeds for the user (history may expire later).
 */
export async function persistRemoteImageSafe(
  userClient: SupabaseClient,
  userId: string,
  remoteUrl: string,
  folder: "clickbait" | "thumbnail-engine" | string = "clickbait"
): Promise<{ url: string; persisted: boolean }> {
  try {
    const url = await persistRemoteImage(userClient, userId, remoteUrl, folder);
    return { url, persisted: true };
  } catch (err) {
    console.error("[persistRemoteImageSafe]", err);
    return { url: remoteUrl, persisted: false };
  }
}
