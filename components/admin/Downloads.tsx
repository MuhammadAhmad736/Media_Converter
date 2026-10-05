"use client"

import { CheckCircle2, XCircle } from "lucide-react"
import type { AdminDashboardData } from "@/types/admin-dashboard"

type DownloadsProps = { data: AdminDashboardData["downloads"] }

const formatFileSize = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes < 0) return "-"
  if (bytes === 0) return "0 Bytes"
  const units = ["Bytes", "KB", "MB", "GB", "TB"]
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const size = bytes / 1024 ** unitIndex
  return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(size)} ${units[unitIndex]}`
}

const formatDate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
}

const Downloads = ({ data }: DownloadsProps) => {
  const summaryCards = [
    { label: "Total Downloads", value: data.totalDownloads },
    { label: "Successful Downloads", value: data.successfulDownloads },
    { label: "Failed Downloads", value: data.failedDownloads },
    { label: "Downloads Today", value: data.downloadsToday },
  ]
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-[#20253D] sm:text-[2rem]">Downloads</h2>
        <p className="mt-1 text-sm text-[#737991]">Monitor download activity across the Media Converter.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-[#E5E9F4] bg-white p-4 shadow-[0_6px_20px_rgba(32,37,61,0.04)]">
            <p className="text-sm text-[#737991]">{label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-[#20253D]">{value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#E5E9F4] bg-white shadow-[0_6px_20px_rgba(32,37,61,0.04)]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#F8F9FF] text-[#737991]">
              <tr>
                <th className="px-4 py-3.5 font-medium">YouTube Title</th>
                <th className="px-4 py-3.5 font-medium">Platform</th>
                <th className="px-4 py-3.5 font-medium">Duration</th>
                <th className="px-4 py-3.5 font-medium">User</th>
                <th className="px-4 py-3.5 font-medium">Format</th>
                <th className="px-4 py-3.5 font-medium">Quality</th>
                <th className="px-4 py-3.5 font-medium">File Size</th>
                <th className="px-4 py-3.5 font-medium">Status</th>
                <th className="px-4 py-3.5 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.downloadList.length > 0 ? data.downloadList.map(({ id, title, platform, duration, user, format, quality, fileSize, status, date }) => (
                <tr key={id} className="border-t border-[#EEF0F7] last:border-b-0">
                  <td className="px-4 py-3.5 font-medium text-[#20253D]">{title}</td>
                  <td className="px-4 py-3.5 text-[#4F586F]">
                    {platform && platform !== "Other" ? platform : ""}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-[#4F586F]">
                    {duration > 0
                      ? `${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, "0")}`
                      : ""}
                  </td>
                  <td className="px-4 py-3.5 text-[#4F586F]">{user?.name ?? "Guest"}</td>
                  <td className="px-4 py-3.5 text-[#4F586F]">{format}</td>
                  <td className="px-4 py-3.5 text-[#4F586F]">{quality}</td>
                  <td className="px-4 py-3.5 text-[#4F586F]">{formatFileSize(fileSize)}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        status === "Successful"
                          ? "bg-[#EAF9F0] text-[#1D8F5F]"
                          : "bg-[#FFF1F2] text-[#BE3455]"
                      }`}
                    >
                      {status === "Successful" ? <CheckCircle2 size={12} aria-hidden="true" /> : <XCircle size={12} aria-hidden="true" />}
                      {status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-[#4F586F]">{formatDate(date)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-sm text-[#737991]">No downloads available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default Downloads
