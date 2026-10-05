import { spawn } from 'node:child_process';
import fs from 'fs';
import path from 'path';
import {
  YtDlpArgsBuilder,
  YtDlpConfig,
  YT_DLP_BIN_PATH,
} from '@choewy/yt-dlp';

import type { DownloadJob } from './types';
import {
  DOWNLOAD_PROGRESS_MARKER,
  MERGE_MIN_DISPLAY_MS,
} from './constants';
import { scheduleCleanup, scheduleErrorCleanup } from './job-store';
import { saveDownloadRecord } from './records';

export async function runDownloadJob(
  job: DownloadJob,
  url: string
): Promise<void> {
  const fullUrl = url.startsWith('http') ? url : `https://${url}`;
  const outputTemplate = path.join(
    job.tempDir,
    job.type === 'mp3' ? 'audio.%(ext)s' : 'video.%(ext)s'
  );

  const args = buildArgs(job, fullUrl, outputTemplate);

  let stdout = '';
  let pendingStdoutLine = '';
  let pendingStderrLine = '';
  let stderrTail = '';
  let mergeStartedAt: number | undefined;

  const handleLine = (rawLine: string) => {
    const line = rawLine.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '').trim();
    const markerIndex = line.indexOf(DOWNLOAD_PROGRESS_MARKER);

    if (markerIndex !== -1) {
      const [downloadedValue, estimatedValue, totalValue] = line
        .slice(markerIndex + DOWNLOAD_PROGRESS_MARKER.length)
        .split('|');
      const downloaded = Number(downloadedValue);
      const total = Number(estimatedValue) || Number(totalValue);

      if (Number.isFinite(downloaded)) job.downloadedBytes = downloaded;
      if (Number.isFinite(total) && total > 0) {
        job.totalBytes = total;
        job.percent = Math.min(
          99,
          Math.floor((job.downloadedBytes / total) * 100)
        );
      }
      return;
    }

    if (
      /Merging formats into|\[Merger\]|\[ExtractAudio\]|Postprocessing/i.test(
        line
      )
    ) {
      job.stage = 'merging';
      mergeStartedAt ??= Date.now();
    }
  };

  const consumeOutput = (chunk: Buffer, isStdout: boolean) => {
    const text = chunk.toString();
    if (isStdout) stdout += text;
    else stderrTail = `${stderrTail}${text}`.slice(-4000);

    const pendingLine = isStdout ? pendingStdoutLine : pendingStderrLine;
    const lines = `${pendingLine}${text}`.split(/\r\n|\n|\r/);
    const remainingLine = lines.pop() ?? '';

    if (isStdout) pendingStdoutLine = remainingLine;
    else pendingStderrLine = remainingLine;

    for (const line of lines) handleLine(line);
  };

  try {
    const child = spawn(YT_DLP_BIN_PATH, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    child.stdout.on('data', (chunk: Buffer) =>
      consumeOutput(chunk, true)
    );
    child.stderr.on('data', (chunk: Buffer) =>
      consumeOutput(chunk, false)
    );

    await new Promise<void>((resolve, reject) => {
      child.once('error', reject);
      child.once('close', (code) => {
        if (pendingStdoutLine) handleLine(pendingStdoutLine);
        if (pendingStderrLine) handleLine(pendingStderrLine);
        if (code === 0) resolve();
        else reject(new Error(stderrTail || `yt-dlp exited with code ${code}`));
      });
    });

    if (job.stage !== 'merging') {
      job.stage = 'merging';
      mergeStartedAt = Date.now();
    }

    const mergeTimeLeft =
      MERGE_MIN_DISPLAY_MS -
      (Date.now() - (mergeStartedAt ?? Date.now()));
    if (mergeTimeLeft > 0) {
      await new Promise((resolve) => setTimeout(resolve, mergeTimeLeft));
    }

    const pathLine = stdout
      .split(/\r?\n/)
      .find((line) => line.startsWith('__YT_DLP_PATH__:'));
    const filePath = pathLine?.slice('__YT_DLP_PATH__:'.length).trim();

    if (!filePath || !fs.existsSync(filePath)) {
      throw new Error('Downloaded file not found after merging');
    }

    job.filePath = filePath;
    job.size = fs.statSync(filePath).size;
    job.stage = 'ready';
    job.percent = 100;
    scheduleCleanup(job);
  } catch (error) {
    console.error('Download preparation error:', error);
    job.stage = 'error';
    job.error =
      error instanceof Error ? error.message : 'Download failed';
    // Save failed attempts without replacing the original download error.
    void saveDownloadRecord(job, 'Failed');
    scheduleErrorCleanup(job);
  } finally {
    job.resolveCompletion();
  }
}

function buildArgs(
  job: DownloadJob,
  fullUrl: string,
  outputTemplate: string
): string[] {
  const argsBuilder = new YtDlpArgsBuilder(
    new YtDlpConfig({
      url: fullUrl,
      output: outputTemplate,
      mergeFormat: job.type === 'mp4' ? 'mp4' : undefined,
      audioOnly: job.type === 'mp3',
      audioFormat: job.type === 'mp3' ? 'mp3' : undefined,
      concurrentFragments: 4,
      quiet: false,
      noProgress: false,
    }).values()
  );

  const args = argsBuilder.video(outputTemplate);
  const targetUrl = args.pop();

  args.push(
    '--newline',
    '--progress-template',
    `download:${DOWNLOAD_PROGRESS_MARKER}%(progress.downloaded_bytes)s|%(progress.total_bytes_estimate)s|%(progress.total_bytes)s`,
    targetUrl ?? fullUrl
  );

  return args;
}