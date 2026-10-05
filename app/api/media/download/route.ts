import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/middleware/require-user';
import { getMediaMetadata, getMediaPlatform } from '@/lib/downloads/media-metadata';
import { createFileResponse } from '@/lib/downloads/streamer';
import type { DownloadTracking, DownloadType } from '@/lib/downloads/types';
import { createJob, getJob } from '@/lib/downloads/job-store';
import { runDownloadJob } from '@/lib/downloads/downloader';

const yt = require('@vreden/youtube_scraper');

export const runtime = 'nodejs';
export const maxDuration = 300;

function isValidType(t: string | null): t is DownloadType {
  return t === 'mp4' || t === 'mp3';
}

async function getDownloadTracking(
  url: string,
  type: DownloadType,
  userId?: string
): Promise<DownloadTracking | null> {
  let duration = 0;
  let title = 'Unknown title';
  try {
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    const metadata = await yt.metadata(fullUrl);
    if (typeof metadata?.title === 'string' && metadata.title.trim()) {
      title = metadata.title.trim();
    }
    if (typeof metadata?.duration?.seconds === 'number' && Number.isFinite(metadata.duration.seconds)) {
      duration = Math.max(0, metadata.duration.seconds);
    }
  } catch (error) {
    console.error('Download metadata lookup error:', error);
  }

  if (duration === 0 || title === 'Unknown title') {
    try {
      const metadata = await getMediaMetadata(url);
      if (duration === 0) duration = metadata.duration;
      if (title === 'Unknown title' && metadata.title) title = metadata.title;
    } catch (error) {
      console.error('Download metadata lookup error:', error);
    }
  }

  return {
    ...(userId ? { userId } : {}),
    title,
    platform: getMediaPlatform(url) ?? 'Other',
    duration,
    quality: type === 'mp3' ? 'Audio' : 'Best available',
  };
}

function getOptionalUserId(request: NextRequest):
  | { userId?: string }
  | { response: NextResponse } {
  const session = requireUser(request);
  if (session.authenticated) return { userId: session.userId };

  if (session.response.status === 401) return {};
  return { response: session.response };
}

export async function GET(request: NextRequest) {
  const session = getOptionalUserId(request);
  if ('response' in session) return session.response;

  const sp = request.nextUrl.searchParams;
  const jobId = sp.get('jobId');

  // ----------------------------------------------------------
  // POLL JOB STATUS OR DOWNLOAD THE FILE
  // ----------------------------------------------------------
  if (jobId) {
    const job = getJob(jobId);
    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }
    if (job.userId !== session.userId) {
      return NextResponse.json(
        { success: false, error: 'Download job not found' },
        { status: 404 }
      );
    }

    return sp.get('download') === '1'
      ? createFileResponse(job)
      : NextResponse.json({
          success: true,
          jobId: job.id,
          stage: job.stage,
          downloadedBytes: job.downloadedBytes,
          totalBytes: job.totalBytes,
          transferredBytes: job.transferredBytes,
          percent: job.percent,
          size: job.size,
          error: job.error,
        });
  }

  // ----------------------------------------------------------
  // DIRECT DOWNLOAD (no jobId supplied)
  // ----------------------------------------------------------
  const url = sp.get('url');
  const type = sp.get('type');

  if (!url || !isValidType(type)) {
    return NextResponse.json(
      { success: false, error: 'Missing or invalid url/type' },
      { status: 400 }
    );
  }

  // 1. Create the job synchronously (fast — just a temp dir + Map entry)
  const job = createJob(type);
  job.userId = session.userId;
  job.tracking = getDownloadTracking(url, type, session.userId);

  // 2. Kick off the long-running download in the background
  void runDownloadJob(job, url);

  // 3. Return a response that waits for the job to finish, then streams
  return createFileResponse(job);
}

export async function POST(request: NextRequest) {
  const session = getOptionalUserId(request);
  if ('response' in session) return session.response;

  const sp = request.nextUrl.searchParams;
  const url = sp.get('url');
  const type = sp.get('type');

  if (!url || !isValidType(type)) {
    return NextResponse.json(
      { success: false, error: 'Missing or invalid url/type' },
      { status: 400 }
    );
  }

  // 1. Create the job
  const job = createJob(type);
  job.userId = session.userId;
  job.tracking = getDownloadTracking(url, type, session.userId);

  // 2. Start the download in the background
  void runDownloadJob(job, url);

  // 3. Return the jobId immediately so the frontend can poll
  return NextResponse.json({ success: true, jobId: job.id });
}