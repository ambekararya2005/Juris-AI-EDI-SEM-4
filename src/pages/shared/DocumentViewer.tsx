import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Edit, ZoomIn, ZoomOut, Printer, ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { getStatusBadge } from '../../components/ui/Badge';
import { mockDocuments } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { downloadPdf } from '../../utils/downloadPdf';


// Multi-page document content mock split
const PAGE_CONTENTS = [
  // Page 1
  `IN THE MATTER OF:

Ravi Ramesh Patil, son of Ramesh Shankar Patil,
Age: 34 years, Occupation: Business,
Aadhaar No. XXXX-XXXX-6789,
Resident of Flat No. 4B, Saraswati Apartments,
Kothrud, Pune – 411 038.

...APPLICANT/ACCUSED

VERSUS

The State of Maharashtra
Through the Station House Officer,
Kothrud Police Station, Pune.

...RESPONDENT`,

  // Page 2
  `RESPECTFULLY SHOWETH:

1. That the Applicant/Accused is a law-abiding citizen with deep roots in the community. He has no prior criminal record and has resided at the above-mentioned address for the past twelve (12) years. He is a reputed businessman in Kothrud, Pune and is falsely implicated in the present FIR.

2. That FIR No. 187/2026 was registered on 05-03-2026 at Kothrud Police Station, Pune, under Sections 420 and 406 of the Indian Penal Code, 1860 (equivalent to Sections 318 and 316 of the Bharatiya Nyaya Sanhita, 2023) at the behest of the complainant. The allegations are wholly false, frivolous, and baseless and are denied in their entirety.

3. That the Applicant was not party to any fraudulent transaction as alleged. He was conducting lawful business activities, as can be verified by GST returns, bank statements, and witness testimonies of business associates. The allegations are a product of a civil commercial dispute being maliciously converted into a criminal complaint.

4. That the Applicant suffers from a serious medical condition, namely Type-II Diabetes Mellitus with hypertension, as evidenced by medical certificates and treatment records from Deenanath Mangeshkar Hospital, Pune, annexed herewith as Exhibit-A. Continued incarceration would severely jeopardise his health.

5. That the Applicant is the sole breadwinner of his family comprising his aged mother (68 years), wife, and two minor children aged 7 and 9 years. His continued detention would cause grave financial hardship and deprive the minor children of their sustenance.

6. That the investigation in the present case is substantially complete. Panchanama has been drawn and statements of witnesses recorded. The Applicant poses no risk of absconding, tampering with evidence, or influencing witnesses. He undertakes to fully cooperate with all further investigative proceedings and to appear before this Hon'ble Court on each and every date of hearing.`,

  // Page 3
  `PRAYER:

It is, therefore, most respectfully prayed that this Hon'ble Court may be pleased to:

a. Release the Applicant/Accused on regular bail in FIR No. 187/2026 registered at Kothrud Police Station, Pune;

b. Pass any other order(s) as this Hon'ble Court may deem fit and proper in the interest of justice.

AND FOR THIS ACT OF KINDNESS, THE HUMBLE APPLICANT SHALL AS IN DUTY BOUND EVER PRAY.

Date: 12-03-2026
Place: Pune

APPLICANT
Through Counsel
[Advocate Signature]`
];

const DocumentViewer: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useApp();
  const doc = mockDocuments.find(d => d.id === id) || mockDocuments[3];

  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);

  const zoomIn = () => setZoom(prev => Math.min(prev + 10, 155));
  const zoomOut = () => setZoom(prev => Math.max(prev - 10, 55));

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const contentToDownload = doc.content || PAGE_CONTENTS.join('\n\n');
    downloadPdf(
      contentToDownload,
      doc.title || 'Document',
      {
        title: doc.title || 'Document',
        type: doc.type,
        clientName: doc.clientName || 'Client',
        date: doc.createdAt
      }
    );
  };


  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Top action toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="h-11">
          <ArrowLeft size={16} /> Back
        </Button>
        <div className="flex items-center gap-2 flex-wrap">
          {getStatusBadge(doc.status)}
          <Button variant="ghost" size="sm" onClick={handlePrint} className="h-11">
            <Printer size={16} /> Print
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownload} className="h-11">
            <Download size={16} /> Download
          </Button>
          {doc.status === 'Draft' && (
            <Button variant="gold" size="sm" onClick={() => addToast('Editing not available in view mode', 'info')} className="h-11">
              <Edit size={16} /> Edit Draft
            </Button>
          )}
        </div>
      </div>

      {/* Editor / Viewer Controls panel */}
      <Card className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 dark:bg-slate-800 border border-border dark:border-slate-700">
        {/* Zoom Controls */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-muted-text dark:text-slate-400">Zoom:</span>
          <div className="flex items-center gap-1.5 bg-surface-gray dark:bg-slate-900 px-2 py-1 rounded-xl">
            <button
              onClick={zoomOut}
              className="p-1 text-dark-text dark:text-slate-300 hover:bg-border dark:hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-xs font-bold text-dark-text dark:text-slate-200 select-none w-10 text-center">
              {zoom}%
            </span>
            <button
              onClick={zoomIn}
              className="p-1 text-dark-text dark:text-slate-300 hover:bg-border dark:hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
          </div>
        </div>

        {/* Page navigation indicator */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-muted-text dark:text-slate-400">
            Page {currentPage} of {PAGE_CONTENTS.length}
          </span>
          <div className="flex items-center gap-1 bg-surface-gray dark:bg-slate-900 p-1 rounded-xl">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              className="p-1.5 text-dark-text dark:text-slate-300 hover:bg-border dark:hover:bg-slate-700 rounded-lg disabled:opacity-40 transition-colors"
              aria-label="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={currentPage === PAGE_CONTENTS.length}
              onClick={() => setCurrentPage(p => Math.min(p + 1, PAGE_CONTENTS.length))}
              className="p-1.5 text-dark-text dark:text-slate-300 hover:bg-border dark:hover:bg-slate-700 rounded-lg disabled:opacity-40 transition-colors"
              aria-label="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </Card>

      {/* Document Sheet Card */}
      <Card className="p-6 md:p-8 dark:bg-slate-800 overflow-hidden relative border border-border dark:border-slate-700">
        <div className="flex gap-4 mb-6 pb-6 border-b border-border dark:border-slate-700 flex-wrap">
          {[['Document', doc.title], ['Type', doc.type], ['Created', doc.createdAt], ['Lawyer', doc.lawyerName || 'Not Assigned']].map(([k, v]) => (
            <div key={k}>
              <p className="text-xs text-muted-text dark:text-slate-400">{k}</p>
              <p className="text-sm font-semibold text-dark-text dark:text-slate-200 mt-0.5">{v}</p>
            </div>
          ))}
        </div>

        {/* Document Content Box */}
        <div className="overflow-auto border border-border/50 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-6 min-h-[480px]">
          <div
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            className="transition-transform duration-200 font-mono text-xs leading-relaxed text-dark-text dark:text-slate-200"
          >
            {/* Session Court Header (Proper formatting) */}
            <div className="text-center mb-8 border-b border-dashed border-border/60 dark:border-slate-700 pb-6">
              <div className="text-2xl font-bold text-navy dark:text-slate-100 font-sans mb-1 tracking-wide">
                सत्र न्यायालय, पुणे
              </div>
              <div className="text-xs md:text-sm font-bold tracking-wider text-dark-text dark:text-slate-300 uppercase">
                IN THE COURT OF SESSIONS JUDGE PUNE
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-text dark:text-slate-400 mt-2">
                APPLICATION FOR BAIL BEFORE ARREST
              </div>
              <div className="text-[10px] text-muted-text dark:text-slate-400 mt-0.5">
                (Under Section 438 of Cr.P.C., 1973 / BNS 2023)
              </div>
            </div>

            {/* Current Page Content */}
            <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed">
              {PAGE_CONTENTS[currentPage - 1]}
            </pre>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DocumentViewer;

