import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Edit } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { getStatusBadge } from '../../components/ui/Badge';
import { mockDocuments } from '../../data/mockData';
import { BAIL_APPLICATION_CONTENT } from '../../data/mockData';

const DocumentViewer: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const doc = mockDocuments.find(d => d.id === id) || mockDocuments[3];

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </Button>
        <div className="flex-1" />
        {getStatusBadge(doc.status)}
        <Button variant="ghost" size="sm"><Download size={16} /> Download</Button>
        {doc.status === 'Draft' && <Button variant="gold" size="sm"><Edit size={16} /> Edit Draft</Button>}
      </div>

      <Card className="p-6">
        <div className="flex gap-4 mb-6 pb-6 border-b border-border flex-wrap">
          {[['Document', doc.title], ['Type', doc.type], ['Created', doc.createdAt], ['Lawyer', doc.lawyerName || 'Not Assigned']].map(([k, v]) => (
            <div key={k}>
              <p className="text-xs text-muted-text">{k}</p>
              <p className="text-sm font-medium text-dark-text">{v}</p>
            </div>
          ))}
        </div>

        <div className="font-mono text-xs leading-relaxed text-dark-text">
          <div className="text-center mb-6">
            <div className="text-xl font-bold text-navy font-sans mb-1">सत्र न्यायालय, पुणे</div>
            <div className="text-sm font-bold tracking-wider">IN THE COURT OF SESSIONS JUDGE PUNE</div>
            <div className="text-xs uppercase tracking-widest text-muted-text mt-1">APPLICATION FOR BAIL BEFORE ARREST</div>
          </div>
          <pre className="whitespace-pre-wrap">{BAIL_APPLICATION_CONTENT}</pre>
        </div>
      </Card>
    </div>
  );
};

export default DocumentViewer;
