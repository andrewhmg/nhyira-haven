# INTEX2 Case Document

## Organization Context

**Client:** Haven West Africa (working name — new nonprofit inspired by Lighthouse Sanctuary)

**Region:** West Africa (Nigeria-based, serving survivors of trafficking and abuse across the region)

**Mission:** Provide safehouses and rehabilitation services for girls who are survivors of sexual abuse or sex trafficking.

---

## Primary Goals

1. **Donor Retention & Growth** — The organization depends entirely on donations. They lose donors and don't understand why. Need to identify at-risk donors, personalize outreach, and show donors how their contributions help residents.

2. **Case Management** — With limited staff across multiple safehouses, they need to track each girl's full journey (intake → counseling → education → health → reintegration). Prevent anyone from falling through the cracks.

3. **Social Media Strategy** — Primary outreach channel, but they don't know what to post, where, or when. Need data-driven decisions about content that drives donations.

4. **Security & Simplicity** — Easy for non-technical staff to use, rigorous privacy protection for vulnerable minors.

---

## Dataset

**Location:** https://drive.google.com/file/d/1Dl8AcS1ydbHKL6PU0gP6tbUPqhPsUeXZ/view

**17 Tables in 3 Domains:**

### Donor & Support Domain
- `safehouses` — Physical locations where girls are housed
- `partners` — Organizations/individuals delivering services
- `partner_assignments` — Which partners serve which safehouses
- `supporters` — Donors, volunteers, advocates
- `donations` — Individual donation events (monetary, in-kind, time, skills)
- `in_kind_donation_items` — Line items for in-kind donations
- `donation_allocations` — How donations are distributed

### Case Management Domain
- `residents` — Case records for girls served
- `process_recordings` — Counseling session notes
- `home_visitations` — Home/field visit records
- `education_records` — Monthly education progress
- `health_wellbeing_records` — Monthly health assessments
- `intervention_plans` — Intervention goals and services
- `incident_reports` — Safety and behavioral incidents

### Outreach & Communication Domain
- `social_media_posts` — Social media activity and engagement
- `safehouse_monthly_metrics` — Aggregated monthly outcomes per safehouse
- `public_impact_snapshots` — Anonymized impact reports for donors

---

## Key Personas

### Persona 1: Amara Okafor — Program Director
- Age: 34
- Role: Oversees 3 safehouses, 12 social workers
- Background: Former NAPTIP (Nigeria anti-trafficking agency) officer
- Tech: Moderate — WhatsApp, Google Sheets daily
- Pain: Fragmented data across paper, WhatsApp, spreadsheets; 10+ hours/quarter manual reporting
- Goal: See all residents in one place, know who's progressing vs. struggling, no one falls through cracks

### Persona 2: David Mensah — Donor Relations Coordinator
- Age: 28
- Role: One-person marketing/fundraising team
- Tech: High — social media, Canva, Mailchimp
- Pain: No visibility into donor patterns; can't connect donations to outcomes; social media is guesswork
- Goal: Flag at-risk donors, know which content drives giving, show donors specific impact

---

## Deliverables Summary

### IS 401 — Project Management & Design
- **Monday:** Roles, personas, journey maps, problem statement, MoSCoW table, product backlog, sprint backlog, burndown chart, wireframes
- **Tuesday:** AI-generated UI options (9 screenshots), design decision, tech stack diagram
- **Wednesday:** One working page deployed, user feedback, current state screenshots
- **Thursday:** OKR metric, accessibility (90%+ Lighthouse), responsiveness, retrospective

### IS 413 — Application Development
- **Public pages:** Landing page, impact dashboard, login, privacy policy
- **Staff portal:** Admin dashboard, donors & contributions, caseload inventory, process recording, home visitations, reports & analytics
- **Tech:** .NET 10/C# backend, React/TypeScript frontend, Azure SQL/MySQL/PostgreSQL
- **Deploy:** Both app and database must be deployed publicly

### IS 414 — Security
- HTTPS/TLS + HTTP→HTTPS redirect
- ASP.NET Identity authentication
- Custom password policies (follow class/lab instructions — NOT AI suggestions)
- Role-based access (admin, staff, donor)
- Confirmation for deletions
- Secrets stored securely (not in repo)
- GDPR privacy policy + functional cookie consent
- Content Security Policy (CSP) header
- **Test accounts:** Admin without MFA, Donor without MFA (with history), Account WITH MFA

### IS 455 — Machine Learning
- Build as many complete ML pipelines as possible
- Each pipeline: problem framing → data prep → exploration → modeling → evaluation → deployment
- Deliverables: Jupyter notebooks in `ml-pipelines/` folder
- **Potential pipelines:**
  - Donor churn prediction (flag at-risk donors)
  - Reintegration readiness (forecast who's ready for placement)
  - Social media ROI (predict what content drives donations)
  - Intervention effectiveness (what works best?)

---

## Trello Board

**URL:** https://trello.com/b/Y99AnNYX/sprint-1-intex

**Sprint 1 Goal:** Establish the project foundation — set up the tech stack, database schema, authentication, and build the landing page and core navigation structure.

---

## Submission Links

- **Final Submission:** https://byu.az1.qualtrics.com/jfe/form/SV_bsjPxSQyEdIQRhA
- **Peer Eval:** https://byu.az1.qualtrics.com/jfe/form/SV_7VXtQGm7rT4cvoa
- **Slack:** https://join.slack.com/t/intexw26/shared_invite/zt-3udumsa9x-P87AgyhpD_DDG64adcimmg
- **GitHub Repo:** https://github.com/andrewhmg/nhyira-haven

---

## Due Dates

| Deliverable | Due |
|-------------|-----|
| Monday Requirements | Mon 4/6 11:59 PM |
| Tuesday Design | Tue 4/7 11:59 PM |
| Wednesday Working Page | Wed 4/8 11:59 PM |
| Thursday Iteration | Thu 4/9 11:59 PM |
| **Final Submission** | **Fri 4/10 10:00 AM** |
| Peer Evaluation | Fri 4/10 11:59 PM |
| Presentation | Fri 4/10 12:00 PM+ |

---

*Last updated: 2026-04-06*