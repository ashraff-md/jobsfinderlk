# JobsFinder.lk — Build Progress

> Last updated: 2026-06-01

## Overall Status

| Milestone | Target | Status | Notes |
|-----------|--------|--------|-------|
| M0 Foundation | Week 1–2 | Done | Scaffold complete; i18n routing + CI remain |
| M1 Core Platform | Week 3–8 | In progress | UI done; core API + auth/jobs wiring in progress |
| M2 Growth & Monetization | Week 9–12 | Not started | |
| M3 AI | Week 13–16 | Not started | |
| M4 Launch | Week 17–18 | Not started | |

---

## M0 — Foundation

- [x] `frontend/` Next.js scaffold
- [x] `backend/` NestJS scaffold
- [x] `docker-compose.yml` (Postgres, Redis, Elasticsearch)
- [x] Design tokens in frontend Tailwind config (`globals.css` @theme)
- [x] `PROGRESS.md` created
- [x] Root `README.md` with local dev instructions
- [x] Route shells for all reference screens (19 routes)
- [x] NestJS health + auth module skeleton
- [x] Initial Prisma migration (`users`, `companies`, `jobs`, `applications`)
- [x] i18n skeleton — locale config + `messages/{en,si,ta}.json`
- [ ] i18n routing — wire `next-intl` middleware + `[locale]` routes
- [ ] CI: lint/typecheck for frontend and backend

---

## M1 — Core Platform

### Frontend

- [x] Landing page — [Ref 1](References/1_landing_page/code.html)
- [x] Auth sign in / sign up — [Ref 2](References/2_authentication_sign_up/code.html)
- [x] Job search + filters — [Ref 3](References/3_smart_job_search_executive_theme/code.html)
- [x] Job detail + apply UI — [Ref 4](References/4_job_details_executive_theme/code.html)
- [x] Seeker dashboard — [Ref 7](References/7_seeker_dashboard_executive_theme/code.html)
- [x] Profile + AI insights — [Ref 7](References/7_job_seeker_profile_ai_insights/code.html)
- [x] Post a job — [Ref 8](References/8_post_a_job_executive_theme/code.html)
- [x] Employer dashboard — [Ref 9](References/9_recruiter_dashboard/code.html)
- [x] Applicant pipeline — [Ref 9](References/9_recruiter_candidate_pipeline/code.html)
- [x] Company profile — [Ref 10](References/10_company_profile/code.html)
- [x] Companies directory — [Ref 11](References/11_companies_directory/code.html)
- [x] Internship hub — [Ref 12](References/12_internship_graduate_portal/code.html)
- [x] Career advice blog — [Ref 13](References/13_career_advice_blog/code.html)
- [x] Pricing page — [Ref 14](References/14_pricing_plans/code.html)
- [x] Help center — [Ref 15](References/15_help_center_support/code.html)
- [x] Admin management hub — [Ref 16](References/16_admin_management_hub/code.html)
- [x] Admin analytics dashboard — [Ref 17](References/17_admin_dashboard_executive_theme/code.html)
- [x] Legal policies — [Ref 17](References/17_legal_policies/code.html)
- [x] Contact us — [Ref 18](References/18_contact_us/code.html)

### Backend

- [x] Auth module — JWT access/refresh tokens
- [ ] Auth module — Google + LinkedIn OAuth
- [ ] Auth module — email verification
- [x] User roles — seeker, employer, admin, moderator
- [ ] Seeker profile CRUD (skills, education, experience)
- [ ] Resume upload metadata (Cloudflare R2)
- [x] Company registration + profile (list, detail, create)
- [x] Jobs CRUD + lifecycle (draft → pending_review → published)
- [x] One-click apply
- [ ] Elasticsearch job indexing + faceted search (Prisma search for now)
- [x] Admin moderation queue (API)
- [x] Scam heuristics (flag payment-required jobs)
- [ ] PDPA — consent, data export, deletion endpoints

### Frontend ↔ API wiring

- [x] API client + auth session (localStorage)
- [x] Sign in / sign up → `/api/auth`
- [x] Job search + detail + quick apply → `/api/jobs`, `/api/applications`
- [x] Companies directory → `/api/companies`
- [x] Post job form → `POST /api/jobs`
- [x] Company profile → `/api/companies/:slug`
- [x] Admin moderation UI → admin API (approval queue)

---

## M2 — Growth & Monetization

### Frontend

- [ ] Saved jobs / bookmarks
- [ ] Application status tracker (seeker + employer pipeline)
- [ ] Verified employer badge UI
- [ ] Salary transparency on job posts
- [ ] Internship hub — [Ref 12](References/12_internship_graduate_portal/code.html)
- [ ] Employer analytics dashboard
- [ ] Pricing page — [Ref 14](References/14_pricing_plans/code.html)
- [ ] Career advice blog — [Ref 13](References/13_career_advice_blog/code.html)
- [ ] Help center — [Ref 15](References/15_help_center_support/code.html)
- [ ] Contact us — [Ref 18](References/18_contact_us/code.html)
- [ ] PWA manifest + mobile polish

### Backend

- [ ] Saved jobs API
- [ ] Application status workflow (submitted → viewed → shortlisted → interview → rejected → hired)
- [ ] Company verification workflow
- [ ] PayHere subscriptions (Free / Basic / Business / Enterprise)
- [ ] Featured job boosts
- [ ] Homepage banner ad management
- [ ] Job alert emails (SendGrid)
- [ ] Redis-cached search results
- [ ] Blog / help / legal content CMS

---

## M3 — AI

### Frontend

- [ ] Job match score on cards and detail page
- [ ] Recommended jobs feed
- [ ] Profile + AI insights — [Ref 7](References/7_job_seeker_profile_ai_insights/code.html)

### Backend

- [ ] CV upload → structured parse
- [ ] Job match scoring (skills + experience + location)
- [ ] Recommendation engine
- [ ] AI CV review
- [ ] Semantic search upgrade (optional vector field)

---

## M4 — Launch

- [ ] Full trilingual UI pass (en / si / ta)
- [ ] CAPTCHA on auth and job post
- [ ] CV malware scanning
- [ ] Load testing (search + apply flows)
- [ ] Beta release + feedback
- [ ] Production deploy + monitoring (Sentry, uptime)

---

## Blockers & Decisions

| Date | Item | Resolution |
|------|------|------------|
| 2026-06-01 | Repo layout | Separate `frontend/` and `backend/` directories |
| 2026-06-01 | ORM | Prisma for PostgreSQL migrations and type-safe queries |
| 2026-06-01 | Design system | Executive Talent Framework tokens in Tailwind v4 `@theme` |
| 2026-06-01 | M0 delivered | All route shells, auth/health API, Prisma schema + migration SQL |
