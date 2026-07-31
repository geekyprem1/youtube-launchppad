import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

/** Public bucket for AI-generated videos (Video Creation Pro / p-video). */
export const VIDEO_STORAGE_BUCKET = "generated-videos";

let bucketReady: Promise<void> | null = null;

function extensionFromContentType(contentType: string): string {
  if (contentType.includes("webm")) return "webm";
  if (contentType.includes("quicktime") || contentType.includes("mov")) return "mov";
  return "mp4";
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
        const exists = buckets?.some((b) => b.id === VIDEO_STORAGE_BUCKET);
        if (!exists) {
          const { error } = await client.storage.createBucket(VIDEO_STORAGE_BUCKET, {
            public: true,
            fileSizeLimit: 200 * 1024 * 1024, // 200MB — 10s clips are well under this
          });
          if (error && !/already exists|duplicate/i.test(error.message)) {
            console.warn("[persistRemoteVideo] createBucket:", error.message);
          }
        }
      } catch (err) {
        console.warn("[persistRemoteVideo] ensureBucket:", err);
      }
    })();
  }
  await bucketReady;
}

/**
 * Download a remote (temporary) Replicate video URL and re-upload to Supabase Storage
 * so history / reloads keep working after Replicate deletes the prediction output.
 *
 * Returns the permanent public URL. Throws if download or upload fails.
 */
export async function persistRemoteVideo(
  userClient: SupabaseClient,
  userId: string,
  remoteUrl: string,
  folder = "video-creation-pro"
): Promise<string> {
  const res = await fetch(remoteUrl, {
    signal: AbortSignal.timeout(120000), // videos are larger than images
  });
  if (!res.ok) {
    throw new Error(`Failed to download generated video (${res.status})`);
  }

  const contentType = (res.headers.get("content-type") || "video/mp4")
    .split(";")[0]
    .trim();
  const ext = extensionFromContentType(contentType);
  const buffer = Buffer.from(await res.arrayBuffer());

  if (buffer.length < 1024) {
    throw new Error("Downloaded video is empty or invalid");
  }

  const storage = getStorageClient(userClient);
  await ensureBucket(storage);

  const filePath = `${userId}/${folder}/${randomUUID()}.${ext}`;

  const { error: uploadError } = await storage.storage
    .from(VIDEO_STORAGE_BUCKET)
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
  } = storage.storage.from(VIDEO_STORAGE_BUCKET).getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Best-effort persist: on failure logs and returns the original temporary URL
 * so the user still gets their video (history may expire later).
 */
export async function persistRemoteVideoSafe(
  userClient: SupabaseClient,
  userId: string,
  remoteUrl: string,
  folder = "video-creation-pro"
): Promise<{ url: string; persisted: boolean }> {
  try {
    const url = await persistRemoteVideo(userClient, userId, remoteUrl, folder);
    return { url, persisted: true };
  } catch (err) {
    console.error("[persistRemoteVideoSafe]", err);
    return { url: remoteUrl, persisted: false };
  }
}
