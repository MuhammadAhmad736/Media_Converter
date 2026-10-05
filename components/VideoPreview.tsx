"use client";

// ============================================================
// IMPORTS
// ============================================================
import { useState } from "react";
import { toast } from "react-toastify";

// ============================================================
// TYPES
// ============================================================

// Information returned by /api/media/info
type Info = {
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  uploader: string;

  // File size is optional because the provider may not return it.
  size?: number | string | null;

  // Only MP4 and MP3 options are provided.
  options: {
    video: {
      format: "mp4";
      label: string;
    };
    audio: {
      format: "mp3";
      label: string;
    };
  };
};

// Download types supported by /api/media/download
type DownloadType = "mp4" | "mp3";
type DownloadStage = "downloading" | "merging" | "ready" | "transferring" | "complete" | "error";

type DownloadProgress = {
  type: DownloadType;
  stage: DownloadStage;
  downloadedBytes: number;
  totalBytes: number | null;
  percent: number | null;
  transferredBytes: number;
  size?: number;
  error?: string;
};

// ============================================================
// YOUTUBE ID EXTRACTOR
// Supports:
//   https://www.youtube.com/watch?v=ID
//   https://youtu.be/ID
//   https://www.youtube.com/embed/ID
//   https://www.youtube.com/shorts/ID
// Returns null if the URL is not a YouTube link.
// ============================================================
function getYouTubeId(url: string): string | null {
  try {
    const normalizedUrl = /^[a-z][a-z\d+.-]*:\/\//i.test(url)
      ? url
      : `https://${url}`;
    const parsedUrl = new URL(normalizedUrl);
    const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, "");
    let videoId: string | null = null;

    if (hostname === "youtu.be") {
      videoId = parsedUrl.pathname.split("/").filter(Boolean)[0] ?? null;
    } else if (
      ["youtube.com", "m.youtube.com", "music.youtube.com"].includes(hostname)
    ) {
      if (parsedUrl.pathname === "/watch") {
        videoId = parsedUrl.searchParams.get("v");
      } else {
        videoId = parsedUrl.pathname.match(
          /^\/(?:embed|shorts|live|v)\/([^/]+)/
        )?.[1] ?? null;
      }
    }

    return videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId) ? videoId : null;
  } catch {
    return null;
  }
}

// ============================================================
// FILE SIZE FORMATTER
// Converts bytes into KB / MB / GB.
// If the API already returns a formatted string, it is returned
// as-is.
// ============================================================
function formatFileSize(size?: number | string | null): string {
  if (size === null || size === undefined || size === "") {
    return "";
  }

  // If the API already returns something like "25 MB",
  // don't try to convert it.
  if (typeof size === "string") {
    return size;
  }

  if (size <= 0) {
    return "";
  }

  const units = ["B", "KB", "MB", "GB"];

  let value = size;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function VideoPreview() {
  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  // URL entered by the user.
  const [url, setUrl] = useState("");

  // Information returned by the info API.
  const [info, setInfo] = useState<Info | null>(null);

  // Loading state for the Check request.
  const [loading, setLoading] = useState(false);

  // Error message.
  const [error, setError] = useState("");

  // Controls whether the YouTube iframe is loaded.
  const [playing, setPlaying] = useState(false);

  // Keeps track of which download button is currently processing.
  const [downloading, setDownloading] = useState<DownloadType | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);

  // ----------------------------------------------------------
  // SUBMIT HANDLER
  // ----------------------------------------------------------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (downloading) return;

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      const message = "Please paste a YouTube video URL.";
      setError(message);
      toast.error(message);
      return;
    }

    setError("");
    setInfo(null);
    setPlaying(false);
    setDownloading(null);
    setDownloadProgress(null);

    if (!getYouTubeId(trimmedUrl)) {
      const message = "Please enter a valid YouTube video URL.";
      setError(message);
      toast.error(message);
      return;
    }

    setLoading(true);

    try {
      // The info route only receives the URL.
      const res = await fetch(
        `/api/media/info?url=${encodeURIComponent(trimmedUrl)}`
      );

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Unable to fetch media information");
      }

      setInfo(json.data);
      toast.success("Video information loaded.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(
        message
      );
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------------------------------------
  // DOWNLOAD HANDLER
  // ----------------------------------------------------------
  // Start the native browser response immediately and poll yt-dlp's
  // source-download, merge, and final transfer stages in the page.
  // ----------------------------------------------------------
  async function handleDownload(type: DownloadType) {
    if (!info || downloading) return;

    const trimmedUrl = url.trim();

    if (!trimmedUrl) return;

    setDownloading(type);
    setError("");
    setDownloadProgress({
      type,
      stage: "downloading",
      downloadedBytes: 0,
      totalBytes: null,
      percent: null,
      transferredBytes: 0,
    });

    const params = new URLSearchParams({
      url: trimmedUrl,
      type,
    });

    let iframe: HTMLIFrameElement | null = null;

    try {
      const response = await fetch(`/api/media/download?${params.toString()}`, {
        method: "POST",
      });
      const result = (await response.json()) as {
        success: boolean;
        jobId?: string;
        error?: string;
      };

      if (!response.ok || !result.success || !result.jobId) {
        throw new Error(result.error || "Unable to start this download");
      }

      const jobId = result.jobId;
      const sourcePhaseStartedAt = Date.now();
      let mergePhaseStartedAt: number | undefined;

      while (true) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        const progressResponse = await fetch(
          `/api/media/download?jobId=${encodeURIComponent(jobId)}`,
          { cache: "no-store" }
        );
        const progress = (await progressResponse.json()) as Omit<DownloadProgress, "type"> & {
          success: boolean;
        };

        if (!progressResponse.ok || !progress.success) {
          throw new Error(progress.error || "Unable to read download progress");
        }
        if (progress.stage === "error") {
          throw new Error(progress.error || "Download failed");
        }

        const now = Date.now();
        let visibleStage = progress.stage;

        if (now - sourcePhaseStartedAt < 1000) {
          visibleStage = "downloading";
        } else if (progress.stage !== "downloading") {
          mergePhaseStartedAt ??= now;
          if (now - mergePhaseStartedAt < 800) {
            visibleStage = "merging";
          }
        }

        setDownloadProgress({ ...progress, type, stage: visibleStage });

        if (progress.stage === "ready" && visibleStage === "ready" && !iframe) {
          const downloadParams = new URLSearchParams({ jobId, download: "1" });
          iframe = document.createElement("iframe");
          iframe.style.display = "none";
          iframe.src = `/api/media/download?${downloadParams.toString()}`;
          document.body.appendChild(iframe);
        }

        if (progress.stage === "complete") {
          iframe?.remove();
          toast.success("Download completed successfully.");
          setTimeout(() => setDownloadProgress(null), 4000);
          break;
        }
      }
    } catch (err) {
      iframe?.remove();
      const message = err instanceof Error ? err.message : "Download failed";
      setError(message);
      toast.error(message);
      setDownloadProgress(null);
    } finally {
      setDownloading(null);
    }
  }

  // ----------------------------------------------------------
  // DERIVED VALUES
  // ----------------------------------------------------------

  const youtubeId = getYouTubeId(url.trim());

  const formattedSize = formatFileSize(info?.size);

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-0 sm:px-2">
      {/* ======================================================
          SEARCH BAR
          ====================================================== */}
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-2xl"
      >
        <div className="flex h-14 w-full min-w-0 items-center gap-2 overflow-hidden rounded-lg border border-[#C9D6FF] bg-white p-1.5 pl-3">
          {/* Search icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 30 30"
            fill="#6B7280"
            className="shrink-0"
          >
            <path d="M13 3C7.489 3 3 7.489 3 13s4.489 10 10 10a9.95 9.95 0 0 0 6.322-2.264l5.971 5.971a1 1 0 1 0 1.414-1.414l-5.97-5.97A9.95 9.95 0 0 0 23 13c0-5.511-4.489-10-10-10m0 2c4.43 0 8 3.57 8 8s-3.57 8-8 8-8-3.57-8-8 3.57-8 8-8" />
          </svg>

          {/* URL input */}
          <input
            type="text"
            placeholder="Paste the video link here..."
            className="h-full min-w-0 flex-1 bg-transparent text-sm text-gray-700 outline-none focus-visible:outline-none placeholder:text-gray-400"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />

          {/* Check button */}
          <button
            type="submit"
            disabled={loading || downloading !== null || !url.trim()}
            className="flex h-10 min-w-22 shrink-0 items-center justify-center gap-1.5 rounded-md bg-[#2442C7] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1E36A7] disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-24 sm:px-5"
          >
            {loading ? (
              <>
                <Spinner />
                <span>Checking…</span>
              </>
            ) : (
              "Check"
            )}
          </button>
        </div>
      </form>

      {/* ======================================================
          ERROR MESSAGE
          ====================================================== */}
      {error && (
        <p className="mt-4 text-center text-sm text-red-500 animate-fade-in">
          {error}
        </p>
      )}

      {/* ======================================================
          SKELETON LOADER
          ====================================================== */}
      {loading && !info && <SkeletonCard />}

      {/* ======================================================
          RESULT CARD
          ====================================================== */}
      {info && !loading && (
        <div className="mt-6 w-full rounded-xl border border-gray-200 bg-white p-3 shadow-sm animate-fade-in-up sm:mt-8 sm:p-5 lg:p-6">
          <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:gap-6">

            {/* ==================================================
                LEFT: PREVIEW
                ================================================== */}
            <div className="w-full min-w-0 lg:w-[55%]">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black group">

                {youtubeId ? (
                  // ---------- YOUTUBE PREVIEW ----------
                  playing ? (
                    // Real YouTube player after clicking play.
                    <iframe
                      key={youtubeId}
                      src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                      title={info.title}
                      className="h-full w-full animate-fade-in"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    // Thumbnail + play button before loading iframe.
                    <button
                      type="button"
                      onClick={() => setPlaying(true)}
                      className="absolute inset-0 flex h-full w-full items-center justify-center"
                      aria-label="Play YouTube preview"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={info.thumbnail}
                        alt={info.title}
                        className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                        loading="lazy"
                      />

                      {/* YouTube-style play button */}
                      <span className="absolute flex h-16 w-16 items-center justify-center rounded-full bg-red-600 shadow-lg transition-transform group-hover:scale-110">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="#fff"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                    </button>
                  )
                ) : (
                  // ---------- NON-YOUTUBE PREVIEW ----------
                  // For non-YouTube sources we currently show
                  // the thumbnail returned by the info API.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={info.thumbnail}
                    alt={info.title}
                    className="h-full w-full object-cover animate-fade-in"
                    loading="lazy"
                  />
                )}

              </div>
            </div>

            {/* ==================================================
                RIGHT: INFO + DOWNLOAD OPTIONS
                ================================================== */}
            <div className="flex w-full min-w-0 flex-col lg:w-[45%]">

              {/* Title */}
              <h2
                className="truncate text-base font-bold text-gray-900 animate-fade-in sm:text-xl"
                title={info.title}
              >
                {info.title}
              </h2>

              {/* Uploader + duration */}
              <p className="mt-1 truncate text-xs text-gray-400 animate-fade-in">
                {info.uploader}

                {info.duration > 0 &&
                  ` • ${Math.floor(info.duration / 60)}m ${
                    info.duration % 60
                  }s`}
              </p>

              {/* Description */}
              <p
                className="mt-2 line-clamp-2 text-sm text-gray-500 animate-fade-in"
                title={info.description}
              >
                {info.description || "No description available."}
              </p>

              {/* ==================================================
                  OPTIONAL FILE SIZE
                  Only display this when the API provides it.
                  ================================================== */}
              {formattedSize && (
                <div className="mt-4 text-sm text-gray-500 animate-fade-in">
                  <span className="font-semibold text-gray-700">
                    Size:
                  </span>{" "}
                  {formattedSize}
                </div>
              )}

              {/* ==================================================
                  DOWNLOAD OPTIONS
                  Only MP4 and MP3 are available.
                  There is NO quality selector.
                  ================================================== */}
              <div className="mt-6 space-y-3 animate-fade-in-up">

                {/* MP4 DOWNLOAD */}
                <button
                  type="button"
                  onClick={() => handleDownload("mp4")}
                  disabled={downloading !== null}
                  className="flex h-12 w-full items-center justify-center rounded-md bg-indigo-500 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {downloading === "mp4" ? (
                    <>
                      <Spinner />
                      <span className="ml-2">
                        {downloadProgress?.stage === "merging"
                          ? "Merging MP4..."
                          : downloadProgress?.stage === "ready"
                            ? "Starting download..."
                          : downloadProgress?.stage === "transferring"
                            ? "Downloading MP4..."
                            : "Downloading source..."}
                      </span>
                    </>
                  ) : (
                    "Download MP4"
                  )}
                </button>

                {/* MP3 DOWNLOAD */}
                <button
                  type="button"
                  onClick={() => handleDownload("mp3")}
                  disabled={downloading !== null}
                  className="flex h-12 w-full items-center justify-center rounded-md border border-indigo-500 bg-white text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {downloading === "mp3" ? (
                    <>
                      <Spinner />
                      <span className="ml-2">
                        {downloadProgress?.stage === "merging"
                          ? "Converting MP3..."
                          : downloadProgress?.stage === "ready"
                            ? "Starting download..."
                          : downloadProgress?.stage === "transferring"
                            ? "Downloading MP3..."
                            : "Merging..."}
                      </span>
                    </>
                  ) : (
                    "Download MP3"
                  )}
                </button>

              </div>

              {downloadProgress && (
                <div
                  className="mt-4 space-y-2 text-sm text-gray-600"
                  role="status"
                  aria-live="polite"
                >
                  {["downloading", "merging", "ready"].includes(downloadProgress.stage) ? (
                    <div className="space-y-2 rounded-md border border-gray-200 bg-white px-3 py-3">
                      <div>
                        <p className="font-semibold text-gray-800">Converting</p>
                        <p className="text-xs text-gray-500">Download starts within seconds</p>
                      </div>
                      <div
                        className="download-preparing-track"
                        role="progressbar"
                        aria-label="Preparing your download"
                      >
                        <div className="download-preparing-bar" aria-hidden="true" />
                      </div>
                    </div>
                  ) : (
                    <>
                  <div className="flex items-center justify-between gap-3">
                    <span>
                      {downloadProgress.stage === "transferring"
                        ? "Sending file..."
                        : "Download complete"}
                    </span>
                    {downloadProgress.stage === "transferring" && downloadProgress.size && (
                      <span>
                        {Math.min(
                          100,
                          Math.floor((downloadProgress.transferredBytes / downloadProgress.size) * 100)
                        )}%
                      </span>
                    )}
                  </div>

                  {downloadProgress.stage === "transferring" && downloadProgress.size && (
                    <>
                      <progress
                        className="h-2 w-full accent-indigo-600"
                        max={downloadProgress.size}
                        value={downloadProgress.transferredBytes}
                      />
                      <p>
                        {formatFileSize(downloadProgress.transferredBytes)} / {formatFileSize(downloadProgress.size)}
                      </p>
                    </>
                  )}

                  {downloadProgress.stage === "complete" && downloadProgress.size && (
                      <p>File size: {formatFileSize(downloadProgress.size)}</p>
                    )}
                    </>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// SPINNER
// ============================================================
function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />

      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
      />
    </svg>
  );
}

// ============================================================
// SKELETON CARD
// ============================================================
function SkeletonCard() {
  return (
    <div className="mt-6 w-full rounded-xl border border-gray-200 bg-white p-3 shadow-sm animate-fade-in sm:mt-8 sm:p-5 lg:p-6">
      <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:gap-6">

        {/* Preview skeleton */}
        <div className="w-full min-w-0 lg:w-[55%]">
          <div className="aspect-video w-full animate-pulse rounded-lg bg-gray-200" />
        </div>

        {/* Content skeleton */}
        <div className="flex w-full min-w-0 flex-col gap-3 lg:w-[45%]">
          <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />

          <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />

          <div className="h-3 w-full animate-pulse rounded bg-gray-200" />

          <div className="h-3 w-5/6 animate-pulse rounded bg-gray-200" />

          {/* Optional size skeleton */}
          <div className="mt-3 h-3 w-20 animate-pulse rounded bg-gray-200" />

          {/* Download buttons skeleton */}
          <div className="mt-4 h-12 w-full animate-pulse rounded bg-gray-200" />

          <div className="h-12 w-full animate-pulse rounded bg-gray-200" />
        </div>

      </div>
    </div>
  );
}

