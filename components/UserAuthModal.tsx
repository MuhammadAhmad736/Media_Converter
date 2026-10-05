"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { ArrowRight, CloudDownload, Eye, EyeOff, LoaderCircle, X } from "lucide-react";

export type UserAuthMode = "signup" | "login";

export type UserAuthCredentials = {
  name?: string;
  email: string;
  password: string;
};

type UserAuthModalProps = {
  mode: UserAuthMode;
  isSubmitting: boolean;
  errorMessage: string;
  onClose: () => void;
  onSwitchMode: (mode: UserAuthMode) => void;
  onSubmit: (credentials: UserAuthCredentials) => Promise<void>;
};

export default function UserAuthModal({
  mode,
  isSubmitting,
  errorMessage,
  onClose,
  onSwitchMode,
  onSubmit,
}: UserAuthModalProps) {
  const [formError, setFormError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isSigningUp = mode === "signup";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (isSigningUp && !name) {
      setFormError("Please enter your name.");
      return;
    }

    if (password.length < 8 || password.length > 72) {
      setFormError("Password must be between 8 and 72 characters.");
      return;
    }

    void onSubmit({ ...(isSigningUp ? { name } : {}), email, password });
  };

  const message = errorMessage || formError;

  return (
    <div
      className="fixed inset-0 z-100 grid min-h-screen place-items-center overflow-y-auto bg-[#17233B]/45 px-4 py-6 backdrop-blur-md sm:px-6"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-auth-title"
        className="relative w-full max-w-110 overflow-hidden rounded-2xl border border-[#E5E9F4] bg-white shadow-[0_28px_80px_rgba(19,30,63,0.25)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close sign in dialog"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-[#737991] transition-colors hover:bg-[#F4F7FF] hover:text-[#2C4DE2]"
        >
          <X size={19} aria-hidden="true" />
        </button>

        <div className="px-6 pb-6 pt-7 sm:px-8 sm:pt-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(145deg,#4B7BFF,#2C4DE2)] text-white">
              <CloudDownload size={22} strokeWidth={2.2} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold text-[#20253D]">Media Converter</p>
              <p className="mt-0.5 text-xs font-medium text-[#737991]">Your account</p>
            </div>
          </div>

          <h2 id="user-auth-title" className="text-2xl font-semibold text-[#20253D]">
            {isSigningUp ? "Create your account" : "Welcome back"}
          </h2>
          <p className="mt-1 text-sm text-[#737991]">
            {isSigningUp ? "Sign up to get started." : "Log in to your account."}
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} aria-busy={isSubmitting}>
            {isSigningUp && (
              <label className="block space-y-1.5 text-sm font-medium text-[#343B55]">
                <span>Name</span>
                <input
                  autoComplete="name"
                  autoFocus
                  disabled={isSubmitting}
                  maxLength={100}
                  name="name"
                  placeholder="Your name"
                  required
                  type="text"
                  className="h-11 w-full rounded-lg border border-[#DDE3F2] bg-white px-3.5 text-sm text-[#20253D] outline-none transition-colors placeholder:text-[#A1A8B9] focus:border-[#6C82F5] focus:ring-4 focus:ring-[#3B6BFF]/10"
                />
              </label>
            )}
            <label className="block space-y-1.5 text-sm font-medium text-[#343B55]">
              <span>Email</span>
              <input
                autoComplete="email"
                autoFocus={!isSigningUp}
                disabled={isSubmitting}
                name="email"
                placeholder="you@example.com"
                required
                type="email"
                className="h-11 w-full rounded-lg border border-[#DDE3F2] bg-white px-3.5 text-sm text-[#20253D] outline-none transition-colors placeholder:text-[#A1A8B9] focus:border-[#6C82F5] focus:ring-4 focus:ring-[#3B6BFF]/10"
              />
            </label>
            <label className="block space-y-1.5 text-sm font-medium text-[#343B55]">
              <span>Password</span>
              <span className="relative block">
                <input
                  id="user-auth-password"
                  autoComplete={isSigningUp ? "new-password" : "current-password"}
                  disabled={isSubmitting}
                  maxLength={72}
                  minLength={isSigningUp ? 8 : undefined}
                  name="password"
                  placeholder="Enter your password"
                  required
                  type={isPasswordVisible ? "text" : "password"}
                  className="h-11 w-full rounded-lg border border-[#DDE3F2] bg-white px-3.5 pr-12 text-sm text-[#20253D] outline-none transition-colors placeholder:text-[#A1A8B9] focus:border-[#6C82F5] focus:ring-4 focus:ring-[#3B6BFF]/10"
                />
                <button
                  type="button"
                  aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                  aria-controls="user-auth-password"
                  aria-pressed={isPasswordVisible}
                  disabled={isSubmitting}
                  onClick={() => setIsPasswordVisible((visible) => !visible)}
                  className="absolute inset-y-0 right-2 flex w-9 cursor-pointer items-center justify-center rounded-md text-[#737991] transition-colors hover:bg-[#F4F7FF] hover:text-[#2C4DE2] disabled:cursor-not-allowed"
                >
                  {isPasswordVisible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                </button>
              </span>
            </label>

            {message && (
              <p className="rounded-lg border border-[#F5CBD3] bg-[#FFF1F2] px-3.5 py-2.5 text-sm text-[#A52E49]" role="alert">
                {message}
              </p>
            )}

            <button
              disabled={isSubmitting}
              type="submit"
              className="group flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#3B6BFF] px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(59,107,255,0.2)] transition-colors hover:bg-[#2C4DE2] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Please wait..." : isSigningUp ? "Sign Up" : "Login"}
              {isSubmitting ? (
                <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
              ) : (
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              )}
            </button>
          </form>
        </div>

        <div className="border-t border-[#EEF0F7] bg-[#F8F9FF] px-6 py-4 text-center text-sm text-[#737991] sm:px-8">
          {isSigningUp ? "Already signed in?" : "Don't have an account?"}{" "}
          <button
            type="button"
            className="cursor-pointer font-semibold text-[#2C4DE2] hover:underline"
            onClick={() => {
              setFormError("");
              onSwitchMode(isSigningUp ? "login" : "signup");
            }}
          >
            {isSigningUp ? "Login" : "Sign Up"}
          </button>
        </div>
      </section>
    </div>
  );
}