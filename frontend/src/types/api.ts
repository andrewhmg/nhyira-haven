// API Types - Matching backend models

// User/Auth
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  errors?: string[];
}

// Safehouse
export interface Safehouse {
  id: number;
  name: string;
  location: string;
  capacity: number;
  currentResidents: number;
  contactPhone?: string;
  contactEmail?: string;
  establishedDate: string;
  isActive: boolean;
  residents?: Resident[];
  partnerAssignments?: PartnerAssignment[];
  monthlyMetrics?: SafehouseMonthlyMetric[];
}

// Partner
export interface Partner {
  id: number;
  name: string;
  partnerType: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  servicesProvided?: string;
  partnershipStartDate: string;
  isActive: boolean;
}

export interface PartnerAssignment {
  id: number;
  safehouseId: number;
  partnerId: number;
  assignmentDate: string;
  role?: string;
  isActive: boolean;
  safehouse?: Safehouse;
  partner?: Partner;
}

// Resident
export interface Resident {
  id: number;
  caseNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  safehouseId: number;
  intakeDate: string;
  caseCategory: string;
  referralSource: string;
  guardianName?: string;
  guardianContact?: string;
  status: string;
  reintegrationDate?: string;
  notes?: string;
  isActive: boolean;
  safehouse?: Safehouse;
  processRecordings?: ProcessRecording[];
  homeVisitations?: HomeVisitation[];
  educationRecords?: EducationRecord[];
  healthWellbeingRecords?: HealthWellbeingRecord[];
  interventionPlans?: InterventionPlan[];
  incidentReports?: IncidentReport[];
}

export interface ProcessRecording {
  id: number;
  residentId: number;
  sessionDate: string;
  sessionType: string;
  counselorName?: string;
  summary: string;
  observations?: string;
  actionPlan?: string;
  followUpRequired?: string;
  nextSessionDate?: string;
  isConfidential: boolean;
}

export interface HomeVisitation {
  id: number;
  residentId: number;
  visitDate: string;
  visitType: string;
  visitorName?: string;
  location: string;
  summary: string;
  familyInteraction?: string;
  safetyConcerns?: string;
  recommendations?: string;
  followUpNeeded: boolean;
}

export interface EducationRecord {
  id: number;
  residentId: number;
  recordDate: string;
  schoolName: string;
  gradeLevel: string;
  subject: string;
  teacherName?: string;
  performanceLevel: string;
  score?: number;
  attendanceRate?: string;
  comments?: string;
}

export interface HealthWellbeingRecord {
  id: number;
  residentId: number;
  recordDate: string;
  height?: string;
  weight?: string;
  bloodType?: string;
  medicalConditions?: string;
  medications?: string;
  allergies?: string;
  mentalHealthStatus?: string;
  counselingProgress?: string;
  healthConcerns?: string;
  nextCheckupDate?: string;
  recordedBy?: string;
}

export interface InterventionPlan {
  id: number;
  residentId: number;
  planDate: string;
  goal: string;
  interventions: string;
  responsibleStaff?: string;
  targetDate: string;
  status: string;
  outcomes?: string;
  completionDate?: string;
  notes?: string;
}

export interface IncidentReport {
  id: number;
  residentId: number;
  incidentDate: string;
  reportedDate: string;
  incidentType: string;
  severity: string;
  description: string;
  reportedBy?: string;
  actionTaken?: string;
  followUpRequired?: string;
  isResolved: boolean;
  resolutionDate?: string;
  notes?: string;
}

// Donor & Support
export interface Supporter {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  supporterType: string;
  country?: string;
  joinedDate: string;
  totalDonated: number;
  donationCount: number;
  lastDonationDate?: string;
  isActive: boolean;
  isAtRisk: boolean;
  donations?: Donation[];
}

export interface Donation {
  id: number;
  supporterId: number;
  amount: number;
  currency: string;
  donationType: string;
  donationDate: string;
  campaignSource?: string;
  socialMediaPostId?: number;
  notes?: string;
  isRecurring: boolean;
  recurringFrequency?: string;
  supporter?: Supporter;
  inKindDonationItems?: InKindDonationItem[];
  donationAllocations?: DonationAllocation[];
}

export interface InKindDonationItem {
  id: number;
  donationId: number;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedValue: number;
  receivedDate: string;
  notes?: string;
}

export interface DonationAllocation {
  id: number;
  donationId: number;
  allocationCategory: string;
  amount: number;
  allocationDate: string;
  notes?: string;
}

// Social Media
export interface SocialMediaPost {
  id: number;
  platform: string;
  content: string;
  postDate: string;
  postUrl?: string;
  likes?: number;
  shares?: number;
  comments?: number;
  reach?: number;
  impressions?: number;
  clicks?: number;
  donationsGenerated?: number;
  donationId?: number;
  campaignTag?: string;
  notes?: string;
}

export interface SafehouseMonthlyMetric {
  id: number;
  safehouseId: number;
  yearMonth: string;
  residentCount: number;
  newIntakes: number;
  reintegrations: number;
  transfers: number;
  totalDonations: number;
  donationCount: number;
  operatingExpenses: number;
  staffCount: number;
  volunteerHours: number;
  highlights?: string;
  challenges?: string;
  recordedDate: string;
}

export interface PublicImpactSnapshot {
  id: number;
  title: string;
  snapshotDate: string;
  totalResidentsServed: number;
  activeResidents: number;
  successfulReintegrations: number;
  totalDonationsReceived: number;
  totalDonors: number;
  activePartners: number;
  safehouseCount: number;
  successStory?: string;
  impactSummary?: string;
  isPublished: boolean;
  publishedDate?: string;
}

// Dashboard
export interface DashboardOverview {
  residents: {
    total: number;
    active: number;
    inactive: number;
  };
  safehouses: {
    total: number;
  };
  supporters: {
    total: number;
    atRisk: number;
  };
  donations: {
    totalAmount: number;
    recent: Array<{
      id: number;
      amount: number;
      donationDate: string;
      supporterName: string;
    }>;
  };
  recentIncidents: Array<{
    id: number;
    incidentType: string;
    severity: string;
    incidentDate: string;
    residentName: string;
  }>;
}

export interface DashboardMetrics {
  donationsByMonth: Array<{
    year: number;
    month: number;
    total: number;
    count: number;
  }>;
  residentsBySafehouse: Array<{
    safehouseId: number;
    count: number;
  }>;
  incidentsByType: Array<{
    type: string;
    count: number;
  }>;
}