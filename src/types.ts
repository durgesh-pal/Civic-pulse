export type Role = 'CITIZEN' | 'AUTHORITY' | 'FIELD_WORKER' | 'ADMIN';

export type IssueCategory =
  | 'Road Damage'
  | 'Garbage'
  | 'Street Light'
  | 'Water Leakage'
  | 'Drainage'
  | 'Traffic'
  | 'Public Sanitation'
  | 'Fallen Trees'
  | 'Public Safety'
  | 'Other';

export type IssueStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Verified'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected';

export type IssuePriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  avatar?: string;
  departmentId?: string;
  departmentName?: string;
  badge?: string;
  civicScore?: number;
  assignedArea?: string;
  reportsSubmitted?: number;
  reportsResolved?: number;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headName: string;
  email: string;
  phone: string;
  color: string;
  activeIssues: number;
  resolvedIssues: number;
  slaComplianceRate: number;
  workerCount: number;
}

export interface IssueLocation {
  address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
}

export interface AIAnalysisResult {
  detectedCategory: IssueCategory;
  detectedIssue: string;
  confidence: number;
  suggestedPriority: IssuePriority;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  summaryDescription: string;
  tags: string[];
  safetyHazardsDetected?: string[];
  rawAnalysis?: string;
}

export interface PriorityScoreBreakdown {
  score: number; // 0 - 100
  severityComponent: number; // Max 30
  publicImpactComponent: number; // Max 25
  urgencyComponent: number; // Max 20
  affectedCitizensComponent: number; // Max 15
  ageComponent: number; // Max 10
  upvoteCount: number;
  duplicateCount: number;
  calculatedLevel: IssuePriority;
}

export interface SLAInfo {
  slaHours: number;
  deadline: string;
  remainingHours: number;
  isOverdue: boolean;
  breachRisk: 'Safe' | 'Warning' | 'Breached';
}

export interface IssueTimelineStep {
  id: string;
  status: IssueStatus;
  title: string;
  description: string;
  actorName: string;
  actorRole: Role;
  timestamp: string;
  proofImageUrl?: string;
}

export interface IssueComment {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  userAvatar?: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
}

export interface IssueFeedback {
  rating: number; // 1-5
  comment: string;
  isResolvedConfirmed: boolean;
  createdAt: string;
  citizenName: string;
}

export interface Issue {
  id: string;
  ticketNumber: string; // e.g. "CIV-2026-00124"
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  priority: IssuePriority;
  priorityScore: PriorityScoreBreakdown;
  location: IssueLocation;
  
  // Reporter info
  reporterId: string;
  reporterName: string;
  reporterPhone?: string;
  
  // Media
  images: string[];
  beforeImage: string;
  afterImage?: string;
  resolutionNotes?: string;
  
  // AI metadata
  aiAnalysis?: AIAnalysisResult;
  isFlaggedSuspicious?: boolean;
  flagReason?: string;
  
  // Department & Assignment
  departmentId?: string;
  departmentName?: string;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  assignedWorkerPhone?: string;
  assignedAt?: string;
  
  // SLA
  sla: SLAInfo;
  estimatedResolutionDate?: string;
  actualResolvedDate?: string;
  
  // Community engagement
  upvotes: number;
  upvotedByUserIds: string[];
  duplicateOfId?: string;
  duplicateCount: number;
  
  // Timeline & Comments
  timeline: IssueTimelineStep[];
  comments: IssueComment[];
  feedback?: IssueFeedback;
  
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'STATUS_CHANGE' | 'ASSIGNMENT' | 'SLA_ALERT' | 'NEW_REPORT' | 'FEEDBACK' | 'SYSTEM';
  issueId?: string;
  ticketNumber?: string;
  isRead: boolean;
  createdAt: string;
}

export interface CivicStats {
  totalReports: number;
  pendingVerification: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  criticalIssues: number;
  overdueCount: number;
  averageResolutionHours: number;
  citizenSatisfactionRate: number;
  activeCitizens: number;
  activeWorkers: number;
}

export interface DuplicateCheckResult {
  hasDuplicate: boolean;
  matchingIssues: {
    issue: Issue;
    similarityScore: number;
    distanceMeters: number;
    reason: string;
  }[];
}
