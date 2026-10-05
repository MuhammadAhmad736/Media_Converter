"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoaderCircle, Menu, ShieldCheck, X } from "lucide-react"
import AdminSidebar, { type AdminSection } from "@/components/admin/AdminSidebar"
import Dashboard from "@/components/admin/Dashboard"
import Analytics from "@/components/admin/Analytics"
import PasswordSettingsModal from "@/components/admin/PasswordSettingsModal"
import Downloads from "@/components/admin/Downloads"
import Users from "@/components/admin/Users"
import { toast } from "react-toastify"
import type { AdminDashboardData } from "@/types/admin-dashboard"

type AdminAuthStatus = "checking" | "authenticated" | "error"

const Page = () => {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<AdminSection>("Dashboard")
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [authStatus, setAuthStatus] = useState<AdminAuthStatus>("checking")
  const [authError, setAuthError] = useState("")
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [authCheckAttempt, setAuthCheckAttempt] = useState(0)
  const [adminName, setAdminName] = useState("")
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null)
  const [isDashboardLoading, setIsDashboardLoading] = useState(false)
  const [dashboardError, setDashboardError] = useState("")
  const [dashboardRefresh, setDashboardRefresh] = useState(0)

  useEffect(() => {
    let isCurrent = true

    fetch("/api/user/login", {
      cache: "no-store",
      credentials: "include",
    })
      .then(async (response) => {
        const result = (await response.json()) as {
          authenticated?: boolean
          error?: string
          user?: { name?: string; isAdmin?: boolean }
        }
        if (!response.ok || !result.authenticated || result.user?.isAdmin !== true) {
          throw new Error(result.error || "Could not verify admin access.")
        }
        return result
      })
      .then((result) => {
        if (!isCurrent) return

        setAuthError("")
        setAdminName(result.user?.name?.trim() || "Admin")
        setAuthStatus("authenticated")
      })
      .catch((error: unknown) => {
        if (!isCurrent) return
        setAuthError(error instanceof Error ? error.message : "Could not verify admin access.")
        setAuthStatus("error")
      })

    return () => {
      isCurrent = false
    }
  }, [authCheckAttempt])

  useEffect(() => {
    if (authStatus !== "authenticated") {
      return
    }

    let isCurrent = true
    setIsDashboardLoading(true)
    setDashboardError("")

    fetch("/api/admin/dashboard", {
      cache: "no-store",
      credentials: "include",
    })
      .then(async (response) => {
        const result = (await response.json()) as Partial<AdminDashboardData> & {
          message?: string;
          success?: boolean;
        }

        if (!response.ok || result.success === false) {
          throw new Error(result.message || "Could not load dashboard data.")
        }
        if (!result.dashboard || !result.analytics || !result.users || !result.downloads) {
          throw new Error("The dashboard response is incomplete.")
        }

        return result as AdminDashboardData
      })
      .then((result) => {
        if (isCurrent) setDashboardData(result)
      })
      .catch((error: unknown) => {
        if (!isCurrent) return
        setDashboardError(error instanceof Error ? error.message : "Could not load dashboard data.")
      })
      .finally(() => {
        if (isCurrent) setIsDashboardLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [authStatus, dashboardRefresh])

  useEffect(() => {
    if (authStatus === "authenticated") return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [authStatus])

  const handleSectionChange = (section: AdminSection) => {
    setActiveSection(section)
  }

  const handleLogout = async () => {
    setAuthError("")
    setIsLoggingOut(true)
    try {
      const response = await fetch("/api/user/login", {
        method: "DELETE",
        credentials: "include",
      })
      if (!response.ok) throw new Error("Could not close the admin session. Try again.")
      router.replace("/")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not close the admin session."
      setIsLoggingOut(false)
      toast.error(message)
    }
  }

  return (
    <div className="min-h-screen bg-background text-[#20253D]">
      <div className="flex min-h-screen">
        <AdminSidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          isExpanded={isSidebarExpanded}
          isMobileOpen={isMobileSidebarOpen}
          onToggleExpanded={() => setIsSidebarExpanded((expanded) => !expanded)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onLogout={() => void handleLogout()}
        />
        {isMobileSidebarOpen && (
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-[#20253D]/25 backdrop-blur-[2px] md:hidden"
          />
        )}
        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex min-h-20.5 items-center gap-4 border-b border-[#E5E9F4] bg-background/90 px-4 py-4 backdrop-blur-xl sm:px-6 md:min-h-24 md:px-8 lg:px-10">
            <button
              type="button"
              aria-label={isMobileSidebarOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileSidebarOpen}
              onClick={() => setIsMobileSidebarOpen((open) => !open)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#DDE3F2] bg-white text-[#2C4DE2] shadow-[0_4px_12px_rgba(32,37,61,0.04)] transition-colors hover:bg-[#EAEDFF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B6BFF] md:hidden"
            >
              {isMobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#737991]">Media Converter</p>
              <h1 className="mt-1 flex min-w-0 items-center gap-2 truncate text-xl font-semibold text-[#20253D] sm:text-2xl">
                Welcome, <span className="truncate text-[#3358E8]">{adminName || "Admin"}</span>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#EAF9F0] px-2 py-1 text-[10px] font-semibold text-[#1D8F5F] sm:text-xs">
                  <ShieldCheck size={13} aria-hidden="true" />
                  Admin
                </span>
              </h1>
            </div>
          </header>
          <div className="px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:px-10">
            {authStatus === "authenticated" && (
              isDashboardLoading ? (
                <div className="flex min-h-48 items-center justify-center gap-3 text-sm font-medium text-[#737991]" role="status">
                  <LoaderCircle className="animate-spin text-[#3B6BFF]" size={22} aria-hidden="true" />
                  Loading dashboard data...
                </div>
              ) : dashboardError ? (
                <div className="rounded-xl border border-[#F5CBD3] bg-white p-5 text-sm text-[#A52E49]" role="alert">
                  <p>{dashboardError}</p>
                  <button
                    type="button"
                    onClick={() => setDashboardRefresh((refresh) => refresh + 1)}
                    className="mt-3 rounded-lg bg-[#3B6BFF] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#2C4DE2]"
                  >
                    Retry
                  </button>
                </div>
              ) : dashboardData ? (
                activeSection === "Dashboard" ? <Dashboard data={dashboardData.dashboard} /> :
                activeSection === "Analytics" ? <Analytics data={dashboardData.analytics} /> :
                activeSection === "Users" ? <Users data={dashboardData.users} /> :
                activeSection === "Downloads" ? <Downloads data={dashboardData.downloads} /> :
                null
              ) : null
            )}
          </div>
        </main>
      </div>
      {isSettingsOpen && (
        <PasswordSettingsModal
          onClose={() => setIsSettingsOpen(false)}
          onPasswordUpdated={() => {
            setIsSettingsOpen(false)
            setActiveSection("Dashboard")
          }}
        />
      )}
      {isLoggingOut && (
        <div
          className="fixed inset-0 z-[120] grid place-items-center bg-[#17233B]/45 px-4 py-6 backdrop-blur-md"
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#E5E9F4] bg-white px-8 py-7 text-[#737991] shadow-[0_28px_80px_rgba(19,30,63,0.25)]">
            <LoaderCircle className="animate-spin text-[#3B6BFF]" size={30} aria-hidden="true" />
            <span className="text-sm font-medium">Signing out...</span>
          </div>
        </div>
      )}
      {!isLoggingOut && (authStatus === "checking" || authStatus === "error") && (
        <div className="admin-auth-backdrop fixed inset-0 z-[100] grid place-items-center bg-[#17233B]/45 px-4 py-6 backdrop-blur-md sm:px-6">
          <section
            aria-live={authStatus === "error" ? "assertive" : "polite"}
            className="admin-auth-dialog w-full max-w-[440px] rounded-2xl border border-[#E5E9F4] bg-white p-7 text-center shadow-[0_28px_80px_rgba(19,30,63,0.25)] sm:p-8"
            role={authStatus === "error" ? "alert" : "status"}
          >
            {authStatus === "checking" ? (
              <>
                <LoaderCircle className="mx-auto animate-spin text-[#3B6BFF]" size={26} aria-hidden="true" />
                <h2 className="mt-4 text-lg font-semibold text-[#20253D]">Checking admin access</h2>
                <p className="mt-1 text-sm text-[#737991]">Connecting securely to the admin workspace.</p>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-[#20253D]">Unable to verify admin access</h2>
                <p className="mt-2 text-sm text-[#737991]">{authError}</p>
                <button
                  className="mt-5 h-10 rounded-lg bg-[#3B6BFF] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#2C4DE2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B6BFF]"
                  onClick={() => {
                    setAuthStatus("checking")
                    setAuthCheckAttempt((attempt) => attempt + 1)
                  }}
                  type="button"
                >
                  Retry
                </button>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

export default Page
