export type PageShellProps = {
  title: string;
  description?: string;
  reference?: string;
  phase?: string;
  children?: React.ReactNode;
};

export const ROUTE_META: Record<
  string,
  { title: string; reference: string; phase: string }
> = {
  "/": {
    title: "Landing Page",
    reference: "References/1_landing_page/code.html",
    phase: "M1",
  },
  "/auth/sign-in": {
    title: "Sign In",
    reference: "References/2_authentication_sign_up/code.html",
    phase: "M1",
  },
  "/auth/sign-up": {
    title: "Sign Up",
    reference: "References/2_authentication_sign_up/code.html",
    phase: "M1",
  },
  "/jobs": {
    title: "Smart Job Search",
    reference: "References/3_smart_job_search_executive_theme/code.html",
    phase: "M1",
  },
  "/jobs/[slug]": {
    title: "Job Details",
    reference: "References/4_job_details_executive_theme/code.html",
    phase: "M1",
  },
  "/dashboard": {
    title: "Seeker Dashboard",
    reference: "References/7_seeker_dashboard_executive_theme/code.html",
    phase: "M1",
  },
  "/dashboard/applications": {
    title: "My Applications",
    reference: "references2/my_applications/code.html",
    phase: "M1",
  },
  "/dashboard/saved": {
    title: "Saved Jobs",
    reference: "references2/saved_jobs/code.html",
    phase: "M1",
  },
  "/dashboard/profile": {
    title: "Profile",
    reference: "references2/profile/code.html",
    phase: "M1",
  },
  "/dashboard/settings": {
    title: "Settings",
    reference: "references2/settings 1/code.html",
    phase: "M1",
  },
  "/employer": {
    title: "Recruiter Dashboard",
    reference: "References/9_recruiter_dashboard/code.html",
    phase: "M1",
  },
  "/employer/applications": {
    title: "Candidate Pipeline",
    reference: "references2/applications/code.html",
    phase: "M1",
  },
  "/employer/jobs": {
    title: "Manage Job Listings",
    reference: "references2/job_listings_management/code.html",
    phase: "M1",
  },
  "/employer/settings": {
    title: "Recruiter Profile Settings",
    reference: "references2/recruiter_settings/code.html",
    phase: "M1",
  },
  "/employer/jobs/new": {
    title: "Post a Job",
    reference: "References/8_post_a_job_executive_theme/code.html",
    phase: "M1",
  },
  "/employer/companies/new": {
    title: "Register Company",
    reference: "References/8_post_a_job_executive_theme/code.html",
    phase: "M1",
  },
  "/employer/jobs/[id]/applicants": {
    title: "Candidate Pipeline",
    reference: "References/9_recruiter_candidate_pipeline/code.html",
    phase: "M1–M2",
  },
  "/companies": {
    title: "Companies Directory",
    reference: "References/11_companies_directory/code.html",
    phase: "M1",
  },
  "/companies/[slug]": {
    title: "Company Profile",
    reference: "References/10_company_profile/code.html",
    phase: "M1",
  },
  "/internships": {
    title: "Internship & Graduate Portal",
    reference: "References/12_internship_graduate_portal/code.html",
    phase: "M2",
  },
  "/career-advice": {
    title: "Career Advice Blog",
    reference: "References/13_career_advice_blog/code.html",
    phase: "M2",
  },
  "/pricing": {
    title: "Pricing Plans",
    reference: "References/14_pricing_plans/code.html",
    phase: "M2",
  },
  "/help": {
    title: "Help Center",
    reference: "References/15_help_center_support/code.html",
    phase: "M2",
  },
  "/admin": {
    title: "Admin Dashboard",
    reference: "References/17_admin_dashboard_executive_theme/code.html",
    phase: "M1",
  },
  "/admin/jobs": {
    title: "Ad Approval Queue",
    reference: "references2/admin_ad_job_post_approval_hub/code.html",
    phase: "M1",
  },
  "/admin/jobs/new": {
    title: "Post a Job",
    reference: "References/8_post_a_job_executive_theme/code.html",
    phase: "M1",
  },
  "/admin/jobs/[id]/review": {
    title: "Ad Compliance Review",
    reference: "references2/admin_ad_review_compliance_detail/code.html",
    phase: "M1",
  },
  "/admin/jobs/government": {
    title: "Government Postings",
    reference: "references2/government_job_posting_form/code.html",
    phase: "M1",
  },
  "/admin/jobs/government/new": {
    title: "Government Job Posting",
    reference: "references2/government_job_posting_form/code.html",
    phase: "M1",
  },
  "/admin/companies": {
    title: "Company Onboarding",
    reference: "references2/admin_company_onboarding_approval/code.html",
    phase: "M1",
  },
  "/admin/companies/[id]": {
    title: "Company Onboarding Detail",
    reference: "references2/admin_company_onboarding_detail/code.html",
    phase: "M1",
  },
  "/admin/verifications": {
    title: "Recruiter Verifications",
    reference: "references2/admin_recruiter_verification_updates/code.html",
    phase: "M1",
  },
  "/admin/verifications/[id]": {
    title: "Recruiter Verification Detail",
    reference: "references2/admin_recruiter_verification_detail/code.html",
    phase: "M1",
  },
  "/admin/talent": {
    title: "Executive Talent Pool",
    reference: "references2/admin_talent_pool_management/code.html",
    phase: "M1–M2",
  },
  "/admin/partners": {
    title: "Partner Management",
    reference: "references2/admin_partner_management/code.html",
    phase: "M1–M2",
  },
  "/admin/revenue": {
    title: "Revenue & Financials",
    reference: "references2/admin_revenue_financials/code.html",
    phase: "M1–M2",
  },
  "/admin/analytics": {
    title: "AI Performance Analytics",
    reference: "references2/admin_ai_performance_analytics/code.html",
    phase: "M1–M2",
  },
  "/admin/settings": {
    title: "Admin Profile",
    reference: "references2/recruiter_settings/code.html",
    phase: "M1",
  },
  "/admin/governance": {
    title: "Governance & Security",
    reference: "references2/admin_platform_governance_security/code.html",
    phase: "M1–M2",
  },
  "/legal/[policy]": {
    title: "Legal Policies",
    reference: "References/17_legal_policies/code.html",
    phase: "M1",
  },
  "/contact": {
    title: "Contact Us",
    reference: "References/18_contact_us/code.html",
    phase: "M2",
  },
};
