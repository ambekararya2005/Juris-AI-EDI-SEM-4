import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Layout from './components/layout/Layout';

// Auth pages
import Login from './pages/auth/Login';

// Client pages
import ClientDashboard from './pages/client/ClientDashboard';
import DocumentWizard from './pages/client/DocumentWizard';
import DocumentSummary from './pages/client/DocumentSummary';
import MyDocuments from './pages/client/MyDocuments';

// Lawyer pages
import LawyerDashboard from './pages/lawyer/LawyerDashboard';
import ReviewQueue from './pages/lawyer/ReviewQueue';
import DocumentEditor from './pages/lawyer/DocumentEditor';
import CaseLawSearch from './pages/lawyer/CaseLawSearch';
import CaseLibrary from './pages/lawyer/CaseLibrary';

// Shared pages
import ContractRisk from './pages/shared/ContractRisk';
import DocumentViewer from './pages/shared/DocumentViewer';
import Settings from './pages/shared/Settings';

import { useAuth } from './context/AuthContext';

// Smart redirect based on role
const RoleRedirect: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'lawyer' ? '/lawyer/dashboard' : '/client/dashboard'} replace />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<RoleRedirect />} />

            {/* Protected — with layout */}
            <Route element={<Layout requireAuth={true} />}>
              {/* Client routes */}
              <Route path="/client/dashboard" element={<ClientDashboard />} />
              <Route path="/client/documents" element={<MyDocuments />} />
              <Route path="/client/documents/new" element={<DocumentWizard />} />
              <Route path="/client/documents/:id" element={<DocumentViewer />} />
              <Route path="/client/summarize" element={<DocumentSummary />} />
              <Route path="/client/risk" element={<ContractRisk />} />

              {/* Lawyer routes */}
              <Route path="/lawyer/dashboard" element={<LawyerDashboard />} />
              <Route path="/lawyer/queue" element={<ReviewQueue />} />
              <Route path="/lawyer/review/:id" element={<DocumentEditor />} />
              <Route path="/lawyer/search" element={<CaseLawSearch />} />
              <Route path="/lawyer/library" element={<CaseLibrary />} />
              <Route path="/lawyer/risk" element={<ContractRisk />} />

              {/* Shared */}
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
