import {
  LegalDocument,
  CaseResult,
  RiskFlag,
  Notification,
  ReviewQueueItem,
  User,
  ActivityData,
} from '../types';

// ===================== USERS =====================
export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Ayesha Malik',
    email: 'ayesha.malik@gmail.com',
    role: 'client',
    phone: '+92-311-2345678',
    cnic: '35202-1234567-8',
    city: 'Islamabad',
  },
  {
    id: 'u2',
    name: 'Adnan Raza',
    email: 'adnan.raza@legalchambers.pk',
    role: 'lawyer',
    phone: '+92-321-9876543',
    cnic: '35202-9876543-2',
    city: 'Lahore',
    barCouncilNumber: 'PBA-2019-04521',
  },
  {
    id: 'u3',
    name: 'Sara Qureshi',
    email: 'sara.q@advocate.pk',
    role: 'lawyer',
    phone: '+92-300-1122334',
    city: 'Karachi',
    barCouncilNumber: 'PBA-2017-02198',
  },
];

// ===================== BAIL APPLICATION CONTENT =====================
export const BAIL_APPLICATION_CONTENT = `عدالت سیشن جج لاہور
IN THE COURT OF SESSIONS JUDGE LAHORE

درخواست برائے ضمانت قبل از گرفتاری
APPLICATION FOR BAIL BEFORE ARREST

Case No.: FIR 112/2026
Police Station: Gulberg, Lahore
Section: 302 PPC

IN THE MATTER OF:
Muhammad Imran Siddiqui son of Muhammad Tariq Siddiqui, 
CNIC No. 35202-7654321-9, resident of House No. 47-B, 
Model Town, Lahore.

...PETITIONER/APPLICANT

VERSUS

The State
...RESPONDENT

RESPECTFULLY SHEWETH:

1. That the Applicant/Accused is a law-abiding citizen with no prior criminal record. He has deep roots in the community and has resided at the above-mentioned address for the past fifteen (15) years. He is a first-time offender caught in an unfortunate circumstance and is falsely implicated in the present FIR.

2. That FIR No. 112/2026 was registered on 08-03-2026 at Police Station Gulberg, Lahore, under Section 302 PPC at the behest of the complainant, allegedly implicating the Applicant in a criminal act, which allegations are completely false, frivolous, and baseless and are denied in toto.

3. That the Applicant/Accused was not present at the alleged scene of crime on the date and time mentioned in the FIR. He was at his place of business located at Shop No. 12, Liberty Market, Lahore, which can be verified by CCTV footage and witness testimonies.

4. That the Applicant suffers from a serious medical condition, namely Type-II Diabetes Mellitus with associated cardiovascular complications, as evidenced by medical certificates and treatment records from Services Hospital, Lahore, attached herewith as Exhibit-A. Incarceration would severely endanger his health and life.

5. That the Applicant is the sole breadwinner of his family comprising his aged parents, wife, and three minor children. His incarceration would plunge the family into financial destitution and deprive the minor children of their sustenance.

6. That the investigation in the present case is substantially complete, and the Applicant poses no risk of tampering with evidence or influencing witnesses. He undertakes to fully cooperate with all investigative proceedings.

7. That the Applicant is ready and willing to furnish surety bonds of any reasonable amount as fixed by this Honorable Court to ensure his presence before the Court at every date of hearing.

8. That the Applicant relies on the precedent set by the Honorable Supreme Court of Pakistan in PLD 2021 SC 445, wherein it was held that bail is the rule and jail is the exception, particularly in cases where the accused is a first-time offender without criminal antecedents.

9. That the Applicant further relies on 2019 SCMR 1244 wherein the Honorable Court held that medical grounds constitute sufficient cause for grant of bail, subject to submission of authentic medical documentation.

PRAYER:

It is, therefore, most respectfully prayed that this Honorable Court may be pleased to:

(i) Grant pre-arrest bail to the Applicant on such terms and conditions as this Honorable Court may deem fit and proper;

(ii) Direct the police/investigation officer not to arrest the Applicant during the pendency of these proceedings;

(iii) Pass such other order(s) as this Honorable Court may deem fit and just in the circumstances of the case.

Respectfully submitted,

_____________________
Muhammad Imran Siddiqui
Applicant/Accused

Through Counsel:
Adnan Raza, Advocate
Punjab Bar Council Registration No. PBA-2019-04521
Chambers: Room 14, District Courts Complex, Lahore
Dated: 10-03-2026`;

// ===================== LEGAL DOCUMENTS =====================
export const mockDocuments: LegalDocument[] = [
  {
    id: 'doc1',
    title: 'Supplier Agreement',
    type: 'Business Agreement',
    status: 'Finalized',
    createdAt: '2026-03-02',
    updatedAt: '2026-03-05',
    clientId: 'u1',
    clientName: 'Ayesha Malik',
    lawyerId: 'u2',
    lawyerName: 'Adnan Raza',
    content: '',
    riskScore: 32,
  },
  {
    id: 'doc2',
    title: 'Rental Contract – F7 Islamabad',
    type: 'Rental Agreement',
    status: 'Under Review',
    createdAt: '2026-03-08',
    updatedAt: '2026-03-09',
    clientId: 'u1',
    clientName: 'Ayesha Malik',
    lawyerId: 'u3',
    lawyerName: 'Sara Qureshi',
    content: '',
    riskScore: 55,
  },
  {
    id: 'doc3',
    title: 'Affidavit – Property Transfer',
    type: 'Affidavit',
    status: 'Revision Needed',
    createdAt: '2026-03-05',
    updatedAt: '2026-03-10',
    clientId: 'u1',
    clientName: 'Ayesha Malik',
    lawyerId: 'u2',
    lawyerName: 'Adnan Raza',
    content: '',
  },
  {
    id: 'doc4',
    title: 'Bail Application – Case No. 44/26',
    type: 'Bail Application',
    status: 'Draft',
    createdAt: '2026-03-10',
    updatedAt: '2026-03-10',
    clientId: 'u1',
    clientName: 'Ayesha Malik',
    content: BAIL_APPLICATION_CONTENT,
  },
  {
    id: 'doc5',
    title: 'Wakalatnama – Civil Court',
    type: 'Wakalatnama',
    status: 'Finalized',
    createdAt: '2026-02-28',
    updatedAt: '2026-03-01',
    clientId: 'u1',
    clientName: 'Ayesha Malik',
    lawyerId: 'u2',
    lawyerName: 'Bilal Hassan',
    content: '',
  },
  {
    id: 'doc6',
    title: 'Partnership Agreement',
    type: 'Business Agreement',
    status: 'Draft',
    createdAt: '2026-03-11',
    updatedAt: '2026-03-11',
    clientId: 'u1',
    clientName: 'Ayesha Malik',
    content: '',
  },
  {
    id: 'doc7',
    title: 'Petition – Land Dispute',
    type: 'Petition',
    status: 'Finalized',
    createdAt: '2026-02-15',
    updatedAt: '2026-02-20',
    clientId: 'u1',
    clientName: 'Ayesha Malik',
    lawyerId: 'u2',
    lawyerName: 'Adnan Raza',
    content: '',
    riskScore: 18,
  },
  {
    id: 'doc8',
    title: 'Affidavit – Income Declaration',
    type: 'Affidavit',
    status: 'Finalized',
    createdAt: '2026-02-10',
    updatedAt: '2026-02-12',
    clientId: 'u1',
    clientName: 'Ayesha Malik',
    lawyerId: 'u3',
    lawyerName: 'Sara Qureshi',
    content: '',
  },
  {
    id: 'doc9',
    title: 'Rental Agreement – G11 Islamabad',
    type: 'Rental Agreement',
    status: 'Under Review',
    createdAt: '2026-03-01',
    updatedAt: '2026-03-03',
    clientId: 'u1',
    clientName: 'Ayesha Malik',
    lawyerId: 'u3',
    lawyerName: 'Sara Qureshi',
    content: '',
    riskScore: 40,
  },
  {
    id: 'doc10',
    title: 'Commercial Lease – Blue Area',
    type: 'Rental Agreement',
    status: 'Draft',
    createdAt: '2026-03-12',
    updatedAt: '2026-03-12',
    clientId: 'u1',
    clientName: 'Ayesha Malik',
    content: '',
  },
];



// ===================== CASE LAW RESULTS =====================
export const mockCases: CaseResult[] = [
  {
    id: 'c1',
    caseName: 'Muhammad Asif v. The State',
    citation: '2022 SCMR 891',
    court: 'Supreme Court',
    year: 2022,
    domain: 'Criminal',
    summary:
      'The Honorable Supreme Court held that bail should not be refused merely on the gravity of the charge. The Court reiterated that it is the rule to grant bail and jail is the exception, particularly where the accused has no prior criminal record and investigation is complete.',
    keyPhrases: ['bail', 'repeat offender', 'surety', 'pre-arrest'],
    fullText: 'Full judgment text for Muhammad Asif v. The State...',
    relatedCases: ['c2', 'c3'],
  },
  {
    id: 'c2',
    caseName: 'Akhtar v. State',
    citation: 'PLD 2021 SC 445',
    court: 'Supreme Court',
    year: 2021,
    domain: 'Criminal',
    summary:
      'Landmark ruling establishing that bail is the rule and jail is the exception. The Court emphasized that denial of bail results in punishment before conviction, which violates Article 10-A of the Constitution of Pakistan guaranteeing fair trial rights.',
    keyPhrases: ['bail rule', 'pre-trial detention', 'constitutional rights', 'fair trial'],
    fullText: 'Full judgment text for Akhtar v. State...',
    relatedCases: ['c1', 'c3'],
  },
  {
    id: 'c3',
    caseName: 'Re: Bail Conditions',
    citation: '2019 SCMR 1244',
    court: 'Supreme Court',
    year: 2019,
    domain: 'Criminal',
    summary:
      'The Court held that medical grounds constitute sufficient cause for grant of bail where the accused suffers from a serious ailment requiring specialized medical treatment unavailable in jail. Medical certification from a government hospital was deemed necessary.',
    keyPhrases: ['medical grounds', 'bail conditions', 'humanitarian', 'serious illness'],
    fullText: 'Full judgment text for Re: Bail Conditions...',
    relatedCases: ['c1', 'c2'],
  },
  {
    id: 'c4',
    caseName: 'Muhammad Ali v. State',
    citation: 'PLJ 2020 Lah 88',
    court: 'High Court',
    year: 2020,
    domain: 'Criminal',
    summary:
      'Lahore High Court held that where the accused is the sole breadwinner of the family and has no previous criminal history, that factor weighs heavily in favor of granting bail. The Court must balance societal interests with hardship caused to dependents.',
    keyPhrases: ['sole breadwinner', 'family hardship', 'bail discretion', 'first offender'],
    fullText: 'Full judgment text for Muhammad Ali v. State...',
    relatedCases: ['c2', 'c5'],
  },
  {
    id: 'c5',
    caseName: 'Fatima Bibi v. Federation of Pakistan',
    citation: 'PLD 2020 SC 311',
    court: 'Supreme Court',
    year: 2020,
    domain: 'Constitutional',
    summary:
      'The Supreme Court held that the right to bail is a fundamental right under Article 9 and 10-A of the Constitution. The Court further held that excessive bail conditions tantamount to denial of bail and are unconstitutional.',
    keyPhrases: ['fundamental rights', 'excessive bail', 'unconstitutional', 'Article 9'],
    fullText: 'Full judgment text for Fatima Bibi v. Federation of Pakistan...',
    relatedCases: ['c2', 'c3'],
  },
  {
    id: 'c6',
    caseName: 'Landlord-Tenant Dispute Resolution',
    citation: '2021 CLC 774 (Lah)',
    court: 'High Court',
    year: 2021,
    domain: 'Civil',
    summary:
      'Lahore High Court clarified that a landlord cannot evict a tenant without following due process under the Punjab Rented Premises Act 2009. Oral termination of lease is ineffective when a written agreement exists specifying a notice period.',
    keyPhrases: ['landlord', 'tenant', 'eviction', 'Punjab Rented Premises Act'],
    fullText: 'Full judgment text for Landlord-Tenant Dispute...',
    relatedCases: ['c7', 'c8'],
  },
  {
    id: 'c7',
    caseName: 'AlphaCorp v. Beta Industries',
    citation: '2022 CLD 455',
    court: 'High Court',
    year: 2022,
    domain: 'Commercial',
    summary:
      'The Court held that a contract clause allowing unilateral amendment of material terms by one party is void for lack of mutuality. Such clauses create an illusory contract and cannot be enforced against the party who did not consent to the amendment.',
    keyPhrases: ['unilateral amendment', 'contract void', 'mutuality', 'commercial dispute'],
    fullText: 'Full judgment text for AlphaCorp v. Beta Industries...',
    relatedCases: ['c6'],
  },
  {
    id: 'c8',
    caseName: 'State v. Rehman (Criminal Negligence)',
    citation: 'PLD 2019 Kar 221',
    court: 'High Court',
    year: 2019,
    domain: 'Criminal',
    summary:
      'The Sindh High Court defined criminal negligence as a gross departure from the standard of care that a reasonable person would exercise. The Court distinguished between civil negligence and criminal negligence, requiring higher threshold for criminal liability.',
    keyPhrases: ['criminal negligence', 'gross departure', 'reasonable person', 'standard of care'],
    fullText: 'Full judgment text for State v. Rehman...',
    relatedCases: ['c1', 'c5'],
  },
  {
    id: 'c9',
    caseName: 'Khan v. Khan (Specific Performance)',
    citation: '2023 SCMR 512',
    court: 'Supreme Court',
    year: 2023,
    domain: 'Civil',
    summary:
      'The Supreme Court upheld the decree for specific performance of an agreement to sell immovable property, holding that where the plaintiff has discharged the burden of proving readiness and willingness, specific performance is available as a matter of right.',
    keyPhrases: ['specific performance', 'immovable property', 'readiness and willingness', 'agreement to sell'],
    fullText: 'Full judgment text for Khan v. Khan...',
    relatedCases: ['c7'],
  },
  {
    id: 'c10',
    caseName: 'In Re: Void Ab Initio Contracts',
    citation: '2020 YLR 1340',
    court: 'High Court',
    year: 2020,
    domain: 'Civil',
    summary:
      'The Lahore High Court held that a contract entered into under duress or undue influence is void ab initio and cannot be ratified by subsequent conduct. The burden of proving the voluntary nature of the contract lies on the party seeking enforcement.',
    keyPhrases: ['void ab initio', 'duress', 'undue influence', 'contract enforcement'],
    fullText: 'Full judgment text for Void Ab Initio Contracts...',
    relatedCases: ['c7', 'c9'],
  },
];

// ===================== RISK FLAGS =====================
export const mockRiskFlags: RiskFlag[] = [
  {
    id: 'r1',
    severity: 'HIGH',
    clauseRef: 'Clause 12.3 — Limitation of Liability',
    title: 'Unlimited Liability Exposure',
    description:
      'This clause contains no cap on liability for AlphaTech, exposing Zara Traders to unlimited financial risk in case of breach. Industry standard requires bilateral liability caps tied to contract value.',
    originalText:
      'AlphaTech shall not be held liable for any indirect, consequential, or incidental damages, however Zara Traders shall remain fully and unconditionally liable for all losses, damages, costs, and expenses arising from or related to any breach of this Agreement, without limitation.',
    suggestedRevision:
      'The liability of each party under this Agreement shall be limited to the total value of payments made or payable under this Agreement in the twelve (12) months preceding the event giving rise to liability. Neither party shall be liable for indirect or consequential damages.',
  },
  {
    id: 'r2',
    severity: 'HIGH',
    clauseRef: 'Clause 8.1 — Payment Terms & Amendment',
    title: 'Unilateral Amendment Rights',
    description:
      'This clause grants AlphaTech the right to unilaterally amend payment terms with only 7 days notice. This creates a significant power imbalance and may constitute an illusory contract under Pakistan contract law.',
    originalText:
      'AlphaTech reserves the exclusive right to amend, modify, or revise the payment schedule, rates, and terms outlined in Schedule B, upon providing seven (7) calendar days written notice to Zara Traders. Such amendments shall be binding and effective upon dispatch of notice.',
    suggestedRevision:
      'Any amendment to payment terms, rates, or schedules under this Agreement shall require the mutual written consent of both parties. No amendment shall be effective unless signed by authorized representatives of both AlphaTech and Zara Traders.',
  },
  {
    id: 'r3',
    severity: 'HIGH',
    clauseRef: 'General — Dispute Resolution',
    title: 'Missing Dispute Resolution Mechanism',
    description:
      'The agreement contains no clause specifying the mechanism for dispute resolution. This leaves parties without a structured process for resolving conflicts and may lead to costly litigation with no agreed jurisdiction.',
    originalText: '[No such clause exists in the current agreement]',
    suggestedRevision:
      'Any dispute, controversy, or claim arising out of or relating to this Agreement shall first be referred to mediation. If mediation fails within 30 days, the dispute shall be submitted to arbitration under the Arbitration Act 1940, with arbitration in Lahore, Pakistan. The decision of the arbitrator shall be final and binding.',
  },
  {
    id: 'r4',
    severity: 'MEDIUM',
    clauseRef: 'Clause 5.2 — Delivery Obligations',
    title: 'Vague Delivery Obligations',
    description:
      'The delivery terms in Clause 5.2 are ambiguous, failing to specify delivery method, risk transfer point, or consequences for delayed delivery. This creates significant uncertainty regarding performance obligations.',
    originalText:
      'AlphaTech shall deliver the goods in a reasonable time at a location mutually agreed upon. Delivery shall be deemed complete upon dispatch from AlphaTech warehouse.',
    suggestedRevision:
      'AlphaTech shall deliver goods to the designated delivery address within fourteen (14) business days of receiving a purchase order. Title and risk in goods shall pass to Zara Traders upon delivery and acceptance. Late delivery shall incur liquidated damages of PKR 5,000 per day of delay.',
  },
  {
    id: 'r5',
    severity: 'MEDIUM',
    clauseRef: 'Clause 15.1 — Agreement Renewal',
    title: 'Automatic Renewal Without Notice',
    description:
      'The contract auto-renews for successive one-year periods without requiring affirmative consent from either party. This may trap Zara Traders in unfavorable obligations without adequate opportunity to renegotiate.',
    originalText:
      'This Agreement shall automatically renew for successive periods of one (1) year each unless either party provides written notice of non-renewal at least five (5) business days before the renewal date.',
    suggestedRevision:
      'This Agreement shall not renew automatically. At least sixty (60) calendar days before the expiration of the initial term, the parties shall negotiate renewal terms in good faith. Renewal shall only occur upon execution of a written renewal agreement signed by both parties.',
  },
  {
    id: 'r6',
    severity: 'LOW',
    clauseRef: 'General — Governing Law',
    title: 'Missing Governing Law Clause',
    description:
      'The agreement does not specify which jurisdiction\'s laws govern the contract. This creates confusion in case of disputes, particularly given that both parties operate in different cities.',
    originalText: '[No governing law clause found in the agreement]',
    suggestedRevision:
      'This Agreement shall be governed by and construed in accordance with the laws of the Islamic Republic of Pakistan. The courts of Lahore, Punjab, shall have exclusive jurisdiction over any disputes arising under this Agreement.',
  },
  {
    id: 'r7',
    severity: 'LOW',
    clauseRef: 'Clause 14.4 — Termination Notice',
    title: 'Non-standard Termination Notice Period',
    description:
      'The termination notice period of 5 business days is significantly shorter than the industry standard of 30-90 days for commercial agreements. This does not provide adequate time for business continuity planning.',
    originalText:
      'Either party may terminate this Agreement by providing five (5) business days written notice to the other party, with or without cause.',
    suggestedRevision:
      'Either party may terminate this Agreement without cause by providing sixty (60) calendar days written notice. Termination for material breach shall require thirty (30) days written notice with opportunity to cure. Immediate termination is permitted only in cases of insolvency or fraud.',
  },
];

// ===================== NOTIFICATIONS =====================
export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    text: 'Adnan Raza finalized your Supplier Agreement',
    type: 'success',
    timestamp: '1 hour ago',
    read: false,
    icon: '✅',
  },
  {
    id: 'n2',
    text: 'Sara Qureshi commented on your Rental Contract',
    type: 'info',
    timestamp: '3 hours ago',
    read: false,
    icon: '💬',
  },
  {
    id: 'n3',
    text: 'Revision requested on your Affidavit – Property Transfer',
    type: 'warning',
    timestamp: '1 day ago',
    read: false,
    icon: '⚠️',
  },
  {
    id: 'n4',
    text: 'Your Bail Application draft is incomplete',
    type: 'warning',
    timestamp: '2 days ago',
    read: false,
    icon: '🔔',
  },
  {
    id: 'n5',
    text: 'New case law match found for your search "bail conditions"',
    type: 'info',
    timestamp: '3 days ago',
    read: true,
    icon: '🔍',
  },
  {
    id: 'n6',
    text: 'Your subscription renews in 7 days',
    type: 'info',
    timestamp: '4 days ago',
    read: true,
    icon: '📅',
  },
];

// ===================== REVIEW QUEUE =====================
export const mockReviewQueue: ReviewQueueItem[] = [
  {
    id: 'q1',
    documentId: 'doc4',
    documentTitle: 'Bail Application – Imran Siddiqui',
    clientName: 'Imran Siddiqui',
    priority: 'HIGH',
    receivedAt: '2 hours ago',
    documentType: 'Bail Application',
  },
  {
    id: 'q2',
    documentId: 'doc2',
    documentTitle: 'Rental Agreement – Fatima Noor',
    clientName: 'Fatima Noor',
    priority: 'MEDIUM',
    receivedAt: '1 day ago',
    documentType: 'Rental Agreement',
  },
  {
    id: 'q3',
    documentId: 'doc3',
    documentTitle: 'Affidavit – Kamran Ali',
    clientName: 'Kamran Ali',
    priority: 'LOW',
    receivedAt: '2 days ago',
    documentType: 'Affidavit',
  },
  {
    id: 'q4',
    documentId: 'doc6',
    documentTitle: 'Business Agreement – TechPak Pvt Ltd',
    clientName: 'TechPak Pvt Ltd',
    priority: 'MEDIUM',
    receivedAt: '3 days ago',
    documentType: 'Business Agreement',
  },
  {
    id: 'q5',
    documentId: 'doc5',
    documentTitle: 'Wakalatnama – Ahmed Farooq',
    clientName: 'Ahmed Farooq',
    priority: 'LOW',
    receivedAt: '4 days ago',
    documentType: 'Wakalatnama',
  },
];

// ===================== ACTIVITY DATA =====================
export const mockActivityData: ActivityData[] = [
  { month: 'Oct', documents: 2, reviews: 8, cases: 12 },
  { month: 'Nov', documents: 4, reviews: 11, cases: 18 },
  { month: 'Dec', documents: 3, reviews: 9, cases: 15 },
  { month: 'Jan', documents: 5, reviews: 13, cases: 22 },
  { month: 'Feb', documents: 6, reviews: 10, cases: 19 },
  { month: 'Mar', documents: 7, reviews: 12, cases: 34 },
];

export const mockWeeklyReviews = [
  { day: 'Mon', reviews: 2 },
  { day: 'Tue', reviews: 3 },
  { day: 'Wed', reviews: 1 },
  { day: 'Thu', reviews: 4 },
  { day: 'Fri', reviews: 2 },
  { day: 'Sat', reviews: 0 },
  { day: 'Sun', reviews: 0 },
];

export const mockRecentSearches = [
  { query: 'bail conditions repeat offender', time: '2h ago' },
  { query: 'landlord tenant dispute Lahore HC', time: '1d ago' },
  { query: 'contract void ab initio', time: '2d ago' },
  { query: 'specific performance enforcement', time: '3d ago' },
  { query: 'criminal negligence definition', time: '5d ago' },
];


