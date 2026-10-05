"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import type { AdminDashboardData } from "@/types/admin-dashboard"

type UsersProps = { data: AdminDashboardData["users"] }

const formatDate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString()
}

const Users = ({ data }: UsersProps) => {
  const [hiddenUsers, setHiddenUsers] = useState<Set<string>>(() => new Set())
  const userList = data.userList
  const summaryCards = [
    { label: "Visitors", value: data.totalVisitors },
    { label: "Total Users", value: data.totalUsers },
    { label: "Active Users", value: data.activeUsers },
    { label: "New Users (Last 7 Days)", value: data.newUsers },
  ]

  const toggleUserVisibility = (id: string) => {
    setHiddenUsers((current) => {
      const updated = new Set(current)
      if (updated.has(id)) updated.delete(id)
      else updated.add(id)
      return updated
    })
  }
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-[#20253D] sm:text-[2rem]">Users</h2>
        <p className="mt-1 text-sm text-[#737991]">Manage and monitor registered users.</p>
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
                <th className="px-4 py-3.5 font-medium">User</th>
                <th className="px-4 py-3.5 font-medium">Email</th>
                <th className="px-4 py-3.5 font-medium">Downloads</th>
                <th className="px-4 py-3.5 font-medium">Status</th>
                <th className="px-4 py-3.5 font-medium">Joined Date</th>
                <th className="px-4 py-3.5 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {userList.length > 0 ? userList.map(({ id, name, email, downloads, status, joinedAt }) => {
                const isHidden = hiddenUsers.has(id)

                return (
                <tr key={id} className="border-t border-[#EEF0F7] last:border-b-0">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAEDFF] text-xs font-semibold text-[#2C4DE2]">
                        {isHidden ? "" : name
                          .split(" ")
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                      <span className="font-medium text-[#20253D]">{isHidden ? "*****" : name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[#4F586F]">{isHidden ? "*****" : email}</td>
                  <td className="px-4 py-3.5 text-[#4F586F]">{isHidden ? "-" : downloads}</td>
                  <td className="px-4 py-3.5">
                    {isHidden ? "-" : (
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${
                          status === "Active"
                            ? "bg-[#EAF9F0] text-[#1D8F5F]"
                            : "bg-[#FFF1F2] text-[#BE3455]"
                        }`}
                      >
                        {status}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-[#4F586F]">{isHidden ? "-" : joinedAt ? formatDate(joinedAt) : "-"}</td>
                  <td className="px-4 py-3.5">
                    <button
                      type="button"
                      aria-label={isHidden ? "Show user information" : "Hide user information"}
                      aria-pressed={!isHidden}
                      onClick={() => toggleUserVisibility(id)}
                      className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-[#DDE3F2] bg-white p-2 text-[#2C4DE2] transition-colors hover:bg-[#F4F7FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B6BFF]"
                    >
                      {isHidden ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                    </button>
                  </td>
                </tr>
                )
              }) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#737991]">No users available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default Users
