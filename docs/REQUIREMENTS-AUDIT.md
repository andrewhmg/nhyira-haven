# INTEX II Requirements Audit

**Last Updated:** 2026-04-06 8:15 PM MDT  
**Project:** Nhyira Haven  
**Team:** 1-12  
**Due:** Friday 4/10 10:00 AM

---

## ✅ COMPLETED

### IS 413 - Application Development

**Backend (ASP.NET Core):**
- ✅ PostgreSQL database on Render (free tier)
- ✅ ASP.NET Identity authentication
- ✅ JWT-based API authentication
- ✅ Role-based access control (Admin, Staff, Donor)
- ✅ Custom password policies (12+ chars, complexity)
- ✅ 17 database tables across 3 domains
- ✅ RESTful API endpoints:
  - `/api/auth/*` - Login, Register
  - `/api/safehouses` - CRUD
  - `/api/residents` - CRUD
  - `/api/supporters` - CRUD
  - `/api/donations` - CRUD
  - `/api/dashboard/*` - Metrics
- ✅ CORS configured for Vercel frontend
- ✅ Auto-migrations on startup
- ✅ Sample data seeder

**Frontend (React + Vite):**
- ✅ Landing page with impact stats
- ✅ Login/Register pages
- ✅ Privacy Policy page
- ✅ Admin Dashboard
- ✅ Donor Management (list + detail)
- ✅ Resident Management (list + detail)
- ✅ Safehouse Management
- ✅ Process Recordings
- ✅ Home Visitations
- ✅ Reports & Analytics
- ✅ Theme.css with custom design
- ✅ Responsive layout
- ✅ Protected routes (AuthContext)

**Deployment:**
- ✅ Backend: https://nhyira-haven-1.onrender.com
- ✅ Frontend: https://frontend-chi-woad-55.vercel.app
- ✅ PostgreSQL: Render managed database
- ✅ GitHub: https://github.com/andrewhmg/nhyira-haven

### IS 414 - Security

- ✅ HTTPS/TLS (Render + Vercel auto)
- ✅ ASP.NET Identity authentication
- ✅ Custom password policies
- ✅ Role-based access (Admin, Staff, Donor)
- ✅ GDPR Privacy Policy page
- ✅ Test accounts:
  - ✅ Admin without MFA: `admin@nhyirahaven.org` / `NhyiraHaven2026!`
  - ✅ Staff without MFA: `staff@nhyirahaven.org` / `NhyiraHaven2026!`
  - ✅ Donor without MFA: `donor@example.com` / `NhyiraHaven2026!`
  - ✅ Account WITH MFA: `secure@nhyirahaven.org` / `NhyiraHaven2026!`
- ⚠️ Cookie consent banner (needs implementation)
- ⚠️ Content Security Policy headers (needs implementation)
- ⚠️ Confirmation dialogs for deletions (needs verification)

### IS 401 - Project Management

- ✅ Team roles assigned (Andrew = Scrum Master, Marielle = PO)
- ✅ Personas documented (Amara, David)
- ✅ Trello board: https://trello.com/b/Y99AnNYX/sprint-1-intex
- ✅ GitHub repo with commit history
- ✅ Tech stack diagram
- ⚠️ Sprint backlog/burndown (update Trello)
- ⚠️ Wireframes (document in submission)

---

## ⚠️ NEEDS ATTENTION

### Critical (Must Have for Friday)

1. **Database Seeding**
   - Status: Sample data only (6 residents, 6 supporters)
   - Need: Full CSV dataset (247 residents, 156 supporters, etc.)
   - Action: Deploy fix is in progress, verify after next deploy

2. **Cookie Consent Banner**
   - Status: Not implemented
   - Requirement: GDPR compliance
   - Action: Add cookie consent component to frontend

3. **Content Security Policy**
   - Status: Not configured
   - Requirement: CSP headers
   - Action: Add to Program.cs middleware

4. **Admin Login Route**
   - Status: 404 on `/login`
   - Action: Fix frontend routing

### Important (Should Have)

5. **Impact Dashboard Data**
   - Status: Shows placeholder (—) values
   - Need: Connect to `/api/impact-stats` endpoint
   - Action: Verify endpoint exists and frontend fetches it

6. **Deletion Confirmations**
   - Status: Unknown
   - Action: Test delete operations in admin panel

7. **Sprint Documentation**
   - Status: Trello not fully updated
   - Action: Update burndown, backlog before Friday

### Nice to Have (If Time Permits)

8. **Social Media Posts Module**
   - Status: Backend exists, frontend unknown
   - Action: Verify frontend implementation

9. **Reports & Analytics**
   - Status: Page exists, functionality unknown
   - Action: Test charts/metrics display

10. **ML Pipelines (IS 414)**
    - Status: Unknown
    - Action: Check `ml-pipelines/` folder

---

## 📋 FRIDAY SUBMISSION CHECKLIST

### Links to Verify
- [ ] Final Submission Form: https://byu.az1.qualtrics.com/jfe/form/SV_bsjPxSQyEdIQRhA
- [ ] Peer Eval: https://byu.az1.qualtrics.com/jfe/form/SV_7VXtQGm7rT4cvoa
- [ ] GitHub: https://github.com/andrewhmg/nhyira-haven
- [ ] Live Frontend: https://frontend-chi-woad-55.vercel.app
- [ ] Live API: https://nhyira-haven-1.onrender.com
- [ ] Trello: https://trello.com/b/Y99AnNYX/sprint-1-intex

### Demo Flow (10 AM Presentation)
1. Landing page → Show impact stats
2. Login as admin → Show dashboard
3. Navigate to Residents → Show case list
4. Open resident detail → Show full case history
5. Navigate to Donors → Show donor list
6. Open donor detail → Show donation history
7. Show Reports → Analytics/charts
8. Show Privacy Policy → GDPR compliance
9. Show Trello board → Sprint progress

---

## 🔥 IMMEDIATE NEXT STEPS

1. **Wait for Render deploy** (CSV seeding fix)
2. **Verify database has full data** (247 residents, 156 supporters)
3. **Fix frontend routing** (login page 404)
4. **Add cookie consent banner**
5. **Add CSP headers**
6. **Test all admin CRUD operations**
7. **Update Trello board**
8. **Complete submission form**

---

*Audit completed: 2026-04-06 20:20 MDT*
