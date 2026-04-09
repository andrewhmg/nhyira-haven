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

  return {
    recency_days: recencyDays,
    frequency: supporter.donationCount,
    total_monetary: supporter.totalDonated,
    avg_amount: supporter.donationCount > 0 ? supporter.totalDonated / supporter.donationCount : 0,
    pct_recurring: supporter.isRecurring ? 1 : 0,
    n_donation_types: 1,
    n_channels: 1,
    n_campaigns: 0,
    donor_tenure_days: tenureDays,
    frequency_trend: 0,
    n_safehouses_funded: 1,
    n_program_areas: 1,
  };
}

/** Build resident features for exit/warning models */
export function buildResidentFeatures(resident: {
  intakeDate: string;
  status: string;
  processRecordings?: Array<{ sessionType: string }>;
  incidentReports?: Array<{ severity: string; isResolved: boolean; incidentType?: string }>;
  homeVisitations?: Array<{ followUpNeeded: boolean }>;
  interventionPlans?: Array<{ status: string }>;
}) {
  const incidents = resident.incidentReports || [];
  const interventions = resident.interventionPlans || [];

  const highSeverity = incidents.filter((i) => i.severity === 'Critical' || i.severity === 'High').length;
  const completedInterventions = interventions.filter((i) => i.status === 'Completed').length;
  const onHoldInterventions = interventions.filter((i) => i.status === 'On Hold').length;
  const runawayAttempts = incidents.filter((i) => i.incidentType === 'Runaway').length;

  return {
    risk_improvement: highSeverity > 0 ? 0 : 1,
    compound_trauma_score: highSeverity > 2 ? 3 : highSeverity > 0 ? 2 : 1,
    family_solo_parent: 0,
    avg_emo_improvement: 0.5,
    any_completed: completedInterventions > 0 ? 1 : 0,
    pct_plans_achieved: completedInterventions / Math.max(interventions.length, 1),
    pct_plans_on_hold: onHoldInterventions / Math.max(interventions.length, 1),
    runaway_attempts: runawayAttempts,
    is_pwd: 0,
    family_informal_settler: 0,
    early_pct_concerns: 0.5,
    early_avg_emo_start: 0.5,
    early_avg_cooperation: 0.5,
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
