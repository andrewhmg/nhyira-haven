# Nhyira Haven - Requirements Checklist

**Current Date:** Monday, April 6, 2026  
**Time:** 4:15 PM MDT  
**Final Deadline:** Friday, April 10 at 10:00 AM

---

## ✅ COMPLETED (Today - Monday)

### Sprint 1 — Requirements (6.5 pts) ✅
- [x] Organization name: **Nhyira Haven** — "Where healing begins"
- [x] Problem statement defined
- [x] 2 Primary personas: Amara Okafor (Program Director), David Mensah (Donor Relations)
- [x] Journey maps for each persona
- [x] MoSCoW prioritized backlog (12 Must, 7 Should, 7 Could, 5 Won't)
- [x] Product backlog (16 user stories)
- [x] Sprint backlog (10 technical tasks)
- [x] Burndown chart (Corrello widget)
- [x] 3 Wireframes (Caseload Inventory, Landing Page, Admin Dashboard)

### Sprint 2 — Design (4 pts) 🔄 In Progress
- [x] Tech stack architecture diagram (created & documented)
- [ ] AI UI design screenshots (9 screenshots — Jacob + Logan)
- [ ] Design decision documentation (Marielle)

### Foundation Work ✅
- [x] .NET 10 backend initialized
- [x] React/Vite frontend initialized (Bootstrap 5)
- [x] Database schema (17+ tables, SQLite)
- [x] Data seeded (8,100+ records from CSV)
- [x] API controllers (Safehouses, Residents, Donations, Supporters, Dashboard)
- [x] Frontend connected to API
- [x] Dashboard showing live data

---

## 📋 REMAINING REQUIREMENTS BY CLASS

### IS 401 — Project Management & Design

| Day | Requirement | Status | Priority |
|-----|-------------|--------|----------|
| **Monday** | Roles, personas, journey maps, problem statement, MoSCoW, backlog, burndown, wireframes | ✅ Done | — |
| **Tuesday** | AI-generated UI options (9 screenshots) | ⏳ Pending | 🔴 HIGH |
| **Tuesday** | Design decision with rationale | ⏳ Pending | 🔴 HIGH |
| **Tuesday** | Tech stack diagram | ✅ Done | — |
| **Wednesday** | One working page deployed | 🟡 Partial | 🔴 HIGH |
| **Wednesday** | User feedback collected | ⬜ Not Started | 🟠 MEDIUM |
| **Wednesday** | Current state screenshots | ⬜ Not Started | 🟠 MEDIUM |
| **Thursday** | OKR metric defined | ⬜ Not Started | 🟡 LOW |
| **Thursday** | Accessibility (90%+ Lighthouse) | ⬜ Not Started | 🔴 HIGH |
| **Thursday** | Responsive design | ⬜ Not Started | 🔴 HIGH |
| **Thursday** | Retrospective | ⬜ Not Started | 🟡 LOW |

---

### IS 413 — Application Development

#### Public Pages (Must Have)
| Page | Status | Priority |
|------|--------|----------|
| Landing page (Home) | ✅ Basic version done | 🔴 HIGH |
| Impact dashboard | ⬜ Not Started | 🔴 HIGH |
| Login page | ✅ Placeholder exists | 🔴 HIGH |
| Privacy policy | ⬜ Not Started | 🔴 HIGH |

#### Staff Portal (Must Have)
| Page | Status | Priority |
|------|--------|----------|
| Admin dashboard | ✅ Basic version done | 🔴 HIGH |
| Donors & contributions | ⬜ Not Started | 🔴 HIGH |
| Caseload inventory | ⬜ Not Started | 🔴 HIGH |
| Process recording (CRUD) | ⬜ Not Started | 🔴 HIGH |
| Home visitations (CRUD) | ⬜ Not Started | 🟠 MEDIUM |
| Reports & analytics | ⬜ Not Started | 🟡 LOW |

#### Technical Requirements
| Requirement | Status | Priority |
|-------------|--------|----------|
| .NET 10/C# backend | ✅ Done | — |
| React/TypeScript frontend | ✅ Done | — |
| Database (Azure SQL/MySQL/PostgreSQL) | ✅ SQLite (dev) | 🟠 MEDIUM |
| **Deploy app publicly** | ⬜ Not Started | 🔴 CRITICAL |
| **Deploy database publicly** | ⬜ Not Started | 🔴 CRITICAL |

---

### IS 414 — Security

| Requirement | Status | Priority |
|-------------|--------|----------|
| HTTPS/TLS + HTTP→HTTPS redirect | ⬜ Not Started | 🔴 CRITICAL |
| ASP.NET Identity authentication | ⬜ Not Started | 🔴 CRITICAL |
| Custom password policies | ⬜ Not Started | 🔴 CRITICAL |
| Role-based access (Admin, Staff, Donor) | ⬜ Not Started | 🔴 HIGH |
| Confirmation for deletions | ⬜ Not Started | 🟠 MEDIUM |
| Secrets stored securely (not in repo) | ⬜ Not Started | 🔴 HIGH |
| GDPR privacy policy page | ⬜ Not Started | 🔴 HIGH |
| Cookie consent banner | ⬜ Not Started | 🔴 HIGH |
| Content Security Policy (CSP) header | ⬜ Not Started | 🟠 MEDIUM |
| **Test accounts:** Admin (no MFA), Donor (no MFA + history), Account (WITH MFA) | ⬜ Not Started | 🔴 CRITICAL |

---

### IS 455 — Machine Learning

| Pipeline | Status | Priority |
|----------|--------|----------|
| Donor churn prediction | ⬜ Not Started | 🟠 MEDIUM |
| Reintegration readiness | ⬜ Not Started | 🟡 LOW |
| Social media ROI | ⬜ Not Started | 🟡 LOW |
| Intervention effectiveness | ⬜ Not Started | 🟡 LOW |

**Note:** Build as many complete pipelines as possible. Each needs:
- Problem framing
- Data prep
- Exploration
- Modeling
- Evaluation
- Deployment

---

## 🎯 IMMEDIATE NEXT STEPS (Prioritized)

### 🔴 CRITICAL (Do Today/Tomorrow)

1. **Complete Tuesday Design Deliverables**
   - [ ] Generate 9 AI UI screenshots (3 screens × 3 variations)
   - [ ] Document design decision rationale
   - [ ] Add to FigJam board

2. **Deploy Working Page (Wednesday Deliverable)**
   - [ ] Set up Azure App Service (backend)
   - [ ] Set up Azure Static Web Apps (frontend)
   - [ ] Deploy and get live URL
   - [ ] Take screenshots of deployed site

3. **Implement Authentication (IS 414)**
   - [ ] Set up ASP.NET Identity
   - [ ] Create custom password policies
   - [ ] Create test accounts (Admin, Donor, Account with MFA)
   - [ ] Implement login page with validation

4. **Security Requirements**
   - [ ] Enable HTTPS/TLS
   - [ ] Add GDPR privacy policy page
   - [ ] Add cookie consent banner
   - [ ] Store secrets in Azure Key Vault (not in repo)

---

### 🟠 HIGH PRIORITY (Wednesday/Thursday)

5. **Build Core Pages**
   - [ ] Residents list page (caseload inventory)
   - [ ] Resident detail page (full timeline)
   - [ ] Donations list + stats page
   - [ ] Process recording CRUD form
   - [ ] Impact dashboard (public)

6. **Accessibility & Responsiveness**
   - [ ] Run Lighthouse audit (target 90%+)
   - [ ] Fix accessibility issues
   - [ ] Test on mobile devices
   - [ ] Ensure responsive layout

7. **User Feedback**
   - [ ] Share deployed link with 2-3 users
   - [ ] Collect feedback on usability
   - [ ] Document feedback and changes made

---

### 🟡 MEDIUM PRIORITY (Thursday)

8. **ML Pipelines (IS 455)**
   - [ ] Build 1-2 complete ML pipelines (Jupyter notebooks)
   - [ ] Donor churn prediction (highest impact)
   - [ ] Add to ml-pipelines/ folder

9. **OKR Metric**
   - [ ] Define one measurable OKR
   - [ ] Document baseline and target

10. **Retrospective**
    - [ ] Write team retrospective
    - [ ] Document lessons learned

---

## 📊 PROGRESS SUMMARY

| Category | Completed | Remaining | % Done |
|----------|-----------|-----------|--------|
| **IS 401 (PM)** | 100% Monday | 60% Tue-Thu | ~50% |
| **IS 413 (Dev)** | Foundation | Pages + Deploy | ~40% |
| **IS 414 (Security)** | Schema | Auth + Policies | ~10% |
| **IS 455 (ML)** | — | 4 pipelines | 0% |
| **Overall** | — | — | **~30%** |

---

## ⏰ TIMELINE

| Day | Focus | Key Deliverables |
|-----|-------|------------------|
| **Mon 4/6** | Requirements | ✅ Complete |
| **Tue 4/7** | Design | AI screenshots, design decision, tech diagram |
| **Wed 4/8** | Working Page | Deployed site, user feedback, screenshots |
| **Thu 4/9** | Iterate | OKR, accessibility, responsive, retrospective |
| **Fri 4/10** | Submit | Final submission by 10:00 AM, presentation |

---

## 🔗 Links

- **Trello:** https://trello.com/b/Y99AnNYX/sprint-1-intex
- **FigJam:** https://www.figma.com/board/pn3s1lJiPPPTX4MKqBBEsl/Team-1-12-2026W-INTEX-Figma-template
- **GitHub:** https://github.com/andrewhogge/nhyira-haven
- **Final Submission:** https://byu.az1.qualtrics.com/jfe/form/SV_bsjPxSQyEdIQRhA

---

*Last updated: April 6, 2026 4:15 PM MDT*
