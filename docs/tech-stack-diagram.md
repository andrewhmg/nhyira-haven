# Nhyira Haven - Tech Stack Architecture

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     React + Vite + TypeScript                       │    │
│  │  • SPA with React Router                                            │    │
│  │  • Bootstrap 5 for styling                                          │    │
│  │  • Axios for API calls                                              │    │
│  │  • Hosted on Azure Static Web Apps                                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTPS/TLS
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     .NET 10 Web API                                 │    │
│  │  • RESTful endpoints                                                │    │
│  │  • ASP.NET Identity (authentication)                                │    │
│  │  • Role-based authorization (Admin, Staff, Donor)                   │    │
│  │  • Entity Framework Core ORM                                        │    │
│  │  • Hosted on Azure App Service                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ Entity Framework Core
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATABASE LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        Azure SQL Database                           │    │
│  │  • 17+ tables (residents, donors, cases, etc.)                      │    │
│  │  • Seeded with CSV data                                             │    │
│  │  • Connection string in Azure Key Vault                             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend (React + Vite + TypeScript)
| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | React 18 | UI components |
| Build Tool | Vite | Fast development + bundling |
| Language | TypeScript | Type safety |
| Styling | Bootstrap 5 | Responsive design |
| Routing | React Router | SPA navigation |
| HTTP Client | Axios | API communication |
| Forms | React Hook Form | Form validation |
| State | React Context | Global state |

### Backend (.NET 10 Web API)
| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | .NET 10 | Web API |
| Auth | ASP.NET Identity | User management |
| ORM | Entity Framework Core | Database access |
| Validation | FluentValidation | Input validation |
| Docs | Swagger/OpenAPI | API documentation |
| Security | HTTPS redirect, CSP, CORS | Security headers |

### Database (Azure SQL)
| Table Group | Tables | Purpose |
|-------------|--------|---------|
| Donor & Support | safehouses, partners, supporters, donations, etc. | Donor management |
| Case Management | residents, process_recordings, home_visitations, etc. | Case tracking |
| Outreach | social_media_posts, monthly_metrics, impact_snapshots | Communications |

## Data Flow

```
[User Browser]
      │
      │ HTTPS (Azure TLS)
      ▼
[Azure Static Web Apps] ──► [React SPA]
      │
      │ REST API calls
      ▼
[Azure App Service] ──► [.NET 10 API]
      │
      │ EF Core + SQL Connection
      ▼
[Azure SQL Database] ──► [Tables + Stored Data]
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                            │
│                                                                 │
│  1. HTTPS/TLS                                                   │
│     └─► Azure-managed TLS certificates                          │
│     └─► HTTP → HTTPS redirect                                   │
│                                                                 │
│  2. Authentication (ASP.NET Identity)                           │
│     └─► Admin accounts (staff access)                           │
│     └─► Donor accounts (limited access)                         │
│     └─► Optional: MFA for sensitive operations                  │
│                                                                 │
│  3. Authorization (Role-Based)                                  │
│     └─► Admin: Full system access                               │
│     └─► Staff: Case management                                  │
│     └─► Donor: Public + own donations                           │
│                                                                 │
│  4. Data Protection                                             │
│     └─► Connection strings in Azure Key Vault                   │
│     └─► GDPR-compliant privacy policy                           │
│     └─► Cookie consent banner                                   │
│     └─► Content Security Policy (CSP) headers                   │
└─────────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      AZURE CLOUD                                │
│                                                                 │
│  ┌─────────────────┐     ┌─────────────────┐                    │
│  │ Static Web Apps │     │  App Service    │                    │
│  │   (Frontend)    │────►│   (Backend)     │                    │
│  │   React/Vite    │     │   .NET 10 API   │                    │
│  └─────────────────┘     └────────┬────────┘                    │
│                                    │                            │
│                                    ▼                            │
│                          ┌─────────────────┐                    │
│                          │  Azure SQL DB   │                    │
│                          │   (Database)    │                    │
│                          └─────────────────┘                    │
│                                                                 │
│  ┌─────────────────┐     ┌─────────────────┐                    │
│  │   Key Vault     │     │  Application    │                    │
│  │   (Secrets)     │     │   Insights      │                    │
│  └─────────────────┘     │   (Logging)     │                    │
│                          └─────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

## IS Class Requirements Mapping

| Class | Requirement | Implementation |
|-------|-------------|---------------|
| **IS 401** | Project management | Scrum, Trello, burndown charts |
| **IS 413** | App development | .NET 10 + React, full CRUD |
| **IS 414** | Security | HTTPS, ASP.NET Identity, roles, CSP, GDPR |
| **IS 455** | ML pipelines | Jupyter notebooks for donor churn, etc. |

---

*Generated: April 6, 2026*
*Team: 1-12*