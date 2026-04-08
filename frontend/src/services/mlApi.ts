/**
 * ML Prediction API Client
 * Calls the Flask ML service to get predictions from trained pipelines.
 */

const ML_API_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:5050';

async function mlFetch<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(`${ML_API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`ML API Error: ${res.status}`);
  return res.json();
}

// ============ Response Types ============

export interface ChurnRiskResult {
  churn_probability: number;
  risk_tier: 'High' | 'Medium' | 'Low';
  top_factors: Array<{ feature: string; importance: number }>;
}

export interface DonorTierResult {
  tier: string;
  probabilities: Record<string, number>;
  top_factors: Array<{ feature: string; importance: number }>;
}

export interface DonorLTVResult {
  predicted_lifetime_value_php: number;
  value_segment: 'High Value' | 'Medium Value' | 'Low Value';
  model_used: string;
}

export interface ReintegrationResult {
  success_probability: number;
  readiness: 'Ready' | 'Progressing' | 'Not Ready';
  top_factors: Array<{ feature: string; importance: number }>;
}

export interface EarlyWarningResult {
  bad_exit_probability: number;
  risk_level: 'Red' | 'Yellow' | 'Green';
  top_factors: Array<{ feature: string; importance: number }>;
}

export interface SessionEffectivenessResult {
  effectiveness_probability: number;
  prediction: string;
  top_factors: Array<{ feature: string; importance: number }>;
}

export interface IncidentRiskResult {
  incident_probability: number;
  alert_level: 'High Risk' | 'Moderate Risk' | 'Low Risk';
  top_factors: Array<{ feature: string; importance: number }>;
}

export interface FamilyCooperationResult {
  cooperation_probability?: number;
  reintegration_probability?: number;
  prediction: string;
}

export interface PostConversionResult {
  conversion_probability: number;
  prediction: string;
  estimated_donation_value_php?: number;
  top_factors: Array<{ feature: string; importance: number }>;
}

export interface AllocationROIResult {
  predicted_outcome: number;
  target_metric: string;
  top_factors: Array<{ feature: string; importance: number }>;
}

export interface ReintegrationReadinessResult {
  ready_within_6mo_probability: number;
  readiness: string;
  estimated_months_to_readiness?: number;
}

// ============ Feature Builders ============

/** Build donor features from Supporter data for churn/tier/LTV models */
export function buildDonorFeatures(supporter: {
  totalDonated: number;
  donationCount: number;
  lastDonationDate?: string;
  joinedDate: string;
  isRecurring?: boolean;
}) {
  const now = new Date();
  const lastDonation = supporter.lastDonationDate ? new Date(supporter.lastDonationDate) : now;
  const joined = new Date(supporter.joinedDate);
  const recencyDays = Math.floor((now.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24));
  const tenureDays = Math.floor((now.getTime() - joined.getTime()) / (1000 * 60 * 60 * 24));
  const avgDonation = supporter.donationCount > 0 ? supporter.totalDonated / supporter.donationCount : 0;
  const donationsPerYear = tenureDays > 0 ? (supporter.donationCount / tenureDays) * 365 : supporter.donationCount;

  return {
    recency_days: recencyDays,
    frequency: supporter.donationCount,
    monetary: supporter.totalDonated,
    total_donated: supporter.totalDonated,
    avg_donation: avgDonation,
    donation_count: supporter.donationCount,
    tenure_days: tenureDays,
    donations_per_year: donationsPerYear,
    max_donation: supporter.totalDonated, // approximation
    min_donation: avgDonation, // approximation
    is_recurring: supporter.isRecurring ? 1 : 0,
    avg_days_between_donations: supporter.donationCount > 1 ? tenureDays / (supporter.donationCount - 1) : tenureDays,
  };
}

/** Build resident features for exit/warning models */
export function buildResidentFeatures(resident: {
  intakeDate: string;
  status: string;
  processRecordings?: Array<{ sessionType: string }>;
  incidentReports?: Array<{ severity: string; isResolved: boolean }>;
  healthWellbeingRecords?: Array<{ mentalHealthStatus?: string }>;
  educationRecords?: Array<{ performanceLevel: string; score?: number }>;
  homeVisitations?: Array<{ followUpNeeded: boolean }>;
  interventionPlans?: Array<{ status: string }>;
}) {
  const now = new Date();
  const intake = new Date(resident.intakeDate);
  const daysSinceIntake = Math.floor((now.getTime() - intake.getTime()) / (1000 * 60 * 60 * 24));
  const monthsSinceIntake = daysSinceIntake / 30;

  const recordings = resident.processRecordings || [];
  const incidents = resident.incidentReports || [];
  const health = resident.healthWellbeingRecords || [];
  const education = resident.educationRecords || [];
  const visits = resident.homeVisitations || [];
  const interventions = resident.interventionPlans || [];

  const resolvedIncidents = incidents.filter((i) => i.isResolved).length;
  const totalIncidents = incidents.length;
  const highSeverity = incidents.filter((i) => i.severity === 'Critical' || i.severity === 'High').length;

  const avgScore = education.length > 0
    ? education.reduce((sum, e) => sum + (e.score ?? 50), 0) / education.length
    : 50;

  const completedInterventions = interventions.filter((i) => i.status === 'Completed').length;

  return {
    // Timeline
    days_since_intake: daysSinceIntake,
    months_in_program: monthsSinceIntake,
    // Sessions
    session_count: recordings.length,
    sessions_per_month: monthsSinceIntake > 0 ? recordings.length / monthsSinceIntake : recordings.length,
    // Incidents
    total_incidents: totalIncidents,
    resolved_incidents: resolvedIncidents,
    incident_resolution_rate: totalIncidents > 0 ? resolvedIncidents / totalIncidents : 1,
    high_severity_incidents: highSeverity,
    early_incident_count: totalIncidents,
    // Risk
    initial_risk: highSeverity > 2 ? 3 : highSeverity > 0 ? 2 : 1,
    risk_improvement: highSeverity > 0 ? 0 : 1,
    // Health
    health_records_count: health.length,
    // Education
    avg_education_score: avgScore,
    education_records_count: education.length,
    pct_favorable: completedInterventions / Math.max(interventions.length, 1),
    // Visits
    home_visit_count: visits.length,
    follow_up_needed_pct: visits.length > 0 ? visits.filter((v) => v.followUpNeeded).length / visits.length : 0,
    // Interventions
    completed_interventions: completedInterventions,
    total_interventions: interventions.length,
    intervention_completion_rate: interventions.length > 0 ? completedInterventions / interventions.length : 0,
    // Emotional (approximations)
    avg_emo_improvement: 0.5,
    emotional_baseline: 3,
  };
}

// ============ API Calls ============

export async function predictChurnRisk(features: Record<string, number>): Promise<ChurnRiskResult> {
  return mlFetch('/api/ml/churn-risk', { features });
}

export async function predictDonorTier(features: Record<string, number>): Promise<DonorTierResult> {
  return mlFetch('/api/ml/donor-tier', { features });
}

export async function predictDonorLTV(features: Record<string, number>, model: 'full' | 'acquisition' = 'full'): Promise<DonorLTVResult> {
  return mlFetch('/api/ml/donor-ltv', { features, model });
}

export async function predictReintegration(features: Record<string, number>): Promise<ReintegrationResult> {
  return mlFetch('/api/ml/reintegration', { features });
}

export async function predictEarlyWarning(features: Record<string, number>): Promise<EarlyWarningResult> {
  return mlFetch('/api/ml/early-warning', { features });
}

export async function predictSessionEffectiveness(features: Record<string, number>): Promise<SessionEffectivenessResult> {
  return mlFetch('/api/ml/session-effectiveness', { features });
}

export async function predictIncidentRisk(features: Record<string, number>): Promise<IncidentRiskResult> {
  return mlFetch('/api/ml/incident-risk', { features });
}

export async function predictFamilyCooperation(features: Record<string, number>, stage: 1 | 2 = 1): Promise<FamilyCooperationResult> {
  return mlFetch('/api/ml/family-cooperation', { features, stage });
}

export async function predictPostConversion(features: Record<string, number>): Promise<PostConversionResult> {
  return mlFetch('/api/ml/post-conversion', { features });
}

export async function predictAllocationROI(features: Record<string, number>, target: 'education' | 'health' | 'incidents'): Promise<AllocationROIResult> {
  return mlFetch('/api/ml/allocation-roi', { features, target });
}

export async function predictReintegrationReadiness(features: Record<string, number>): Promise<ReintegrationReadinessResult> {
  return mlFetch('/api/ml/reintegration-readiness', { features });
}

export async function getMLHealth(): Promise<{ status: string; models_loaded: Record<string, boolean> }> {
  const res = await fetch(`${ML_API_URL}/api/ml/health`);
  return res.json();
}

// ============ Batch Helpers ============

/** Get all ML insights for a single donor */
export async function getDonorMLInsights(supporter: Parameters<typeof buildDonorFeatures>[0]) {
  const features = buildDonorFeatures(supporter);
  const [churn, tier, ltv] = await Promise.allSettled([
    predictChurnRisk(features),
    predictDonorTier(features),
    predictDonorLTV(features),
  ]);
  return {
    churn: churn.status === 'fulfilled' ? churn.value : null,
    tier: tier.status === 'fulfilled' ? tier.value : null,
    ltv: ltv.status === 'fulfilled' ? ltv.value : null,
  };
}

/** Get all ML insights for a single resident */
export async function getResidentMLInsights(resident: Parameters<typeof buildResidentFeatures>[0]) {
  const features = buildResidentFeatures(resident);
  const [earlyWarning, reintegration, incidentRisk, readiness] = await Promise.allSettled([
    predictEarlyWarning(features),
    predictReintegration(features),
    predictIncidentRisk(features),
    predictReintegrationReadiness(features),
  ]);
  return {
    earlyWarning: earlyWarning.status === 'fulfilled' ? earlyWarning.value : null,
    reintegration: reintegration.status === 'fulfilled' ? reintegration.value : null,
    incidentRisk: incidentRisk.status === 'fulfilled' ? incidentRisk.value : null,
    readiness: readiness.status === 'fulfilled' ? readiness.value : null,
  };
}
