/**
 * mockService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides the same data contracts as Supabase queries but backed by the
 * static mockData.ts objects.  Import these helpers in each page/hook when
 * REACT_APP_MOCK_MODE === 'true' so the whole app works without a live backend.
 *
 * All functions return a promise so they're drop-in async replacements.
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

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

const formatDateIN = (dateStr: string) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';

// ─────────────────────────────────────────────────────────────────────────────
// Mock Users / Auth
// ─────────────────────────────────────────────────────────────────────────────

/** The mock client profile (maps to Profile shape in AuthContext) */
export const MOCK_CLIENT_USER = {
  id: 'u1',
  role: 'client' as const,
  full_name: 'Priya Suresh Deshmukh',
  email: 'priya.deshmukh@gmail.com',
  phone: '+91-98765-43210',
  city: 'Pune',
  avatar_initials: 'PD',
  bar_number: null,
  specialization: null,
  rating: null,
  is_onboarded: true,
  // compatibility
  name: 'Priya Suresh Deshmukh',
  barCouncilNumber: '',
  cnic: 'XXXX-XXXX-4321',
};

/** The mock lawyer profile */
export const MOCK_LAWYER_USER = {
  id: 'u2',
  role: 'lawyer' as const,
  full_name: 'Adv. Rahul Vijay Joshi',
  email: 'rahul.joshi@legalchambers.in',
  phone: '+91-98234-56789',
  city: 'Pune',
  avatar_initials: 'RJ',
  bar_number: 'MH/4521/2017',
  specialization: 'Criminal Law, Property Law, Civil Litigation',
  rating: 4.8,
  is_onboarded: true,
  // compatibility
  name: 'Adv. Rahul Vijay Joshi',
  barCouncilNumber: 'MH/4521/2017',
};

// ─────────────────────────────────────────────────────────────────────────────
// Client Dashboard data
// ─────────────────────────────────────────────────────────────────────────────

/** Returns documents formatted for the Client Dashboard table */
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

/** Returns notifications formatted for the client */
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

/** Returns the most recent active case for the client */
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

/** Returns upcoming hearings for the client */
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

/** Returns mock activity data for the chart */
export const getMockActivityData = () => mockActivityData;

// ─────────────────────────────────────────────────────────────────────────────
// My Documents page
// ─────────────────────────────────────────────────────────────────────────────

/** Returns full document list for the My Documents page */
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

/** Simulates deleting a document (filters from mock array in-memory) */
export const deleteMockDocument = async (id: string, current: any[]) => {
  await delay(200);
  return current.filter(d => d.id !== id);
};

// ─────────────────────────────────────────────────────────────────────────────
// Lawyer Dashboard data
// ─────────────────────────────────────────────────────────────────────────────

/** Review queue items formatted for the Lawyer Dashboard */
export const getMockLawyerQueue = async () => {
  await delay();
  // Return documents that are under review or draft (lawyer u2 perspective)
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
        ? doc.clientName
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        : 'PD',
      email: 'priya.deshmukh@gmail.com',
      phone: '+91-98765-43210',
    },
  }));
};

/** Returns mock lawyer stats */
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

/** Returns unique clients for the lawyer */
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

/** Weekly review activity data */
export const getMockWeeklyReviews = () => mockWeeklyReviews;

// ─────────────────────────────────────────────────────────────────────────────
// Review Queue page
// ─────────────────────────────────────────────────────────────────────────────

/** Full review queue for the ReviewQueue page */
export const getMockReviewQueuePage = async () => {
  await delay();
  return mockReviewQueue.map(item => ({
    id: item.documentId,
    title: item.documentTitle,
    type: item.documentType,
    status: 'under_review',
    created_at: new Date(Date.now() - (item.priority === 'HIGH' ? 3 : item.priority === 'MEDIUM' ? 28 : 72) * 3600_000).toISOString(),
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

// ─────────────────────────────────────────────────────────────────────────────
// Lawyer profile
// ─────────────────────────────────────────────────────────────────────────────
export const getMockLawyerProfile = () => mockLawyerProfile;

// ─────────────────────────────────────────────────────────────────────────────
// Flag check
// ─────────────────────────────────────────────────────────────────────────────
export const IS_MOCK_MODE = process.env.REACT_APP_MOCK_MODE === 'true';

/** Returns which role to show in mock mode — check URL param ?role=lawyer */
export const getMockRole = (): 'client' | 'lawyer' => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.get('role') === 'lawyer') return 'lawyer';
  }
  return 'client';
};
