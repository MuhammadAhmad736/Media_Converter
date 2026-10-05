import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@choewy/yt-dlp", "ffmpeg-static"],
  outputFileTracingIncludes: {
    "/*": [
      "node_modules/@choewy/yt-dlp/**/*",
      "node_modules/ffmpeg-static/**/*",
    ],
  },
};

export default nextConfig;
