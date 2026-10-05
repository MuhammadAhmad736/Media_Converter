import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { YT_DLP_BIN_PATH } from "@choewy/yt-dlp";

const execFileAsync = promisify(execFile);

export type MediaMetadata = {
  title?: string;
  duration: number;
};

export function getMediaPlatform(url: string): string | undefined {
  try {
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    const hostname = new URL(fullUrl).hostname.replace(/^www\./, "").toLowerCase();

    if (hostname === "youtu.be" || hostname === "youtube.com" || hostname.endsWith(".youtube.com")) {
      return "YouTube";
    }
    if (hostname === "instagram.com" || hostname.endsWith(".instagram.com")) {
      return "Instagram";
    }
    if (hostname === "tiktok.com" || hostname.endsWith(".tiktok.com")) {
      return "TikTok";
    }
    if (
      hostname === "facebook.com" ||
      hostname.endsWith(".facebook.com") ||
      hostname === "fb.watch"
    ) {
      return "Facebook";
    }

    return hostname || undefined;
  } catch {
    return undefined;
  }
}

export async function getMediaMetadata(url: string): Promise<MediaMetadata> {
  const fullUrl = url.startsWith("http") ? url : `https://${url}`;
  const { stdout } = await execFileAsync(
    YT_DLP_BIN_PATH,
    ["--dump-single-json", "--skip-download", "--no-warnings", "--no-playlist", fullUrl],
    { maxBuffer: 10 * 1024 * 1024, timeout: 30_000 },
  );
  const metadata: unknown = JSON.parse(stdout);

  if (typeof metadata !== "object" || metadata === null) {
    throw new Error("Media metadata response is invalid.");
  }

  const title =
    "title" in metadata && typeof metadata.title === "string"
      ? metadata.title.trim() || undefined
      : undefined;
  const duration =
    "duration" in metadata &&
    typeof metadata.duration === "number" &&
    Number.isFinite(metadata.duration)
      ? Math.max(0, metadata.duration)
      : 0;

  return { title, duration };
}
