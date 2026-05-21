/**
 * DemoBanner.tsx
 * A sticky top banner that appears only in mock/demo mode.
 * Shows which role is active and offers a one-click switcher between portals.
 */
import React from 'react';
import { IS_MOCK_MODE } from '../data/mockService';

const DemoBanner: React.FC = () => {
  if (!IS_MOCK_MODE) return null;

  const params = new URLSearchParams(window.location.search);
  const currentRole = params.get('role') === 'lawyer' ? 'lawyer' : 'client';
  const switchUrl = currentRole === 'client'
    ? `${window.location.pathname}?role=lawyer`
    : window.location.pathname.replace('/lawyer', '/client').replace('?role=lawyer', '');

  const switchLabel = currentRole === 'client' ? '⚖️ Switch to Lawyer Portal' : '👤 Switch to Client Portal';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'linear-gradient(90deg, #1B3A6B 0%, #C9A846 100%)',
        color: '#fff',
        padding: '6px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif',
        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
      }}
    >
      <span>
        🎭 <strong>Demo Mode</strong> — showing mock data &nbsp;
        <span
          style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '999px',
            padding: '2px 8px',
            fontWeight: 600,
            textTransform: 'capitalize',
          }}
        >
          {currentRole} Portal
        </span>
      </span>

      <a
        href={switchUrl}
        style={{
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '6px',
          color: '#fff',
          padding: '3px 12px',
          textDecoration: 'none',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
        onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
      >
        {switchLabel}
      </a>
    </div>
  );
};

export default DemoBanner;
