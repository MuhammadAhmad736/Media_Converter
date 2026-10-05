import fs from 'fs';
import path from 'path';
import os from 'os';
import { randomUUID } from 'node:crypto';
import type { DownloadJob, DownloadType } from './types';

const PREPARED_DOWNLOAD_TTL_MS = 30 * 60 * 1000;
const ERROR_CLEANUP_TTL_MS = 2 * 60 * 1000;

const jobs = new Map<string, DownloadJob>();

export function getJob(id: string): DownloadJob | undefined {
  return jobs.get(id);
}

export function addJob(job: DownloadJob): void {
  jobs.set(job.id, job);
}

export function createJob(type: DownloadType): DownloadJob {
  const id = randomUUID();
  const tempDir = path.join(os.tmpdir(), `ytdlp-${id}`);
  fs.mkdirSync(tempDir, { recursive: true });

  let resolveCompletion!: () => void;
  const completion = new Promise<void>((resolve) => {
    resolveCompletion = resolve;
  });

  const job: DownloadJob = {
    id,
    tempDir,
    type,
    stage: 'downloading',
    downloadedBytes: 0,
    totalBytes: null,
    percent: null,
    transferredBytes: 0,
    completion,
    resolveCompletion,
  };

  jobs.set(id, job);
  return job;
}

export function scheduleCleanup(
  job: DownloadJob,
  delay = PREPARED_DOWNLOAD_TTL_MS
): void {
  clearTimeout(job.cleanupTimer);
  job.cleanupTimer = setTimeout(() => cleanupJob(job.id), delay);
  job.cleanupTimer.unref();
}

export function scheduleErrorCleanup(job: DownloadJob): void {
  scheduleCleanup(job, ERROR_CLEANUP_TTL_MS);
}

export function cleanupJob(id: string): void {
  const job = jobs.get(id);
  if (!job) return;

  clearTimeout(job.cleanupTimer);
  jobs.delete(id);

  try {
    fs.rmSync(job.tempDir, { recursive: true, force: true });
  } catch (error) {
    console.error('Download cleanup error:', error);
  }
}