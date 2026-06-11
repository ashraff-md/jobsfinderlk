"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CompanyAutocomplete } from "@/components/companies/company-autocomplete";
import { InlineEmailVerification } from "@/components/auth/inline-email-verification";
import { InlinePhoneVerification } from "@/components/auth/inline-phone-verification";
import {
  RecruiterPhotoUploader,
  type RecruiterPhotoDraft,
} from "@/components/auth/recruiter-photo-uploader";
import { VerificationStatusBadge } from "@/components/auth/verification-status-badge";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import {
  changePassword,
  getAccessToken,
  getProfile,
  updateEmployerProfile,
} from "@/lib/api/auth";
import { suggestCompanies } from "@/lib/api/companies";
import {
  getListingAllowance,
  listEmployerPurchasesApi,
  type EmployerPurchaseRecord,
  type ListingAllowance,
} from "@/lib/api/employer-billing";
import { EmployerEbillDownloadButton } from "@/components/billing/employer-ebill-download-button";
import {
  formatLkr,
  formatPaymentMethod,
  formatPurchaseDate,
  formatPurchaseProduct,
} from "@/lib/employer/purchases";
import { getVerificationStatus } from "@/lib/api/verification";
import { normalizePhone, phonesMatch } from "@/lib/auth/phone";
import { signInPath } from "@/lib/auth/portal";

export function EmployerSettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const [companyPendingReview, setCompanyPendingReview] = useState(false);
  const [photo, setPhoto] = useState<RecruiterPhotoDraft | null>(null);
  const [listingAllowance, setListingAllowance] = useState<ListingAllowance | null>(null);
  const [purchases, setPurchases] = useState<EmployerPurchaseRecord[]>([]);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [savedSnapshot, setSavedSnapshot] = useState({
    email: "",
    fullName: "",
    title: "",
    phone: "",
    billingAddress: "",
    companyId: "",
    companySearch: "",
    companyPendingReview: false,
    photoUrl: null as string | null,
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [savedPhoneVerified, setSavedPhoneVerified] = useState(false);
  const [activeVerification, setActiveVerification] = useState<"email" | "phone" | null>(null);

  const displayName = useMemo(() => {
    const trimmed = fullName.trim();
    return trimmed || (email ? email.split("@")[0] : "Recruiter");
  }, [email, fullName]);

  const purchaseSummary = useMemo(() => {
    const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.total, 0);
    const listingPurchases = purchases.filter((p) => p.product === "job-listings").length;
    const sponsoredPurchases = purchases.filter((p) => p.product === "sponsored-jobs").length;
    const bannerPurchases = purchases.filter((p) => p.product === "banner-advertising").length;
    const slotDisplay = listingAllowance
      ? `${listingAllowance.remainingSlots}/${listingAllowance.totalSlots}`
      : "—";
    return {
      count: purchases.length,
      totalSpent,
      remainingSlots: listingAllowance?.remainingSlots ?? null,
      slotDisplay,
      listingPurchases,
      sponsoredPurchases,
      bannerPurchases,
      promotionPurchases: sponsoredPurchases + bannerPurchases,
    };
  }, [purchases, listingAllowance]);

  const avatarInitial = useMemo(
    () => (displayName.charAt(0) || "R").toUpperCase(),
    [displayName],
  );

  const ebillBuyer = useMemo(
    () => ({
      name: displayName,
      email,
      billingAddress: billingAddress.trim() || undefined,
    }),
    [billingAddress, displayName, email],
  );

  const phoneChanged = useMemo(
    () => !phonesMatch(phone, savedSnapshot.phone),
    [phone, savedSnapshot.phone],
  );

  const hasProfileChanges = useMemo(() => {
    if (fullName.trim() !== savedSnapshot.fullName.trim()) return true;
    if (title.trim() !== savedSnapshot.title.trim()) return true;
    if (phoneChanged) return true;
    if (billingAddress.trim() !== savedSnapshot.billingAddress.trim()) return true;
    if (companyId !== savedSnapshot.companyId) return true;
    if (
      companySearch.trim().toLowerCase() !==
      savedSnapshot.companySearch.trim().toLowerCase()
    ) {
      return true;
    }
    if (!emailVerified && email.trim() !== savedSnapshot.email.trim()) return true;

    const currentPhotoUrl = photo?.dataUrl ?? null;
    if (currentPhotoUrl !== savedSnapshot.photoUrl) return true;

    return false;
  }, [
    billingAddress,
    companyId,
    companySearch,
    email,
    emailVerified,
    fullName,
    phoneChanged,
    photo,
    savedSnapshot,
    title,
  ]);

  const canSaveProfile =
    hasProfileChanges && !(phoneChanged && !phoneVerified);

  const applyEmployerProfile = useCallback(
    (link: NonNullable<Awaited<ReturnType<typeof getProfile>>["employerUsers"]>[number] | undefined) => {
      const nextFullName = link?.fullName ?? "";
      const nextTitle = link?.title ?? "";
      const nextPhone = link?.contactNo ?? "";
      const nextBillingAddress = link?.billingAddress ?? "";
      const nextCompanyId = link?.company?.id ?? "";
      const nextCompanyName = link?.company?.name ?? "";
      const nextPhotoUrl = link?.photoUrl ?? null;

      setFullName(nextFullName);
      setTitle(nextTitle);
      setPhone(nextPhone);
      setBillingAddress(nextBillingAddress);
      const nextPendingReview = link?.company ? !link.company.verified : false;
      setCompanyId(nextCompanyId);
      setCompanySearch(nextCompanyName);
      setCompanyPendingReview(nextPendingReview);
      setPhoto(
        nextPhotoUrl
          ? { name: "profile-photo", previewUrl: nextPhotoUrl, dataUrl: nextPhotoUrl }
          : null,
      );
      setSavedSnapshot({
        fullName: nextFullName,
        title: nextTitle,
        phone: nextPhone,
        billingAddress: nextBillingAddress,
        companyId: nextCompanyId,
        companySearch: nextCompanyName,
        companyPendingReview: nextPendingReview,
        photoUrl: nextPhotoUrl,
      });
    },
    [],
  );

  const loadProfile = useCallback(async () => {
    if (!getAccessToken()) {
      router.push(signInPath("employer"));
      return;
    }
    setLoadingProfile(true);
    setProfileError(null);
    try {
      const profile = await getProfile();
      setEmail(profile.email);
      setEmailVerified(profile.emailVerified);
      const link = profile.employerUsers?.[0];
      applyEmployerProfile(link);
      setSavedSnapshot((prev) => ({ ...prev, email: profile.email }));
      const initialPhoneVerified = link?.phoneVerified ?? false;
      setPhoneVerified(initialPhoneVerified);
      setSavedPhoneVerified(initialPhoneVerified);

      try {
        const verification = await getVerificationStatus(getAccessToken());
        setEmailVerified(verification.emailVerified);
        setPhoneVerified(verification.phoneVerified);
        setSavedPhoneVerified(verification.phoneVerified);
      } catch {
        // Keep values from profile response when verification endpoint fails.
      }

      try {
        const [allowance, employerPurchases] = await Promise.all([
          getListingAllowance(),
          listEmployerPurchasesApi(),
        ]);
        setListingAllowance(allowance);
        setPurchases(employerPurchases);
      } catch {
        setListingAllowance(profile.listingAllowance ?? null);
        setPurchases([]);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(signInPath("employer"));
        return;
      }
      setProfileError(err instanceof ApiError ? err.message : "Failed to load profile.");
    } finally {
      setLoadingProfile(false);
    }
  }, [applyEmployerProfile, router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    const refreshPurchases = async () => {
      if (!getAccessToken()) return;
      try {
        const [allowance, employerPurchases] = await Promise.all([
          getListingAllowance(),
          listEmployerPurchasesApi(),
        ]);
        setListingAllowance(allowance);
        setPurchases(employerPurchases);
      } catch {
        // Keep current values when refresh fails.
      }
    };

    window.addEventListener("employer-purchases-updated", refreshPurchases);
    return () => window.removeEventListener("employer-purchases-updated", refreshPurchases);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || loadingProfile) return;
    if (window.location.hash === "#billing") {
      document.getElementById("billing")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loadingProfile]);

  const handleSaveProfile = async () => {
    setProfileError(null);
    setProfileSuccess(null);

    if (!fullName.trim()) {
      setProfileError("Full name is required.");
      return;
    }
    if (!title.trim()) {
      setProfileError("Professional title is required.");
      return;
    }
    if (!phone.trim()) {
      setProfileError("Phone number is required.");
      return;
    }
    if (phoneChanged && !phoneVerified) {
      setProfileError("Verify your new phone number with OTP before saving.");
      setActiveVerification("phone");
      return;
    }
    if (!companySearch.trim()) {
      setProfileError("Company name is required.");
      return;
    }
    const companyChanged =
      companyId !== savedSnapshot.companyId ||
      companySearch.trim().toLowerCase() !==
        savedSnapshot.companySearch.trim().toLowerCase();
    if (companyChanged && !companyId) {
      try {
        const suggestions = await suggestCompanies(companySearch.trim());
        const strongMatch = suggestions.find((item) => item.score >= 0.92);
        if (strongMatch) {
          setProfileError(
            `"${strongMatch.name}" already exists. Select it from the suggestions.`,
          );
          return;
        }
      } catch {
        // Allow backend validation when suggestions cannot be loaded.
      }
    }
    if (!emailVerified) {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        setProfileError("Email address is required.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        setProfileError("Enter a valid email address.");
        return;
      }
    }

    setSavingProfile(true);
    try {
      const photoPayload =
        photo === null
          ? savedSnapshot.photoUrl
            ? ""
            : undefined
          : photo.dataUrl !== savedSnapshot.photoUrl
            ? photo.dataUrl
            : undefined;

      const companyPayload =
        companyId && companyId !== savedSnapshot.companyId
          ? { companyId }
          : companyChanged
            ? { companyName: companySearch.trim() }
            : {};

      const updated = await updateEmployerProfile({
        fullName: fullName.trim(),
        title: title.trim() || undefined,
        contactNo: phone.trim() || undefined,
        billingAddress: billingAddress.trim() || undefined,
        ...companyPayload,
        ...(photoPayload !== undefined ? { photoUrl: photoPayload } : {}),
        ...(!emailVerified ? { email: email.trim() } : {}),
      });
      const nextPhotoUrl = updated.photoUrl ?? null;
      const nextCompanyPendingReview = !updated.company.verified;
      setCompanySearch(updated.company.name);
      setCompanyId(updated.company.id);
      setCompanyPendingReview(nextCompanyPendingReview);
      setPhoto(
        nextPhotoUrl
          ? { name: "profile-photo", previewUrl: nextPhotoUrl, dataUrl: nextPhotoUrl }
          : null,
      );
      const savedPhone = normalizePhone(phone.trim());
      setPhone(savedPhone);
      setSavedSnapshot({
        email: email.trim(),
        fullName: fullName.trim(),
        title: title.trim(),
        phone: savedPhone,
        billingAddress: billingAddress.trim(),
        companyId: updated.company.id,
        companySearch: updated.company.name,
        companyPendingReview: nextCompanyPendingReview,
        photoUrl: nextPhotoUrl,
      });
      setSavedPhoneVerified(true);
      setProfileSuccess("Profile saved.");
      window.dispatchEvent(new Event("employer-profile-updated"));
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : "Failed to save profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDiscard = () => {
    setEmail(savedSnapshot.email);
    setFullName(savedSnapshot.fullName);
    setTitle(savedSnapshot.title);
    setPhone(savedSnapshot.phone);
    setBillingAddress(savedSnapshot.billingAddress);
    setPhoneVerified(savedPhoneVerified);
    setActiveVerification(null);
    setCompanyId(savedSnapshot.companyId);
    setCompanySearch(savedSnapshot.companySearch);
    setCompanyPendingReview(savedSnapshot.companyPendingReview);
    setPhoto(
      savedSnapshot.photoUrl
        ? {
            name: "profile-photo",
            previewUrl: savedSnapshot.photoUrl,
            dataUrl: savedSnapshot.photoUrl,
          }
        : null,
    );
    setProfileError(null);
    setProfileSuccess(null);
  };

  const handlePasswordSubmit = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword.trim()) {
      setPasswordError("Enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      const result = await changePassword(currentPassword, newPassword);
      setPasswordSuccess(result.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : "Failed to update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-container-max py-stack-lg">
        {loadingProfile ? (
          <p className="text-on-surface-variant">Loading profile…</p>
        ) : (
          <div className="grid grid-cols-12 gap-gutter">
            {profileError && (
              <p className="col-span-12 rounded-lg border border-error/30 bg-error-container/30 px-4 py-3 text-sm text-error">
                {profileError}
              </p>
            )}
            {profileSuccess && (
              <p className="col-span-12 rounded-lg border border-secondary/30 bg-surface-container-low px-4 py-3 text-sm text-secondary">
                {profileSuccess}
              </p>
            )}

            <section className="col-span-12 rounded-lg border border-outline-variant bg-surface-container-lowest p-8 lg:col-span-7 lg:row-start-1">
              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-primary-container">Personal Information</h2>
                  <p className="font-body-md text-on-surface-variant">
                    Update your personal details and professional identity.
                  </p>
                </div>
              </div>

              <div className="mx-auto max-w-xl space-y-6">
                <RecruiterPhotoUploader
                  photo={photo}
                  onChange={setPhoto}
                  fallbackInitial={avatarInitial}
                  disabled={savingProfile}
                />

                <div className="space-y-4">
                  <div>
                    <label htmlFor="settings-full-name" className="mb-2 block font-label-bold text-on-surface">
                      Full Name <span className="text-error">*</span>
                    </label>
                    <input
                      id="settings-full-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded border border-outline-variant bg-white p-3 font-body-md outline-none transition-all focus:border-primary-container focus:ring-0"
                    />
                  </div>

                  <div>
                    <label htmlFor="settings-title" className="mb-2 block font-label-bold text-on-surface">
                      Professional Title <span className="text-error">*</span>
                    </label>
                    <input
                      id="settings-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Head of Talent Acquisition"
                      className="w-full rounded border border-outline-variant bg-white p-3 font-body-md outline-none transition-all focus:border-primary-container focus:ring-0"
                    />
                  </div>

                  <CompanyAutocomplete
                    label="Company"
                    value={companySearch}
                    selectedCompanyId={companyId || undefined}
                    selectedPendingReview={companyPendingReview}
                    showCreateLink={false}
                    required
                    placeholder="Start typing a company name…"
                    onQueryChange={setCompanySearch}
                    onSelect={(company) => {
                      setCompanyId(company.id);
                      setCompanySearch(company.name);
                      setCompanyPendingReview(Boolean(company.pendingReview));
                    }}
                    onClear={() => {
                      setCompanyId("");
                      setCompanyPendingReview(false);
                    }}
                  />

                  <div>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <label htmlFor="settings-email" className="font-label-bold text-on-surface">
                        Email Address <span className="text-error">*</span>
                      </label>
                      <VerificationStatusBadge
                        verified={emailVerified}
                        onVerify={
                          emailVerified
                            ? undefined
                            : () =>
                                setActiveVerification((current) =>
                                  current === "email" ? null : "email",
                                )
                        }
                      />
                    </div>
                    <input
                      id="settings-email"
                      type="email"
                      readOnly={emailVerified}
                      disabled={emailVerified}
                      value={email}
                      onChange={emailVerified ? undefined : (e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className={
                        emailVerified
                          ? "w-full cursor-not-allowed rounded border border-outline-variant bg-surface-container-low p-3 font-body-md text-on-surface-variant outline-none"
                          : "w-full rounded border border-outline-variant bg-white p-3 font-body-md outline-none transition-all focus:border-primary-container focus:ring-0"
                      }
                    />
                    {!emailVerified && activeVerification === "email" ? (
                      <InlineEmailVerification
                        onVerified={() => {
                          setEmailVerified(true);
                          setActiveVerification(null);
                        }}
                      />
                    ) : null}
                  </div>

                  <div>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <label htmlFor="settings-phone" className="font-label-bold text-on-surface">
                        Phone Number <span className="text-error">*</span>
                      </label>
                      <VerificationStatusBadge
                        verified={phoneVerified && !phoneChanged}
                        type="phone"
                        onVerify={
                          phoneVerified && !phoneChanged
                            ? undefined
                            : () =>
                                setActiveVerification((current) =>
                                  current === "phone" ? null : "phone",
                                )
                        }
                      />
                    </div>
                    <input
                      id="settings-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        const next = e.target.value;
                        setPhone(next);
                        if (!phonesMatch(next, savedSnapshot.phone)) {
                          setPhoneVerified(false);
                          setActiveVerification("phone");
                        } else {
                          setPhoneVerified(savedPhoneVerified);
                          setActiveVerification(null);
                        }
                      }}
                      placeholder="+94 11 234 5678"
                      className="w-full rounded border border-outline-variant bg-white p-3 font-body-md outline-none transition-all focus:border-primary-container focus:ring-0"
                    />
                    {phoneChanged && !phoneVerified ? (
                      <p className="mt-2 text-body-sm text-on-surface-variant">
                        Verify your new phone number with OTP before saving.
                      </p>
                    ) : null}
                    {(!phoneVerified || phoneChanged) && activeVerification === "phone" ? (
                      <InlinePhoneVerification
                        phone={phone}
                        onVerified={() => {
                          const normalized = normalizePhone(phone.trim());
                          setPhone(normalized);
                          setPhoneVerified(true);
                          setSavedPhoneVerified(true);
                          setActiveVerification(null);
                          setSavedSnapshot((prev) => ({ ...prev, phone: normalized }));
                        }}
                      />
                    ) : null}
                  </div>

                  <div>
                    <label
                      htmlFor="settings-billing-address"
                      className="mb-2 block font-label-bold text-on-surface"
                    >
                      Billing Address
                    </label>
                    <textarea
                      id="settings-billing-address"
                      value={billingAddress}
                      onChange={(e) => setBillingAddress(e.target.value)}
                      rows={3}
                      placeholder="Street, city, postal code, country"
                      className="w-full resize-y rounded border border-outline-variant bg-white p-3 font-body-md outline-none transition-all focus:border-primary-container focus:ring-0"
                    />
                    <p className="mt-1.5 text-body-sm text-on-surface-variant">
                      Used on purchase e-bills as your billing address.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-stretch justify-end gap-4 border-t border-outline-variant pt-8 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    disabled={!hasProfileChanges || savingProfile}
                    onClick={handleDiscard}
                    className="px-8 py-3 font-label-bold text-on-surface-variant transition-colors hover:text-primary-container disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="button"
                    disabled={!canSaveProfile || savingProfile}
                    onClick={handleSaveProfile}
                    className="executive-shadow rounded-lg bg-secondary px-10 py-3 font-label-bold text-white shadow-lg transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingProfile ? "Saving…" : "Save Preferences"}
                  </button>
                </div>
              </div>
            </section>

            <section
              id="billing"
              className="relative col-span-12 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest p-8 lg:col-span-12 lg:row-start-2"
            >
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-secondary/5 blur-3xl" />
              <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-primary-container">Billing &amp; Purchases</h2>
                  <p className="mt-1 font-body-md text-on-surface-variant">
                    One-time purchases for job listings, sponsored placements, and banner
                    advertising.
                  </p>
                </div>
                <Link
                  href="/pricing"
                  className="inline-flex shrink-0 items-center justify-center rounded bg-primary-container px-5 py-2.5 font-label-bold text-label-sm text-white transition-all hover:bg-black"
                >
                  View Pricing
                </Link>
              </div>

              <div className="mb-6 rounded border border-secondary/20 bg-secondary/5 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-label-bold uppercase tracking-widest text-outline">
                      Remaining Job Posting Slots
                    </p>
                    <p className="mt-2 text-headline-lg font-bold text-primary-container">
                      {purchaseSummary.slotDisplay}
                    </p>
                    <p className="mt-1 text-label-sm text-on-surface-variant">
                      {listingAllowance
                        ? `${listingAllowance.freeSlots} free slot included · ${listingAllowance.purchasedSlots} purchased`
                        : "Listing packages add job posting slots; sponsorship and banners are separate purchases."}
                    </p>
                  </div>
                  <Link
                    href="/pricing"
                    className="inline-flex shrink-0 items-center justify-center rounded border border-outline-variant bg-white px-4 py-2 font-label-bold text-secondary transition-colors hover:bg-surface-container-low"
                  >
                    View Pricing
                  </Link>
                </div>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded border border-outline-variant bg-surface-container-low p-4">
                  <p className="text-[11px] font-label-bold uppercase tracking-widest text-outline">
                    Total Purchases
                  </p>
                  <p className="mt-2 text-headline-md font-bold text-primary-container">
                    {purchaseSummary.count}
                  </p>
                  <p className="mt-1 text-[11px] text-outline">
                    {purchaseSummary.listingPurchases} listings ·{" "}
                    {purchaseSummary.sponsoredPurchases} sponsored ·{" "}
                    {purchaseSummary.bannerPurchases} banners
                  </p>
                </div>
                <div className="rounded border border-outline-variant bg-surface-container-low p-4">
                  <p className="text-[11px] font-label-bold uppercase tracking-widest text-outline">
                    Sponsored &amp; Banner Ads
                  </p>
                  <p className="mt-2 text-headline-md font-bold text-primary-container">
                    {purchaseSummary.promotionPurchases}
                  </p>
                  <p className="mt-1 text-[11px] text-outline">
                    Promotion purchases across your account
                  </p>
                </div>
                <div className="rounded border border-outline-variant bg-surface-container-low p-4">
                  <p className="text-[11px] font-label-bold uppercase tracking-widest text-outline">
                    Total Spent
                  </p>
                  <p className="mt-2 text-headline-md font-bold text-primary-container">
                    {purchaseSummary.count > 0 ? formatLkr(purchaseSummary.totalSpent) : "—"}
                  </p>
                  <p className="mt-1 text-[11px] text-outline">
                    All listings, sponsorship, and banner purchases
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded border border-outline-variant">
                <div className="border-b border-outline-variant bg-surface-container-low px-4 py-3">
                  <h3 className="font-label-bold text-primary-container">Purchase History</h3>
                </div>
                {purchases.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <Icon name="receipt_long" className="mx-auto mb-3 text-3xl text-outline" />
                    <p className="font-body-md text-on-surface-variant">No purchases yet.</p>
                    <p className="mt-1 text-label-sm text-outline">
                      Purchase job listings, sponsored placements, or banner advertising from
                      pricing.
                    </p>
                    <Link
                      href="/pricing"
                      className="mt-4 inline-flex font-label-bold text-secondary hover:underline"
                    >
                      Browse packages
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-surface-container-lowest text-[11px] font-bold uppercase tracking-widest text-outline">
                        <tr>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3">Package</th>
                          <th className="px-4 py-3">Payment</th>
                          <th className="px-4 py-3 text-right">Amount</th>
                          <th className="w-[80px] px-3 py-3 text-right">E-Bill</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant">
                        {purchases.map((purchase) => (
                          <tr key={purchase.id} className="hover:bg-surface-container-low/40">
                            <td className="px-4 py-4 text-label-sm text-outline">
                              {formatPurchaseDate(purchase.purchasedAt)}
                            </td>
                            <td className="px-4 py-4 text-label-sm text-on-surface">
                              {formatPurchaseProduct(purchase.product)}
                            </td>
                            <td className="px-4 py-4">
                              <p className="font-label-bold text-primary-container">{purchase.plan}</p>
                              {purchase.duration && (
                                <p className="text-[11px] text-outline">{purchase.duration}</p>
                              )}
                            </td>
                            <td className="px-4 py-4 text-label-sm text-outline">
                              {formatPaymentMethod(purchase.paymentMethod)}
                            </td>
                            <td className="px-4 py-4 text-right font-label-bold text-primary-container">
                              {formatLkr(purchase.total)}
                            </td>
                            <td className="px-3 py-4 text-right">
                              <EmployerEbillDownloadButton
                                purchase={purchase}
                                buyer={ebillBuyer}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            <section className="col-span-12 flex flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-8 lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:self-start">
              <div className="mb-4 flex items-center gap-2">
                <Icon name="security" className="text-primary-container" />
                <h2 className="text-lg font-bold text-primary-container">Security</h2>
              </div>
              <p className="mb-8 font-body-md text-on-surface-variant">
                Manage your password and account security settings.
              </p>
              {passwordError && (
                <p className="mb-4 text-sm text-error">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="mb-4 text-sm text-secondary">{passwordSuccess}</p>
              )}
              <div className="space-y-4">
                <div>
                  <label htmlFor="settings-current-password" className="mb-2 block font-label-bold text-on-surface">
                    Current Password
                  </label>
                  <input
                    id="settings-current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
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
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full rounded border border-outline-variant bg-white p-3 font-body-md outline-none focus:border-primary-container"
                  />
                </div>
              </div>
              <button
                type="button"
                disabled={savingPassword}
                onClick={handlePasswordSubmit}
                className="mt-8 w-full rounded bg-primary-container py-3 font-label-bold text-white transition-all hover:bg-black disabled:opacity-60"
              >
                {savingPassword ? "Updating…" : "Update Password"}
              </button>
            </section>
          </div>
        )}
      </div>
    </>
  );
}
