import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware/require-admin";
import { connectDB } from "@/lib/db/mongodb";
import Download from "@/models/info";
import User from "@/models/user";
import Visitor from "@/models/visitors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const DOWNLOAD_LIST_LIMIT = 500;
const USER_LIST_LIMIT = 500;

export async function GET(request: NextRequest) {
	try {
		const access = await requireAdmin(request);
		if (!access.authorized) return access.response;

		await connectDB();

		const now = new Date();
		const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
		const weekStart = new Date(today.getTime() - 6 * DAY_IN_MILLISECONDS);
		const activeSince = new Date(now.getTime() - 30 * DAY_IN_MILLISECONDS);
		const newUserSince = new Date(now.getTime() - 7 * DAY_IN_MILLISECONDS);

		const [downloadStatsResult, dailyDownloadResults, downloadCountsByUser, recentDownloads, totalUsers, newUsers, visitor] =
			await Promise.all([
				Download.aggregate<{
					totalDownloads: number;
					successfulDownloads: number;
					failedDownloads: number;
					downloadsToday: number;
					mp4Downloads: number;
					mp3Downloads: number;
				}>([
					{
						$group: {
							_id: null,
							totalDownloads: { $sum: 1 },
							successfulDownloads: {
								$sum: { $cond: [{ $eq: ["$status", "Successful"] }, 1, 0] },
							},
							failedDownloads: {
								$sum: { $cond: [{ $eq: ["$status", "Failed"] }, 1, 0] },
							},
							downloadsToday: {
								$sum: { $cond: [{ $gte: ["$date", today] }, 1, 0] },
							},
							mp4Downloads: {
								$sum: { $cond: [{ $eq: ["$format", "MP4"] }, 1, 0] },
							},
							mp3Downloads: {
								$sum: { $cond: [{ $eq: ["$format", "MP3"] }, 1, 0] },
							},
						},
					},
				]),
				Download.aggregate<{ _id: string; downloads: number }>([
					{ $match: { date: { $gte: weekStart } } },
					{
						$group: {
							_id: { $dateToString: { format: "%Y-%m-%d", date: "$date", timezone: "UTC" } },
							downloads: { $sum: 1 },
						},
					},
				]),
				Download.aggregate<{
					_id: string;
					downloads: number;
					lastDownload: Date;
				}>([
					{ $match: { userId: { $exists: true, $ne: null } } },
					{
						$group: {
							_id: "$userId",
							downloads: { $sum: 1 },
							lastDownload: { $max: "$date" },
						},
					},
				]),
				Download.find().sort({ date: -1 }).limit(DOWNLOAD_LIST_LIMIT).lean(),
				User.countDocuments(),
				User.countDocuments({ createdAt: { $gte: newUserSince } }),
				Visitor.findOne().select("counter").lean(),
			]);

		const stats = downloadStatsResult[0] ?? {
			totalDownloads: 0,
			successfulDownloads: 0,
			failedDownloads: 0,
			downloadsToday: 0,
			mp4Downloads: 0,
			mp3Downloads: 0,
		};
		const dailyDownloads = new Map(dailyDownloadResults.map(({ _id, downloads }) => [_id, downloads]));
		const downloadsOverview = Array.from({ length: 7 }, (_, index) => {
			const date = new Date(weekStart.getTime() + index * DAY_IN_MILLISECONDS);
			const day = date.toISOString().slice(0, 10);
			return {
				day: date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
				downloads: dailyDownloads.get(day) ?? 0,
			};
		});

		const downloadUserIds = [
			...new Set(
				recentDownloads
					.map((download) => download.userId?.toString())
					.filter((userId): userId is string => Boolean(userId)),
			),
		];
		const userRecords = await User.find({ _id: { $in: downloadUserIds } })
			.select("name email")
			.lean();
		const usersById = new Map(userRecords.map((user) => [user._id.toString(), user]));
		const recentUserActivity = new Map(
			downloadCountsByUser.map(({ _id, downloads, lastDownload }) => [
				_id.toString(),
				{ downloads, lastDownload: new Date(lastDownload) },
			]),
		);

		const userRecordsForList = await User.find()
			.select("name email createdAt")
			.sort({ createdAt: -1 })
			.limit(USER_LIST_LIMIT)
			.lean();
		const userList = userRecordsForList.map((user) => {
			const activity = recentUserActivity.get(user._id.toString());
			return {
				id: user._id.toString(),
				name: user.name,
				email: user.email,
				downloads: activity?.downloads ?? 0,
				status: activity && activity.lastDownload >= activeSince ? "Active" : "Inactive",
				joinedAt: user.createdAt?.toISOString() ?? null,
			};
		});
		const activeUsers = recentActivityCount(downloadCountsByUser, activeSince);

		const downloadList = recentDownloads.map((download) => {
			const userId = download.userId?.toString();
			const user = userId ? usersById.get(userId) : undefined;
			return {
				id: download._id.toString(),
				title: download.title,
				platform: download.platform === "Other" ? "" : download.platform ?? "",
				duration: download.duration ?? 0,
				user: user
					? { id: user._id.toString(), name: user.name, email: user.email }
					: null,
				format: download.format,
				quality: download.quality,
				fileSize: download.fileSize,
				status: download.status,
				date: download.date.toISOString(),
			};
		});
		const recentDownloadList = downloadList.slice(0, 10).map(({ id, title, platform, duration, format, quality, status, date }) => ({
			id,
			title,
			platform,
			duration,
			format,
			quality,
			status,
			date,
		}));

		return NextResponse.json({
			success: true,
			dashboard: {
				stats: {
					totalDownloads: stats.totalDownloads,
					successfulDownloads: stats.successfulDownloads,
					failedDownloads: stats.failedDownloads,
					downloadsToday: stats.downloadsToday,
				},
				recentDownloads: recentDownloadList,
			},
			analytics: {
				totalDownloads: stats.totalDownloads,
				successfulDownloads: stats.successfulDownloads,
				failedDownloads: stats.failedDownloads,
				downloadsToday: stats.downloadsToday,
				downloadsOverview,
				downloadStatus: {
					successful: stats.successfulDownloads,
					failed: stats.failedDownloads,
				},
				formatUsage: { mp4: stats.mp4Downloads, mp3: stats.mp3Downloads },
			},
			users: {
				totalUsers,
				activeUsers,
				newUsers,
				totalVisitors: visitor?.counter ?? 0,
				userList,
			},
			downloads: {
				totalDownloads: stats.totalDownloads,
				successfulDownloads: stats.successfulDownloads,
				failedDownloads: stats.failedDownloads,
				downloadsToday: stats.downloadsToday,
				downloadList,
			},
		});
	} catch (error) {
		console.error("Admin dashboard data error:", error);
		return NextResponse.json(
			{ success: false, message: "Could not load dashboard data." },
			{ status: 500 },
		);
	}
}

function recentActivityCount(
	records: Array<{ lastDownload: Date }>,
	activeSince: Date,
) {
	return records.filter(({ lastDownload }) => new Date(lastDownload) >= activeSince).length;
}
