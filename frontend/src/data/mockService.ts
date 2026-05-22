/**
 * mockService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Returns mock/demo data for all dashboards.
 * Auth (login, signup, onboarding) uses real Supabase — only the dashboard
 * data displayed is replaced with this rich mock dataset.
 */

import {
  mockDocuments,
  mockNotifications,
  mockActiveCases,
  mockHearings,
  mockReviewQueue,
  mockClients,
  mockActivityData,
  mockWeeklyReviews,
  mockLawyerProfile,
} from './mockData';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

const formatDateIN = (dateStr: string) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';

// ─── Client Dashboard ─────────────────────────────────────────────────────────

export const getMockClientDocuments = async () => {
  await delay();
  return mockDocuments
    .filter(d => d.clientId === 'u1')
    .map(doc => ({
      id: doc.id,
      title: doc.title,
      type: doc.type,
      status: doc.status,
      createdAt: formatDateIN(doc.createdAt),
      lawyerName: doc.lawyerName || '',
    }));
};

export const getMockClientNotifications = async () => {
  await delay();
  return mockNotifications.map(n => ({
    id: n.id,
    text: n.text,
    type: n.type,
    timestamp: n.timestamp,
    read: n.read,
    icon: n.icon,
  }));
};

export const getMockActiveCase = async () => {
  await delay();
  const c = mockActiveCases[0];
  if (!c) return null;
  return {
    id: c.id,
    caseNumber: c.caseNumber,
    court: c.court,
    nextHearing: formatDateIN(c.nextHearing),
    stage: c.stage,
    title: c.title,
  };
};

export const getMockClientHearings = async () => {
  await delay();
  return mockHearings.map(h => ({
    id: h.id,
    date: h.date,
    time: h.time,
    caseTitle: h.caseTitle,
    court: h.court,
  }));
};

export const getMockActivityData = () => mockActivityData;

// ─── My Documents page ────────────────────────────────────────────────────────

export const getMockAllClientDocuments = async () => {
  await delay();
  return mockDocuments
    .filter(d => d.clientId === 'u1')
    .map(doc => ({
      id: doc.id,
      title: doc.title,
      type: doc.type,
      status: doc.status,
      createdAt: formatDateIN(doc.createdAt),
      updatedAt: formatDateIN(doc.updatedAt),
      clientId: doc.clientId,
      clientName: doc.clientName,
      lawyerId: doc.lawyerId || '',
      lawyerName: doc.lawyerName || '',
      content: doc.content || '',
      riskScore: doc.riskScore,
    }));
};

// ─── Lawyer Dashboard ─────────────────────────────────────────────────────────

export const getMockLawyerQueue = async () => {
  await delay();
  const reviewDocs = mockDocuments.filter(
    d => d.lawyerId === 'u2' && (d.status === 'Under Review' || d.status === 'Draft')
  );
  return reviewDocs.map(doc => ({
    id: doc.id,
    title: doc.title,
    type: doc.type,
    status: doc.status,
    created_at: doc.createdAt + 'T09:00:00.000Z',
    updated_at: doc.updatedAt + 'T12:00:00.000Z',
    version: 1,
    district: 'Pune',
    client: {
      id: doc.clientId,
      full_name: doc.clientName,
      avatar_initials: doc.clientName
        ? doc.clientName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
        : 'PD',
      email: 'priya.deshmukh@gmail.com',
      phone: '+91-98765-43210',
    },
  }));
};

export const getMockLawyerStats = async () => {
  await delay();
  const queue = await getMockLawyerQueue();
  return {
    total: queue.length,
    urgent: 1,
    reviewedToday: 2,
    avgTurnaround: '1.8d',
  };
};

export const getMockLawyerClients = async () => {
  await delay();
  return mockClients
    .filter(c => c.assignedLawyer === 'Adv. Rahul Vijay Joshi')
    .map(c => ({
      id: c.id,
      full_name: c.name,
      avatar_initials: c.initials,
      email: c.email,
      docCount: c.caseCount,
    }));
};

export const getMockWeeklyReviews = () => mockWeeklyReviews;

// ─── Review Queue page ────────────────────────────────────────────────────────

export const getMockReviewQueuePage = async () => {
  await delay();
  return mockReviewQueue.map(item => ({
    id: item.documentId,
    title: item.documentTitle,
    type: item.documentType,
    status: 'under_review',
    created_at: new Date(
      Date.now() -
        (item.priority === 'HIGH' ? 3 : item.priority === 'MEDIUM' ? 28 : 72) * 3600_000
    ).toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
    district: 'Pune',
    client: {
      id: 'u1',
      full_name: item.clientName,
      avatar_initials: item.clientName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      email: 'priya.deshmukh@gmail.com',
      phone: '+91-98765-43210',
    },
  }));
};

// ─── Lawyer Profile ───────────────────────────────────────────────────────────
export const getMockLawyerProfile = () => mockLawyerProfile;
