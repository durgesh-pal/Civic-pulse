import { IssueCategory, IssuePriority } from '../types';

export const CIVIC_CATEGORIES: {
  name: IssueCategory;
  description: string;
  icon: string;
  departmentCode: string;
  defaultSlaHours: Record<IssuePriority, number>;
}[] = [
  {
    name: 'Road Damage',
    description: 'Potholes, broken asphalt, craters, road sinking, damaged dividers',
    icon: 'Hammer',
    departmentCode: 'PWD_ROAD',
    defaultSlaHours: { Critical: 24, High: 48, Medium: 72, Low: 168 },
  },
  {
    name: 'Garbage',
    description: 'Overflowing dustbins, illegal dumping, littering, animal waste',
    icon: 'Trash2',
    departmentCode: 'SWM_SAN',
    defaultSlaHours: { Critical: 12, High: 24, Medium: 48, Low: 72 },
  },
  {
    name: 'Street Light',
    description: 'Non-functional lights, dangling wires, flickering lamps, broken poles',
    icon: 'Lightbulb',
    departmentCode: 'ELEC_DEPT',
    defaultSlaHours: { Critical: 24, High: 48, Medium: 72, Low: 120 },
  },
  {
    name: 'Water Leakage',
    description: 'Burst pipeline, contaminated supply, low pressure, valve leak',
    icon: 'Droplets',
    departmentCode: 'WATER_BOARD',
    defaultSlaHours: { Critical: 12, High: 24, Medium: 48, Low: 96 },
  },
  {
    name: 'Drainage',
    description: 'Clogged storm drains, overflowing sewage, broken manhole covers',
    icon: 'Waves',
    departmentCode: 'DRAIN_ENG',
    defaultSlaHours: { Critical: 18, High: 36, Medium: 72, Low: 120 },
  },
  {
    name: 'Traffic',
    description: 'Broken traffic lights, missing signage, dangerous road intersections',
    icon: 'ShieldAlert',
    departmentCode: 'TRAFFIC_DIV',
    defaultSlaHours: { Critical: 12, High: 24, Medium: 48, Low: 72 },
  },
  {
    name: 'Public Sanitation',
    description: 'Dirty public toilets, stagnant dirty water, foul odor in public places',
    icon: 'Sparkles',
    departmentCode: 'SWM_SAN',
    defaultSlaHours: { Critical: 24, High: 48, Medium: 72, Low: 120 },
  },
  {
    name: 'Fallen Trees',
    description: 'Uprooted trees blocking roads, dangerous hanging tree branches',
    icon: 'Trees',
    departmentCode: 'HORTI_DEPT',
    defaultSlaHours: { Critical: 12, High: 24, Medium: 48, Low: 72 },
  },
  {
    name: 'Public Safety',
    description: 'Open construction pits, unprotected high voltage boxes, unsafe structures',
    icon: 'AlertTriangle',
    departmentCode: 'MUNICIPAL_CORP',
    defaultSlaHours: { Critical: 12, High: 24, Medium: 36, Low: 72 },
  },
  {
    name: 'Other',
    description: 'Encroachments, noise pollution, stray animals, general civic issues',
    icon: 'HelpCircle',
    departmentCode: 'MUNICIPAL_CORP',
    defaultSlaHours: { Critical: 24, High: 48, Medium: 72, Low: 168 },
  },
];

export const DEMO_USERS = [
  {
    role: 'CITIZEN',
    name: 'Rahul Sharma',
    email: 'citizen@sih.gov.in',
    password: 'password123',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    civicScore: 185,
    badge: 'Civic Hero',
    location: 'Indiranagar, Bengaluru, Karnataka',
  },
  {
    role: 'AUTHORITY',
    name: 'Rajesh Verma (IAS)',
    email: 'authority@sih.gov.in',
    password: 'password123',
    phone: '+91 98111 22334',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    departmentName: 'Municipal Corporation HQ',
    assignedArea: 'Central Municipal Zone',
  },
  {
    role: 'FIELD_WORKER',
    name: 'Ramesh Kumar',
    email: 'worker@sih.gov.in',
    password: 'password123',
    phone: '+91 99222 33445',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    departmentName: 'Road Maintenance Division',
    assignedArea: 'Zone 4, Sector B',
  },
  {
    role: 'ADMIN',
    name: 'Dr. Meenakshi Sundaram',
    email: 'admin@sih.gov.in',
    password: 'password123',
    phone: '+91 98333 44556',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    departmentName: 'Smart City Mission Command',
    assignedArea: 'Pan-City Administration',
  },
];

// Sample images with realistic civic issues for instant demo testing
export const SAMPLE_ISSUE_IMAGES = [
  {
    id: 'pothole-1',
    category: 'Road Damage',
    title: 'Severe Pothole on Arterial Road',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    resolvedUrl: 'https://images.unsplash.com/photo-1578885136359-16c8bd4d3a8e?w=800&auto=format&fit=crop&q=80',
    severity: 'High',
    description: 'Deep hazardous crater with exposed aggregate on main transit road.',
  },
  {
    id: 'garbage-1',
    category: 'Garbage',
    title: 'Overflowing Waste Dump on Footpath',
    url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80',
    resolvedUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800&auto=format&fit=crop&q=80',
    severity: 'High',
    description: 'Municipal waste overflow spreading onto pedestrian walking path.',
  },
  {
    id: 'streetlight-1',
    category: 'Street Light',
    title: 'Broken Street Light & Dangling Wire',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    resolvedUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
    severity: 'Medium',
    description: 'Street lamp fixture non-functional causing complete blackout on street.',
  },
  {
    id: 'water-1',
    category: 'Water Leakage',
    title: 'Major Water Main Pipe Burst',
    url: 'https://images.unsplash.com/photo-1584467735868-71825838031d?w=800&auto=format&fit=crop&q=80',
    resolvedUrl: 'https://images.unsplash.com/photo-1584467735870-87a41aa37582?w=800&auto=format&fit=crop&q=80',
    severity: 'Critical',
    description: 'Potable water pipeline rupture flooding street and causing water loss.',
  },
  {
    id: 'drainage-1',
    category: 'Drainage',
    title: 'Blocked Stormwater Drain / Waterlogging',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
    resolvedUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    severity: 'High',
    description: 'Clogged drainage grate preventing monsoon runoff and flooding junction.',
  },
];
