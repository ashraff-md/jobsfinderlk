"use client";

import { useState } from "react";
import { SeekerShell } from "@/components/layout/seeker-shell";
import { Icon } from "@/components/ui/icon";

function Toggle({
  id,
  defaultChecked = false,
  label,
}: {
  id: string;
  defaultChecked?: boolean;
  label: string;
}) {
  return (
    <label htmlFor={id} className="relative inline-flex h-6 w-12 cursor-pointer items-center">
      <input
        id={id}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span className="h-6 w-full rounded-full bg-surface-container-highest transition-colors peer-checked:bg-secondary" />
      <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-6" />
      <span className="sr-only">{label}</span>
    </label>
  );
}

const NOTIFICATION_ROWS = [
  { id: "job-rec", label: "Job Recommendations", email: true, push: false },
  { id: "app-updates", label: "Application Updates", email: true, push: true },
  { id: "newsletter", label: "Newsletter & Insights", email: false, push: false },
  { id: "messages", label: "Immediate Messages", email: true, push: true },
  { id: "profile-views", label: "Profile Views", email: false, push: false },
  { id: "system", label: "System Alerts", email: true, push: true },
] as const;

export function SeekerSettingsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <SeekerShell activeNav="settings" userName="Alex Silva">
      <div className="mx-auto max-w-container-max">
        <header className="mb-stack-lg">
          <h1 className="font-headline-lg text-headline-lg text-primary-container">Settings</h1>
          <p className="mt-2 font-body-md text-outline">
            Manage your account, localized experience, and privacy preferences.
          </p>
        </header>

        <div className="grid grid-cols-12 gap-gutter">
          <section className="professional-card col-span-12 overflow-hidden rounded-xl lg:col-span-8">
            <div className="flex items-center justify-between border-b border-outline-variant p-stack-lg">
              <div>
                <h2 className="font-headline-md text-headline-md text-primary-container">
                  Localization & Accessibility
                </h2>
                <p className="font-label-sm text-outline">
                  Tailor the interface to your primary language and visual needs.
                </p>
              </div>
              <Icon name="language" className="text-3xl text-secondary" />
            </div>
            <div className="space-y-stack-lg p-stack-lg">
              <div className="space-y-stack-sm">
                <label className="block font-label-bold text-primary-container">Interface Language</label>
                <div className="grid grid-cols-3 gap-stack-md">
                  <button
                    type="button"
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-secondary bg-surface-container-low p-stack-md transition-all"
                  >
                    <span className="font-label-bold text-secondary">English</span>
                    <span className="mt-1 text-[10px] text-outline">Default (US)</span>
                  </button>
                  <button
                    type="button"
                    className="flex flex-col items-center justify-center rounded-lg border border-outline-variant p-stack-md transition-all hover:border-secondary"
                  >
                    <span className="font-label-bold text-on-surface">සිංහල</span>
                    <span className="mt-1 text-[10px] text-outline">Sinhala</span>
                  </button>
                  <button
                    type="button"
                    className="flex flex-col items-center justify-center rounded-lg border border-outline-variant p-stack-md transition-all hover:border-secondary"
                  >
                    <span className="font-label-bold text-on-surface">தமிழ்</span>
                    <span className="mt-1 text-[10px] text-outline">Tamil</span>
                  </button>
                </div>
              </div>
              <div className="space-y-stack-sm">
                <label className="block font-label-bold text-primary-container">Theme Appearance</label>
                <div className="flex gap-stack-md">
                  <button
                    type="button"
                    className="flex flex-1 items-center gap-3 rounded-lg border border-secondary bg-surface-container-low p-stack-md"
                  >
                    <Icon name="light_mode" className="text-secondary" />
                    <span className="font-label-bold">Light</span>
                  </button>
                  <button
                    type="button"
                    className="flex flex-1 items-center gap-3 rounded-lg border border-outline-variant p-stack-md hover:bg-surface-container"
                  >
                    <Icon name="dark_mode" className="text-outline" />
                    <span className="font-label-bold">Dark</span>
                  </button>
                  <button
                    type="button"
                    className="flex flex-1 items-center gap-3 rounded-lg border border-outline-variant p-stack-md hover:bg-surface-container"
                  >
                    <Icon name="settings_brightness" className="text-outline" />
                    <span className="font-label-bold">System</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <aside className="col-span-12 lg:col-span-4">
            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-xl bg-primary-container p-stack-lg text-on-primary-container">
              <div className="relative z-10">
                <h3 className="mb-2 font-headline-md text-on-primary-fixed">Pro Reliability</h3>
                <p className="font-body-md opacity-80">
                  Your privacy settings are encrypted with enterprise-grade security protocols.
                </p>
              </div>
              <button
                type="button"
                className="relative z-10 mt-6 rounded bg-white px-6 py-2 font-label-bold text-primary-container shadow-lg transition-transform hover:scale-105"
              >
                View Security Log
              </button>
              <Icon
                name="verified"
                className="absolute -bottom-4 -right-4 text-[120px] opacity-[0.06]"
              />
            </div>
          </aside>

          <section className="professional-card col-span-12 overflow-hidden rounded-xl">
            <div className="border-b border-outline-variant p-stack-lg">
              <h2 className="font-headline-md text-headline-md text-primary-container">
                Privacy & Intelligence Controls
              </h2>
              <p className="font-label-sm text-outline">
                Control how your data is used to improve our talent matching algorithms.
              </p>
            </div>
            <div className="divide-y divide-outline-variant">
              {[
                {
                  title: "Anonymized Data Sharing",
                  description:
                    "Share anonymous salary and role metadata with our career research partners to improve market transparency in Sri Lanka.",
                  id: "toggle-data",
                },
                {
                  title: "AI Talent Model Training",
                  description:
                    'Allow our AI to learn from your application success patterns to provide more accurate "Match Scores" for future executive roles.',
                  id: "toggle-ai",
                  defaultChecked: true,
                  badge: "Recommended",
                },
                {
                  title: "Public Profile Indexing",
                  description:
                    "Allow search engines to index your public career profile. Turning this off restricts visibility to logged-in recruiters only.",
                  id: "toggle-search",
                  defaultChecked: true,
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between p-stack-lg transition-colors hover:bg-surface-container-low"
                >
                  <div className="max-w-2xl">
                    <h4 className="mb-1 font-label-bold text-primary-container">{item.title}</h4>
                    <p className="font-body-md text-outline">{item.description}</p>
                    {item.badge && (
                      <span className="mt-2 inline-flex rounded bg-secondary-fixed px-2 py-1 text-[10px] font-bold uppercase text-on-secondary-fixed-variant">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <Toggle id={item.id} defaultChecked={item.defaultChecked} label={item.title} />
                </div>
              ))}
            </div>
          </section>

          <section className="professional-card col-span-12 rounded-xl p-stack-lg">
            <div className="mb-stack-md flex items-center gap-2 border-b border-outline-variant pb-4">
              <Icon name="contact_mail" className="text-secondary" />
              <h2 className="font-headline-md text-headline-md text-primary-container">Account Information</h2>
            </div>
            <div className="mt-stack-md grid grid-cols-1 gap-stack-lg md:grid-cols-2">
              <div className="space-y-2">
                <label className="font-label-bold text-on-surface">Email Address</label>
                <input
                  type="email"
                  defaultValue="alexander.sterling@executive.com"
                  className="w-full border border-outline-variant bg-surface-container-lowest px-4 py-3 outline-none transition-all focus:border-2 focus:border-primary-container"
                />
                <p className="text-label-sm text-outline">Used for login and important communications.</p>
              </div>
              <div className="space-y-2">
                <label className="font-label-bold text-on-surface">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    defaultValue="••••••••••••"
                    className="w-full border border-outline-variant bg-surface-container-lowest px-4 py-3 outline-none transition-all focus:border-2 focus:border-primary-container"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 font-label-bold text-secondary hover:underline"
                  >
                    Change
                  </button>
                </div>
                <p className="text-label-sm text-outline">Last updated 3 months ago.</p>
              </div>
            </div>
          </section>

          <div className="col-span-12 grid grid-cols-1 gap-stack-lg md:grid-cols-12">
            <section className="professional-card flex flex-col rounded-xl p-stack-lg md:col-span-7">
              <div className="mb-stack-md flex items-center gap-2">
                <Icon name="visibility" className="text-secondary" />
                <h2 className="font-headline-md text-headline-md text-primary-container">Profile Visibility</h2>
              </div>
              <p className="mb-stack-lg font-body-md text-outline">
                Control who can see your career achievements and work history.
              </p>
              <div className="flex-1 space-y-4">
                <label className="flex cursor-pointer items-start gap-4 rounded border border-outline-variant p-4 transition-colors hover:bg-surface-container-low">
                  <input
                    type="radio"
                    name="visibility"
                    defaultChecked
                    className="mt-1 text-secondary focus:ring-secondary"
                  />
                  <div>
                    <span className="block font-label-bold text-on-surface">Public Profile</span>
                    <span className="text-label-sm text-outline">
                      Recruiters and companies can find you in search results. Highly recommended for
                      active seekers.
                    </span>
                  </div>
                </label>
                <label className="flex cursor-pointer items-start gap-4 rounded border border-outline-variant p-4 transition-colors hover:bg-surface-container-low">
                  <input type="radio" name="visibility" className="mt-1 text-secondary focus:ring-secondary" />
                  <div>
                    <span className="block font-label-bold text-on-surface">Private Profile</span>
                    <span className="text-label-sm text-outline">
                      Your profile is hidden from search. Only visible to companies you directly apply to.
                    </span>
                  </div>
                </label>
              </div>
            </section>

            <section className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-primary-container bg-primary-container p-stack-lg text-white md:col-span-5">
              <div className="relative z-10">
                <span className="rounded bg-secondary px-2 py-1 text-label-bold text-on-secondary">
                  CURRENT PLAN
                </span>
                <h2 className="mt-2 font-headline-md text-headline-md">Executive Pro</h2>
                <div className="mt-stack-lg space-y-2">
                  {["Unlimited Applications", "Direct Messenger Access", "Priority Profile Placement"].map(
                    (feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <Icon name="check_circle" className="text-sm" />
                        <span className="font-label-bold">{feature}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>
              <div className="relative z-10 mt-auto">
                <p className="mb-4 text-label-sm opacity-80">Renews on Oct 24, 2024</p>
                <button
                  type="button"
                  className="w-full rounded bg-white py-3 font-label-bold text-primary-container transition-all hover:opacity-90 active:scale-95"
                >
                  Manage Subscription
                </button>
              </div>
              <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-secondary opacity-20 blur-3xl" />
            </section>
          </div>

          <section className="professional-card col-span-12 rounded-xl p-stack-lg">
            <div className="mb-stack-lg flex items-center gap-2">
              <Icon name="notifications_active" className="text-secondary" />
              <h2 className="font-headline-md text-headline-md text-primary-container">
                Notification Preferences
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="font-label-bold uppercase tracking-wider text-on-surface">Email Channels</h3>
                {NOTIFICATION_ROWS.slice(0, 3).map((row) => (
                  <div
                    key={row.id}
                    className="flex items-center justify-between border-b border-outline-variant py-2"
                  >
                    <span className="font-body-md">{row.label}</span>
                    <Toggle id={`email-${row.id}`} defaultChecked={row.email} label={row.label} />
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <h3 className="font-label-bold uppercase tracking-wider text-on-surface">Push (Mobile/Web)</h3>
                {NOTIFICATION_ROWS.slice(3).map((row) => (
                  <div
                    key={row.id}
                    className="flex items-center justify-between border-b border-outline-variant py-2"
                  >
                    <span className="font-body-md">{row.label}</span>
                    <Toggle id={`push-${row.id}`} defaultChecked={row.push} label={row.label} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="col-span-12 flex flex-col items-center justify-end gap-stack-md border-t border-outline-variant pt-stack-lg md:flex-row">
            <button
              type="button"
              className="w-full rounded border border-primary-container px-8 py-3 font-label-bold text-primary-container transition-colors hover:bg-surface-container md:w-auto"
            >
              Discard Changes
            </button>
            <button
              type="button"
              onClick={() => {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
              }}
              className="flex w-full items-center justify-center gap-2 rounded bg-primary-container px-10 py-3 font-label-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-95 md:w-auto"
            >
              <Icon name={saved ? "check" : "save"} />
              {saved ? "Saved" : "Save Preferences"}
            </button>
          </div>

          <section className="col-span-12 mt-8 border-t border-error/20 pt-10">
            <h3 className="mb-4 font-label-bold uppercase text-error">Danger Zone</h3>
            <div className="flex flex-col items-center justify-between gap-6 rounded border border-error/20 bg-error-container p-6 md:flex-row">
              <div>
                <p className="font-label-bold text-on-error-container">Deactivate Account</p>
                <p className="text-label-sm text-on-error-container opacity-80">
                  Once you deactivate your account, your data will be permanently removed from our active
                  database. This action is irreversible.
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded bg-error px-6 py-2 font-label-bold text-on-error transition-opacity hover:opacity-90"
              >
                Deactivate Now
              </button>
            </div>
          </section>
        </div>
      </div>
    </SeekerShell>
  );
}
