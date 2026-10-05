export type DownloadType = 'mp4' | 'mp3';

export type DownloadStage =
  | 'downloading'
  | 'merging'
  | 'ready'
  | 'transferring'
  | 'complete'
  | 'error';

export type DownloadTracking = {
  userId?: string;
  title: string;
  platform: string;
  duration: number;
  quality: string;
};

export type DownloadJob = {
  id: string;
  userId?: string;
  tempDir: string;
  type: DownloadType;
  stage: DownloadStage;
  downloadedBytes: number;
  totalBytes: number | null;
  percent: number | null;
  transferredBytes: number;
  filePath?: string;
  size?: number;
  error?: string;
  tracking?: Promise<DownloadTracking | null>;
  recordPromise?: Promise<void>;
  cleanupTimer?: NodeJS.Timeout;
  completion: Promise<void>;
  resolveCompletion: () => void;
};