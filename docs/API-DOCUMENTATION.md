# Nhyira Haven API Documentation

Base URL: `http://localhost:5000/api` (development) or `https://nhyira-haven.azurewebsites.net/api` (production)

---

## 📋 Endpoints Overview

| Controller | Endpoints | Purpose |
|------------|-----------|---------|
| Safehouses | `/api/safehouses` | Manage safehouse locations |
| Residents | `/api/residents` | Manage resident case records |
| Donations | `/api/donations` | Manage donation records |
| Supporters | `/api/supporters` | Manage donor/supporter profiles |
| Dashboard | `/api/dashboard` | Analytics and overview metrics |
| Health | `/api/health` | API health check |

---

## 🏠 Safehouses

### GET /api/safehouses
Returns all safehouses with related data.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Lighthouse Safehouse 1",
    "location": "Quezon City, Metro Manila, Philippines",
    "capacity": 8,
    "currentResidents": 8,
    "establishedDate": "2022-01-01",
    "isActive": true,
    "residents": [...],
    "partnerAssignments": [...]
  }
]
```

### GET /api/safehouses/{id}
Returns a single safehouse with full details.

### GET /api/safehouses/{id}/residents
Returns all residents at a specific safehouse.

### GET /api/safehouses/{id}/metrics
Returns monthly metrics for a safehouse.

### POST /api/safehouses
Creates a new safehouse.

**Body:**
```json
{
  "name": "New Safehouse",
  "location": "Lagos, Nigeria",
  "capacity": 10,
  "currentResidents": 0,
  "establishedDate": "2026-01-01",
  "isActive": true
}
```

### PUT /api/safehouses/{id}
Updates an existing safehouse.

### DELETE /api/safehouses/{id}
Deletes a safehouse.

---

## 👤 Residents

### GET /api/residents
Returns all residents with optional filtering.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `safehouseId` | int | Filter by safehouse |
| `status` | string | Filter by status (Active, Closed, Transferred) |
| `category` | string | Filter by case category |

**Example:**
```
GET /api/residents?safehouseId=1&status=Active
```

**Response:**
```json
[
  {
    "id": 1,
    "caseNumber": "C0043",
    "firstName": "Maria",
    "lastName": "Santos",
    "dateOfBirth": "2008-08-31",
    "gender": "F",
    "safehouseId": 1,
    "intakeDate": "2023-01-15",
    "caseCategory": "Trafficking",
    "status": "Active",
    "safehouse": {...}
  }
]
```

### GET /api/residents/{id}
Returns a single resident with full case history.

**Includes:**
- Safehouse
- Process recordings
- Home visitations
- Education records
- Health/wellbeing records
- Intervention plans
- Incident reports

### GET /api/residents/{id}/timeline
Returns resident timeline with all events.

**Response:**
```json
{
  "resident": {...},
  "processRecordings": [...],
  "homeVisitations": [...],
  "incidents": [...]
}
```

### POST /api/residents
Creates a new resident record.

**Body:**
```json
{
  "caseNumber": "C0001",
  "firstName": "Jane",
  "lastName": "Doe",
  "dateOfBirth": "2010-05-15",
  "gender": "F",
  "safehouseId": 1,
  "intakeDate": "2026-04-06",
  "caseCategory": "Trafficking",
  "referralSource": "NAPTIP",
  "status": "Active"
}
```

### PUT /api/residents/{id}
Updates an existing resident.

### DELETE /api/residents/{id}
Deletes a resident record.

---

## 💰 Donations

### GET /api/donations
Returns all donations with optional filtering.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `supporterId` | int | Filter by supporter |
| `type` | string | Filter by type (Monetary, InKind, Time, Skills) |
| `startDate` | datetime | Filter from date |
| `endDate` | datetime | Filter to date |

**Example:**
```
GET /api/donations?type=Monetary&startDate=2026-01-01
```

### GET /api/donations/{id}
Returns a single donation with related data.

### GET /api/donations/stats
Returns donation statistics.

**Response:**
```json
{
  "totalAmount": 15000.00,
  "totalByType": [
    { "type": "Monetary", "count": 420, "total": 15000.00 },
    { "type": "InKind", "count": 129, "total": 0 }
  ],
  "recurringDonations": 25,
  "averageDonation": 35.71,
  "totalDonations": 549
}
```

### POST /api/donations
Creates a new donation record.

**Body:**
```json
{
  "supporterId": 1,
  "amount": 100.00,
  "currency": "USD",
  "donationType": "Monetary",
  "donationDate": "2026-04-06",
  "campaignSource": "Website",
  "isRecurring": false
}
```

### PUT /api/donations/{id}
Updates an existing donation.

### DELETE /api/donations/{id}
Deletes a donation record.

---

## 👥 Supporters (Donors)

### GET /api/supporters
Returns all supporters with optional filtering.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Filter by type (Individual, Corporate, Foundation) |
| `atRisk` | bool | Filter at-risk donors (true/false) |

### GET /api/supporters/{id}
Returns a single supporter with donation history.

### GET /api/supporters/{id}/donations
Returns all donations from a supporter.

### GET /api/supporters/at-risk/list
Returns supporters flagged as at-risk for churn.

**Response:**
```json
[
  {
    "id": 5,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "totalDonated": 500.00,
    "donationCount": 3,
    "lastDonationDate": "2025-06-15",
    "isAtRisk": true
  }
]
```

### POST /api/supporters
Creates a new supporter.

**Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "+1-555-1234",
  "supporterType": "Individual",
  "country": "United States",
  "joinedDate": "2026-04-06"
}
```

### PUT /api/supporters/{id}
Updates an existing supporter.

### DELETE /api/supporters/{id}
Deletes a supporter.

---

## 📊 Dashboard

### GET /api/dashboard/overview
Returns overall dashboard summary.

**Response:**
```json
{
  "residents": {
    "total": 60,
    "active": 55,
    "inactive": 5
  },
  "safehouses": {
    "total": 9
  },
  "supporters": {
    "total": 60,
    "atRisk": 12
  },
  "donations": {
    "totalAmount": 15000.00,
    "recent": [...]
  },
  "recentIncidents": [...]
}
```

### GET /api/dashboard/metrics
Returns detailed analytics metrics.

**Response:**
```json
{
  "donationsByMonth": [
    { "year": 2026, "month": 4, "total": 2500.00, "count": 35 }
  ],
  "residentsBySafehouse": [
    { "safehouseId": 1, "count": 8 }
  ],
  "incidentsByType": [
    { "type": "Behavioral", "count": 25 }
  ]
}
```

---

## 🔐 Health Check

### GET /api/health
Returns API health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-04-06T22:06:00Z"
}
```

---

## 🛡️ Error Responses

All endpoints return standard HTTP status codes:

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful delete/update) |
| 400 | Bad Request (invalid input) |
| 404 | Not Found |
| 500 | Internal Server Error |

**Error Response Format:**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "traceId": "00-1234-5678-90ab-cdef"
}
```

---

## 🔧 Development Setup

```bash
# Run migrations
cd backend
dotnet ef database update

# Seed data
dotnet run -- seed

# Run API
dotnet run

# API will be available at:
# https://localhost:5001
# http://localhost:5000
```

---

## 📝 Swagger Documentation

When running in development mode, Swagger UI is available at:
- `https://localhost:5001/swagger`
- `http://localhost:5000/swagger`

---

*Last updated: April 6, 2026*
*Team: 1-12*
*Version: 1.0.0*