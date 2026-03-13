// ============================================================
// TypeScript Interfaces & Types for JurisAI
// ============================================================

export type UserRole = 'client' | 'lawyer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  cnic?: string;
  city?: string;
  barCouncilNumber?: string;
}

export type DocumentType =
  | 'Wakalatnama'
  | 'Petition'
  | 'Affidavit'
  | 'Bail Application'
  | 'Business Agreement'
  | 'Rental Agreement';

export type DocumentStatus =
  | 'Draft'
  | 'Under Review'
  | 'Finalized'
  | 'Revision Needed';

export interface LegalDocument {
  id: string;
  title: string;
  type: DocumentType;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
  clientId: string;
  clientName: string;
  lawyerId?: string;
  lawyerName?: string;
  content: string;
  riskScore?: number;
}

export interface CaseResult {
  id: string;
  caseName: string;
  citation: string;
  court: string;
  year: number;
  domain: string;
  summary: string;
  keyPhrases: string[];
  fullText: string;
  relatedCases: string[];
  saved?: boolean;
}

export type RiskSeverity = 'HIGH' | 'MEDIUM' | 'LOW';

export interface RiskFlag {
  id: string;
  severity: RiskSeverity;
  clauseRef: string;
  title: string;
  description: string;
  originalText: string;
  suggestedRevision: string;
}

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export interface Notification {
  id: string;
  text: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  icon: string;
}

export type ReviewPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ReviewQueueItem {
  id: string;
  documentId: string;
  documentTitle: string;
  clientName: string;
  priority: ReviewPriority;
  receivedAt: string;
  documentType: DocumentType;
}

export interface ActivityData {
  month: string;
  documents: number;
  cases?: number;
  reviews?: number;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}
