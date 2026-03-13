import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ExternalLink } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { mockCases } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

const CaseLibrary: React.FC = () => {
  const { savedCases, toggleSavedCase } = useApp();
  const navigate = useNavigate();

  const saved = mockCases.filter(c => savedCases.includes(c.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-dark-text">Case Library</h1>
          <p className="text-muted-text text-sm mt-1">{saved.length} saved cases</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/lawyer/search')}>+ Search & Add Cases</Button>
      </div>
      {saved.length === 0 ? (
        <Card className="p-16 text-center">
          <div className="w-16 h-16 bg-light-blue rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart size={28} className="text-muted-text" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-dark-text mb-2">No saved cases yet</h3>
          <p className="text-sm text-muted-text mb-4">Search for case law and save cases to your library</p>
          <Button onClick={() => navigate('/lawyer/search')}>Search Case Law →</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {saved.map(c => (
            <Card key={c.id} className="p-5">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs bg-navy text-white px-2 py-0.5 rounded-md">{c.court}</span>
                <button onClick={() => toggleSavedCase(c.id)} className="text-risk">
                  <Heart size={16} fill="currentColor" />
                </button>
              </div>
              <h3 className="font-semibold text-dark-text text-sm mb-0.5">{c.caseName}</h3>
              <p className="font-mono text-xs text-gold mb-2">{c.citation}</p>
              <p className="text-xs text-muted-text line-clamp-2">{c.summary}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CaseLibrary;
