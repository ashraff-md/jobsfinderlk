"use client";

import Link from "next/link";
import { EmployerShell } from "@/components/layout/employer-shell";
import { Icon } from "@/components/ui/icon";

const PROFILE = {
  name: "Alexander Thorne",
  title: "Head of Talent Acquisition",
  email: "alexander.t@innovatech.com",
  phone: "+94 11 234 5678",
  photo:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD9iK0iAuQw8wXD676OXWE19VW5sex-nkWqs9YbYBcsXfElsrY_bMZQUor7fTAMDIFF0kQv-dHtpTeqZh0-vdobjMMBbLLtpY6dlx6vGLIza-eM8z1f1poqyOlvuYnSxXuGXHrEVSKUYPJqbJYC3lNm15qhvsdC9CB5ztKmy5oeHvzXOQYNAxIaDIOjbEVXnyMfs1WPUPEDszaaCeR6drp1k0DxLDruPu_BvcCrV1ZzFRfX9khlWgA5ZO-YKGndB70d5yaH8jVEzxDe",
};

const COMPANY = {
  name: "Innovatech Global Ltd.",
  description:
    "Innovatech is a leader in sustainable technology solutions, focused on executive-level engineering talent and high-growth infrastructure projects globally.",
  logo:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB6rWf4sA2SJGJ3SM7T9VKCk3Z4dPE3MRmQSgiCtTd_vDDCohnT71LzZMFr0u4yP_Aii4VxbOQKnsbGXPBjqwMBSH63JgQF_zPOuaQ03pJRFt4f03Muj0_-TowkGSchMuC-kCkcDhcbJd9-7c1UOe9RmCwEsl8b8yKcwqyQzbAAVycRJQEQVrlrqTUhhz976Y3uIz6fGwfQ9TkYKy2tgu93OcTrXhNE9hMvEvPlJ_n7sbf16GKloSOLkERZH98UPv57vRWzqJfatexV",
};

export function EmployerSettingsPage() {
  return (
    <EmployerShell activeNav="settings" showFooter={false}>
      <header className="-mx-margin-mobile sticky top-0 z-30 flex h-20 items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-margin-mobile md:-mx-margin-desktop md:px-margin-desktop">
        <h1 className="font-headline-md text-headline-md text-primary-container">Recruiter Profile Settings</h1>
        <div className="flex items-center gap-4 sm:gap-6">
          <nav className="hidden items-center gap-6 lg:flex">
            <Link href="/jobs" className="font-body-md text-on-surface-variant transition-colors hover:text-secondary">
              Find Jobs
            </Link>
            <Link href="/companies" className="font-body-md text-on-surface-variant transition-colors hover:text-secondary">
              Companies
            </Link>
            <Link href="/pricing" className="font-body-md text-on-surface-variant transition-colors hover:text-secondary">
              Salaries
            </Link>
          </nav>
          <div className="hidden h-8 w-px bg-outline-variant lg:block" />
          <button
            type="button"
            className="rounded p-2 text-on-surface-variant transition-colors hover:text-primary-container"
            aria-label="Notifications"
          >
            <Icon name="notifications" />
          </button>
          <Link
            href="/employer/jobs/new"
            className="rounded bg-primary-container px-4 py-2 font-label-bold text-white transition-all hover:bg-black sm:px-6"
          >
            Post a Job
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-container-max py-stack-lg">
        <div className="grid grid-cols-12 gap-gutter">
          <section className="col-span-12 rounded-lg border border-outline-variant bg-surface-container-lowest p-8 lg:col-span-7">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-headline-md text-headline-md text-primary-container">Personal Information</h2>
                <p className="font-body-md text-on-surface-variant">
                  Update your personal details and professional identity.
                </p>
              </div>
              <button
                type="button"
                className="flex shrink-0 items-center gap-2 font-label-bold text-secondary hover:underline"
              >
                <Icon name="edit" className="text-sm" />
                Edit Details
              </button>
            </div>

            <div className="flex flex-col gap-8 md:flex-row">
              <div className="shrink-0">
                <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-lg border border-outline-variant bg-surface-container-high">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="" className="h-full w-full object-cover" src={PROFILE.photo} />
                </div>
                <button
                  type="button"
                  className="mt-4 w-full rounded border border-outline py-2 font-label-bold text-label-sm text-on-surface transition-colors hover:bg-surface-variant"
                >
                  Change Photo
                </button>
              </div>

              <div className="grow space-y-4">
                <div>
                  <label htmlFor="settings-full-name" className="mb-2 block font-label-bold text-on-surface">
                    Full Name
                  </label>
                  <input
                    id="settings-full-name"
                    type="text"
                    defaultValue={PROFILE.name}
                    className="w-full rounded border border-outline-variant bg-white p-3 font-body-md outline-none transition-all focus:border-primary-container focus:ring-0"
                  />
                </div>
                <div>
                  <label htmlFor="settings-title" className="mb-2 block font-label-bold text-on-surface">
                    Professional Title
                  </label>
                  <input
                    id="settings-title"
                    type="text"
                    defaultValue={PROFILE.title}
                    className="w-full rounded border border-outline-variant bg-white p-3 font-body-md outline-none transition-all focus:border-primary-container focus:ring-0"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="settings-email" className="mb-2 block font-label-bold text-on-surface">
                      Email Address
                    </label>
                    <input
                      id="settings-email"
                      type="email"
                      defaultValue={PROFILE.email}
                      className="w-full rounded border border-outline-variant bg-white p-3 font-body-md outline-none transition-all focus:border-primary-container focus:ring-0"
                    />
                  </div>
                  <div>
                    <label htmlFor="settings-phone" className="mb-2 block font-label-bold text-on-surface">
                      Phone Number
                    </label>
                    <input
                      id="settings-phone"
                      type="tel"
                      defaultValue={PROFILE.phone}
                      className="w-full rounded border border-outline-variant bg-white p-3 font-body-md outline-none transition-all focus:border-primary-container focus:ring-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="col-span-12 flex flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-8 lg:col-span-5">
            <div className="mb-4 flex items-center gap-2">
              <Icon name="security" className="text-primary-container" />
              <h2 className="font-headline-md text-headline-md text-primary-container">Security</h2>
            </div>
            <p className="mb-8 font-body-md text-on-surface-variant">
              Manage your password and account security settings.
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="settings-current-password" className="mb-2 block font-label-bold text-on-surface">
                  Current Password
                </label>
                <input
                  id="settings-current-password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded border border-outline-variant bg-white p-3 font-body-md outline-none focus:border-primary-container"
                />
              </div>
              <div>
                <label htmlFor="settings-new-password" className="mb-2 block font-label-bold text-on-surface">
                  New Password
                </label>
                <input
                  id="settings-new-password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  className="w-full rounded border border-outline-variant bg-white p-3 font-body-md outline-none focus:border-primary-container"
                />
              </div>
              <div>
                <label htmlFor="settings-retype-password" className="mb-2 block font-label-bold text-on-surface">
                  Retype Password
                </label>
                <input
                  id="settings-retype-password"
                  type="password"
                  placeholder="Re-enter new password"
                  className="w-full rounded border border-outline-variant bg-white p-3 font-body-md outline-none focus:border-primary-container"
                />
              </div>
            </div>
            <button
              type="button"
              className="mt-8 w-full rounded bg-primary-container py-3 font-label-bold text-white transition-all hover:bg-black"
            >
              Update Password
            </button>
          </section>

          <section className="col-span-12 rounded-lg border border-outline-variant bg-surface-container-lowest p-8 lg:col-span-7">
            <div className="mb-8">
              <span className="mb-2 inline-block rounded bg-surface-container-high px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                Read-Only
              </span>
              <h2 className="font-headline-md text-headline-md text-primary-container">
                Current Company Information
              </h2>
              <p className="font-body-md text-on-surface-variant">
                Updates to company branding and details must be reviewed and approved by the platform
                administration.
              </p>
            </div>

            <div className="flex flex-col gap-8 opacity-80 md:flex-row">
              <div className="shrink-0">
                <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-lg border border-outline-variant bg-surface-container-high">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="Company logo" className="h-full w-full object-cover" src={COMPANY.logo} />
                </div>
              </div>
              <div className="grow space-y-4">
                <div>
                  <label htmlFor="settings-company-name" className="mb-2 block font-label-bold text-on-surface">
                    Company Name
                  </label>
                  <input
                    id="settings-company-name"
                    readOnly
                    type="text"
                    value={COMPANY.name}
                    className="w-full cursor-not-allowed rounded border border-outline-variant bg-surface-container-low p-3 font-body-md outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="settings-company-description" className="mb-2 block font-label-bold text-on-surface">
                    Company Description
                  </label>
                  <textarea
                    id="settings-company-description"
                    readOnly
                    rows={3}
                    value={COMPANY.description}
                    className="w-full cursor-not-allowed rounded border border-outline-variant bg-surface-container-low p-3 font-body-md outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                className="w-full rounded border border-secondary px-6 py-3 font-label-bold text-secondary transition-all hover:bg-secondary hover:text-white md:w-auto"
              >
                Request Company Update
              </button>
            </div>
          </section>

          <section className="relative col-span-12 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest p-8 lg:col-span-5">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-secondary/5 blur-3xl" />
            <h2 className="mb-8 font-headline-md text-headline-md text-primary-container">Billing &amp; Plan</h2>
            <div className="mb-4 rounded border border-outline-variant bg-surface-container-low p-6">
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded bg-primary-container px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    Enterprise Pro
                  </span>
                  <p className="mt-2 font-headline-md text-headline-md text-primary-container">
                    $499
                    <span className="font-body-md font-normal text-on-surface-variant">/mo</span>
                  </p>
                  <p className="font-label-sm text-on-surface-variant">Next billing date: Oct 12, 2026</p>
                </div>
                <Icon name="workspace_premium" className="text-3xl text-secondary" filled />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant py-2">
                <span className="font-body-md text-on-surface">Active Job Posts</span>
                <span className="font-label-bold text-primary-container">12 / 50</span>
              </div>
              <div className="flex items-center justify-between border-b border-outline-variant py-2">
                <span className="font-body-md text-on-surface">Team Seats</span>
                <span className="font-label-bold text-primary-container">5 / 10</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="font-body-md text-on-surface">Payment Method</span>
                <div className="flex items-center gap-2">
                  <Icon name="credit_card" className="text-on-surface-variant" />
                  <span className="font-label-bold text-primary-container">•••• 9012</span>
                </div>
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <Link
                href="/pricing"
                className="flex-1 rounded bg-primary-container py-3 text-center font-label-bold text-label-sm text-white transition-all hover:bg-black"
              >
                Manage Subscription
              </Link>
              <button
                type="button"
                className="rounded border border-outline-variant px-4 py-3 transition-all hover:bg-surface-variant"
                aria-label="Download invoice"
              >
                <Icon name="download" />
              </button>
            </div>
          </section>

          <div className="col-span-12 flex flex-col items-stretch justify-end gap-4 border-t border-outline-variant pt-8 sm:flex-row sm:items-center">
            <button
              type="button"
              className="px-8 py-3 font-label-bold text-on-surface-variant transition-colors hover:text-primary-container"
            >
              Discard Changes
            </button>
            <button
              type="button"
              className="executive-shadow rounded-lg bg-secondary px-10 py-3 font-label-bold text-white shadow-lg transition-all hover:opacity-90"
            >
              Save All Preferences
            </button>
          </div>
        </div>
      </div>
    </EmployerShell>
  );
}
