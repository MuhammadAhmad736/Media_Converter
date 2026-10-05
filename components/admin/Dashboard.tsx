"use client"

import { CalendarDays, CheckCircle2, Download, XCircle } from "lucide-react"
import type { AdminDashboardData } from "@/types/admin-dashboard"

type DashboardProps = { data: AdminDashboardData["dashboard"] }

const formatDate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
}

const Dashboard = ({ data }: DashboardProps) => {
  const summaryCards = [
    { label: "Total Downloads", value: data.stats.totalDownloads, icon: Download },
    { label: "Successful Downloads", value: data.stats.successfulDownloads, icon: CheckCircle2 },
    { label: "Failed Downloads", value: data.stats.failedDownloads, icon: XCircle },
    { label: "Downloads Today", value: data.stats.downloadsToday, icon: CalendarDays },
  ]
  const recentDownloads = data.recentDownloads

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-[#20253D] sm:text-[2rem]">Dashboard</h2>
        <p className="mt-1 text-sm text-[#737991]">Download activity at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-[#E5E9F4] bg-white p-4 shadow-[0_6px_20px_rgba(32,37,61,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-[#737991]">{label}</p>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-[#20253D]">{value.toLocaleString()}</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4F7FF] text-[#3B6BFF]">
                <Icon size={18} strokeWidth={2} aria-hidden="true" />
              </span>
            </div>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#E5E9F4] bg-white shadow-[0_6px_20px_rgba(32,37,61,0.04)]">
        <div className="border-b border-[#EEF0F7] px-4 py-4 sm:px-5">
          <h3 className="text-lg font-semibold text-[#20253D]">Recent Downloads</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#F8F9FF] text-[#737991]">
              <tr>
                <th className="px-4 py-3.5 font-medium">YouTube Title</th>
                <th className="px-4 py-3.5 font-medium">Platform</th>
                <th className="px-4 py-3.5 font-medium">Duration</th>
                <th className="px-4 py-3.5 font-medium">Format</th>
                <th className="px-4 py-3.5 font-medium">Quality</th>
                <th className="px-4 py-3.5 font-medium">Status</th>
                <th className="px-4 py-3.5 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentDownloads.length > 0 ? recentDownloads.map((download) => {
                const isFailed = download.status.toLowerCase() === "failed"
                const durationMinutes = Math.floor(download.duration / 60)
                const durationSeconds = download.duration % 60

                return (
                  <tr key={download.id} className="border-t border-[#EEF0F7]">
                    <td className="px-4 py-3.5 font-medium text-[#20253D]">{download.title}</td>
                    <td className="px-4 py-3.5 text-[#4F586F]">
                      {download.platform && download.platform !== "Other" ? download.platform : ""}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#4F586F]">
                      {download.duration > 0
                        ? `${durationMinutes}:${String(durationSeconds).padStart(2, "0")}`
                        : ""}
                    </td>
                    <td className="px-4 py-3.5 text-[#4F586F]">{download.format}</td>
                    <td className="px-4 py-3.5 text-[#4F586F]">{download.quality}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${isFailed ? "bg-[#FFF1F2] text-[#BE3455]" : "bg-[#EAF9F0] text-[#1D8F5F]"}`}>
                        {download.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#4F586F]">{formatDate(download.date)}</td>
                  </tr>
                )
              }) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-[#737991]">No recent downloads.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default Dashboard