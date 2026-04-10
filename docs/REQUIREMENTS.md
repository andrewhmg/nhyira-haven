# Nhyira Haven - Project Requirements

## Project Overview

**Organization:** Nhyira Haven (proposed name for new nonprofit)

**Mission:** Create a safe haven organization similar to Lighthouse Sanctuary to assist survivors of sexual abuse and sex trafficking in regions lacking similar services.

**Context:** The organization depends entirely on donations, operates safehouses for girls who are survivors, and needs technology resources to effectively run operations while protecting the privacy and safety of victims, employees, donors, and partners.

---

## Course Requirements

### IS 401 – Project Management and Systems Design

**Format:** Four one-day sprints (Monday-Thursday), final deliverable and presentation due Friday. Each day's deliverables due by 11:59pm.

#### Monday — Requirements (6.5 pts)
- [ ] **Roles:** Identify a Scrum Master and Product Owner for the team
- [ ] **Customer Personas:** Create two realistic personas representing the two most important target users; justify why these are most important
- [ ] **Journey Map:** Show key steps users take today and identify pain points
- [ ] **Problem Statement:** Clearly describe the specific problem the product will solve
- [ ] **MoSCoW Table:** List every requirement in MoSCoW format with at least five "nice-to-have" ideas; identify one feature NOT built and why
- [ ] **Product Backlog:** Include clear product goal and at least 12 backlog cards
- [ ] **Sprint "Monday" Backlog:** Define sprint goal with at least 8 cards, each with point estimate and exactly one person assigned
- [ ] **Burndown Chart:** Set up chart to track progress throughout the week
- [ ] **Figma Wireframe:** Brainstorm and draw wireframes for 3 most important screens in Desktop view

#### Tuesday — Design (4 pts)
- [ ] **Sprint "Tuesday" Backlog:** Define sprint goal with at least 8 cards, each with point estimate and exactly one person assigned
- [ ] **AI-Generated UI Options:** Provide 3 screenshots of each of 3 different UI designs (9 screenshots total); include 5 questions asked to AI about each design with takeaways summarized
- [ ] **Design Decision:** Indicate which UI was chosen with justification paragraph; list three changes made to original AI output
- [ ] **Tech Stack Diagram:** Draw diagram showing logos for chosen frontend, backend, and database technologies

#### Wednesday — One Working Page (4.5 pts)
- [ ] **Sprint "Wednesday" Backlog:** Define sprint goal with at least 8 cards, each with point estimate and exactly one person assigned
- [ ] **Current State Screenshots:** Show screenshots of at least 5 pages in both desktop and mobile views
- [ ] **One Working Page:** Demonstrate one page deployed to cloud that persists data in database
- [ ] **User Feedback:** Show website to a real person with insight on target persona; document 5 specific changes planned based on feedback
- [ ] **Burndown Chart:** Share up-to-date burndown chart reflecting progress

#### Thursday — Iterate (5 pts)
- [ ] **Sprint "Thursday" Backlog:** Define sprint goal with at least 8 cards, each with point estimate and exactly one person assigned
- [ ] **OKR Metric:** Track and display one meaningful metric in app with explanation of why it's the most important success measure
- [ ] **Accessibility:** Achieve Lighthouse accessibility score of at least 90% on every page
- [ ] **Responsiveness:** Ensure every page resizes appropriately for desktop and mobile views
- [ ] **Retrospective:** Each person writes 2 things going well, 2 things that could be better, and personal greatest contribution; team reflects on how well solution solves customer problem

---

### IS 413 – Enterprise Application Development

#### Tech Stack Requirements
- [ ] **Backend:** .NET 10 / C#
- [ ] **Frontend:** React / TypeScript (Vite)
- [ ] **Database:** Azure SQL Database, MySQL, or PostgreSQL (relational database deployed separately from app)
- [ ] **Deployment:** Microsoft Azure recommended (or other cloud provider)

#### Public Pages (Non-Authenticated Users)
- [ ] **Home / Landing Page:** Modern, professional landing page introducing organization, mission, and clear calls to action
- [ ] **Impact / Donor-Facing Dashboard:** Displays aggregated, anonymized data showing organization's impact (outcomes, progress, resource use) in clear, visually understandable format
- [ ] **Login Page:** Allows users to authenticate with username/password, with proper validation and error handling
- [ ] **Privacy Policy + Cookie Consent:** GDPR-compliant privacy policy explaining data usage with cookie consent notification

#### Donor Features (Authenticated)
- [ ] **Donor Dashboard:** Allows authenticated donor to:
  - View donation history
  - Submit fake donations (not tied to real payment service)

#### Admin / Staff Portal (Authenticated Users Only)
- [ ] **Admin Dashboard:** High-level overview of key metrics:
  - Active residents across safehouses
  - Recent donations
  - Upcoming case conferences
  - Summarized progress data
- [ ] **Donors & Contributions Page:** Staff can:
  - View, create, and manage supporter profiles
  - Classify supporters by type (monetary donor, volunteer, skills contributor, etc.) and status (active/inactive)
  - Track all contribution types (monetary, in-kind, time, skills, social media)
  - Record and review donation activity
  - View donation allocations across safehouses and program areas
- [ ] **Caseload Inventory Page:** Core case management:
  - View, create, and update resident profiles
  - Track demographics, case category and sub-categories (trafficked, physical abuse victim, neglected)
  - Disability information
  - Family socio-demographic profile (4Ps beneficiary, solo parent, indigenous group, informal settler)
  - Admission details, referral information, assigned social workers
  - Reintegration tracking
  - Support filtering and searching by case status, safehouse, case category, and other key fields
- [ ] **Process Recording Page:** Counseling session documentation:
  - Enter and view dated counseling session notes for each resident
  - Capture: session date, social worker, session type (individual/group), emotional state, narrative summary, interventions applied, follow-up actions
  - View full history of process recordings chronologically
- [ ] **Home Visitation & Case Conferences Page:**
  - Log home and field visits (initial assessment, routine follow-up, reintegration assessment, post-placement monitoring, emergency)
  - Record: home environment observations, family cooperation level, safety concerns, follow-up actions
  - View case conference history and upcoming conferences for each resident
- [ ] **Reports & Analytics Page:**
  - Donation trends over time
  - Resident outcome metrics (education progress, health improvements)
  - Safehouse performance comparisons
  - Reintegration success rates
  - Align with Annual Accomplishment Report format (caring, healing, teaching services; beneficiary counts; program outcomes)

#### Additional Requirements
- [ ] **Additional Pages:** Any pages required to support functionality described in security, social media, accessibility, or partner features
- [ ] **Data Validation:** Validate data and handle errors for robust, reliable website
- [ ] **Code Quality:** Good code practices, titles, icons, logos, consistent look and feel, pagination, speed, finishing touches

#### IS 413 Grading Objectives (20 points total)
| Objective | Points |
|-----------|--------|
| App compiles and runs without errors | 1 |
| Modern, professional UI with consistent branding/navigation | 1 |
| Home/Landing page with clear calls to action | 1 |
| Login page with validation and error handling | 1 |
| Privacy policy page with cookie consent | 1 |
| Public impact/donor-facing dashboard (anonymized, aggregated) | 1 |
| Donor dashboard (view history, submit fake donation) | 2 |
| Admin dashboard (high-level operational summary) | 1 |
| Donors & Contributions page (manage supporters/contributions) | 2 |
| Caseload Inventory page (CRUD, search, filter residents) | 2 |
| Process Recording page (enter/view session notes chronologically) | 1 |
| Home Visitation & Case Conferences page | 1 |
| Reports & Analytics page (charts/summaries) | 1 |
| At least one additional required page/feature | 1 |
| Database deployed separately from app | 2 |
| Data validation, error handling, code quality throughout | 1 |
| BONUS: Advanced/impressive React/.NET features | Up to 1 |

---

### IS 414 – Security

#### Confidentiality (Encryption)
- [ ] Use HTTPS for all public connections (valid TLS certificate required)
- [ ] Redirect HTTP traffic to HTTPS

#### Authentication
- [ ] Username/password authentication (ASP.NET Identity recommended)
- [ ] Identity database can be SQLite or database server
- [ ] Visitors (unauthenticated) can browse home page and other public pages
- [ ] Authenticated users can access IS 413 pages
- [ ] **Strong Password Policy:** Configure ASP.NET Identity to require better passwords than default PasswordOptions (DO NOT follow Microsoft's suggested values; follow class instruction)
- [ ] **API Authentication:** All APIs must have appropriate authentication/authorization
  - `/login` and `/auth/me` endpoints cannot require authentication
  - Most CRUD operations (especially CUD and some R) must only be accessible to authenticated and appropriately authorized users
  - When in doubt, make maximally restrictive unless it breaks functionality

#### Role-Based Access Control (RBAC)
- [ ] **Admin Role:** Only authenticated users with admin role can add, modify, or delete data
- [ ] **Donor Role:** Only authenticated donor users can see their donor history and donation impact
- [ ] **Non-Authenticated:** Can see homepage, privacy policy, etc.
- [ ] **Staff Role:** Optional (may or may not differ from admin)

#### Integrity
- [ ] Data can only be changed/deleted by authorized, authenticated users
- [ ] **Confirmation Required:** Must have confirmation dialog before deleting data

#### Credentials
- [ ] Handle credentials safely (usernames, passwords, API keys, etc.)
- [ ] Options (choose one):
  - Use secrets manager
  - Place secrets in separate file (.env) NOT uploaded to GitHub
  - Set environmental variables in operating system
- [ ] **NO credentials in code or public repositories**

#### Privacy
- [ ] **GDPR-Compliant Privacy Policy:** Create and populate content linked from footer (minimum on homepage); tailor to site
- [ ] **GDPR Cookie Consent Notification:** Enable fully functional cookie consent (specify in video if cosmetic or functional)

#### Attack Mitigations
- [ ] **Content Security Policy (CSP) HTTP Header:**
  - Enable CSP header (NOT embedded in HTML tag)
  - Specify only needed sources (default-src, style-src, img-src, script-src, etc.)
  - Graders will evaluate CSP presence in developer tools inspector

#### Availability
- [ ] Site must be publicly accessible (deployed to cloud provider)

#### Additional Security Features (2 points)
Choose one or more additional features:
- [ ] Enable at least one third-party authentication provider
- [ ] Enable two-factor or multi-factor authentication (must have at least one admin and one non-admin user WITHOUT 2FA/MFA for grading access)
- [ ] Enable HTTP Strict Transport Security (HSTS)
- [ ] Enable browser-accessible cookie (NOT httponly) that saves user setting used by React (light/dark mode, color theme, language, etc.)
- [ ] Enable data sanitization (incoming data) or data encoding (frontend rendering) to prevent injection attacks
- [ ] Deploy both operational and identity databases to "real" DBMS (NOT SQLite)
- [ ] Deploy using Docker containers instead of VM
- [ ] Other creative security/privacy features

#### IS 414 Security Rubric (20 points total)
| Objective | Points |
|-----------|--------|
| Confidentiality - Use HTTPS/TLS | 1 |
| Confidentiality - Redirect HTTP to HTTPS | 0.5 |
| Auth - Username/password authentication | 3 |
| Auth - Require better passwords | 1 |
| Auth - Pages/APIs require auth where needed | 1 |
| Auth - RBAC - Only admin can CUD (including endpoints) | 1.5 |
| Integrity - Confirmation to delete data | 1 |
| Credentials - Stored securely, not in public repo | 1 |
| Privacy - Privacy policy created and added to site | 1 |
| Privacy - GDPR cookie consent fully functional | 1 |
| Attack Mitigations - CSP header set properly | 2 |
| Availability - Deployed publicly | 4 |
| Additional security features | 2 |

**Important:** Security features MUST be clearly shown in submitted video to receive points. Undocumented features don't "exist" for grading.

---

### IS 455 – Machine Learning

#### Overview
Build complete ML pipelines integrated into or supported by the web application. Each pipeline must follow the full end-to-end ML pipeline and address a meaningful business question.

#### Required Pipeline Stages (for each pipeline)

1. **Problem Framing (Ch. 1)**
   - [ ] Define the business question
   - [ ] Select success metrics
   - [ ] Determine whether predictive or explanatory approach is appropriate
   - [ ] Generate BOTH a causal and predictive model
   - [ ] Indicate which features are most impactful
   - [ ] Recommend decisions based on results

2. **Data Acquisition and Preparation (Ch. 2–5, 7)**
   - [ ] Identify and collect data from provided tables
   - [ ] Clean, transform, and engineer features from raw data
   - [ ] Build reproducible data preparation pipelines (not one-off scripts)
   - [ ] Expect 60–80% of pipeline effort here

3. **Exploration (Ch. 6, 8)**
   - [ ] Examine distributions, relationships, and anomalies
   - [ ] Build intuition about the data before modeling
   - [ ] Discover relationships in the dataset

4. **Modeling (Ch. 9–14)**
   - [ ] Select and train algorithms
   - [ ] Approaches: multiple linear regression (Ch. 9–11), decision trees (Ch. 12), classification (Ch. 13), ensemble methods (Ch. 14)
   - [ ] For explanatory work: prioritize interpretability over accuracy
   - [ ] For predictive work: complex features and less interpretable models acceptable when they improve accuracy

5. **Evaluation and Selection (Ch. 15)**
   - [ ] Assess model performance using appropriate metrics
   - [ ] Use proper validation strategies and fairness checks
   - [ ] Use train/test splits or cross-validation
   - [ ] Tune hyperparameters
   - [ ] Compare multiple models where appropriate
   - [ ] **Interpret results in business terms** (not just R² or accuracy)

6. **Feature Selection (Ch. 16)**
   - [ ] Thoughtfully select which features to include
   - [ ] Demonstrate understanding of why features matter
   - [ ] Use feature importance, selection techniques, or domain reasoning

7. **Deployment (Ch. 17)**
   - [ ] Move validated model into production web application
   - [ ] Options: API endpoint serving predictions, dashboard display, interactive interface

#### Pipeline Requirements
- [ ] Deliver as many complete pipelines as possible (quality over quantity, but more = better score)
- [ ] Each pipeline addresses a **different** business problem
- [ ] Demonstrate variety of modeling approaches
- [ ] Include at least one predictive model and one explanatory model (ideally)
- [ ] Each pipeline delivered as .ipynb file integrated with web app

#### Potential Business Questions (from dataset domains)

**Donor Domain:**
- Which donors might give more if asked?
- Which donors are at risk of lapsing?
- Which fundraising campaigns actually move the needle vs. generating noise?
- How to personalize outreach without dedicated marketing team?
- Connect donation activity to outcomes for donor communication

**Case Management Domain:**
- Which girls are progressing vs. struggling?
- Which interventions are actually working?
- When is a resident ready for reintegration?
- When is a resident at risk of regression?
- Predict successful reintegration outcomes

**Social Media/Outreach Domain:**
- What content should be posted?
- Which platforms to use?
- How often to post?
- What time of day?
- What content leads to donations vs. just likes?

#### AI Usage Guidelines
1. **AI as Problem Setter:** Brainstorm potential problems (predictive and explanatory)
2. **AI as Creative Expander:** Suggest features, transformations, relationships
3. **AI as Critical Evaluator:** Stress-test approach, check for prediction/explanation confusion
4. **AI as Verification Agent:** Verify code correctness, evaluation methodology, results
5. **AI as Production Agent:** Deploy models, create APIs, build dashboards

**Key Principle:** You drive the thinking; AI accelerates work. Must understand and explain every pipeline choice.

#### IS 455 Evaluation
- Pipelines evaluated on application of principles from Chapters 1–17
- Pipeline thinking over algorithm-only thinking
- Clear prediction vs. explanation distinction
- Relative evaluation among teams (more meaningful opportunities executed well = higher score)
- Worth 1/5 of overall INTEX grade

---

## Dataset

**Source:** https://drive.google.com/file/d/1Dl8AcS1ydbHKL6PU0gP6tbUPqhPsUeXZ/view?usp=sharing

**Structure:** 17 tables as 17 CSV files with data dictionary (Appendix A)

### Three Main Domains

#### 1. Donor and Support Domain
- Safehouses
- Partners
- Supporters
- Donations (monetary, in-kind, time, skills, social media advocacy)
- Donation allocations

#### 2. Case Management Domain
- Residents (girls served)
- Case information
- Process recordings (counseling sessions)
- Home visitations
- Education records
- Health and wellbeing records
- Intervention plans
- Incident reports

#### 3. Outreach and Communication Domain
- Social media activity
- Engagement metrics
- Public impact snapshots

**Note:** You may modify the data as needed, add tables/fields, or not use all existing data.

---

## Primary Goals (from Client)

### 1. Donor Retention and Growth
- Understand which donors might give more if asked
- Identify donors at risk of lapsing
- Determine which fundraising campaigns actually move the needle
- Personalize outreach without dedicated marketing team
- Connect donation activity to outcomes for donor communication

### 2. Case Management Excellence
- Track which girls are progressing vs. struggling
- Identify which interventions are working
- Determine when residents are ready for reintegration or at risk of regression
- Manage cases across full lifecycle (intake → assessment → counseling → education → health → reintegration/placement)
- Document structured counseling sessions (process recordings)
- Track home visitations and case conferences

### 3. Social Media Strategy
- Determine what to post, on which platforms, how often, what time
- Understand what content leads to donations vs. just likes
- Be strategic without marketing team
- Use technology to make smarter social media decisions

### 4. System Maintainability
- Easy to create, update, and (carefully) remove data
- Administerable with limited staff

### 5. Security and Privacy
- Protect privacy and safety of victims, employees, donors, and partners
- Secure systems for extremely sensitive data involving minors who are abuse survivors

---

## Deliverables Summary

| Course | Deliverable | Due |
|--------|-------------|-----|
| IS 401 | Figjam board (Monday section) | Monday 11:59pm |
| IS 401 | Figjam board (Tuesday section) | Tuesday 11:59pm |
| IS 401 | Figjam board (Wednesday section) | Wednesday 11:59pm |
| IS 401 | Figjam board (Thursday section) | Thursday 11:59pm |
| IS 401 | Final deliverable and presentation | Friday |
| IS 413 | Web application with all required pages | Project due date |
| IS 414 | Security features documented in video | Project due date |
| IS 455 | ML pipelines (.ipynb files) integrated with app | Project due date |

---

## Key Dates

- **Sprint Monday:** Requirements - Due Monday 11:59pm
- **Sprint Tuesday:** Design - Due Tuesday 11:59pm
- **Sprint Wednesday:** One Working Page - Due Wednesday 11:59pm
- **Sprint Thursday:** Iterate - Due Thursday 11:59pm
- **Final Delivery:** Friday (all courses)

---

## Notes

- All security features MUST be documented in submitted video
- Database must be deployed separately from application
- Both app and database must be deployed
- Accessibility score of 90%+ required on every page (Lighthouse)
- Responsive design required for desktop and mobile
- Strong password policy required (follow class instruction, not Microsoft defaults)
- GDPR compliance required for privacy policy and cookie consent
