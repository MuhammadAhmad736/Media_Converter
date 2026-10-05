import { NextRequest, NextResponse } from "next/server";
import { getMediaMetadata, getMediaPlatform } from "@/lib/downloads/media-metadata";

const yt = require('@vreden/youtube_scraper');

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    // Get URL from query parameters
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    // Check if URL was provided
    if (!url) {
      return NextResponse.json(
        {
          success: false,
          message: "URL is required",
        },
        { status: 400 }
      );
    }

    // Get metadata using @vreden/youtube_scraper
    const result = await yt.metadata(url);

    if (!result?.status || !result.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid URL",
        },
        { status: 404 }
      );
    }

    let duration =
      typeof result.duration?.seconds === "number" &&
      Number.isFinite(result.duration.seconds)
        ? Math.max(0, result.duration.seconds)
        : 0;
    let title = typeof result.title === "string" ? result.title : "";

    if (duration === 0 || !title) {
      try {
        const metadata = await getMediaMetadata(url);
        if (duration === 0) duration = metadata.duration;
        if (!title && metadata.title) title = metadata.title;
      } catch (error) {
        console.error("Media duration lookup error:", error);
      }
    }

    // Get the best available thumbnail
    const thumbnail =
      result.thumbnails?.find((item: any) => item.quality === "maxres")?.url ||
      result.thumbnails?.find((item: any) => item.quality === "high")?.url ||
      result.thumbnails?.[0]?.url ||
      "";

    // Return only the data our frontend needs
    const platform = getMediaPlatform(url);

    return NextResponse.json({
      success: true,

      data: {
        title,
        description: result.description || "",
        thumbnail,
        ...(duration > 0 ? { duration } : {}),
        ...(platform ? { platform } : {}),

        // YouTube channel/uploader
        uploader: result.channel_title || "",

        // metadata() does not provide a reliable file size
        size: null,

        // Our application supports these two download options
        options: {
          video: {
            format: "mp4",
            label: "MP4",
          },

          audio: {
            format: "mp3",
            label: "Audio Only",
          },
        },
      },
    });
  } catch (error) {
    console.error("Media info error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get media information",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}