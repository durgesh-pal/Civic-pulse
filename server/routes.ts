import express from 'express';
import { db } from './db';
import { analyzeCivicImage, generateCivicChatReply } from './gemini';
import { IssuePriority, IssueStatus, Role } from '../src/types';

export const apiRouter = express.Router();

// ==================== AUTHENTICATION ====================
apiRouter.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.json({
    user,
    token: `jwt_token_${user.id}_${Date.now()}`,
  });
});

apiRouter.post('/auth/demo-login', (req, res) => {
  const { role } = req.body;
  const user = db.users.find((u) => u.role === (role || 'CITIZEN'));

  if (!user) {
    return res.status(404).json({ error: 'Demo user not found' });
  }

  res.json({
    user,
    token: `jwt_token_${user.id}_${Date.now()}`,
  });
});

apiRouter.get('/auth/me', (req, res) => {
  const userId = req.query.userId as string;
  const user = db.users.find((u) => u.id === userId) || db.users[0];
  res.json({ user });
});

apiRouter.get('/users', (req, res) => {
  res.json({ users: db.users });
});

apiRouter.get('/workers', (req, res) => {
  const workers = db.users.filter((u) => u.role === 'FIELD_WORKER');
  res.json({ workers });
});

apiRouter.get('/departments', (req, res) => {
  res.json({ departments: db.departments });
});

// ==================== ISSUES API ====================
apiRouter.get('/issues', (req, res) => {
  const { status, category, priority, departmentId, reporterId, assignedWorkerId, search, limit } = req.query;

  let list = [...db.issues];

  if (status && status !== 'All') {
    list = list.filter((i) => i.status === status);
  }
  if (category && category !== 'All') {
    list = list.filter((i) => i.category === category);
  }
  if (priority && priority !== 'All') {
    list = list.filter((i) => i.priority === priority);
  }
  if (departmentId) {
    list = list.filter((i) => i.departmentId === departmentId);
  }
  if (reporterId) {
    list = list.filter((i) => i.reporterId === reporterId);
  }
  if (assignedWorkerId) {
    list = list.filter((i) => i.assignedWorkerId === assignedWorkerId);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(
      (i) =>
        i.ticketNumber.toLowerCase().includes(q) ||
        i.title.toLowerCase().includes(q) ||
        i.location.address.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
    );
  }

  // Always refresh dynamic SLA remaining hours on fetch
  list = list.map((i) => ({
    ...i,
    sla: db.calculateSLA(i.category, i.priority, i.createdAt),
  }));

  if (limit) {
    list = list.slice(0, Number(limit));
  }

  res.json({ issues: list, count: list.length });
});

apiRouter.get('/issues/:id', (req, res) => {
  const issue = db.issues.find((i) => i.id === req.params.id || i.ticketNumber === req.params.id);
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  // Refresh SLA info
  const refreshedSla = db.calculateSLA(issue.category, issue.priority, issue.createdAt);
  issue.sla = refreshedSla;

  res.json({ issue });
});

apiRouter.post('/issues/create', (req, res) => {
  try {
    const newIssue = db.createIssue(req.body);
    res.status(201).json({ issue: newIssue });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create issue' });
  }
});

// Check duplicates before submitting
apiRouter.post('/issues/check-duplicates', (req, res) => {
  const { lat, lng, category, title } = req.body;
  const result = db.checkDuplicates(Number(lat) || 12.9784, Number(lng) || 77.6408, category || 'Road Damage', title || '');
  res.json(result);
});

// Upvote issue
apiRouter.post('/issues/:id/upvote', (req, res) => {
  const { userId } = req.body;
  const issue = db.issues.find((i) => i.id === req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  const voterId = userId || 'user-citizen-1';
  if (!issue.upvotedByUserIds.includes(voterId)) {
    issue.upvotedByUserIds.push(voterId);
    issue.upvotes = issue.upvotedByUserIds.length;

    // Recalculate priority score
    issue.priorityScore = db.calculatePriorityScore({
      severity: issue.priority,
      upvotes: issue.upvotes,
      duplicateCount: issue.duplicateCount,
      category: issue.category,
      createdAt: issue.createdAt,
    });

    // Reward citizen
    const user = db.users.find((u) => u.id === voterId);
    if (user) {
      user.civicScore = (user.civicScore || 0) + 2;
    }
  }

  res.json({ issue, upvotes: issue.upvotes });
});

// Add comment
apiRouter.post('/issues/:id/comments', (req, res) => {
  const { message, userId, userName, userRole, isInternal } = req.body;
  const issue = db.issues.find((i) => i.id === req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  const newComment = {
    id: `comment-${Date.now()}`,
    userId: userId || 'user-citizen-1',
    userName: userName || 'Rahul Sharma',
    userRole: (userRole || 'CITIZEN') as Role,
    message: message || '',
    isInternal: Boolean(isInternal),
    createdAt: new Date().toISOString(),
  };

  issue.comments.push(newComment);
  res.json({ comment: newComment, comments: issue.comments });
});

// Authority Assign Department / Worker
apiRouter.post('/issues/:id/assign', (req, res) => {
  const { departmentId, workerId, deadline, priority, authorityName } = req.body;
  const issue = db.issues.find((i) => i.id === req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  const dept = db.departments.find((d) => d.id === departmentId);
  const worker = db.users.find((u) => u.id === workerId);

  if (dept) {
    issue.departmentId = dept.id;
    issue.departmentName = dept.name;
  }
  if (worker) {
    issue.assignedWorkerId = worker.id;
    issue.assignedWorkerName = worker.name;
    issue.assignedWorkerPhone = worker.phone;
    issue.assignedAt = new Date().toISOString();
  }
  if (priority) {
    issue.priority = priority as IssuePriority;
  }

  issue.status = 'Assigned';
  issue.updatedAt = new Date().toISOString();

  // Add timeline step
  issue.timeline.push({
    id: `step-${Date.now()}`,
    status: 'Assigned',
    title: `Assigned to ${dept?.name || 'Department'}`,
    description: `Assigned to Field Officer ${worker?.name || 'Team'} by ${authorityName || 'Authority'}. Target deadline set.`,
    actorName: authorityName || 'Rajesh Verma (IAS)',
    actorRole: 'AUTHORITY',
    timestamp: new Date().toISOString(),
  });

  // Notify Worker
  if (worker) {
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: worker.id,
      title: 'New Field Work Assignment',
      message: `You were assigned ${issue.ticketNumber} (${issue.title}) at ${issue.location.address}.`,
      type: 'ASSIGNMENT',
      issueId: issue.id,
      ticketNumber: issue.ticketNumber,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  }

  // Notify Citizen
  db.notifications.unshift({
    id: `notif-${Date.now()}-cit`,
    userId: issue.reporterId,
    title: 'Report Assigned to Field Team',
    message: `Your report ${issue.ticketNumber} has been assigned to ${dept?.name || 'Department'}. Worker: ${worker?.name || 'Assigned Officer'}.`,
    type: 'STATUS_CHANGE',
    issueId: issue.id,
    ticketNumber: issue.ticketNumber,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  res.json({ issue });
});

// Update Status (Worker Starts Work, Reject, Verify)
apiRouter.post('/issues/:id/status', (req, res) => {
  const { status, remarks, actorName, actorRole } = req.body;
  const issue = db.issues.find((i) => i.id === req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  const oldStatus = issue.status;
  issue.status = status as IssueStatus;
  issue.updatedAt = new Date().toISOString();

  issue.timeline.push({
    id: `step-${Date.now()}`,
    status: status as IssueStatus,
    title: `Status Changed to ${status}`,
    description: remarks || `Status transitioned from ${oldStatus} to ${status}.`,
    actorName: actorName || 'System',
    actorRole: (actorRole || 'AUTHORITY') as Role,
    timestamp: new Date().toISOString(),
  });

  res.json({ issue });
});

// Field Worker Submits Resolution with After Photo
apiRouter.post('/issues/:id/resolve-submit', (req, res) => {
  const { afterImage, resolutionNotes, workerName } = req.body;
  const issue = db.issues.find((i) => i.id === req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  issue.afterImage = afterImage || issue.beforeImage;
  issue.resolutionNotes = resolutionNotes || 'Work completed on site according to engineering specifications.';
  issue.status = 'In Progress'; // awaiting authority verification or marked for verification

  issue.timeline.push({
    id: `step-${Date.now()}`,
    status: 'In Progress',
    title: 'Resolution Evidence Submitted',
    description: `Field Worker ${workerName || 'Officer'} uploaded after-repair photo evidence for Authority approval.`,
    actorName: workerName || 'Ramesh Kumar',
    actorRole: 'FIELD_WORKER',
    timestamp: new Date().toISOString(),
    proofImageUrl: issue.afterImage,
  });

  // Notify Authority to verify
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: 'user-auth-1',
    title: 'Resolution Verification Required',
    message: `${issue.ticketNumber} resolution submitted by ${workerName || 'Worker'}. Please verify before/after photos.`,
    type: 'STATUS_CHANGE',
    issueId: issue.id,
    ticketNumber: issue.ticketNumber,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  res.json({ issue });
});

// Authority Approves Resolution -> Status becomes RESOLVED
apiRouter.post('/issues/:id/verify-resolution', (req, res) => {
  const { approved, remarks, authorityName } = req.body;
  const issue = db.issues.find((i) => i.id === req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  if (approved) {
    issue.status = 'Resolved';
    issue.actualResolvedDate = new Date().toISOString();
    issue.updatedAt = new Date().toISOString();

    issue.timeline.push({
      id: `step-${Date.now()}`,
      status: 'Resolved',
      title: 'Resolution Verified & Closed',
      description: remarks || 'Authority verified physical work quality via photo comparison. Ticket marked Resolved.',
      actorName: authorityName || 'Rajesh Verma (IAS)',
      actorRole: 'AUTHORITY',
      timestamp: new Date().toISOString(),
      proofImageUrl: issue.afterImage,
    });

    // Notify Citizen to give rating
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: issue.reporterId,
      title: 'Issue Resolved! Please Rate Us',
      message: `Your grievance ${issue.ticketNumber} has been resolved. Tap to see before/after comparison and share feedback.`,
      type: 'FEEDBACK',
      issueId: issue.id,
      ticketNumber: issue.ticketNumber,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    // Reward citizen points for resolved report
    const reporter = db.users.find((u) => u.id === issue.reporterId);
    if (reporter) {
      reporter.reportsResolved = (reporter.reportsResolved || 0) + 1;
    }
  } else {
    // Rework requested
    issue.status = 'In Progress';
    issue.timeline.push({
      id: `step-${Date.now()}`,
      status: 'In Progress',
      title: 'Rework Requested by Authority',
      description: remarks || 'Quality check failed. Additional remediation needed on site.',
      actorName: authorityName || 'Rajesh Verma (IAS)',
      actorRole: 'AUTHORITY',
      timestamp: new Date().toISOString(),
    });

    if (issue.assignedWorkerId) {
      db.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: issue.assignedWorkerId,
        title: 'Rework Requested on Task',
        message: `Authority requested revision on ${issue.ticketNumber}: ${remarks || 'Review photo evidence.'}`,
        type: 'STATUS_CHANGE',
        issueId: issue.id,
        ticketNumber: issue.ticketNumber,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  res.json({ issue });
});

// Citizen Submits Feedback & Rating
apiRouter.post('/issues/:id/feedback', (req, res) => {
  const { rating, comment, isResolvedConfirmed, citizenName, userId } = req.body;
  const issue = db.issues.find((i) => i.id === req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  issue.feedback = {
    rating: Number(rating) || 5,
    comment: comment || 'Issue resolved satisfactorily.',
    isResolvedConfirmed: isResolvedConfirmed !== false,
    citizenName: citizenName || 'Citizen',
    createdAt: new Date().toISOString(),
  };

  // Reward citizen for feedback
  const user = db.users.find((u) => u.id === (userId || issue.reporterId));
  if (user) {
    user.civicScore = (user.civicScore || 0) + 5;
  }

  res.json({ issue, feedback: issue.feedback });
});

// ==================== AI VISION & CHAT ====================
apiRouter.post('/ai/analyze-image', async (req, res) => {
  try {
    const { image, description, category } = req.body;
    const result = await analyzeCivicImage(image, description, category);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'AI analysis failed' });
  }
});

apiRouter.post('/ai/chat', async (req, res) => {
  try {
    const { message, userRole } = req.body;
    const reply = await generateCivicChatReply(message || '', {
      totalIssues: db.issues.length,
      userRole,
      recentIssues: db.issues.slice(0, 5),
    });
    res.json({ reply });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'AI chat failed' });
  }
});

// ==================== ANALYTICS & DASHBOARDS ====================
apiRouter.get('/analytics', (req, res) => {
  const total = db.issues.length;
  const resolved = db.issues.filter((i) => i.status === 'Resolved').length;
  const inProgress = db.issues.filter((i) => i.status === 'In Progress' || i.status === 'Assigned').length;
  const pending = db.issues.filter((i) => i.status === 'Submitted' || i.status === 'Under Review' || i.status === 'Verified').length;
  const critical = db.issues.filter((i) => i.priority === 'Critical').length;
  const overdue = db.issues.filter((i) => i.sla.isOverdue && i.status !== 'Resolved').length;

  // Category counts
  const categoryCounts: Record<string, number> = {};
  for (const issue of db.issues) {
    categoryCounts[issue.category] = (categoryCounts[issue.category] || 0) + 1;
  }

  // Priority counts
  const priorityCounts: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  for (const issue of db.issues) {
    priorityCounts[issue.priority] = (priorityCounts[issue.priority] || 0) + 1;
  }

  // Department loads
  const departmentStats = db.departments.map((dept) => {
    const deptIssues = db.issues.filter((i) => i.departmentId === dept.id);
    const deptResolved = deptIssues.filter((i) => i.status === 'Resolved').length;
    return {
      name: dept.name,
      code: dept.code,
      total: deptIssues.length,
      resolved: deptResolved,
      pending: deptIssues.length - deptResolved,
      complianceRate: dept.slaComplianceRate,
    };
  });

  // Recent 7 days trend
  const dailyTrends = [
    { day: 'Mon', reported: 14, resolved: 11 },
    { day: 'Tue', reported: 18, resolved: 16 },
    { day: 'Wed', reported: 12, resolved: 14 },
    { day: 'Thu', reported: 22, resolved: 19 },
    { day: 'Fri', reported: 25, resolved: 21 },
    { day: 'Sat', reported: 16, resolved: 18 },
    { day: 'Sun', reported: 11, resolved: 13 },
  ];

  res.json({
    summary: {
      totalReports: total,
      resolvedReports: resolved,
      inProgressReports: inProgress,
      pendingReports: pending,
      criticalReports: critical,
      overdueReports: overdue,
      resolutionRate: Math.round((resolved / (total || 1)) * 100),
      averageResolutionHours: 28.4,
      citizenSatisfactionScore: 4.8,
    },
    categoryDistribution: Object.keys(categoryCounts).map((cat) => ({
      category: cat,
      count: categoryCounts[cat],
    })),
    priorityDistribution: Object.keys(priorityCounts).map((p) => ({
      priority: p,
      count: priorityCounts[p],
    })),
    departmentStats,
    dailyTrends,
  });
});

// ==================== NOTIFICATIONS ====================
apiRouter.get('/notifications', (req, res) => {
  const { userId } = req.query;
  const list = userId ? db.notifications.filter((n) => n.userId === userId) : db.notifications;
  res.json({ notifications: list });
});

apiRouter.post('/notifications/mark-read', (req, res) => {
  const { id } = req.body;
  const notif = db.notifications.find((n) => n.id === id);
  if (notif) notif.isRead = true;
  res.json({ success: true });
});

apiRouter.post('/notifications/mark-all-read', (req, res) => {
  const { userId } = req.body;
  db.notifications.forEach((n) => {
    if (!userId || n.userId === userId) {
      n.isRead = true;
    }
  });
  res.json({ success: true });
});

// Reset demo data to pristine state
apiRouter.post('/system/reset-demo-data', (req, res) => {
  db.seed();
  res.json({ success: true, message: 'Civic database re-seeded with demo records' });
});
