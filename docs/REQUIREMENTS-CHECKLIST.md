# Nhyira Haven - Requirements Checklist

**Team:** 1-12  
**Project:** Nhyira Haven — "Where Healing Begins"  
**Final Deadline:** Friday, April 10, 2026 at 10:00 AM  
**Last Updated:** Wednesday, April 8, 2026 (Verified from GitHub)

---

## IS 401 — Project Management & Design

### Monday Requirements ✅ DONE
- [x] Organization name & branding — **Nhyira Haven**
- [x] Problem statement — Defined in INTEX2-CASE.md
- [x] 2 Primary personas — Amara Okafor (Program Director), David Mensah (Donor Relations)
- [x] Journey maps for each persona — In FigJam
- [x] MoSCoW prioritized backlog — 12 Must, 7 Should, 7 Could, 5 Won't
- [x] Product backlog (user stories) — 16 stories
- [x] Sprint backlog (technical tasks) — 10 tasks
- [x] Burndown chart — Corrello widget in FigJam
- [x] 3 Wireframes — Caseload Inventory, Landing Page, Admin Dashboard

### Tuesday Requirements
- [x] Tech stack architecture diagram — docs/tech-stack-diagram.md
- [ ] AI-generated UI design screenshots (9 screenshots: 3 screens × 3 variations)
- [ ] Design decision documentation with rationale

### Wednesday Requirements
- [x] One working page deployed — Landing page live at https://zealous-hill-057c4580f.1.azurestaticapps.net
- [ ] User feedback collected (2-3 users test the system)
- [ ] Current state screenshots of deployed site

### Thursday Requirements
- [ ] OKR metric defined
- [ ] Accessibility audit (90%+ Lighthouse score)
- [ ] Responsive design verified (mobile, tablet, desktop)
- [ ] Team retrospective document

---

## IS 413 — Application Development

### Public Pages (Must Have)
- [x] Landing page (Home) — `frontend/src/pages/Landing.tsx` ✅
- [x] Impact dashboard — `frontend/src/pages/ImpactDashboard.tsx` ✅
- [x] Login page — `frontend/src/pages/Login.tsx` ✅
- [x] Privacy policy page — `frontend/src/pages/PrivacyPolicy.tsx` ✅

### Staff Portal (Must Have)
- [x] Admin dashboard — `frontend/src/pages/admin/AdminDashboard.tsx` ✅
- [x] Donors & contributions page — `frontend/src/pages/admin/Donors.tsx`, `DonorDetail.tsx` ✅
- [x] Caseload inventory page — `frontend/src/pages/admin/Residents.tsx`, `ResidentDetail.tsx` ✅
- [x] Process recording (CRUD) — `frontend/src/pages/admin/ProcessRecordings.tsx` ✅
- [x] Home visitations (CRUD) — `frontend/src/pages/admin/HomeVisitations.tsx` ✅
- [x] Reports & analytics page — `frontend/src/pages/admin/Reports.tsx` ✅

### Technical Requirements
- [x] .NET 10/C# backend — `backend/` with 7 controllers ✅
- [x] React/TypeScript frontend — `frontend/src/` with 13 pages ✅
- [x] Database connected (Supabase PostgreSQL) — `ApplicationDbContext.cs` ✅
- [x] App deployed publicly — https://nhyira-haven-api.azurewebsites.net ✅
- [x] Database deployed publicly — Supabase PostgreSQL ✅

### Backend Controllers (7 total)
- [x] `AuthController.cs` — Login/Register with JWT
- [x] `DashboardController.cs` — Overview & metrics
- [x] `DonationsController.cs` — Donation CRUD
- [x] `ResidentsController.cs` — Caseload management
- [x] `SafehousesController.cs` — Safehouse CRUD
- [x] `HealthController.cs` — Health records
- [x] `SupportersController.cs` — Donor management

### Database Models (4 domains)
- [x] `ApplicationUser.cs` — Identity with roles
- [x] `DonorSupport.cs` — Donors, donations, partners
- [x] `CaseManagement.cs` — Residents, interventions, visits
- [x] `Outreach.cs` — Social media, metrics, impact

---

## IS 414 — Security

### Authentication & Authorization
- [x] ASP.NET Identity authentication — `DbInitializer.cs` ✅
- [x] Custom password policies (12+ characters) — `PasswordPolicy.cs` ✅
- [x] Role-based access (Admin, Staff, Donor) — `ProtectedRoute.tsx` ✅
- [ ] HTTPS redirect (force HTTP→HTTPS) — Azure default (needs verification)
- [x] Test accounts created — Admin, Staff, Donor, MFA-enabled in `DbInitializer.cs` ✅

### Privacy & Compliance
- [x] GDPR privacy policy page — 16 sections in `PrivacyPolicy.tsx` ✅
- [x] Cookie consent banner — `CookieConsent.tsx` with preferences ✅
- [x] Confirmation for deletions — `ConfirmModal.tsx` component ✅
- [ ] Content Security Policy (CSP) header
- [ ] Secrets stored securely (Azure Key Vault, not in repo) — Currently in appsettings

---

## IS 455 — Machine Learning

### ML Pipelines (Build as many as possible)
- [x] 7 ML pipelines added — Commit `b7266c7 "Added 7 new ML pipelines"` ✅
- [ ] Donor churn prediction
- [ ] Reintegration readiness
- [ ] Social media ROI
- [ ] Intervention effectiveness

### Each pipeline requires:
- [ ] Problem framing
- [ ] Data preparation
- [ ] Exploration
- [ ] Modeling
- [ ] Evaluation
- [ ] Deployment (Jupyter notebooks in `ml-pipelines/`)

---

## Current Blockers

1. **Database seeding** — Users not seeded in Supabase (login returns error)
   - DbInitializer exists but not running on Azure startup
   - Need to run SQL INSERT or fix startup seeding

---

## Progress Summary

| Class | Completed | Remaining | % Done |
|-------|-----------|-----------|--------|
| IS 401 (PM) | Monday + Tech Diagram | AI screenshots, feedback, OKR | 65% |
| IS 413 (Dev) | All pages + controllers | Full CRUD testing | 85% |
| IS 414 (Security) | Auth, policies, GDPR, cookies | CSP header, secrets | 75% |
| IS 455 (ML) | Pipeline files exist | Complete pipelines | 20% |
| **Overall** | — | — | **~60%** |

---

## Quick Links

| Resource | URL |
|----------|-----|
| Live Frontend | https://zealous-hill-057c4580f.1.azurestaticapps.net |
| Live Backend | https://nhyira-haven-api.azurewebsites.net |
| GitHub | https://github.com/andrewhmg/nhyira-haven |
| Trello | https://trello.com/b/Y99AnNYX/sprint-1-intex |
| FigJam | https://www.figma.com/board/pn3s1lJiPPPTX4MKqBBEsl/Team-1-12-2026W-INTEX-Figma-template |
| Final Submission | https://byu.az1.qualtrics.com/jfe/form/SV_bsjPxSQyEdIQRhA |

---

## Timeline

| Day | Focus | Key Deliverables |
|-----|-------|------------------|
| Mon 4/6 | Requirements | ✅ Complete |
| Tue 4/7 | Design | AI screenshots, design decision, tech diagram |
| Wed 4/8 | Working Page | Deployed site, user feedback, screenshots |
| Thu 4/9 | Iterate | OKR, accessibility, responsive, retrospective |
| Fri 4/10 | Submit | Final submission by 10:00 AM, presentation |
