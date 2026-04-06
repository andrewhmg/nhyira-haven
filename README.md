# Nhyira Haven

> "Where healing begins."

INTEX2 Project — Team 1-12 | IS 401, 413, 414, 455

## Overview

Nhyira Haven is a web platform for a nonprofit organization supporting survivors of sexual abuse and trafficking in West Africa. The system provides:

- **Case Management** — Track residents through their full journey (intake → counseling → reintegration)
- **Donor Engagement** — Show donors the real impact of their contributions
- **Analytics & ML** — Predict donor churn, identify at-risk residents, optimize social media strategy

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + Vite + TypeScript + Bootstrap 5 |
| **Backend** | .NET 10 Web API + ASP.NET Identity |
| **Database** | SQLite (dev) → Azure SQL (prod) |
| **ORM** | Entity Framework Core 10 |
| **Auth** | ASP.NET Identity (Admin, Staff, Donor roles) |
| **Deployment** | Azure App Service + Azure Static Web Apps |

## Project Structure

```
nhyira-haven/
├── backend/
│   ├── Controllers/       # API endpoints
│   ├── Data/              # DbContext, migrations
│   ├── Models/            # Entity classes (17+ tables)
│   ├── Services/          # DataSeeder
│   └── Program.cs         # App configuration
├── frontend/
│   ├── src/
│   │   ├── components/    # Layout, shared components
│   │   ├── pages/         # Home, Login, etc.
│   │   └── main.tsx       # Entry point
│   └── package.json
├── data/                  # CSV dataset (8,100+ records)
├── docs/
│   ├── INTEX2-CASE.md     # Project requirements
│   ├── DATABASE-SCHEMA.md # Database documentation
│   └── API-DOCUMENTATION.md
└── README.md
```

## Team

| Role | Name |
|------|------|
| **Product Owner** | Marielle Sutton |
| **Scrum Master** | Andrew Hogge |
| **Developer** | Jacob Woodward |
| **Developer** | Logan Johnson |

## Database Schema

**17+ tables across 3 domains:**

| Domain | Tables |
|--------|--------|
| **Donor & Support** | Safehouses, Partners, Supporters, Donations, InKindDonationItems, DonationAllocations, PartnerAssignments |
| **Case Management** | Residents, ProcessRecordings, HomeVisitations, EducationRecords, HealthWellbeingRecords, InterventionPlans, IncidentReports |
| **Outreach** | SocialMediaPosts, SafehouseMonthlyMetrics, PublicImpactSnapshots |

See [docs/DATABASE-SCHEMA.md](docs/DATABASE-SCHEMA.md) for full schema.

## API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/safehouses` | List all safehouses |
| `GET /api/residents` | List residents (filterable) |
| `GET /api/residents/{id}/timeline` | Full case timeline |
| `GET /api/donations` | List donations |
| `GET /api/donations/stats` | Donation statistics |
| `GET /api/supporters` | List donors |
| `GET /api/supporters/at-risk/list` | At-risk donors |
| `GET /api/dashboard/overview` | Dashboard summary |
| `GET /api/dashboard/metrics` | Analytics metrics |

See [docs/API-DOCUMENTATION.md](docs/API-DOCUMENTATION.md) for full documentation.

## Quick Start

```bash
# Clone the repo
git clone https://github.com/andrewhmg/nhyira-haven.git
cd nhyira-haven

# Backend setup
cd backend
dotnet restore
dotnet ef database update
dotnet run -- seed    # Seed 8,100+ records
dotnet run

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev

# API: https://localhost:5001
# Frontend: http://localhost:5173
```

## Key Personas

| Persona | Role | Goals |
|---------|------|-------|
| **Abena Mensah** | Case Worker (Accra, Ghana) | Fast data entry, proactive alerts, easy reporting |
| **James Osei** | Donor (US-based, Ghanaian origin) | See donation impact, access history, feel connected |

## ML Pipelines (Planned)

1. **Donor Churn Prediction** — Identify donors at risk of lapsing
2. **Reintegration Readiness** — Forecast which residents are ready for placement
3. **Social Media ROI** — Predict which content drives donations
4. **Intervention Effectiveness** — Explanatory model: what works best?

## Links

- **GitHub:** https://github.com/andrewhmg/nhyira-haven
- **FigJam:** https://www.figma.com/board/pn3s1lJiPPPTX4MKqBBEsl/Team-1-12-2026W-INTEX-Figma-template
- **Trello:** https://trello.com/b/Y99AnNYX/sprint-1-intex

## Deliverables

| Day | Focus | Points | Status |
|-----|-------|--------|--------|
| Monday | Requirements | 6.5 | ✅ Complete |
| Tuesday | Design | 4 | 🔄 In Progress |
| Wednesday | Working Page | 4.5 | ⏳ Pending |
| Thursday | Iterate | 5 | ⏳ Pending |
| Friday | Final Submission | — | Due 10:00 AM |

---

*Built for INTEX2 Winter 2026*