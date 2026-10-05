"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { CalendarDays, CheckCircle2, Download, XCircle } from "lucide-react"
import type { AdminDashboardData } from "@/types/admin-dashboard"

type AnalyticsProps = { data: AdminDashboardData["analytics"] }

const formatColors = ["#3B6BFF", "#7C8BFF"]

const Analytics = ({ data }: AnalyticsProps) => {
  const downloadTrendData = data.downloadsOverview
  const downloadStatusData = [
    { name: "Successful", value: data.downloadStatus.successful },
    { name: "Failed", value: data.downloadStatus.failed },
  ]
  const formatUsageData = [
    { name: "MP4", downloads: data.formatUsage.mp4 },
    { name: "MP3", downloads: data.formatUsage.mp3 },
  ]
  const summaryCards = [
    { label: "Total Downloads", value: data.totalDownloads, icon: Download },
    { label: "Successful Downloads", value: data.successfulDownloads, icon: CheckCircle2 },
    { label: "Failed Downloads", value: data.failedDownloads, icon: XCircle },
    { label: "Downloads Today", value: data.downloadsToday, icon: CalendarDays },
  ]
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-[#20253D] sm:text-[2rem]">Analytics</h2>
        <p className="mt-1 text-sm text-[#737991]">Track your Media Converter activity and usage.</p>
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

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-2xl border border-[#E5E9F4] bg-white p-4 shadow-[0_6px_20px_rgba(32,37,61,0.04)] sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-[#20253D]">Downloads Overview</h3>
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#737991]">7 days</span>
          </div>

          {downloadTrendData.length > 0 ? <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={downloadTrendData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="#EEF0F7" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#737991", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#737991", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E5E9F4",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 8px 20px rgba(32,37,61,0.08)",
                  }}
                />
                <Line type="monotone" dataKey="downloads" stroke="#3B6BFF" strokeWidth={3} dot={{ r: 4, fill: "#3B6BFF" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div> : <div className="grid h-64 place-items-center text-sm text-[#737991]">No download data available.</div>}
        </section>

        <section className="rounded-2xl border border-[#E5E9F4] bg-white p-4 shadow-[0_6px_20px_rgba(32,37,61,0.04)] sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-[#20253D]">Download Status</h3>
          </div>

          {downloadStatusData.some((entry) => entry.value > 0) ? <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={downloadStatusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={42}
                  outerRadius={68}
                  paddingAngle={4}
                >
                  {downloadStatusData.map((entry, index) => (
                    <Cell key={entry.name} fill={index === 0 ? "#1D8F5F" : "#BE3455"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E5E9F4",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 8px 20px rgba(32,37,61,0.08)",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div> : <div className="grid h-64 place-items-center text-sm text-[#737991]">No download status data available.</div>}
        </section>
      </div>

      <section className="rounded-2xl border border-[#E5E9F4] bg-white p-4 shadow-[0_6px_20px_rgba(32,37,61,0.04)] sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-[#20253D]">Format Usage</h3>
        </div>

        {formatUsageData.some((entry) => entry.downloads > 0) ? <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formatUsageData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="#EEF0F7" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#737991", fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "#737991", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E5E9F4",
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0 8px 20px rgba(32,37,61,0.08)",
                }}
              />
              <Bar dataKey="downloads" radius={[8, 8, 0, 0]}>
                {formatUsageData.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={formatColors[index % formatColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div> : <div className="grid h-64 place-items-center text-sm text-[#737991]">No format data available.</div>}
      </section>
    </div>
  )
}

export default Analytics
