"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { CloudDownload, LoaderCircle, LogOut, Menu, ShieldCheck, UserRound, X } from "lucide-react";
import UserAuthModal, {
  type UserAuthCredentials,
  type UserAuthMode,
} from "@/components/UserAuthModal";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "About", href: "#about" },
];

const Navbar = () => {
  const [activeItem, setActiveItem] = useState("Home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState<UserAuthMode | null>(null);
  const [authError, setAuthError] = useState("");
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [user, setUser] = useState<{ name: string; email: string; isAdmin: boolean } | null>(null);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAccountMenuOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !accountMenuRef.current?.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [isAccountMenuOpen]);

  useEffect(() => {
    let isCurrent = true;

    fetch("/api/user/login", { cache: "no-store", credentials: "include" })
      .then(async (response) => {
        const result = (await response.json()) as {
          authenticated?: boolean;
          user?: { name?: string; email?: string; isAdmin?: boolean };
        };

        if (!response.ok) throw new Error("Could not check your account.");
        return result;
      })
      .then((result) => {
        if (!isCurrent) return;
        setUser(result.authenticated && result.user?.name
          ? { name: result.user.name, email: result.user.email ?? "", isAdmin: result.user.isAdmin === true }
          : null);
      })
      .catch(() => {
        if (isCurrent) setUser(null);
      })
      .finally(() => {
        if (isCurrent) setIsCheckingUser(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const handleAuthSubmit = async (credentials: UserAuthCredentials) => {
    if (!authMode) return;

    setIsAuthSubmitting(true);
    setAuthError("");

    try {
      const response = await fetch("/api/user/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: authMode === "signup" ? "register" : "login", ...credentials }),
      });
      const result = (await response.json()) as {
        error?: string;
        user?: { name?: string; email?: string; isAdmin?: boolean };
      };

      if (!response.ok) throw new Error(result.error || "Could not sign in.");

      setUser({
        name: result.user?.name || credentials.name || "User",
        email: result.user?.email || credentials.email,
        isAdmin: result.user?.isAdmin === true,
      });
      setAuthMode(null);
      setIsAccountMenuOpen(false);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Authentication is temporarily unavailable.");
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    const loaderStartedAt = Date.now();
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/user/login", {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Could not log out. Please try again.");
      setUser(null);
      setIsAccountMenuOpen(false);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Could not log out.");
      setIsAccountMenuOpen(false);
      setAuthMode("login");
    } finally {
      const remainingLoaderTime = 500 - (Date.now() - loaderStartedAt);
      if (remainingLoaderTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingLoaderTime));
      }
      setIsLoggingOut(false);
    }
  };

  const selectItem = (label: string) => {
    setActiveItem(label);
    setIsMenuOpen(false);
  };

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    label: string,
    href: string,
  ) => {
    event.preventDefault();
    selectItem(label);

    const target = document.querySelector<HTMLElement>(href);

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", href);
    }
  };

  useEffect(() => {
    const sections = navItems
      .map((item) => document.querySelector<HTMLElement>(item.href))
      .filter((section): section is HTMLElement => Boolean(section));

    const updateActiveItem = () => {
      const readingLine = window.innerHeight * 0.35;
      const currentSection = [...sections]
        .reverse()
        .find((section) => section.getBoundingClientRect().top <= readingLine);
      const activeSection = navItems.find(
        (item) => item.href === `#${currentSection?.id}`,
      );

      if (activeSection) {
        setActiveItem((current) =>
          current === activeSection.label ? current : activeSection.label,
        );
      }
    };

    window.addEventListener("scroll", updateActiveItem, { passive: true });
    window.addEventListener("resize", updateActiveItem);
    updateActiveItem();

    return () => {
      window.removeEventListener("scroll", updateActiveItem);
      window.removeEventListener("resize", updateActiveItem);
    };
  }, []);

  return (
    <>
    <header className="sticky top-0 z-50 hidden bg-transparent sm:block">
      <nav
        className="relative mx-3 my-2 flex min-h-14 max-w-6xl items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/65 px-3 py-2 shadow-[0_8px_24px_rgba(32,37,61,0.08)] backdrop-blur-xl sm:mx-5 sm:my-3 sm:min-h-15 sm:gap-5 sm:px-5 lg:mx-auto lg:min-h-16 lg:px-8"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="group flex min-w-0 shrink-0 items-center gap-2.5 text-base font-bold text-[#20253D] transition-opacity hover:opacity-80 sm:gap-3 sm:text-[17px]"
          onClick={() => selectItem("Home")}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(145deg,#4B7BFF,#2C4DE2)] text-white shadow-[0_8px_18px_rgba(44,77,226,0.22)] transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105 sm:h-10 sm:w-10">
            <CloudDownload size={21} strokeWidth={2.4} aria-hidden="true" />
          </span>
          <span>Media Converter</span>
        </Link>

        <div
          className={`absolute left-3 right-3 top-[calc(100%+0.5rem)] flex flex-col items-stretch gap-1 rounded-xl border border-[#E5E9F4] bg-white p-2 shadow-[0_18px_45px_rgba(32,37,61,0.14)] transition-[opacity,transform,visibility] duration-200 sm:left-5 sm:right-5 sm:p-3 lg:pointer-events-auto lg:static lg:flex-row lg:items-center lg:justify-center lg:gap-1.5 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:translate-y-0 ${isMenuOpen ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none -translate-y-2 opacity-0"} lg:visible lg:opacity-100`}
        >
          {navItems.map((item) => {
            const isActive = activeItem === item.label;

            return (
              <a
                key={item.label}
                href={item.href}
                className={`relative w-full rounded-lg px-3.5 py-3 text-left text-sm font-semibold transition-colors duration-200 lg:after:absolute lg:after:bottom-1 lg:after:left-3 lg:after:right-3 lg:after:h-0.5 lg:after:origin-center lg:after:rounded-full lg:after:bg-[#3B6BFF] lg:after:transition-transform lg:after:duration-200 lg:after:ease-out lg:w-auto lg:px-3 lg:py-2.5 lg:text-center lg:text-[13px] lg:whitespace-nowrap ${isActive ? "bg-[#EAEDFF] text-[#2C4DE2] lg:after:scale-x-100 lg:shadow-[0_3px_10px_rgba(65,116,255,0.08)]" : "text-[#737991] lg:after:scale-x-0 hover:bg-[#F4F7FF] hover:text-[#2C4DE2] lg:hover:after:scale-x-100"}`}
                aria-current={isActive ? "page" : undefined}
                onClick={(event) => handleNavClick(event, item.label, item.href)}
              >
                {item.label}
              </a>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isCheckingUser ? (
            <span aria-label="Checking account" className="h-9 w-9 animate-pulse rounded-full bg-[#EAEDFF] sm:h-10 sm:w-10" />
          ) : user ? (
            <div ref={accountMenuRef} className="relative">
              <button
                type="button"
                aria-label={`Account menu for ${user.name}${user.isAdmin ? ", admin" : ""}`}
                aria-expanded={isAccountMenuOpen}
                onClick={() => setIsAccountMenuOpen((open) => !open)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D7E0FF] bg-[#F4F7FF] text-sm font-semibold text-[#2C4DE2] shadow-[0_4px_12px_rgba(65,116,255,0.08)] transition-all hover:bg-[#EAEDFF] sm:h-10 sm:w-10"
              >
                {user.name.trim().charAt(0).toUpperCase() || "U"}
                {user.isAdmin && (
                  <span
                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-[#EAF9F0] text-[#1D8F5F]"
                    title="Administrator"
                  >
                    <ShieldCheck size={11} strokeWidth={2.5} aria-hidden="true" />
                  </span>
                )}
              </button>
              {isAccountMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+0.6rem)] z-50 w-56 rounded-xl border border-[#E5E9F4] bg-white p-2 shadow-[0_18px_45px_rgba(32,37,61,0.14)]">
                  <div className="border-b border-[#EEF0F7] px-3 py-2">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <p className="truncate text-sm font-semibold text-[#20253D]">{user.name}</p>
                      {user.isAdmin && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#EAF9F0] px-1.5 py-0.5 text-[10px] font-semibold text-[#1D8F5F]">
                          <ShieldCheck size={11} aria-hidden="true" />
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-[#737991]">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-[#BE3455] transition-colors hover:bg-[#FFF1F2]"
                  >
                    <LogOut size={16} aria-hidden="true" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              aria-label="Sign up"
              onClick={() => {
                setAuthError("");
                setAuthMode("signup");
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D7E0FF] bg-[#F4F7FF] text-[#2C4DE2] shadow-[0_4px_12px_rgba(65,116,255,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#B9C9FF] hover:bg-[#EAEDFF] hover:shadow-[0_10px_24px_rgba(44,77,226,0.16)] active:translate-y-0 active:scale-95 sm:h-10 sm:w-10"
            >
              <UserRound size={18} strokeWidth={2.3} aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-[#DDE3F2] bg-white text-[#20253D] shadow-[0_4px_12px_rgba(32,37,61,0.04)] transition-all hover:border-[#B9C9FF] hover:bg-[#F4F7FF] active:scale-95 lg:hidden"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </nav>
    </header>
    {authMode && (
      <UserAuthModal
        mode={authMode}
        isSubmitting={isAuthSubmitting}
        errorMessage={authError}
        onClose={() => setAuthMode(null)}
        onSwitchMode={(mode) => {
          setAuthError("");
          setAuthMode(mode);
        }}
        onSubmit={handleAuthSubmit}
      />
    )}
    {(isAuthSubmitting || isLoggingOut) && (
      <div
        className="fixed inset-0 z-120 grid place-items-center bg-[#17233B]/45 px-4 py-6 backdrop-blur-md"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#E5E9F4] bg-white px-8 py-7 text-[#737991] shadow-[0_28px_80px_rgba(19,30,63,0.25)]">
          <LoaderCircle className="animate-spin text-[#3B6BFF]" size={30} aria-hidden="true" />
          <span className="text-sm font-medium">
            {isLoggingOut
              ? "Signing out..."
              : authMode === "signup"
                ? "Creating your account..."
                : "Signing in..."}
          </span>
        </div>
      </div>
    )}
    </>
  );
};

export default Navbar;