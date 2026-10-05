export type AdminDashboardData = {
  dashboard: {
    stats: {
      totalDownloads: number;
      successfulDownloads: number;
      failedDownloads: number;
      downloadsToday: number;
    };
    recentDownloads: Array<{
      id: string;
      title: string;
      platform: string;
      duration: number;
      format: string;
      quality: string;
      status: string;
      date: string;
    }>;
  };
  analytics: {
    totalDownloads: number;
    successfulDownloads: number;
    failedDownloads: number;
    downloadsToday: number;
    downloadsOverview: Array<{ day: string; downloads: number }>;
    downloadStatus: { successful: number; failed: number };
    formatUsage: { mp4: number; mp3: number };
  };
  users: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    totalVisitors: number;
    userList: Array<{
      id: string;
      name: string;
      email: string;
      downloads: number;
      status: string;
      joinedAt?: string | null;
    }>;
  };
  downloads: {
    totalDownloads: number;
    successfulDownloads: number;
    failedDownloads: number;
    downloadsToday: number;
    downloadList: Array<{
      id: string;
      title: string;
      platform: string;
      duration: number;
      user: { id: string; name: string; email: string } | null;
      format: string;
      quality: string;
      fileSize: number;
      status: string;
      date: string;
    }>;
  };
};