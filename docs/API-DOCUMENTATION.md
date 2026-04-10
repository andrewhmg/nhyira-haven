# Nhyira Haven API Documentation

Base URL: `http://localhost:5000/api` (development) or `https://nhyira-haven.azurewebsites.net/api` (production)

ML API Base URL: `http://localhost:5050/api/ml` (development) or `https://nhyira-haven-ml.azurewebsites.net/api/ml` (production)

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
| ML Predictions | `/api/ml/*` | 11 ML prediction endpoints (donor, case management, social media) |

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

## 🤖 Machine Learning Predictions

The ML API is a separate Flask service hosted at `https://nhyira-haven-ml.azurewebsites.net`. It serves 11 trained prediction pipelines from `ml-pipelines/prediction_api.py`. All prediction endpoints accept JSON with a `features` object and return JSON including model output plus the top 5 feature importances driving the prediction.

**Common request shape:**
```json
{
  "features": {
    "feature_name_1": 0,
    "feature_name_2": 0
  }
}
```

Unknown or missing feature keys default to `0`. The exact feature list for each model is available at `/api/ml/health`, which reports which models are currently loaded.

**Common response fields:**

| Field | Type | Description |
|-------|------|-------------|
| `top_factors` | array | Top 5 features by importance: `[{"feature": "name", "importance": 0.12}, ...]` |
| `error` | string | Present only on 400/503 responses |

Errors return `400` for bad input or `503` when a required model artifact is not loaded.

---

### GET /api/ml/health
Returns the ML service status and a map of which model artifacts are currently loaded in memory.

**Response:**
```json
{
  "status": "ok",
  "models_loaded": {
    "donor_tier_rf": true,
    "churn_gb": true,
    "social_gb": true,
    "readiness_classifier": true
  }
}
```

---

### POST /api/ml/donor-tier
Classifies a donor into a value tier (`High`, `Medium`, `Low`) from RFM-style features. Pipeline: `key-donor-identification.ipynb`.

**Request:**
```json
{
  "features": {
    "recency_days": 30,
    "frequency": 12,
    "monetary_total": 5000,
    "avg_gift": 420,
    "tenure_days": 900
  }
}
```

**Response:**
```json
{
  "tier": "High",
  "probabilities": { "High": 0.82, "Medium": 0.15, "Low": 0.03 },
  "top_factors": [{ "feature": "monetary_total", "importance": 0.34 }]
}
```

---

### POST /api/ml/churn-risk
Predicts probability that a donor will lapse. Pipeline: `donor-churn-prevention.ipynb`.

**Request:**
```json
{
  "features": {
    "recency_days": 180,
    "frequency": 3,
    "avg_gift": 150,
    "days_since_last_gift": 200
  }
}
```

**Response:**
```json
{
  "churn_probability": 0.78,
  "risk_tier": "High",
  "top_factors": [{ "feature": "recency_days", "importance": 0.41 }]
}
```

`risk_tier` is `High` when probability > 0.7, `Medium` when > 0.3, otherwise `Low`.

---

### POST /api/ml/donor-ltv
Predicts a donor's lifetime value in currency and assigns an LTV tier. Pipeline: `donor-lifetime-value.ipynb`.

**Request:**
```json
{
  "features": {
    "tenure_days": 720,
    "frequency": 14,
    "avg_gift": 350,
    "is_recurring": 1
  }
}
```

**Response:**
```json
{
  "predicted_ltv": 3450.12,
  "ltv_tier": "Gold",
  "top_factors": [{ "feature": "frequency", "importance": 0.29 }]
}
```

Tiers: `Platinum` > 5000, `Gold` > 2000, `Silver` > 500, `Bronze` otherwise.

---

### POST /api/ml/reintegration
Predicts the probability of a successful exit for a resident. Pipeline: `successful-exit-prediction.ipynb`.

**Request:**
```json
{
  "features": {
    "risk_improvement": 1,
    "pct_favorable": 0.8,
    "intervention_count": 12,
    "length_of_stay_days": 240
  }
}
```

**Response:**
```json
{
  "success_probability": 0.81,
  "readiness": "Ready",
  "top_factors": [{ "feature": "pct_favorable", "importance": 0.27 }]
}
```

`readiness` is `Ready` when probability > 0.7, `Progressing` when > 0.4, otherwise `Not Ready`.

---

### POST /api/ml/reintegration-readiness
Predicts a readiness score and classification for exit planning. Pipeline: `reintegration-readiness.ipynb`.

**Request:**
```json
{
  "features": {
    "length_of_stay_days": 210,
    "favorable_session_ratio": 0.75,
    "family_contact_count": 8,
    "incident_count_last_90d": 0
  }
}
```

**Response:**
```json
{
  "readiness_probability": 0.72,
  "readiness_score": 0.68,
  "readiness_level": "Ready",
  "top_factors": [{ "feature": "favorable_session_ratio", "importance": 0.31 }]
}
```

---

### POST /api/ml/early-warning
Flags residents at risk of a bad exit with a traffic-light level. Pipeline: `bad-exit-early-warning.ipynb`.

**Request:**
```json
{
  "features": {
    "initial_risk": 2,
    "early_incident_count": 3,
    "early_favorable_session_ratio": 0.2,
    "days_since_intake": 45
  }
}
```

**Response:**
```json
{
  "bad_exit_probability": 0.74,
  "risk_level": "Red",
  "top_factors": [{ "feature": "early_incident_count", "importance": 0.38 }]
}
```

Levels: `Red` > 0.7, `Yellow` > 0.3, `Green` otherwise.

---

### POST /api/ml/incident-risk
Predicts probability that a resident will experience an incident in the near term. Pipeline: `incident-early-warning.ipynb`.

**Request:**
```json
{
  "features": {
    "prior_incident_count": 2,
    "days_since_last_incident": 14,
    "recent_session_ratio": 0.4,
    "risk_tier_numeric": 2
  }
}
```

**Response:**
```json
{
  "incident_probability": 0.55,
  "risk_level": "Medium",
  "top_factors": [{ "feature": "prior_incident_count", "importance": 0.33 }]
}
```

Levels: `High` > 0.7, `Medium` > 0.3, `Low` otherwise.

---

### POST /api/ml/session-effectiveness
Classifies a counseling session as `Effective` or `Needs Review`. Pipeline: `counseling-session-effectiveness.ipynb`.

**Request:**
```json
{
  "features": {
    "duration_minutes": 60,
    "session_number": 5,
    "counselor_tenure_days": 900,
    "resident_engagement_score": 4
  }
}
```

**Response:**
```json
{
  "effectiveness_probability": 0.68,
  "prediction": "Effective",
  "top_factors": [{ "feature": "resident_engagement_score", "importance": 0.35 }]
}
```

---

### POST /api/ml/family-cooperation
Two-stage model: stage 1 predicts family cooperation; stage 2 predicts reintegration outcome given cooperation. Pipeline: `family-cooperation-reintegration.ipynb`.

**Request:**
```json
{
  "stage": 1,
  "features": {
    "home_visit_count": 4,
    "family_contact_frequency": 0.8,
    "distance_km": 25,
    "family_income_tier": 2
  }
}
```

`stage` is `1` (default) for family cooperation prediction or `2` for reintegration outcome given cooperation.

**Response:**
```json
{
  "cooperation_probability": 0.71,
  "prediction": "Cooperative",
  "stage": 1,
  "top_factors": [{ "feature": "home_visit_count", "importance": 0.29 }]
}
```

---

### POST /api/ml/post-conversion
Predicts whether a social media post will convert to donations and estimates donation value. Pipeline: `social-media-conversion.ipynb`.

**Request:**
```json
{
  "features": {
    "platform_Instagram": 1,
    "post_type_FundraisingAppeal": 1,
    "likes": 250,
    "shares": 40,
    "comments": 18,
    "has_image": 1,
    "post_hour": 18
  }
}
```

Platform and post-type features are one-hot encoded (e.g. `platform_Facebook`, `platform_Twitter`, `post_type_Story`). Missing columns default to `0`.

**Response:**
```json
{
  "conversion_probability": 0.62,
  "prediction": "Likely to Convert",
  "estimated_donation_value_php": 1840.5,
  "top_factors": [{ "feature": "post_type_FundraisingAppeal", "importance": 0.22 }]
}
```

`estimated_donation_value_php` is `0.0` when the post is not predicted to convert.

---

### POST /api/ml/allocation-roi
Predicts outcome improvement for a program funding allocation. Pipeline: `donation-allocation-roi.ipynb`.

**Request:**
```json
{
  "target": "education",
  "features": {
    "total_funding": 50000,
    "resident_count": 25,
    "staff_count": 6
  }
}
```

`target` must be `"education"`, `"health"`, or `"incidents"`. The API distributes `total_funding` across program categories using fixed allocation splits tuned per target, then predicts the outcome metric with the corresponding model.

**Response:**
```json
{
  "predicted_outcome": 0.74,
  "target_metric": "education",
  "top_factors": [{ "feature": "funding_education", "importance": 0.41 }]
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

*Last updated: April 9, 2026 (added 12 ML prediction endpoints)*
*Team: 1-12*
*Version: 1.0.0*