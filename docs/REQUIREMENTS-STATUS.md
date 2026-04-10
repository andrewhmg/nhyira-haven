# INTEX2 Requirements Status

**Team:** 1-12  
**Project:** Nhyira Haven — "Where Healing Begins"  
**Deadline:** Friday, April 10, 2026 at 10:00 AM  
**Time Remaining:** ~18 hours

---

## 📊 Overall Progress

| Class | Completed | Remaining | Status |
|-------|-----------|-----------|--------|
| IS 401 (PM/Design) | 65% | AI screenshots, feedback, OKR, retro | ⚠️ In Progress |
| IS 413 (Development) | 95% | Minor polish | ✅ Nearly Done |
| IS 414 (Security) | 90% | Secrets to Key Vault | ✅ Nearly Done |
| IS 455 (ML) | 80% | Verify pipeline completeness | ⚠️ In Progress |

---

## IS 401 — Project Management & Design

### Monday Requirements ✅ COMPLETE

- [x] Organization name & branding — **Nhyira Haven**
- [x] Problem statement — Defined in INTEX2-CASE.md
- [x] 2 Primary personas — Amara Okafor (Program Director), David Mensah (Donor Relations)
- [x] Journey maps for each persona — In FigJam
- [x] MoSCoW prioritized backlog — 12 Must, 7 Should, 7 Could, 5 Won't
- [x] Product backlog (user stories) — 16 stories
- [x] Sprint backlog (technical tasks) — 10 tasks
- [x] Burndown chart — Corrello widget in FigJam
- [x] 3 Wireframes — Caseload Inventory, Landing Page, Admin Dashboard

### Tuesday Requirements ⚠️ IN PROGRESS

- [x] Tech stack architecture diagram — `docs/tech-stack-diagram.md`
- [ ] **AI-generated UI design screenshots (9 total)**
  - Need: 3 screens × 3 design variations each
  - Screens: Landing Page, Admin Dashboard, Caseload Inventory
- [ ] **Design decision documentation** — Why chosen design was selected

### Wednesday Requirements ⚠️ IN PROGRESS

- [x] One working page deployed — https://zealous-hill-057c4580f.1.azurestaticapps.net
- [ ] **User feedback collected** — Need 2-3 users to test and provide feedback
- [ ] **Current state screenshots** — Screenshots of deployed site

### Thursday Requirements ❌ NOT STARTED

- [ ] **OKR metric defined** — Objective & Key Results for measuring success
- [ ] **Accessibility audit** — Run Lighthouse, achieve 90%+ score
- [ ] **Responsive design verified** — Test on mobile, tablet, desktop
- [ ] **Team retrospective document** — What worked, what didn't, improvements

---

## IS 413 — Application Development

### Public Pages ✅ COMPLETE

| Page | File | Status |
|------|------|--------|
| Landing (Home) | `frontend/src/pages/Landing.tsx` | ✅ |
| Impact Dashboard | `frontend/src/pages/ImpactDashboard.tsx` | ✅ |
| Login | `frontend/src/pages/Login.tsx` | ✅ |
| Privacy Policy | `frontend/src/pages/PrivacyPolicy.tsx` | ✅ |

### Staff Portal ✅ COMPLETE

| Page | File | Status |
|------|------|--------|
| Admin Dashboard | `frontend/src/pages/admin/AdminDashboard.tsx` | ✅ |
| Donors & Contributions | `frontend/src/pages/admin/Donors.tsx` | ✅ |
| Donor Detail | `frontend/src/pages/admin/DonorDetail.tsx` | ✅ |
| Caseload Inventory | `frontend/src/pages/admin/Residents.tsx` | ✅ |
| Resident Detail | `frontend/src/pages/admin/ResidentDetail.tsx` | ✅ |
| Process Recordings | `frontend/src/pages/admin/ProcessRecordings.tsx` | ✅ |
| Home Visitations | `frontend/src/pages/admin/HomeVisitations.tsx` | ✅ |
| Reports & Analytics | `frontend/src/pages/admin/Reports.tsx` | ✅ |
| Safehouse Management | `frontend/src/pages/admin/SafehouseManagement.tsx` | ✅ |

### Backend Controllers ✅ COMPLETE

| Controller | Endpoint Base | Records |
|------------|---------------|---------|
| AuthController | `/api/auth` | — |
| DashboardController | `/api/dashboard` | — |
| DonationsController | `/api/donations` | 840 |
| SupportersController | `/api/supporters` | 70 |
| ResidentsController | `/api/residents` | 60 |
| SafehousesController | `/api/safehouses` | 9 |
| HealthController | `/api/health` | — |
| PartnersController | `/api/partners` | 30 |
| PartnerAssignmentsController | `/api/partner-assignments` | 0 |
| ProcessRecordingsController | `/api/process-recordings` | 2,819 |
| HomeVisitationsController | `/api/home-visitations` | 1,337 |
| EducationRecordsController | `/api/education-records` | 534 |
| HealthRecordsController | `/api/health-records` | 534 |
| InterventionPlansController | `/api/intervention-plans` | 180 |
| IncidentReportsController | `/api/incident-reports` | 100 |
| InKindDonationItemsController | `/api/in-kind-donation-items` | 129 |
| DonationAllocationsController | `/api/donation-allocations` | 521 |
| SocialMediaPostsController | `/api/social-media-posts` | 1,624 |
| SafehouseMetricsController | `/api/safehouse-metrics` | 450 |
| PublicImpactSnapshotsController | `/api/public-impact-snapshots` | 1 |

**Total: 20 controllers, all deployed and working**

### Database ✅ COMPLETE

- [x] PostgreSQL database — Neon.tech
- [x] All 17 tables seeded with CSV data
- [x] Entity relationships configured
- [x] Migrations applied

### Deployment ✅ COMPLETE

- [x] Backend deployed — https://nhyira-haven-api.azurewebsites.net
- [x] Frontend deployed — https://zealous-hill-057c4580f.1.azurestaticapps.net
- [x] Database deployed — Neon PostgreSQL
- [x] CI/CD configured — GitHub Actions

---

## IS 414 — Security

### Authentication & Authorization ✅ COMPLETE

- [x] ASP.NET Identity authentication
- [x] JWT token-based auth
- [x] Custom password policy (12+ characters)
- [x] Role-based access control (Admin, Staff, Donor)
- [x] Protected routes in React
- [x] Test accounts created:
  - Admin: `admin@nhyirahaven.org` / `NhyiraHaven2026!`
  - Staff: `staff@nhyirahaven.org`
  - Donor: `donor@nhyirahaven.org`

### Privacy & Compliance ✅ COMPLETE

- [x] GDPR privacy policy page — 16 sections
- [x] Cookie consent banner — CookieConsent.tsx
- [x] Delete confirmation modals — ConfirmModal.tsx
- [x] Content Security Policy (CSP) header — ✅ Verified
- [x] X-Frame-Options: DENY — ✅ Verified
- [x] X-Content-Type-Options: nosniff — ✅ Verified

### Security Headers (Verified)

```
content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://nhyira-haven-api.azurewebsites.net https://db.zuyyebiltbkzkooegbrs.supabase.co;
x-frame-options: DENY
x-content-type-options: nosniff
```

### Remaining ⚠️

- [ ] Move secrets to Azure Key Vault (currently in appsettings.json)
- [ ] Verify HTTPS redirect is enforced

---

## IS 455 — Machine Learning

### ML Pipelines ✅ FILES EXIST

| Pipeline | File | Status |
|----------|------|--------|
| Donor Churn Prevention | `donor-churn-prevention.ipynb` | ✅ Needs verification |
| Reintegration Readiness | `reintegration-readiness.ipynb` | ✅ Needs verification |
| Social Media Conversion | `social-media-conversion.ipynb` | ✅ Needs verification |
| Donation Allocation ROI | `donation-allocation-roi.ipynb` | ✅ Needs verification |
| Counseling Effectiveness | `counseling-session-effectiveness.ipynb` | ✅ Needs verification |
| Incident Early Warning | `incident-early-warning.ipynb` | ✅ Needs verification |
| Donor Lifetime Value | `donor-lifetime-value.ipynb` | ✅ Needs verification |
| Key Donor Identification | `key-donor-identification.ipynb` | ✅ Needs verification |
| Family Cooperation Reintegration | `family-cooperation-reintegration.ipynb` | ✅ Needs verification |
| Successful Exit Prediction | `successful-exit-prediction.ipynb` | ✅ Needs verification |
| Bad Exit Early Warning | `bad-exit-early-warning.ipynb` | ✅ Needs verification |

**Total: 11 pipeline notebooks**

### Each Pipeline Must Have ❓ NEEDS VERIFICATION

- [ ] Problem framing — What question is being answered?
- [ ] Data preparation — Cleaning and feature engineering
- [ ] Exploration — EDA and visualization
- [ ] Modeling — Algorithm selection and training
- [ ] Evaluation — Metrics and performance
- [ ] Deployment — How it integrates with the app

---

## 🔴 Priority Action Items

### High Priority (Due Thursday Night)

1. **AI UI Screenshots (IS 401)**
   - Generate 9 screenshots: 3 screens × 3 variations
   - Screens: Landing, Admin Dashboard, Caseload
   - Document design decision rationale

2. **User Feedback (IS 401)**
   - Get 2-3 people to test the deployed site
   - Collect written feedback
   - Take screenshots of current state

3. **OKR Metric (IS 401)**
   - Define Objective
   - Define 3-5 Key Results
   - Document in a markdown file

4. **Lighthouse Accessibility Audit (IS 401)**
   - Run Lighthouse on frontend
   - Achieve 90%+ accessibility score
   - Screenshot the results

5. **Responsive Design Check (IS 401)**
   - Test on mobile viewport
   - Test on tablet viewport
   - Test on desktop viewport
   - Document findings

6. **Team Retrospective (IS 401)**
   - What went well
   - What didn't go well
   - What to improve next sprint

### Medium Priority (Nice to Have)

7. **Secrets to Key Vault (IS 414)**
   - Move connection strings from appsettings.json
   - Configure Azure Key Vault
   - Update app to read from Key Vault

8. **Verify ML Pipeline Completeness (IS 455)**
   - Check each notebook has all 6 steps
   - Add missing sections if needed
   - Ensure evaluation metrics are documented

---

## 📁 File Locations

| Deliverable | Location |
|-------------|----------|
| Requirements Checklist | `docs/REQUIREMENTS-CHECKLIST.md` |
| Requirements Status | `docs/REQUIREMENTS-STATUS.md` (this file) |
| INTEX2 Case Document | `docs/INTEX2-CASE.md` |
| Tech Stack Diagram | `docs/tech-stack-diagram.md` |
| Database Schema | `docs/DATABASE-SCHEMA.md` |
| API Documentation | `docs/API-DOCUMENTATION.md` |
| ML Pipelines | `ml-pipelines/*.ipynb` |

---

## 🔗 Quick Links

| Resource | URL |
|----------|-----|
| Live Frontend | https://zealous-hill-057c4580f.1.azurestaticapps.net |
| Live Backend | https://nhyira-haven-api.azurewebsites.net |
| GitHub Repo | https://github.com/andrewhmg/nhyira-haven |
| Trello Board | https://trello.com/b/Y99AnNYX/sprint-1-intex |
| FigJam | https://www.figma.com/board/pn3s1lJiPPPTX4MKqBBEsl/Team-1-12-2026W-INTEX-Figma-template |
| Final Submission | https://byu.az1.qualtrics.com/jfe/form/SV_bsjPxSQyEdIQRhA |
| Peer Evaluation | https://byu.az1.qualtrics.com/jfe/form/SV_7VXtQGm7rT4cvoa |

---

## ⏰ Timeline

| Day | Focus | Status |
|-----|-------|--------|
| Mon 4/6 | Requirements | ✅ Complete |
| Tue 4/7 | Design | ⚠️ AI screenshots needed |
| Wed 4/8 | Working Page | ✅ Deployed, feedback needed |
| Thu 4/9 | Iterate | 🔄 In progress |
| Fri 4/10 | Submit | 🔴 **Deadline 10:00 AM** |

---

*Last updated: Thursday, April 9, 2026*