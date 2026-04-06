# Tech Stack Diagram (Mermaid)

Copy this into FigJam or any Mermaid-compatible tool.

```mermaid
graph TB
    subgraph Client["CLIENT LAYER"]
        React["React + Vite + TypeScript"]
        Tailwind["Tailwind CSS"]
        Router["React Router"]
    end
    
    subgraph API["API LAYER"]
        NET[".NET 10 Web API"]
        Identity["ASP.NET Identity"]
        EF["Entity Framework Core"]
    end
    
    subgraph Database["DATABASE LAYER"]
        AzureSQL["Azure SQL Database"]
        Tables["17+ Tables"]
    end
    
    subgraph Security["SECURITY"]
        HTTPS["HTTPS/TLS"]
        Roles["Role-Based Access"]
        GDPR["GDPR Compliance"]
    end
    
    React --> |"REST API"| NET
    NET --> |"EF Core"| AzureSQL
    Identity --> Roles
    HTTPS --> React
    GDPR --> React
```

## Simpler Version (for FigJam text)

```
┌─────────────────────────────────────────────────────────────┐
│                    NHYIRA HAVEN STACK                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   FRONTEND (Azure Static Web Apps)                         │
│   ┌─────────────────────────────────────────────────────┐  │
│   │  React  •  Vite  •  TypeScript  •  Tailwind CSS    │  │
│   └─────────────────────────────────────────────────────┘  │
│                          │                                  │
│                          │ HTTPS/TLS                        │
│                          ▼                                  │
│   BACKEND (Azure App Service)                              │
│   ┌─────────────────────────────────────────────────────┐  │
│   │  .NET 10 Web API  •  ASP.NET Identity              │  │
│   │  Entity Framework Core  •  Swagger                 │  │
│   └─────────────────────────────────────────────────────┘  │
│                          │                                  │
│                          │ SQL Connection                   │
│                          ▼                                  │
│   DATABASE (Azure SQL)                                     │
│   ┌─────────────────────────────────────────────────────┐  │
│   │  17+ Tables: residents, donors, cases, etc.        │  │
│   │  Seeded with CSV data                               │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│   SECURITY                                                  │
│   • HTTPS/TLS (Azure-managed)                              │
│   • ASP.NET Identity (Admin, Staff, Donor roles)          │
│   • Azure Key Vault (secrets)                              │
│   • GDPR privacy policy + cookie consent                  │
│   • Content Security Policy headers                        │
└─────────────────────────────────────────────────────────────┘
```

## Class Requirements

| IS 401 | IS 413 | IS 414 | IS 455 |
|--------|--------|--------|--------|
| Scrum | .NET 10 + React | HTTPS/TLS | ML pipelines |
| Trello | CRUD operations | ASP.NET Identity | Donor churn |
| Burndown | Deployed to cloud | Role-based auth | Predictions |