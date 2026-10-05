import Download from '@/models/info';
import { connectDB } from '@/lib/db/mongodb';
import type { DownloadJob } from './types';

export async function saveDownloadRecord(
  job: DownloadJob,
  status: 'Successful' | 'Failed'
): Promise<void> {
  if (!job.tracking) return;

  if (!job.recordPromise) {
    job.recordPromise = (async () => {
      try {
        const tracking = await job.tracking;
        if (!tracking) return;

        await connectDB();
        await Download.create({
          ...(tracking.userId ? { userId: tracking.userId } : {}),
          title: tracking.title,
          format: job.type === 'mp4' ? 'MP4' : 'MP3',
          platform: tracking.platform,
          duration: tracking.duration,
          quality: tracking.quality,
          fileSize: status === 'Successful' ? job.size ?? 0 : 0,
          status,
          date: new Date(),
        });
      } catch (error) {
        console.error('Download history save error:', error);
      }
    })();
  }

  await job.recordPromise;
}