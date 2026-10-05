"use client";

import {
  BarChart3,
  CloudDownload,
  Download,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";

export type AdminSection = "Dashboard" | "Analytics" | "Users" | "Downloads";

type AdminSidebarProps = {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  isExpanded: boolean;
  isMobileOpen: boolean;
  onToggleExpanded: () => void;
  onOpenSettings: () => void;
  onCloseMobile: () => void;
  onLogout: () => void;
};

const navigationItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Analytics", icon: BarChart3 },
  { label: "Users", icon: Users },
  { label: "Downloads", icon: Download },
] satisfies { label: AdminSection; icon: typeof LayoutDashboard }[];

export default function AdminSidebar({
  activeSection,
  onSectionChange,
  isExpanded,
  isMobileOpen,
  onToggleExpanded,
  onOpenSettings,
  onCloseMobile,
  onLogout,
}: AdminSidebarProps) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex h-screen w-72 shrink-0 flex-col border-r border-[#E5E9F4] bg-white shadow-[0_16px_40px_rgba(32,37,61,0.12)] md:sticky md:top-0 md:z-auto md:h-screen md:w-19 md:translate-x-0 md:shadow-none ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} ${isExpanded ? "lg:w-64" : "lg:w-19"}`}
    >
      <div className={`flex items-center justify-between px-5 py-5 md:max-lg:justify-center ${isExpanded ? "" : "lg:justify-center"}`}>
        <div className={`flex min-w-0 items-center gap-3 md:max-lg:justify-center ${isExpanded ? "" : "lg:justify-center"}`}>
          <Link
            href="/admin"
            aria-label="Media Converter"
            onClick={onCloseMobile}
            className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(145deg,#4B7BFF,#2C4DE2)] text-white shadow-[0_8px_18px_rgba(44,77,226,0.22)] transition-transform hover:-rotate-3"
          >
            <CloudDownload size={22} strokeWidth={2.2} aria-hidden="true" />
          </Link>
          <div className={`min-w-0 ${isExpanded ? "md:max-lg:hidden" : "hidden"}`}>
            <Link
              href="/admin"
              onClick={onCloseMobile}
              className="block w-fit text-sm font-bold tracking-tight text-[#20253D] hover:text-[#2C4DE2]"
            >
              Media Converter
            </Link>
            <span className="mt-0.5 block text-xs font-medium text-[#737991]">Admin workspace</span>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={onCloseMobile}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#737991] transition-colors hover:bg-[#F4F7FF] hover:text-[#2C4DE2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B6BFF] md:hidden"
        >
          <X size={19} aria-hidden="true" />
        </button>
      </div>

      <div className={`hidden px-3 pt-3 lg:flex ${isExpanded ? "justify-end" : "justify-center"}`}>
        <button
          type="button"
          aria-label={isExpanded ? "Make sidebar compact" : "Expand sidebar"}
          aria-expanded={isExpanded}
          title={isExpanded ? "Make sidebar compact" : "Expand sidebar"}
          onClick={onToggleExpanded}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#737991] transition-colors hover:bg-[#F4F7FF] hover:text-[#2C4DE2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B6BFF]"
        >
          {isExpanded ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>
      </div>

      <nav aria-label="Admin sections" className="flex-1 space-y-1 px-3 py-5 md:max-lg:px-2">
        <p className={`mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9AA1B5] md:max-lg:hidden ${isExpanded ? "" : "lg:hidden"}`}>Workspace</p>
        {navigationItems.map(({ label, icon: Icon }) => {
          const isActive = activeSection === label;

          return (
            <button
              key={label}
              type="button"
              aria-current={isActive ? "page" : undefined}
              title={label}
              onClick={() => {
                onSectionChange(label);
                onCloseMobile();
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B6BFF] md:max-lg:justify-center md:max-lg:px-0 ${!isExpanded ? "lg:justify-center lg:px-0" : ""} ${
                isActive
                  ? "bg-[#EAEDFF] text-[#2C4DE2] shadow-[0_3px_10px_rgba(65,116,255,0.08)]"
                  : "text-[#737991] hover:bg-[#F4F7FF] hover:text-[#2C4DE2]"
              }`}
            >
              <Icon size={18} strokeWidth={2} aria-hidden="true" />
              <span className={`md:max-lg:hidden ${isExpanded ? "" : "lg:hidden"}`}>{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="space-y-1 p-3 md:max-lg:px-2">
        <button
          type="button"
          title="Settings"
          onClick={() => {
            onOpenSettings();
            onCloseMobile();
          }}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#737991] transition-colors hover:bg-[#F4F7FF] hover:text-[#2C4DE2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B6BFF] md:max-lg:justify-center md:max-lg:px-0 ${!isExpanded ? "lg:justify-center lg:px-0" : ""}`}
        >
          <Settings size={19} aria-hidden="true" />
          <span className={`md:max-lg:hidden ${isExpanded ? "" : "lg:hidden"}`}>Settings</span>
        </button>
      </div>

      <div className="  p-3 md:max-lg:px-2">
        <button
          type="button"
          title="Logout"
          onClick={onLogout}
          className={`flex w-full items-center gap-3 rounded-lg bg-[#FFF1F2] px-3 py-2.5 text-sm font-semibold text-[#BE3455] shadow-[inset_0_0_0_1px_rgba(190,52,85,0.08)] transition-colors hover:bg-[#FFE4E8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BE3455] md:max-lg:justify-center md:max-lg:px-0 ${!isExpanded ? "lg:justify-center lg:px-0" : ""}`}
        >
          <LogOut size={19} aria-hidden="true" />
          <span className={`md:max-lg:hidden ${isExpanded ? "" : "lg:hidden"}`}>Logout</span>
        </button>
      </div>
    </aside>
  );
}