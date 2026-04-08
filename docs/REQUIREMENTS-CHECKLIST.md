# Nhyira Haven - Requirements Checklist

**Team:** 1-12  
**Project:** Nhyira Haven — "Where Healing Begins"  
**Final Deadline:** Friday, April 10, 2026 at 10:00 AM  
**Last Updated:** Wednesday, April 8, 2026

---

## IS 401 — Project Management & Design

### Monday Requirements ✅ DONE
- [x] Organization name & branding
- [x] Problem statement
- [x] 2 Primary personas (Amara Okafor, David Mensah)
- [x] Journey maps for each persona
- [x] MoSCoW prioritized backlog (Must/Should/Could/Won't)
- [x] Product backlog (user stories)
- [x] Sprint backlog (technical tasks)
- [x] Burndown chart (Corrello widget)
- [x] 3 Wireframes (Caseload Inventory, Landing Page, Admin Dashboard)

### Tuesday Requirements
- [x] Tech stack architecture diagram
- [ ] AI-generated UI design screenshots (9 screenshots: 3 screens × 3 variations)
- [ ] Design decision documentation with rationale

### Wednesday Requirements
- [x] One working page deployed (landing page is live)
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
- [x] Landing page (Home) — https://zealous-hill-057c4580f.1.azurestaticapps.net
- [ ] Impact dashboard (public-facing showing donor impact)
- [x] Login page (placeholder exists)
- [x] Privacy policy page (placeholder exists)

### Staff Portal (Must Have)
- [x] Admin dashboard (basic version)
- [ ] Donors & contributions page (full CRUD)
- [ ] Caseload inventory page (residents list)
- [ ] Process recording (CRUD for case notes)
- [ ] Home visitations (CRUD for field visits)
- [ ] Reports & analytics page

### Technical Requirements
- [x] .NET 10/C# backend
- [x] React/TypeScript frontend
- [x] Database connected (Supabase PostgreSQL)
- [x] App deployed publicly
- [x] Database deployed publicly

---

## IS 414 — Security

### Authentication & Authorization
- [x] ASP.NET Identity authentication
- [x] Custom password policies (12+ characters)
- [x] Role-based access (Admin, Staff, Donor)
- [ ] HTTPS redirect (force HTTP→HTTPS)
- [x] Test accounts created (Admin, Staff, Donor, MFA-enabled)

### Privacy & Compliance
- [x] GDPR privacy policy page
- [x] Cookie consent banner
- [x] Confirmation for deletions (UI component exists)
- [ ] Content Security Policy (CSP) header
- [ ] Secrets stored securely (Azure Key Vault, not in repo)

---

## IS 455 — Machine Learning

### ML Pipelines (Build as many as possible)
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
2. **ML pipelines** — Not started

---

## Progress Summary

| Class | Completed | Remaining | % Done |
|-------|-----------|-----------|--------|
| IS 401 (PM) | Monday + Tech Diagram | User feedback, screenshots, OKR, accessibility | 60% |
| IS 413 (Dev) | Foundation + Pages | Full CRUD, pages | 70% |
| IS 414 (Security) | Auth, policies, GDPR | CSP header, secrets | 70% |
| IS 455 (ML) | — | 4 pipelines | 0% |
| **Overall** | — | — | **~50%** |

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
