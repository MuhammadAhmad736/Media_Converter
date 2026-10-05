"use client"

import { useEffect, useState, type FormEvent } from "react"
import { Eye, EyeOff, KeyRound, X } from "lucide-react"
import { toast } from "react-toastify"

type PasswordSettingsModalProps = {
  onClose: () => void
  onPasswordUpdated: () => void
}

const PasswordSettingsModal = ({ onClose, onPasswordUpdated }: PasswordSettingsModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const email = String(formData.get("email") ?? "").trim()
    const currentPassword = String(formData.get("currentPassword") ?? "")
    const newPassword = String(formData.get("newPassword") ?? "")
    const confirmPassword = String(formData.get("confirmPassword") ?? "")

    if (newPassword !== confirmPassword) {
      toast.error("The new passwords do not match.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/user/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "change-password", email, currentPassword, newPassword }),
      })
      const result = (await response.json()) as { error?: string; message?: string }

      if (!response.ok) {
        throw new Error(result.error || result.message || "Could not update the password.")
      }

      form.reset()
      toast.success("Password updated successfully.")
      onPasswordUpdated()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the password.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[110] grid min-h-screen place-items-center overflow-y-auto bg-[#17233B]/45 px-4 py-6 backdrop-blur-md sm:px-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-settings-title"
        className="w-full max-w-[480px] overflow-hidden rounded-2xl border border-[#E5E9F4] bg-white shadow-[0_28px_80px_rgba(19,30,63,0.25)]"
      >
        <div className="px-6 pb-6 pt-7 sm:px-8 sm:pt-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF3FF] text-[#3B6BFF]">
                <KeyRound size={20} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold text-[#20253D]">Admin settings</p>
                <p className="mt-0.5 text-xs font-medium text-[#737991]">Account security</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close settings" 
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#737991] transition-colors hover:bg-[#F4F7FF] hover:text-[#2C4DE2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B6BFF]"
            >
              <X size={19} aria-hidden="true" />
            </button>
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5865D8]">Password</p>
          <h2 id="password-settings-title" className="mt-2 text-2xl font-semibold text-[#20253D]">
            Change password
          </h2>
          <p className="mt-1 text-sm text-[#737991]">Confirm your account details before choosing a new password.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} aria-busy={isSubmitting}>
            <label className="block space-y-1.5 text-sm font-medium text-[#343B55]">
              <span>Admin email</span>
              <input
                autoComplete="email"
                autoFocus
                disabled={isSubmitting}
                name="email"
                placeholder="admin@example.com"
                required
                type="email"
                className="h-11 w-full rounded-lg border border-[#DDE3F2] bg-white px-3.5 text-sm text-[#20253D] outline-none transition-colors placeholder:text-[#A1A8B9] focus:border-[#6C82F5] focus:ring-4 focus:ring-[#3B6BFF]/10"
              />
            </label>

            <label className="block space-y-1.5 text-sm font-medium text-[#343B55]">
              <span>Current password</span>
              <div className="relative">
                <input
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  name="currentPassword"
                  placeholder="Enter your current password"
                  required
                  type={showCurrentPassword ? "text" : "password"}
                  className="h-11 w-full rounded-lg border border-[#DDE3F2] bg-white px-3.5 pr-11 text-sm text-[#20253D] outline-none transition-colors placeholder:text-[#A1A8B9] focus:border-[#6C82F5] focus:ring-4 focus:ring-[#3B6BFF]/10"
                />
                <button
                  type="button"
                  aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                  aria-pressed={showCurrentPassword}
                  title={showCurrentPassword ? "Hide password" : "Show password"}
                  disabled={isSubmitting}
                  onClick={() => setShowCurrentPassword((visible) => !visible)}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#737991] transition-colors hover:text-[#2C4DE2] focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#3B6BFF] disabled:cursor-not-allowed"
                >
                  {showCurrentPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5 text-sm font-medium text-[#343B55]">
                <span>New password</span>
                <div className="relative">
                  <input
                    autoComplete="new-password"
                    minLength={12}
                    disabled={isSubmitting}
                    name="newPassword"
                    placeholder="At least 12 characters"
                    required
                    type={showNewPassword ? "text" : "password"}
                    className="h-11 w-full rounded-lg border border-[#DDE3F2] bg-white px-3.5 pr-11 text-sm text-[#20253D] outline-none transition-colors placeholder:text-[#A1A8B9] focus:border-[#6C82F5] focus:ring-4 focus:ring-[#3B6BFF]/10"
                  />
                  <button
                    type="button"
                    aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                    aria-pressed={showNewPassword}
                    title={showNewPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowNewPassword((visible) => !visible)}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#737991] transition-colors hover:text-[#2C4DE2] focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#3B6BFF]"
                  >
                    {showNewPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                </div>
              </label>
              <label className="block space-y-1.5 text-sm font-medium text-[#343B55]">
                <span>Confirm new password</span>
                <div className="relative">
                  <input
                    autoComplete="new-password"
                    minLength={12}
                    disabled={isSubmitting}
                    name="confirmPassword"
                    placeholder="Re-enter new password"
                    required
                    type={showConfirmPassword ? "text" : "password"}
                    className="h-11 w-full rounded-lg border border-[#DDE3F2] bg-white px-3.5 pr-11 text-sm text-[#20253D] outline-none transition-colors placeholder:text-[#A1A8B9] focus:border-[#6C82F5] focus:ring-4 focus:ring-[#3B6BFF]/10"
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? "Hide confirmed password" : "Show confirmed password"}
                    aria-pressed={showConfirmPassword}
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowConfirmPassword((visible) => !visible)}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#737991] transition-colors hover:text-[#2C4DE2] focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#3B6BFF]"
                  >
                    {showConfirmPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                </div>
              </label>
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="h-11 rounded-lg border border-[#DDE3F2] px-4 text-sm font-semibold text-[#4F586F] transition-colors hover:bg-[#F8F9FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B6BFF]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-11 rounded-lg bg-[#3B6BFF] px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(59,107,255,0.2)] transition-colors hover:bg-[#2C4DE2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B6BFF] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Updating..." : "Update password"}
              </button>
            </div>
          </form>
        </div>

        <div className="border-t border-[#EEF0F7] bg-[#F8F9FF] px-6 py-3.5 text-center text-xs font-medium text-[#737991] sm:px-8">
          Your signed-in admin session is required to update the password.
        </div>
      </section>
    </div>
  )
}

export default PasswordSettingsModal