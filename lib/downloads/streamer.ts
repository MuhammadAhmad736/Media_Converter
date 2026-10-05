import fs from 'fs';
import { Readable } from 'node:stream';
import type { DownloadJob } from './types';
import {
  DOWNLOAD_CHUNK_SIZE,
  MIN_VISIBLE_TRANSFER_MS,
  MAX_TRANSFER_BYTES_PER_SECOND,
  ERROR_CLEANUP_TTL_MS,
} from './constants';
import { scheduleCleanup } from './job-store';
import { saveDownloadRecord } from './records';

export function createFileResponse(job: DownloadJob): Response {
  const body = Readable.toWeb(
    Readable.from(
      (async function* () {
        await job.completion;

        if (job.stage === 'error' || !job.filePath) {
          throw new Error(job.error || 'Download preparation failed');
        }

        job.stage = 'transferring';
        clearTimeout(job.cleanupTimer);

        let transferCompleted = false;
        try {
          const fileSize = job.size ?? fs.statSync(job.filePath).size;
          const transferDurationMs = Math.max(
            MIN_VISIBLE_TRANSFER_MS,
            (fileSize / MAX_TRANSFER_BYTES_PER_SECOND) * 1000
          );

          const fileStream = fs.createReadStream(job.filePath, {
            highWaterMark: DOWNLOAD_CHUNK_SIZE,
          });

          for await (const chunk of fileStream) {
            await new Promise((resolve) =>
              setTimeout(
                resolve,
                (transferDurationMs * chunk.length) / fileSize
              )
            );
            job.transferredBytes += chunk.length;
            yield chunk as Buffer;
          }

          job.stage = 'complete';
          transferCompleted = true;
        } finally {
          await saveDownloadRecord(
            job,
            transferCompleted ? 'Successful' : 'Failed'
          );
          scheduleCleanup(job, ERROR_CLEANUP_TTL_MS);
        }
      })()
    )
  ) as ReadableStream<Uint8Array>;

  const headers = new Headers({
    'Content-Disposition': `attachment; filename="${
      job.type === 'mp3' ? 'audio.mp3' : 'video.mp4'
    }"`,
    'Content-Type':
      job.type === 'mp3' ? 'audio/mpeg' : 'video/mp4',
    'Cache-Control': 'no-store',
  });

  if (job.size !== undefined) {
    headers.set('Content-Length', String(job.size));
  }

  return new Response(body, { status: 200, headers });
}