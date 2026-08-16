import {
  Department,
  Issue,
  IssueCategory,
  IssuePriority,
  IssueStatus,
  IssueTimelineStep,
  NotificationItem,
  PriorityScoreBreakdown,
  Role,
  SLAInfo,
  User,
} from '../src/types';
import { calculateDistanceMeters } from '../src/lib/utils';
import { CIVIC_CATEGORIES, DEMO_USERS, SAMPLE_ISSUE_IMAGES } from '../src/lib/constants';

class CivicDatabase {
  users: User[] = [];
  departments: Department[] = [];
  issues: Issue[] = [];
  notifications: NotificationItem[] = [];
  auditLogs: any[] = [];
  private issueCounter = 120;

  constructor() {
    this.seed();
  }

  // Calculate dynamic priority score formula:
  // Severity × 30 + Public Impact × 25 + Urgency × 20 + Affected Citizens × 15 + Age × 10
  calculatePriorityScore(params: {
    severity: IssuePriority;
    upvotes: number;
    duplicateCount: number;
    category: IssueCategory;
    createdAt: string;
  }): PriorityScoreBreakdown {
    // 1. Severity component (Max 30)
    let sevFactor = 0.4;
    if (params.severity === 'Critical') sevFactor = 1.0;
    else if (params.severity === 'High') sevFactor = 0.75;
    else if (params.severity === 'Medium') sevFactor = 0.5;
    else sevFactor = 0.25;
    const severityComponent = Math.round(sevFactor * 30);

    // 2. Public Impact component (Max 25) - based on upvotes + category danger
    const upvoteFactor = Math.min(params.upvotes / 15, 1.0);
    const catDangerBonus = ['Water Leakage', 'Road Damage', 'Public Safety'].includes(params.category) ? 0.2 : 0.0;
    const publicImpactComponent = Math.round(Math.min((upvoteFactor * 0.8 + catDangerBonus) * 25, 25));

    // 3. Urgency component (Max 20)
    const urgencyComponent = params.severity === 'Critical' ? 20 : params.severity === 'High' ? 15 : params.severity === 'Medium' ? 10 : 5;

    // 4. Affected Citizens component (Max 15) - based on duplicates and upvotes
    const affectedCount = 1 + params.duplicateCount * 4 + params.upvotes;
    const affectedFactor = Math.min(affectedCount / 20, 1.0);
    const affectedCitizensComponent = Math.round(affectedFactor * 15);

    // 5. Age component (Max 10) - older unresolved complaints gain escalation points
    const ageHours = Math.max(0, (Date.now() - new Date(params.createdAt).getTime()) / (1000 * 60 * 60));
    const ageFactor = Math.min(ageHours / 72, 1.0);
    const ageComponent = Math.round(ageFactor * 10);

    const totalScore = Math.min(100, Math.max(10, severityComponent + publicImpactComponent + urgencyComponent + affectedCitizensComponent + ageComponent));

    let calculatedLevel: IssuePriority = 'Low';
    if (totalScore >= 81) calculatedLevel = 'Critical';
    else if (totalScore >= 61) calculatedLevel = 'High';
    else if (totalScore >= 31) calculatedLevel = 'Medium';
    else calculatedLevel = 'Low';

    return {
      score: totalScore,
      severityComponent,
      publicImpactComponent,
      urgencyComponent,
      affectedCitizensComponent,
      ageComponent,
      upvoteCount: params.upvotes,
      duplicateCount: params.duplicateCount,
      calculatedLevel,
    };
  }

  calculateSLA(category: IssueCategory, priority: IssuePriority, createdAt: string): SLAInfo {
    const catConfig = CIVIC_CATEGORIES.find((c) => c.name === category);
    const slaHours = catConfig?.defaultSlaHours[priority] || (priority === 'Critical' ? 24 : priority === 'High' ? 48 : 72);

    const createdTime = new Date(createdAt).getTime();
    const deadlineTime = createdTime + slaHours * 60 * 60 * 1000;
    const remainingMs = deadlineTime - Date.now();
    const remainingHours = Math.round(remainingMs / (1000 * 60 * 60) * 10) / 10;
    const isOverdue = remainingHours < 0;

    let breachRisk: 'Safe' | 'Warning' | 'Breached' = 'Safe';
    if (isOverdue) breachRisk = 'Breached';
    else if (remainingHours < 6) breachRisk = 'Warning';

    return {
      slaHours,
      deadline: new Date(deadlineTime).toISOString(),
      remainingHours,
      isOverdue,
      breachRisk,
    };
  }

  seed() {
    this.departments = [
      {
        id: 'dept-1',
        name: 'Public Works Department (Roads)',
        code: 'PWD_ROAD',
        headName: 'Er. Sandeep Malhotra (Chief Engineer)',
        email: 'pwd.roads@sih.gov.in',
        phone: '+91 80 2234 5001',
        color: '#2563eb',
        activeIssues: 12,
        resolvedIssues: 45,
        slaComplianceRate: 94.2,
        workerCount: 14,
      },
      {
        id: 'dept-2',
        name: 'Solid Waste & Sanitation Wing',
        code: 'SWM_SAN',
        headName: 'Dr. Anjali Deshmukh (Health Officer)',
        email: 'sanitation@sih.gov.in',
        phone: '+91 80 2234 5002',
        color: '#059669',
        activeIssues: 8,
        resolvedIssues: 68,
        slaComplianceRate: 97.5,
        workerCount: 22,
      },
      {
        id: 'dept-3',
        name: 'Electricity & Street Lighting Board',
        code: 'ELEC_DEPT',
        headName: 'Er. K. V. Ramanathan',
        email: 'electricity@sih.gov.in',
        phone: '+91 80 2234 5003',
        color: '#d97706',
        activeIssues: 5,
        resolvedIssues: 52,
        slaComplianceRate: 91.8,
        workerCount: 10,
      },
      {
        id: 'dept-4',
        name: 'Water Supply & Sewerage Board',
        code: 'WATER_BOARD',
        headName: 'Er. Arvind Swaminathan',
        email: 'waterboard@sih.gov.in',
        phone: '+91 80 2234 5004',
        color: '#0284c7',
        activeIssues: 9,
        resolvedIssues: 39,
        slaComplianceRate: 88.6,
        workerCount: 16,
      },
      {
        id: 'dept-5',
        name: 'Stormwater & Drainage Engineering',
        code: 'DRAIN_ENG',
        headName: 'Er. Pradeep Patil',
        email: 'drainage@sih.gov.in',
        phone: '+91 80 2234 5005',
        color: '#7c3aed',
        activeIssues: 4,
        resolvedIssues: 31,
        slaComplianceRate: 93.0,
        workerCount: 8,
      },
      {
        id: 'dept-6',
        name: 'Traffic Infrastructure Division',
        code: 'TRAFFIC_DIV',
        headName: 'ACP Vikramaditya Rathore',
        email: 'traffic.infra@sih.gov.in',
        phone: '+91 80 2234 5006',
        color: '#dc2626',
        activeIssues: 3,
        resolvedIssues: 28,
        slaComplianceRate: 96.0,
        workerCount: 6,
      },
      {
        id: 'dept-7',
        name: 'Horticulture & Green Belt Dept',
        code: 'HORTI_DEPT',
        headName: 'Mrs. Sunita Rao',
        email: 'horticulture@sih.gov.in',
        phone: '+91 80 2234 5007',
        color: '#16a34a',
        activeIssues: 2,
        resolvedIssues: 19,
        slaComplianceRate: 98.0,
        workerCount: 5,
      },
    ];

    // Seed Demo Users
    this.users = [
      {
        id: 'user-citizen-1',
        name: 'Rahul Sharma',
        email: 'citizen@sih.gov.in',
        role: 'CITIZEN',
        phone: '+91 98765 43210',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        civicScore: 185,
        badge: 'Civic Hero',
        assignedArea: 'Indiranagar, Bengaluru',
        reportsSubmitted: 8,
        reportsResolved: 6,
        createdAt: '2026-01-10T09:00:00.000Z',
      },
      {
        id: 'user-citizen-2',
        name: 'Priya Iyer',
        email: 'priya.iyer@gmail.com',
        role: 'CITIZEN',
        phone: '+91 98123 45678',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        civicScore: 120,
        badge: 'Community Helper',
        assignedArea: 'Koramangala, Bengaluru',
        reportsSubmitted: 5,
        reportsResolved: 4,
        createdAt: '2026-02-01T10:00:00.000Z',
      },
      {
        id: 'user-citizen-3',
        name: 'Amitabh Sen',
        email: 'amitabh.sen@yahoo.com',
        role: 'CITIZEN',
        phone: '+91 97234 56789',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        civicScore: 75,
        badge: 'Civic Contributor',
        assignedArea: 'HSR Layout, Bengaluru',
        reportsSubmitted: 3,
        reportsResolved: 2,
        createdAt: '2026-03-12T11:00:00.000Z',
      },
      {
        id: 'user-auth-1',
        name: 'Rajesh Verma (IAS)',
        email: 'authority@sih.gov.in',
        role: 'AUTHORITY',
        phone: '+91 98111 22334',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        departmentId: 'dept-1',
        departmentName: 'Municipal Corporation HQ',
        assignedArea: 'Central Municipal Zone',
        createdAt: '2025-11-01T08:00:00.000Z',
      },
      {
        id: 'user-auth-2',
        name: 'Kavita Chawla (Deputy Commissioner)',
        email: 'kavita.chawla@sih.gov.in',
        role: 'AUTHORITY',
        phone: '+91 98111 55667',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        departmentId: 'dept-2',
        departmentName: 'Solid Waste & Sanitation Wing',
        assignedArea: 'East Zone',
        createdAt: '2025-12-01T08:00:00.000Z',
      },
      {
        id: 'user-worker-1',
        name: 'Ramesh Kumar',
        email: 'worker@sih.gov.in',
        role: 'FIELD_WORKER',
        phone: '+91 99222 33445',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        departmentId: 'dept-1',
        departmentName: 'Public Works Department (Roads)',
        assignedArea: 'Zone 4, Indiranagar Sector B',
        createdAt: '2026-01-05T08:00:00.000Z',
      },
      {
        id: 'user-worker-2',
        name: 'Suresh Gaikwad',
        email: 'suresh.gaikwad@sih.gov.in',
        role: 'FIELD_WORKER',
        phone: '+91 99222 77889',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        departmentId: 'dept-2',
        departmentName: 'Solid Waste & Sanitation Wing',
        assignedArea: 'Zone 2, Koramangala',
        createdAt: '2026-01-15T08:00:00.000Z',
      },
      {
        id: 'user-worker-3',
        name: 'Mohammed Mansoor',
        email: 'm.mansoor@sih.gov.in',
        role: 'FIELD_WORKER',
        phone: '+91 99222 99001',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        departmentId: 'dept-4',
        departmentName: 'Water Supply & Sewerage Board',
        assignedArea: 'Zone 3, HSR Layout',
        createdAt: '2026-02-01T08:00:00.000Z',
      },
      {
        id: 'user-admin-1',
        name: 'Dr. Meenakshi Sundaram',
        email: 'admin@sih.gov.in',
        role: 'ADMIN',
        phone: '+91 98333 44556',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        departmentName: 'Smart City Mission Command',
        assignedArea: 'Pan-City Administration',
        createdAt: '2025-10-01T08:00:00.000Z',
      },
    ];

    // Seed realistic Indian civic issues
    const baseDate = new Date();
    const subHours = (h: number) => new Date(baseDate.getTime() - h * 60 * 60 * 1000).toISOString();

    const sampleLocations = [
      { address: '100 Feet Road, Near CMH Hospital, Indiranagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560038', lat: 12.9784, lng: 77.6408 },
      { address: '80 Feet Road, 4th Block, Koramangala', city: 'Bengaluru', state: 'Karnataka', pincode: '560034', lat: 12.9345, lng: 77.6265 },
      { address: '27th Main Rd, Sector 1, HSR Layout', city: 'Bengaluru', state: 'Karnataka', pincode: '560102', lat: 12.9121, lng: 77.6446 },
      { address: 'Brigade Road, Near Junction, Ashok Nagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560025', lat: 12.9719, lng: 77.607 },
      { address: 'Outer Ring Road, Near Bellandur Flyover', city: 'Bengaluru', state: 'Karnataka', pincode: '560103', lat: 12.9298, lng: 77.6834 },
      { address: 'M.G. Road Metro Station Entrance, Central Ward', city: 'Bengaluru', state: 'Karnataka', pincode: '560001', lat: 12.9756, lng: 77.6066 },
      { address: '14th Cross Rd, Malleshwaram West', city: 'Bengaluru', state: 'Karnataka', pincode: '560003', lat: 13.0031, lng: 77.5701 },
      { address: 'Jayanagar 4th Block Complex, South Zone', city: 'Bengaluru', state: 'Karnataka', pincode: '560011', lat: 12.9283, lng: 77.5833 },
      { address: 'Sarjapur Main Road, Near Wipro Gate 1', city: 'Bengaluru', state: 'Karnataka', pincode: '560035', lat: 12.9105, lng: 77.6872 },
      { address: 'Whitefield Main Road, Hope Farm Junction', city: 'Bengaluru', state: 'Karnataka', pincode: '560066', lat: 12.9834, lng: 77.7518 },
    ];

    const rawIssues: Partial<Issue>[] = [
      {
        ticketNumber: 'CIV-2026-00101',
        title: 'Deep Hazardous Pothole Near Hospital Bus Stop',
        description: 'Large crater approximately 18cm deep right in front of Indiranagar bus stop. Two motorcyclists skid yesterday evening.',
        category: 'Road Damage',
        status: 'Assigned',
        priority: 'Critical',
        location: sampleLocations[0],
        reporterId: 'user-citizen-1',
        reporterName: 'Rahul Sharma',
        reporterPhone: '+91 98765 43210',
        images: [SAMPLE_ISSUE_IMAGES[0].url],
        beforeImage: SAMPLE_ISSUE_IMAGES[0].url,
        departmentId: 'dept-1',
        departmentName: 'Public Works Department (Roads)',
        assignedWorkerId: 'user-worker-1',
        assignedWorkerName: 'Ramesh Kumar',
        assignedWorkerPhone: '+91 99222 33445',
        assignedAt: subHours(12),
        upvotes: 18,
        upvotedByUserIds: ['user-citizen-2', 'user-citizen-3'],
        duplicateCount: 2,
        createdAt: subHours(26),
        updatedAt: subHours(12),
      },
      {
        ticketNumber: 'CIV-2026-00102',
        title: 'Overflowing Community Garbage Bin on Main Street',
        description: 'Commercial waste has spilled onto the entire pedestrian walkway. Stray animals scattering garbage and creating intense odor.',
        category: 'Garbage',
        status: 'In Progress',
        priority: 'High',
        location: sampleLocations[1],
        reporterId: 'user-citizen-2',
        reporterName: 'Priya Iyer',
        reporterPhone: '+91 98123 45678',
        images: [SAMPLE_ISSUE_IMAGES[1].url],
        beforeImage: SAMPLE_ISSUE_IMAGES[1].url,
        departmentId: 'dept-2',
        departmentName: 'Solid Waste & Sanitation Wing',
        assignedWorkerId: 'user-worker-2',
        assignedWorkerName: 'Suresh Gaikwad',
        assignedWorkerPhone: '+91 99222 77889',
        assignedAt: subHours(18),
        upvotes: 14,
        upvotedByUserIds: ['user-citizen-1'],
        duplicateCount: 1,
        createdAt: subHours(20),
        updatedAt: subHours(4),
      },
      {
        ticketNumber: 'CIV-2026-00103',
        title: 'Major Water Supply Main Pipeline Burst',
        description: 'Underground potable water pipe burst with continuous high pressure gush flooding street and cutting water to 40 houses.',
        category: 'Water Leakage',
        status: 'Under Review',
        priority: 'Critical',
        location: sampleLocations[2],
        reporterId: 'user-citizen-3',
        reporterName: 'Amitabh Sen',
        reporterPhone: '+91 97234 56789',
        images: [SAMPLE_ISSUE_IMAGES[3].url],
        beforeImage: SAMPLE_ISSUE_IMAGES[3].url,
        departmentId: 'dept-4',
        departmentName: 'Water Supply & Sewerage Board',
        upvotes: 24,
        upvotedByUserIds: ['user-citizen-1', 'user-citizen-2'],
        duplicateCount: 3,
        createdAt: subHours(6),
        updatedAt: subHours(6),
      },
      {
        ticketNumber: 'CIV-2026-00104',
        title: 'Broken Street Lights Causing Total Darkness',
        description: '3 consecutive street light poles on 14th cross are completely non-operational for the past 4 nights. Unsafe for women and seniors.',
        category: 'Street Light',
        status: 'Resolved',
        priority: 'Medium',
        location: sampleLocations[6],
        reporterId: 'user-citizen-1',
        reporterName: 'Rahul Sharma',
        reporterPhone: '+91 98765 43210',
        images: [SAMPLE_ISSUE_IMAGES[2].url],
        beforeImage: SAMPLE_ISSUE_IMAGES[2].url,
        afterImage: SAMPLE_ISSUE_IMAGES[2].resolvedUrl,
        resolutionNotes: 'Replaced burnt capacitor and installed 45W high-lumen energy saving LED fixtures on all 3 lamp poles. Tested and verified.',
        departmentId: 'dept-3',
        departmentName: 'Electricity & Street Lighting Board',
        assignedWorkerId: 'user-worker-1',
        assignedWorkerName: 'Ramesh Kumar',
        assignedWorkerPhone: '+91 99222 33445',
        assignedAt: subHours(72),
        actualResolvedDate: subHours(16),
        upvotes: 9,
        upvotedByUserIds: ['user-citizen-2'],
        duplicateCount: 0,
        feedback: {
          rating: 5,
          comment: 'Outstanding prompt repair by the electricity team! The road is completely well lit now.',
          isResolvedConfirmed: true,
          citizenName: 'Rahul Sharma',
          createdAt: subHours(12),
        },
        createdAt: subHours(80),
        updatedAt: subHours(12),
      },
      {
        ticketNumber: 'CIV-2026-00105',
        title: 'Clogged Stormwater Drain & Waterlogging at Junction',
        description: 'Silt and plastic waste blocking underground culvert. Moderate rain causes 1.5ft water stagnation affecting vehicle movement.',
        category: 'Drainage',
        status: 'Verified',
        priority: 'High',
        location: sampleLocations[4],
        reporterId: 'user-citizen-2',
        reporterName: 'Priya Iyer',
        reporterPhone: '+91 98123 45678',
        images: [SAMPLE_ISSUE_IMAGES[4].url],
        beforeImage: SAMPLE_ISSUE_IMAGES[4].url,
        departmentId: 'dept-5',
        departmentName: 'Stormwater & Drainage Engineering',
        upvotes: 11,
        upvotedByUserIds: [],
        duplicateCount: 0,
        createdAt: subHours(14),
        updatedAt: subHours(8),
      },
      {
        ticketNumber: 'CIV-2026-00106',
        title: 'Uprooted Gulmohar Tree Blocking Two-Way Traffic',
        description: 'Old tree fell during yesterday gusty wind, crushing telephone cables and completely choking the road.',
        category: 'Fallen Trees',
        status: 'Assigned',
        priority: 'Critical',
        location: sampleLocations[7],
        reporterId: 'user-citizen-1',
        reporterName: 'Rahul Sharma',
        reporterPhone: '+91 98765 43210',
        images: ['https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&auto=format&fit=crop&q=80'],
        beforeImage: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&auto=format&fit=crop&q=80',
        departmentId: 'dept-7',
        departmentName: 'Horticulture & Green Belt Dept',
        assignedWorkerId: 'user-worker-1',
        assignedWorkerName: 'Ramesh Kumar',
        assignedWorkerPhone: '+91 99222 33445',
        assignedAt: subHours(4),
        upvotes: 31,
        upvotedByUserIds: ['user-citizen-2', 'user-citizen-3'],
        duplicateCount: 4,
        createdAt: subHours(8),
        updatedAt: subHours(4),
      },
      {
        ticketNumber: 'CIV-2026-00107',
        title: 'Broken Traffic Signal Creating Massive Gridlock',
        description: 'Four-way intersection traffic lights flashing dead amber. Commuters stuck in severe 45-minute jam during morning rush hour.',
        category: 'Traffic',
        status: 'In Progress',
        priority: 'Critical',
        location: sampleLocations[3],
        reporterId: 'user-citizen-3',
        reporterName: 'Amitabh Sen',
        reporterPhone: '+91 97234 56789',
        images: ['https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=800&auto=format&fit=crop&q=80'],
        beforeImage: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=800&auto=format&fit=crop&q=80',
        departmentId: 'dept-6',
        departmentName: 'Traffic Infrastructure Division',
        assignedWorkerId: 'user-worker-3',
        assignedWorkerName: 'Mohammed Mansoor',
        assignedWorkerPhone: '+91 99222 99001',
        assignedAt: subHours(2),
        upvotes: 42,
        upvotedByUserIds: ['user-citizen-1', 'user-citizen-2'],
        duplicateCount: 5,
        createdAt: subHours(5),
        updatedAt: subHours(2),
      },
      {
        ticketNumber: 'CIV-2026-00108',
        title: 'Open Deep Cable Trench Without Barricade',
        description: 'Excavation done for telecom fiber laying left completely open without warning signs, red tape, or night illumination.',
        category: 'Public Safety',
        status: 'Submitted',
        priority: 'High',
        location: sampleLocations[8],
        reporterId: 'user-citizen-2',
        reporterName: 'Priya Iyer',
        reporterPhone: '+91 98123 45678',
        images: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80'],
        beforeImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
        departmentId: 'dept-1',
        departmentName: 'Public Works Department (Roads)',
        upvotes: 7,
        upvotedByUserIds: [],
        duplicateCount: 0,
        createdAt: subHours(3),
        updatedAt: subHours(3),
      },
      {
        ticketNumber: 'CIV-2026-00109',
        title: 'Re-laid Potholes & Smooth Asphalt Surface',
        description: 'Multiple potholes near 80 Feet Road junction repaired with hot-mix bituminous concrete.',
        category: 'Road Damage',
        status: 'Resolved',
        priority: 'High',
        location: sampleLocations[1],
        reporterId: 'user-citizen-1',
        reporterName: 'Rahul Sharma',
        reporterPhone: '+91 98765 43210',
        images: [SAMPLE_ISSUE_IMAGES[0].url],
        beforeImage: SAMPLE_ISSUE_IMAGES[0].url,
        afterImage: SAMPLE_ISSUE_IMAGES[0].resolvedUrl,
        resolutionNotes: 'Completed asphalt resurfacing and roller compaction on 120 sq ft stretch. Seal coat applied.',
        departmentId: 'dept-1',
        departmentName: 'Public Works Department (Roads)',
        assignedWorkerId: 'user-worker-1',
        assignedWorkerName: 'Ramesh Kumar',
        assignedWorkerPhone: '+91 99222 33445',
        assignedAt: subHours(90),
        actualResolvedDate: subHours(24),
        upvotes: 22,
        upvotedByUserIds: ['user-citizen-2', 'user-citizen-3'],
        duplicateCount: 1,
        feedback: {
          rating: 4,
          comment: 'Good repair work, road is smooth now.',
          isResolvedConfirmed: true,
          citizenName: 'Rahul Sharma',
          createdAt: subHours(20),
        },
        createdAt: subHours(96),
        updatedAt: subHours(20),
      },
      {
        ticketNumber: 'CIV-2026-00110',
        title: 'Waste Clearance & Sanitized Community Point',
        description: 'Complete mechanical clearance of garbage dump followed by lime powder spraying to sanitize ground.',
        category: 'Garbage',
        status: 'Resolved',
        priority: 'High',
        location: sampleLocations[0],
        reporterId: 'user-citizen-3',
        reporterName: 'Amitabh Sen',
        reporterPhone: '+91 97234 56789',
        images: [SAMPLE_ISSUE_IMAGES[1].url],
        beforeImage: SAMPLE_ISSUE_IMAGES[1].url,
        afterImage: SAMPLE_ISSUE_IMAGES[1].resolvedUrl,
        resolutionNotes: '3 tonnes of solid waste lifted via compactor truck. Bleaching powder and disinfectant applied.',
        departmentId: 'dept-2',
        departmentName: 'Solid Waste & Sanitation Wing',
        assignedWorkerId: 'user-worker-2',
        assignedWorkerName: 'Suresh Gaikwad',
        assignedWorkerPhone: '+91 99222 77889',
        assignedAt: subHours(60),
        actualResolvedDate: subHours(18),
        upvotes: 19,
        upvotedByUserIds: ['user-citizen-1'],
        duplicateCount: 0,
        feedback: {
          rating: 5,
          comment: 'Very clean now. Much appreciated!',
          isResolvedConfirmed: true,
          citizenName: 'Amitabh Sen',
          createdAt: subHours(14),
        },
        createdAt: subHours(64),
        updatedAt: subHours(14),
      },
    ];

    this.issues = rawIssues.map((raw, idx) => {
      const id = `issue-${idx + 1}`;
      const createdAt = raw.createdAt || subHours(10);
      const category = raw.category || 'Road Damage';
      const priority = raw.priority || 'Medium';
      const upvotes = raw.upvotes || 0;
      const duplicateCount = raw.duplicateCount || 0;

      const priorityScore = this.calculatePriorityScore({
        severity: priority,
        upvotes,
        duplicateCount,
        category,
        createdAt,
      });

      const sla = this.calculateSLA(category, priority, createdAt);

      const timeline = this.buildTimelineForIssue(raw as any, createdAt);

      const comments = [
        {
          id: `comment-${id}-1`,
          userId: raw.reporterId || 'user-citizen-1',
          userName: raw.reporterName || 'Rahul Sharma',
          userRole: 'CITIZEN' as Role,
          message: 'Please take action at the earliest, this is causing huge disruption to local residents.',
          isInternal: false,
          createdAt: createdAt,
        },
      ];

      if (raw.status !== 'Submitted') {
        comments.push({
          id: `comment-${id}-2`,
          userId: 'user-auth-1',
          userName: 'Rajesh Verma (IAS)',
          userRole: 'AUTHORITY' as Role,
          message: `Verified and prioritized as ${priority}. Work order issued under civic emergency protocol.`,
          isInternal: false,
          createdAt: subHours(8),
        });
      }

      return {
        id,
        ticketNumber: raw.ticketNumber || `CIV-2026-00${this.issueCounter++}`,
        title: raw.title || 'Civic Infrastructure Concern',
        description: raw.description || '',
        category,
        status: raw.status || 'Submitted',
        priority,
        priorityScore,
        location: raw.location || sampleLocations[0],
        reporterId: raw.reporterId || 'user-citizen-1',
        reporterName: raw.reporterName || 'Rahul Sharma',
        reporterPhone: raw.reporterPhone || '+91 98765 43210',
        images: raw.images || [SAMPLE_ISSUE_IMAGES[0].url],
        beforeImage: raw.beforeImage || SAMPLE_ISSUE_IMAGES[0].url,
        afterImage: raw.afterImage,
        resolutionNotes: raw.resolutionNotes,
        aiAnalysis: {
          detectedCategory: category,
          detectedIssue: raw.title || 'Infrastructure Defect',
          confidence: 95,
          severity: priority,
          suggestedPriority: priority,
          summaryDescription: `AI Verified: High visual defect confidence for ${category}. Recommended immediate dispatch.`,
          tags: [category.toLowerCase().replace(/\s+/g, '_'), 'verified', 'sih_civic'],
          safetyHazardsDetected: ['Transit obstruction', 'Public safety risk'],
        },
        departmentId: raw.departmentId,
        departmentName: raw.departmentName,
        assignedWorkerId: raw.assignedWorkerId,
        assignedWorkerName: raw.assignedWorkerName,
        assignedWorkerPhone: raw.assignedWorkerPhone,
        assignedAt: raw.assignedAt,
        sla,
        estimatedResolutionDate: new Date(new Date(createdAt).getTime() + 48 * 3600 * 1000).toISOString(),
        actualResolvedDate: raw.actualResolvedDate,
        upvotes,
        upvotedByUserIds: raw.upvotedByUserIds || [],
        duplicateCount,
        timeline,
        comments,
        feedback: raw.feedback,
        createdAt,
        updatedAt: raw.updatedAt || createdAt,
      };
    });

    // Seed notifications
    this.notifications = [
      {
        id: 'notif-1',
        userId: 'user-citizen-1',
        title: 'Issue Assigned to Field Worker',
        message: 'Your report CIV-2026-00101 has been assigned to Ramesh Kumar (PWD Roads).',
        type: 'ASSIGNMENT',
        issueId: 'issue-1',
        ticketNumber: 'CIV-2026-00101',
        isRead: false,
        createdAt: subHours(12),
      },
      {
        id: 'notif-2',
        userId: 'user-citizen-1',
        title: 'Issue Resolved & Verified',
        message: 'Your street light report CIV-2026-00104 has been marked resolved. Please rate the service.',
        type: 'FEEDBACK',
        issueId: 'issue-4',
        ticketNumber: 'CIV-2026-00104',
        isRead: true,
        createdAt: subHours(16),
      },
      {
        id: 'notif-3',
        userId: 'user-auth-1',
        title: 'Critical SLA Warning',
        message: 'Issue CIV-2026-00103 (Water Pipeline Burst) is approaching its 12h SLA threshold.',
        type: 'SLA_ALERT',
        issueId: 'issue-3',
        ticketNumber: 'CIV-2026-00103',
        isRead: false,
        createdAt: subHours(2),
      },
      {
        id: 'notif-4',
        userId: 'user-worker-1',
        title: 'New Emergency Task Assigned',
        message: 'You have been assigned to clear fallen tree on Sarjapur Road (CIV-2026-00106).',
        type: 'ASSIGNMENT',
        issueId: 'issue-6',
        ticketNumber: 'CIV-2026-00106',
        isRead: false,
        createdAt: subHours(4),
      },
    ];
  }

  private buildTimelineForIssue(raw: Partial<Issue>, createdAt: string): IssueTimelineStep[] {
    const steps: IssueTimelineStep[] = [
      {
        id: 'step-1',
        status: 'Submitted' as IssueStatus,
        title: 'Complaint Registered',
        description: 'Citizen submitted grievance with geotagged photo proof.',
        actorName: raw.reporterName || 'Citizen',
        actorRole: 'CITIZEN' as Role,
        timestamp: createdAt,
      },
      {
        id: 'step-2',
        status: 'Verified' as IssueStatus,
        title: 'AI & Automated Geocheck Verified',
        description: 'AI Vision model verified defect signature with 95% confidence. Priority calculated.',
        actorName: 'CivicPulse AI Engine',
        actorRole: 'ADMIN' as Role,
        timestamp: new Date(new Date(createdAt).getTime() + 15 * 60 * 1000).toISOString(),
      },
    ];

    if (['Assigned', 'In Progress', 'Resolved'].includes(raw.status || '')) {
      steps.push({
        id: 'step-3',
        status: 'Assigned' as IssueStatus,
        title: `Routed to ${raw.departmentName || 'Concerned Dept'}`,
        description: `Authority assigned work order to Field Officer ${raw.assignedWorkerName || 'Field Team'}.`,
        actorName: 'Rajesh Verma (IAS)',
        actorRole: 'AUTHORITY' as Role,
        timestamp: raw.assignedAt || new Date(new Date(createdAt).getTime() + 2 * 3600 * 1000).toISOString(),
      });
    }

    if (['In Progress', 'Resolved'].includes(raw.status || '')) {
      steps.push({
        id: 'step-4',
        status: 'In Progress' as IssueStatus,
        title: 'On-Site Work Initiated',
        description: 'Field worker reached GPS coordinates and began civil restoration works.',
        actorName: raw.assignedWorkerName || 'Field Worker',
        actorRole: 'FIELD_WORKER' as Role,
        timestamp: new Date(new Date(createdAt).getTime() + 5 * 3600 * 1000).toISOString(),
      });
    }

    if (raw.status === 'Resolved') {
      steps.push({
        id: 'step-5',
        status: 'Resolved' as IssueStatus,
        title: 'Resolution Approved & Closed',
        description: raw.resolutionNotes || 'Work successfully completed with geo-referenced after photo.',
        actorName: 'Rajesh Verma (IAS)',
        actorRole: 'AUTHORITY' as Role,
        timestamp: raw.actualResolvedDate || new Date(new Date(createdAt).getTime() + 20 * 3600 * 1000).toISOString(),
        proofImageUrl: raw.afterImage,
      });
    }

    return steps;
  }

  // Find duplicate issues within 500 meters in same category
  checkDuplicates(lat: number, lng: number, category: IssueCategory, title: string) {
    const matches: {
      issue: Issue;
      similarityScore: number;
      distanceMeters: number;
      reason: string;
    }[] = [];

    for (const issue of this.issues) {
      if (issue.status === 'Resolved' || issue.status === 'Rejected') continue;

      const dist = calculateDistanceMeters(lat, lng, issue.location.lat, issue.location.lng);

      if (dist <= 600 && (issue.category === category || issue.title.toLowerCase().includes(title.toLowerCase().split(' ')[0]))) {
        let similarity = 0.5;
        if (issue.category === category) similarity += 0.3;
        if (dist <= 150) similarity += 0.2;

        matches.push({
          issue,
          similarityScore: Math.min(0.98, similarity),
          distanceMeters: dist,
          reason: `${issue.category} report registered ${dist} meters away on ${issue.location.address}`,
        });
      }
    }

    matches.sort((a, b) => b.similarityScore - a.similarityScore);
    return {
      hasDuplicate: matches.length > 0,
      matchingIssues: matches,
    };
  }

  // Create new issue with automated AI scoring & SLA
  createIssue(payload: Partial<Issue> & { location: any }): Issue {
    const id = `issue-${Date.now()}`;
    const ticketNumber = `CIV-2026-00${this.issueCounter++}`;
    const createdAt = new Date().toISOString();
    const category = payload.category || 'Road Damage';
    const priority = payload.priority || 'High';

    const priorityScore = this.calculatePriorityScore({
      severity: priority,
      upvotes: 0,
      duplicateCount: 0,
      category,
      createdAt,
    });

    const sla = this.calculateSLA(category, priority, createdAt);

    // Auto assign department
    const dept = this.departments.find((d) => d.code === CIVIC_CATEGORIES.find((c) => c.name === category)?.departmentCode) || this.departments[0];

    const timeline = [
      {
        id: `step-${Date.now()}-1`,
        status: 'Submitted' as IssueStatus,
        title: 'Complaint Registered',
        description: 'Citizen submitted grievance with geotagged photo proof.',
        actorName: payload.reporterName || 'Citizen',
        actorRole: 'CITIZEN' as Role,
        timestamp: createdAt,
      },
      {
        id: `step-${Date.now()}-2`,
        status: 'Verified' as IssueStatus,
        title: 'AI Verification & Priority Assessment',
        description: `Automated AI Vision scored issue at ${priorityScore.score}/100 [${priority}]. Assigned to ${dept.name}.`,
        actorName: 'CivicPulse AI Engine',
        actorRole: 'ADMIN' as Role,
        timestamp: new Date(Date.now() + 2000).toISOString(),
      },
    ];

    const newIssue: Issue = {
      id,
      ticketNumber,
      title: payload.title || `${category} on ${payload.location.address}`,
      description: payload.description || '',
      category,
      status: 'Submitted',
      priority,
      priorityScore,
      location: payload.location,
      reporterId: payload.reporterId || 'user-citizen-1',
      reporterName: payload.reporterName || 'Rahul Sharma',
      reporterPhone: payload.reporterPhone || '+91 98765 43210',
      images: payload.images && payload.images.length > 0 ? payload.images : [payload.beforeImage || SAMPLE_ISSUE_IMAGES[0].url],
      beforeImage: payload.beforeImage || (payload.images && payload.images[0]) || SAMPLE_ISSUE_IMAGES[0].url,
      aiAnalysis: payload.aiAnalysis,
      departmentId: dept.id,
      departmentName: dept.name,
      sla,
      estimatedResolutionDate: new Date(Date.now() + sla.slaHours * 3600 * 1000).toISOString(),
      upvotes: 1,
      upvotedByUserIds: [payload.reporterId || 'user-citizen-1'],
      duplicateCount: 0,
      timeline,
      comments: [
        {
          id: `comment-${Date.now()}`,
          userId: payload.reporterId || 'user-citizen-1',
          userName: payload.reporterName || 'Rahul Sharma',
          userRole: 'CITIZEN',
          message: payload.description || 'Issue submitted for municipal review.',
          isInternal: false,
          createdAt: createdAt,
        },
      ],
      createdAt,
      updatedAt: createdAt,
    };

    this.issues.unshift(newIssue);

    // Update citizen points
    const reporter = this.users.find((u) => u.id === newIssue.reporterId);
    if (reporter) {
      reporter.civicScore = (reporter.civicScore || 0) + 10;
      reporter.reportsSubmitted = (reporter.reportsSubmitted || 0) + 1;
    }

    // Add notification for Authority
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: 'user-auth-1',
      title: `New ${priority} Civic Issue`,
      message: `${newIssue.ticketNumber}: ${newIssue.title} reported on ${newIssue.location.address}.`,
      type: 'NEW_REPORT',
      issueId: newIssue.id,
      ticketNumber: newIssue.ticketNumber,
      isRead: false,
      createdAt,
    });

    return newIssue;
  }
}

export const db = new CivicDatabase();
