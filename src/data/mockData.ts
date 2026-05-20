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
    name: 'Priya Suresh Deshmukh',
    email: 'priya.deshmukh@gmail.com',
    role: 'client',
    phone: '+91-98765-43210',
    cnic: 'XXXX-XXXX-4321',
    city: 'Pune',
  },
  {
    id: 'u2',
    name: 'Adv. Rahul Vijay Joshi',
    email: 'rahul.joshi@legalchambers.in',
    role: 'lawyer',
    phone: '+91-98234-56789',
    cnic: 'XXXX-XXXX-7892',
    city: 'Pune',
    barCouncilNumber: 'MH/4521/2017',
  },
  {
    id: 'u3',
    name: 'Adv. Meera Santosh Kulkarni',
    email: 'meera.kulkarni@advocate.in',
    role: 'lawyer',
    phone: '+91-99001-12233',
    city: 'Pune',
    barCouncilNumber: 'MH/2312/2014',
  },
];

// ===================== BAIL APPLICATION CONTENT =====================
export const BAIL_APPLICATION_CONTENT = `IN THE COURT OF SESSIONS JUDGE, PUNE
Criminal Miscellaneous Application No. 187 / 2026

APPLICATION FOR REGULAR BAIL
U/S 437 CrPC 1973 / SECTION 480 BNSS 2023

IN THE MATTER OF:

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

...RESPONDENT


RESPECTFULLY SHOWETH:

1. That the Applicant/Accused is a law-abiding citizen with deep roots in the community. He has no prior criminal record and has resided at the above-mentioned address for the past twelve (12) years. He is a reputed businessman in Kothrud, Pune and is falsely implicated in the present FIR.

2. That FIR No. 187/2026 was registered on 05-03-2026 at Kothrud Police Station, Pune, under Sections 420 and 406 of the Indian Penal Code, 1860 (equivalent to Sections 318 and 316 of the Bharatiya Nyaya Sanhita, 2023) at the behest of the complainant. The allegations are wholly false, frivolous, and baseless and are denied in their entirety.

3. That the Applicant was not party to any fraudulent transaction as alleged. He was conducting lawful business activities, as can be verified by GST returns, bank statements, and witness testimonies of business associates. The allegations are a product of a civil commercial dispute being maliciously converted into a criminal complaint.

4. That the Applicant suffers from a serious medical condition, namely Type-II Diabetes Mellitus with hypertension, as evidenced by medical certificates and treatment records from Deenanath Mangeshkar Hospital, Pune, annexed herewith as Exhibit-A. Continued incarceration would severely jeopardise his health.

5. That the Applicant is the sole breadwinner of his family comprising his aged mother (68 years), wife, and two minor children aged 7 and 9 years. His continued detention would cause grave financial hardship and deprive the minor children of their sustenance.

6. That the investigation in the present case is substantially complete. Panchanama has been drawn and statements of witnesses recorded. The Applicant poses no risk of absconding, tampering with evidence, or influencing witnesses. He undertakes to fully cooperate with all further investigative proceedings and to appear before this Hon'ble Court on each and every date of hearing.


PRAYER:

It is therefore most respectfully prayed that this Hon'ble Court may be pleased to:

(i)  Grant regular bail to the Applicant/Accused under Section 437 of the Code of Criminal Procedure, 1973 / Section 480 of the Bharatiya Nagarik Suraksha Sanhita, 2023, on such terms and conditions as this Hon'ble Court may deem fit and proper;

(ii) Direct the Applicant to furnish surety bonds of a reasonable amount to ensure his presence before this Court on each and every date of hearing;

(iii) Pass such other and further order(s) as this Hon'ble Court may deem fit and just in the circumstances of the case.

WHEREFORE, the Applicant most humbly prays for the above reliefs in the interest of justice.

Pune                               Advocate for the Applicant
Date: 10-03-2026                   Adv. Meera Santosh Kulkarni
                                   Enrolment No: MH/2312/2014
                                   Bar Council of Maharashtra & Goa`;

// ===================== LEGAL DOCUMENTS =====================
export const mockDocuments: LegalDocument[] = [
  {
    id: 'doc1',
    title: 'Supplier Agreement — Kapoor Textiles Pvt. Ltd.',
    type: 'Business Agreement',
    status: 'Finalized',
    createdAt: '2026-03-02',
    updatedAt: '2026-03-05',
    clientId: 'u1',
    clientName: 'Priya Suresh Deshmukh',
    lawyerId: 'u2',
    lawyerName: 'Adv. Rahul Vijay Joshi',
    content: `SUPPLY OF GOODS AGREEMENT

This Agreement is entered into on this 2nd day of March, 2026 at Pune, Maharashtra.

BETWEEN:
Priya Suresh Deshmukh, daughter of Suresh Dattatray Deshmukh,
Age: 31 years, Sole Proprietor,
Resident of Flat No. 4B, Saraswati Apartments, Kothrud, Pune – 411 038.
PAN: ABCDE1234F
(hereinafter referred to as "Party A")

AND:
Kapoor Textiles Pvt. Ltd.,
CIN: U17111MH2015PTC267432,
Registered Office: Shop No. 12, Ground Floor, Laxmi Complex, Shivajinagar, Pune – 411 005.
(hereinafter referred to as "Party B")

RESPECTFULLY SHOWETH:

1. NATURE OF AGREEMENT: Party B agrees to supply textile goods as detailed in Schedule I to Party A on the terms and conditions set out in this Agreement.

2. CONSIDERATION: The total value of supply under this Agreement shall be ₹12,00,000/- (Rupees Twelve Lakhs only), exclusive of applicable GST, payable as per the payment schedule in Schedule II.

3. DURATION: This Agreement shall be effective from 01.04.2026 and shall remain in force for a period of one (1) year unless terminated earlier in accordance with the provisions hereof.

4. GOVERNING LAW: This Agreement shall be governed by and construed in accordance with the laws of India. All disputes shall be subject to the exclusive jurisdiction of the Courts at Pune, Maharashtra.

5. ARBITRATION: Any dispute, controversy, or claim arising out of or in connection with this Agreement shall be submitted to arbitration in accordance with the Arbitration & Conciliation Act, 1996. The seat of arbitration shall be Pune, Maharashtra.

Pune                               Adv. Rahul Vijay Joshi
Date: 02-03-2026                   Enrolment No: MH/4521/2017`,
    riskScore: 32,
  },
  {
    id: 'doc2',
    title: 'Leave & Licence Agreement — Flat 4B, Kothrud, Pune',
    type: 'Leave & Licence Agreement',
    status: 'Under Review',
    createdAt: '2026-03-08',
    updatedAt: '2026-03-09',
    clientId: 'u1',
    clientName: 'Priya Suresh Deshmukh',
    lawyerId: 'u3',
    lawyerName: 'Adv. Meera Santosh Kulkarni',
    content: `LEAVE AND LICENCE AGREEMENT

This Leave and Licence Agreement is executed at Pune on this 8th day of March, 2026.

BETWEEN:
Vikram Dilip Pawar, son of Dilip Shriram Pawar,
Age: 48 years, Resident of Bungalow No. 3, Officers Colony, Civil Lines, Nagpur – 440 001.
(hereinafter referred to as the "Licensor")

AND:
Priya Suresh Deshmukh, daughter of Suresh Dattatray Deshmukh,
Age: 31 years, Resident of Flat No. 4B, Saraswati Apartments, Kothrud, Pune – 411 038.
(hereinafter referred to as the "Licensee")

RESPECTFULLY SHOWETH:

1. PROPERTY: The Licensor hereby grants Leave and Licence to the Licensee to use and occupy the residential premises described as Flat No. 4B, Saraswati Apartments, Kothrud, Pune – 411 038 (CTS No. 1245/A) for residential purposes only.

2. DURATION: The licence is granted for a period of eleven (11) months commencing from 01.04.2026 and ending on 28.02.2027.

3. LICENCE FEE: The Licensee shall pay a monthly licence fee of ₹18,000/- (Rupees Eighteen Thousand only) in advance on or before the 5th day of each month.

4. SECURITY DEPOSIT: The Licensee has paid a refundable security deposit of ₹54,000/- (Rupees Fifty-Four Thousand only) to the Licensor, receipt of which is hereby acknowledged.

5. STAMP DUTY: This Agreement shall be duly stamped as per the applicable provisions of the Maharashtra Stamp Act, 1958, and registered with the Sub-Registrar of Assurances, Pune.

6. GOVERNING LAW: This Agreement is governed by the Maharashtra Rent Control Act, 1999.

Pune                               Adv. Meera Santosh Kulkarni
Date: 08-03-2026                   Enrolment No: MH/2312/2014`,
    riskScore: 55,
  },
  {
    id: 'doc3',
    title: 'Affidavit — Name Correction (Priya Deshmukhh → Priya Deshmukh)',
    type: 'Affidavit',
    status: 'Revision Needed',
    createdAt: '2026-03-05',
    updatedAt: '2026-03-10',
    clientId: 'u1',
    clientName: 'Priya Suresh Deshmukh',
    lawyerId: 'u2',
    lawyerName: 'Adv. Rahul Vijay Joshi',
    content: `AFFIDAVIT FOR NAME CORRECTION

I, Priya Suresh Deshmukh, daughter of Suresh Dattatray Deshmukh,
Age: 31 years,
Resident of Flat No. 4B, Saraswati Apartments, Kothrud, Pune – 411 038,
do hereby solemnly affirm and state as follows:

RESPECTFULLY SHOWETH:

1. That I am the deponent herein and am competent to swear this affidavit.

2. That my correct and legal name as per my birth certificate and school leaving certificate is PRIYA SURESH DESHMUKH.

3. That my Aadhaar card issued by the Unique Identification Authority of India (UIDAI) bears my name as "PRIYA DESHMUKHH" (with an erroneous double 'H') due to a typographical error at the time of data entry.

4. That the names "PRIYA DESHMUKHH" and "PRIYA SURESH DESHMUKH" both refer to one and the same person, i.e., myself, and there is no other person by either name known to me.

5. That I require the correction of this typographical error in my Aadhaar card and other official records for the purposes of documentation and verification.

6. That this affidavit is made bona fide and the facts stated herein are true to the best of my knowledge and belief.

Solemnly affirmed at Pune this 5th day of March, 2026.

                                   Deponent
                                   Priya Suresh Deshmukh

Sworn before me:
Executive Magistrate, Pune
Date: 05-03-2026`,
  },
  {
    id: 'doc4',
    title: 'Bail Application — Ravi Patil, FIR 187/2026, Kothrud PS',
    type: 'Bail Application',
    status: 'Draft',
    createdAt: '2026-03-10',
    updatedAt: '2026-03-10',
    clientId: 'u1',
    clientName: 'Priya Suresh Deshmukh',
    content: BAIL_APPLICATION_CONTENT,
  },
  {
    id: 'doc5',
    title: 'Vakalatnama — Civil Suit No. 112/2026, Pune District Court',
    type: 'Vakalatnama',
    status: 'Finalized',
    createdAt: '2026-02-28',
    updatedAt: '2026-03-01',
    clientId: 'u1',
    clientName: 'Priya Suresh Deshmukh',
    lawyerId: 'u2',
    lawyerName: 'Adv. Rahul Vijay Joshi',
    content: `VAKALATNAMA

IN THE COURT OF THE DISTRICT JUDGE, PUNE
Civil Suit No. 112 / 2026

Priya Suresh Deshmukh                    ...PLAINTIFF
VERSUS
Sharma Builders & Developers             ...DEFENDANT

VAKALATNAMA

I, Priya Suresh Deshmukh, daughter of Suresh Dattatray Deshmukh,
Age: 31 years,
Resident of Flat No. 4B, Saraswati Apartments, Kothrud, Pune – 411 038,
do hereby appoint, nominate, and retain:

Adv. Rahul Vijay Joshi
Enrolment No. MH/4521/2017
Bar Council of Maharashtra & Goa
Office: Chamber No. 14, District Court Complex, Shivajinagar, Pune – 411 005.

as my Advocate to appear, plead, and act for me in the above-mentioned matter and in all proceedings connected therewith, including appeals, revisions, reviews, and miscellaneous applications.

I authorise my said Advocate to:
(a) File the suit and all pleadings on my behalf;
(b) Appear, plead, and argue before this Hon'ble Court and courts subordinate thereto;
(c) Sign and file pleadings, applications, affidavits, and other documents;
(d) File appeals and revisions in higher courts as may be necessary;
(e) Receive notices and accept service of process on my behalf;
(f) Compromise or settle the claim on such terms as he may deem fit, with my prior consent.

Dated this 28th day of February, 2026 at Pune.

                                   Signature of Client
                                   Priya Suresh Deshmukh

Accepted:
Adv. Rahul Vijay Joshi
Enrolment No: MH/4521/2017
Bar Council of Maharashtra & Goa`,
  },
  {
    id: 'doc6',
    title: 'Partnership Agreement — SwiftServe Solutions LLP',
    type: 'Business Agreement',
    status: 'Draft',
    createdAt: '2026-03-11',
    updatedAt: '2026-03-11',
    clientId: 'u1',
    clientName: 'Priya Suresh Deshmukh',
    content: `LIMITED LIABILITY PARTNERSHIP AGREEMENT
SwiftServe Solutions LLP

This Limited Liability Partnership Agreement is entered into on this 11th day of March, 2026 at Mumbai, Maharashtra.

BETWEEN:
1. Vikram Dilip Pawar, son of Dilip Shriram Pawar,
   Age: 48 years, Resident of Bungalow No. 3, Officers Colony, Civil Lines, Nagpur – 440 001.
   (hereinafter referred to as "Partner 1")

AND:
2. Rohit Prakash Jadhav, son of Prakash Narayan Jadhav,
   Age: 42 years, Resident of House No. 7, Ganesh Nagar, Wardha Road, Nagpur – 440 015.
   (hereinafter referred to as "Partner 2")

RESPECTFULLY SHOWETH:

1. NATURE OF BUSINESS: The LLP shall carry on the business of Information Technology Services and related consulting activities.

2. REGISTERED OFFICE: The Registered Office of the LLP shall be at Office No. 304, Hubtown Viva, Western Express Highway, Andheri East, Mumbai – 400 069.

3. CAPITAL CONTRIBUTION: Each Partner shall contribute ₹5,00,000/- (Rupees Five Lakhs only) as their initial capital contribution.

4. PROFIT AND LOSS SHARING: The profits and losses of the LLP shall be shared equally between the Partners (50:50) unless otherwise agreed in writing.

5. GOVERNING LAW: This Agreement shall be governed by the Laws of India. Disputes shall be subject to the exclusive jurisdiction of Courts at Mumbai.

Pune                               Adv. Rahul Vijay Joshi
Date: 11-03-2026                   Enrolment No: MH/4521/2017`,
  },
  {
    id: 'doc7',
    title: 'Petition — Challenging PMC Notice, Ward Office Kothrud',
    type: 'Petition',
    status: 'Finalized',
    createdAt: '2026-02-15',
    updatedAt: '2026-02-20',
    clientId: 'u1',
    clientName: 'Priya Suresh Deshmukh',
    lawyerId: 'u2',
    lawyerName: 'Adv. Rahul Vijay Joshi',
    content: `IN THE HIGH COURT OF JUDICATURE AT BOMBAY
WRIT PETITION (CIVIL) NO. ___ / 2026
(Under Article 226 of the Constitution of India)

Priya Suresh Deshmukh,
Flat No. 4B, Saraswati Apartments,
Kothrud, Pune – 411 038.
                                         ...PETITIONER

VERSUS

1. The Pune Municipal Corporation,
   Through its Commissioner,
   Shivajinagar, Pune – 411 005.

2. The Ward Officer,
   Kothrud Ward Office, Pune Municipal Corporation.
                                         ...RESPONDENTS

PETITION UNDER ARTICLE 226 OF THE CONSTITUTION OF INDIA

RESPECTFULLY SHOWETH:

1. That the Petitioner is the owner and occupier of the residential flat described above and is aggrieved by the impugned demolition notice dated 05.03.2026 issued by the Respondent No. 2 (Ward Officer, Kothrud Ward, Pune Municipal Corporation) directing demolition of alleged "unauthorised construction".

2. That the said notice has been issued without following due process of law, without affording the Petitioner an opportunity of hearing, and in violation of the principles of natural justice.

3. That the alleged construction in question was carried out in accordance with the sanctioned building plan approved by the Pune Municipal Corporation and is fully compliant with the Development Control Regulations.

4. That the impugned notice is without jurisdiction, illegal, arbitrary, and violates the Petitioner's right to property and right to shelter guaranteed under the Constitution of India.

PRAYER:

It is therefore most respectfully prayed that this Hon'ble Court may be pleased to:

(a) Issue a writ of certiorari or any other appropriate writ, direction or order quashing and setting aside the impugned demolition notice dated 05.03.2026 issued by Respondent No. 2;
(b) Issue a writ of mandamus directing the Respondents not to take any coercive action against the Petitioner in pursuance of the impugned notice;
(c) Award costs of this petition to the Petitioner;
(d) Pass such other and further orders as this Hon'ble Court may deem fit and proper.

WHEREFORE, the Petitioner most humbly prays for the above reliefs.

Mumbai                             Adv. Rahul Vijay Joshi
Date: 15-02-2026                   Enrolment No: MH/4521/2017
                                   Bar Council of Maharashtra & Goa`,
    riskScore: 18,
  },
  {
    id: 'doc8',
    title: 'Affidavit — Loss of Original Documents (Property)',
    type: 'Affidavit',
    status: 'Finalized',
    createdAt: '2026-02-10',
    updatedAt: '2026-02-12',
    clientId: 'u1',
    clientName: 'Priya Suresh Deshmukh',
    lawyerId: 'u3',
    lawyerName: 'Adv. Meera Santosh Kulkarni',
    content: `AFFIDAVIT FOR LOSS OF ORIGINAL SALE DEED

I, Rohit Prakash Jadhav, son of Prakash Narayan Jadhav,
Age: 42 years,
Resident of House No. 7, Ganesh Nagar, Wardha Road, Nagpur – 440 015,
do hereby solemnly affirm and state on oath as follows:

RESPECTFULLY SHOWETH:

1. That I am the owner of the property described as Survey No. 45/2, Near Collector Office, Nashik Road, Nashik – 422 101, vide Sale Deed registered on 15.01.2019 before the Sub-Registrar of Assurances, Nashik.

2. That the original Sale Deed bearing Document No. 1124/2019 has been lost or misplaced and despite best efforts, the same could not be traced.

3. That I lodged a missing document complaint with Nagpur City Police Station (Sadar) vide Undertaking Slip No. 278/2026 dated 08.02.2026.

4. That the said original Sale Deed has not been pledged, mortgaged, encumbered, or deposited with any bank, financial institution, or any other person.

5. That I am the absolute and exclusive owner of the said property and no other person has any right, title, interest, or claim therein.

6. That I require a certified copy of the Sale Deed from the concerned Sub-Registrar office for the purposes of mutation and further dealing with the said property.

7. That this affidavit is made bona fide and the facts stated herein are true to the best of my knowledge and belief.

Solemnly affirmed at Nagpur this 10th day of February, 2026.

                                   Deponent
                                   Rohit Prakash Jadhav

Sworn before me:
Notary Public, Nagpur
Date: 10-02-2026`,
  },
  {
    id: 'doc9',
    title: 'Bail Application — Arjun Rane, FIR 52/2026, Bandra PS',
    type: 'Bail Application',
    status: 'Under Review',
    createdAt: '2026-03-01',
    updatedAt: '2026-03-03',
    clientId: 'u1',
    clientName: 'Priya Suresh Deshmukh',
    lawyerId: 'u3',
    lawyerName: 'Adv. Meera Santosh Kulkarni',
    content: `IN THE COURT OF SESSIONS JUDGE, MUMBAI
Criminal Miscellaneous Application No. 52 / 2026

APPLICATION FOR REGULAR BAIL
U/S 437 CrPC 1973 / SECTION 480 BNSS 2023

IN THE MATTER OF:

Arjun Santosh Rane, son of Santosh Vishnu Rane,
Age: 28 years,
Aadhaar No. XXXX-XXXX-3456,
Resident of B/201, Green Valley CHS, Sector 17, Kharghar, Navi Mumbai – 410 210.

...APPLICANT/ACCUSED

VERSUS

The State of Maharashtra
Through the Station House Officer,
Bandra Police Station, Mumbai.

...RESPONDENT


RESPECTFULLY SHOWETH:

1. That the Applicant is a young first-time offender with no prior criminal record. He is employed as a software engineer and has been a law-abiding member of society his entire life.

2. That FIR No. 52/2026 was registered on 18-02-2026 at Bandra Police Station, Mumbai, under Section 379 of the Indian Penal Code, 1860 (equivalent to Section 303 of the Bharatiya Nyaya Sanhita, 2023) and the allegations are denied in toto.

3. That the investigation is substantially complete and charge-sheet has been filed. The Applicant's continued custody serves no investigative purpose.

4. That the Applicant is the sole earner of his family comprising his widowed mother and younger sister who is pursuing higher education. His continued detention causes irreparable hardship to his dependents.

5. That the Applicant undertakes to cooperate fully with the trial proceedings and to appear before this Hon'ble Court on each and every date of hearing without fail.

PRAYER:

It is therefore most respectfully prayed that this Hon'ble Court may be pleased to:

(i)  Grant regular bail to the Applicant under Section 437 CrPC 1973 / Section 480 BNSS 2023 on such terms and conditions as this Hon'ble Court may deem fit;
(ii) Direct the Applicant to furnish surety bonds of a reasonable amount;
(iii) Pass such other orders as this Hon'ble Court may deem fit and just.

WHEREFORE, the Applicant most humbly prays for the above reliefs in the interest of justice.

Mumbai                             Advocate for the Applicant
Date: 01-03-2026                   Adv. Meera Santosh Kulkarni
                                   Enrolment No: MH/2312/2014
                                   Bar Council of Maharashtra & Goa`,
    riskScore: 40,
  },
  {
    id: 'doc10',
    title: 'Leave & Licence Agreement — Office No. 304, Andheri East',
    type: 'Leave & Licence Agreement',
    status: 'Draft',
    createdAt: '2026-03-12',
    updatedAt: '2026-03-12',
    clientId: 'u1',
    clientName: 'Priya Suresh Deshmukh',
    content: `COMMERCIAL LEAVE AND LICENCE AGREEMENT

This Commercial Leave and Licence Agreement is executed at Mumbai on this 12th day of March, 2026.

BETWEEN:
Om Sai Properties,
Proprietor: Nilesh Ganesh Bhosale, son of Ganesh Ramrao Bhosale,
Age: 52 years, Resident of Flat No. 901, Amanora Apartments, Hadapsar, Pune – 411 028.
(hereinafter referred to as the "Licensor")

AND:
SwiftServe Solutions LLP,
LLPIN: AAB-1234,
Registered Office: Office No. 304, Hubtown Viva, Western Express Highway, Andheri East, Mumbai – 400 069.
Represented by its Designated Partner: Vikram Dilip Pawar.
(hereinafter referred to as the "Licensee")

RESPECTFULLY SHOWETH:

1. PROPERTY: The Licensor grants Leave and Licence to the Licensee to use and occupy the commercial premises described as Office No. 304, Hubtown Viva, Western Express Highway, Andheri East, Mumbai – 400 069, for commercial office purposes only.

2. DURATION: Eleven (11) months commencing from 01.04.2026.

3. LICENCE FEE: ₹45,000/- (Rupees Forty-Five Thousand only) per month, payable in advance on or before the 5th of each month.

4. SECURITY DEPOSIT: ₹1,35,000/- (Rupees One Lakh Thirty-Five Thousand only), refundable at the end of the licence period subject to deductions for any damages.

5. PURPOSE: The licensed premises shall be used solely for commercial office purposes by the Licensee and for no other purpose.

6. STAMP DUTY & REGISTRATION: This Agreement shall be stamped as per Article 36A of Schedule I to the Maharashtra Stamp Act, 1958, and shall be registered at the Sub-Registrar of Assurances, Mumbai. Both parties shall share the stamp duty and registration costs equally unless otherwise agreed.

7. GOVERNING LAW: This Agreement is governed by the Maharashtra Rent Control Act, 1999, and the laws of India.

Mumbai                             [To be executed]
Date: 12-03-2026`,
  },
];



// ===================== CASE LAW RESULTS =====================
export const mockCases: CaseResult[] = [
  {
    id: 'c1',
    caseName: 'Satender Kumar Antil v. Central Bureau of Investigation',
    citation: '(2022) 10 SCC 51',
    court: 'Supreme Court of India',
    year: 2022,
    domain: 'Criminal',
    summary:
      'Landmark judgment consolidating bail jurisprudence in India. The Supreme Court held that bail is the rule and jail is the exception, and directed subordinate courts not to mechanically deny bail. The Court issued comprehensive guidelines to reduce the undertrial population and directed that applications be disposed of within stipulated time frames. The judgment emphasised that the right to personal liberty under Article 21 must be given primacy.',
    keyPhrases: ['bail', 'undertrial', 'personal liberty', 'Article 21', 'CrPC 437', 'BNSS 480'],
    fullText: 'Full judgment text for Satender Kumar Antil v. CBI...',
    relatedCases: ['c2', 'c3'],
  },
  {
    id: 'c2',
    caseName: 'Arnab Ranjan Goswami v. Union of India',
    citation: '(2021) 2 SCC 427',
    court: 'Supreme Court of India',
    year: 2021,
    domain: 'Criminal',
    summary:
      'The Supreme Court reiterated that personal liberty under Article 21 is paramount and cannot be curtailed except by procedure established by law. High Courts must exercise their jurisdiction under Section 439 CrPC with due regard to constitutional values and must not remain silent spectators when liberty is threatened. The Court cautioned against hyper-technical approaches to bail applications.',
    keyPhrases: ['personal liberty', 'Article 21', 'High Court jurisdiction', 'Section 439 CrPC', 'bail'],
    fullText: 'Full judgment text for Arnab Ranjan Goswami v. Union of India...',
    relatedCases: ['c1', 'c3'],
  },
  {
    id: 'c3',
    caseName: 'State of Maharashtra v. Tasneem Rizwan Siddiquee',
    citation: '(2018) 9 SCC 745',
    court: 'Supreme Court of India',
    year: 2018,
    domain: 'Criminal',
    summary:
      'The Court affirmed that in MCOCA cases stringent bail conditions apply, but the court must still evaluate material on record before denying bail. Gravity of offence alone cannot be the sole ground for denial. The judgment laid down that courts must independently scrutinise whether the conditions under Section 21(4) MCOCA are satisfied on the basis of material available at the stage of bail.',
    keyPhrases: ['MCOCA', 'bail conditions', 'organised crime', 'Maharashtra', 'Section 21'],
    fullText: 'Full judgment text for State of Maharashtra v. Tasneem Rizwan Siddiquee...',
    relatedCases: ['c1', 'c2'],
  },
  {
    id: 'c4',
    caseName: 'Prakash Ramchandra Solkar v. State of Maharashtra',
    citation: '2019 (3) Bom CR (Cri) 412',
    court: 'Bombay High Court',
    year: 2019,
    domain: 'Criminal',
    summary:
      'The Bombay High Court granted bail in an IPC Section 302 matter, holding that prolonged incarceration without completion of trial violates the fundamental rights of the accused under Article 21. The Court observed that a trial progressing at a slow pace cannot be a ground to keep the accused in indefinite detention. Bail was granted with conditions including surrender of passport and periodic reporting to the police station.',
    keyPhrases: ['bail', 'IPC 302', 'murder', 'Article 21', 'prolonged incarceration', 'Bombay HC'],
    fullText: 'Full judgment text for Prakash Ramchandra Solkar v. State of Maharashtra...',
    relatedCases: ['c2', 'c5'],
  },
  {
    id: 'c5',
    caseName: 'Anil Dattatray Sawant v. State of Maharashtra',
    citation: '2021 Cri LJ 1832 (Bom)',
    court: 'Bombay High Court',
    year: 2021,
    domain: 'Criminal',
    summary:
      'Anticipatory bail under Section 438 CrPC was granted by the Bombay High Court in a financial fraud case involving allegations under Sections 420 and 406 IPC. The Court observed that economic offences, while serious, do not warrant a blanket denial of anticipatory bail. The court must balance the liberty of the accused with the interests of investigation and must impose appropriate conditions to safeguard both.',
    keyPhrases: ['anticipatory bail', 'Section 438 CrPC', 'Section 482 BNSS', 'IPC 420', 'financial fraud', 'Bombay HC'],
    fullText: 'Full judgment text for Anil Dattatray Sawant v. State of Maharashtra...',
    relatedCases: ['c2', 'c3'],
  },
  {
    id: 'c6',
    caseName: 'Shyam Sunder Kohli v. Sushma Kohli',
    citation: 'AIR 2004 SC 5111',
    court: 'Supreme Court of India',
    year: 2004,
    domain: 'Civil',
    summary:
      'The Supreme Court held that specific performance of an agreement to sell immovable property cannot be refused merely because property prices have escalated since the contract date. The contractual obligations must be honoured under the Transfer of Property Act and the Specific Relief Act. The Court emphasised that equity and fairness demand that parties be held to their contractual bargain.',
    keyPhrases: ['specific performance', 'agreement to sell', 'Transfer of Property Act', 'Specific Relief Act', 'property prices'],
    fullText: 'Full judgment text for Shyam Sunder Kohli v. Sushma Kohli...',
    relatedCases: ['c7', 'c8'],
  },
  {
    id: 'c7',
    caseName: 'Bachhaj Nahar v. Nilima Mandal',
    citation: '(2008) 17 SCC 491',
    court: 'Supreme Court of India',
    year: 2008,
    domain: 'Civil',
    summary:
      'The Court emphasised that pleadings must be specific and the relief claimed must correspond to the cause of action pleaded. Courts cannot grant reliefs not prayed for by the parties. The judgment reinforced the foundational principle of civil procedure that the parties and the court are bound by the pleadings, and deviation from them without amendment is impermissible.',
    keyPhrases: ['pleadings', 'CPC', 'specific relief', 'civil procedure', 'cause of action'],
    fullText: 'Full judgment text for Bachhaj Nahar v. Nilima Mandal...',
    relatedCases: ['c6'],
  },
  {
    id: 'c8',
    caseName: 'Godrej & Boyce Manufacturing Co. Ltd. v. Deputy Secretary, MeitY',
    citation: 'AIR 2017 Bom 13',
    court: 'Bombay High Court',
    year: 2017,
    domain: 'Civil',
    summary:
      'The Bombay High Court upheld the specific performance of a development agreement, holding that readiness and willingness to perform must be demonstrated throughout the period of the suit and not merely at the time of filing. The Court applied the principle that in Maharashtra, development agreements involving land must comply with local planning regulations and Development Control Regulations (DCR).',
    keyPhrases: ['specific performance', 'development agreement', 'readiness and willingness', 'Maharashtra DCR', 'Bombay HC'],
    fullText: 'Full judgment text for Godrej & Boyce v. MeitY...',
    relatedCases: ['c6', 'c7'],
  },
  {
    id: 'c9',
    caseName: 'Tata Consultancy Services Ltd. v. Cyrus Investments Pvt. Ltd.',
    citation: '[2021] 9 SCC 1',
    court: 'Supreme Court of India',
    year: 2021,
    domain: 'Commercial',
    summary:
      'The Supreme Court laid down comprehensive principles for oppression and mismanagement under the Companies Act 2013. The Court held that minority shareholders rights must be balanced against the board\'s business judgment rule. The decision clarified the standard of review for company law petitions before the NCLT and elaborated on the threshold for making out a case of oppression under Sections 241-242 of the Companies Act.',
    keyPhrases: ['oppression', 'mismanagement', 'Companies Act 2013', 'NCLT', 'minority shareholders', 'business judgment rule'],
    fullText: 'Full judgment text for TCS v. Cyrus Investments...',
    relatedCases: ['c8'],
  },
  {
    id: 'c10',
    caseName: 'BCCI v. Deccan Chronicle Holdings Ltd.',
    citation: '2014 SCC OnLine Bom 1064',
    court: 'Bombay High Court',
    year: 2014,
    domain: 'Commercial',
    summary:
      'The Bombay High Court dealt with enforcement of an arbitral award in a high-profile commercial dispute. The Court held that jurisdiction under Section 34 of the Arbitration and Conciliation Act 1996 is narrow and limited to review on grounds of patent illegality apparent on the face of the award or violation of public policy of India. The Court declined to re-examine the merits of the arbitral tribunal\'s findings.',
    keyPhrases: ['arbitration award', 'Section 34', 'Arbitration Act 1996', 'patent illegality', 'public policy', 'Bombay HC'],
    fullText: 'Full judgment text for BCCI v. Deccan Chronicle Holdings...',
    relatedCases: ['c7', 'c9'],
  },
];

// ===================== RISK FLAGS =====================
export const mockRiskFlags: RiskFlag[] = [
  {
    id: 'r1',
    severity: 'HIGH',
    clauseRef: 'Clause 7.2 — Unilateral Cancellation by Developer',
    title: 'Unilateral Cancellation by Developer (RERA Violation)',
    description:
      'Developer can cancel the agreement at sole discretion on 30 days notice. This violates RERA Maharashtra protections for home buyers under Section 11(4)(i) of the Real Estate (Regulation and Development) Act, 2016, and may result in forfeiture of booking amount.',
    originalText:
      'The Developer reserves the right to cancel this Agreement at its sole discretion upon giving 30 days written notice to the Purchaser.',
    suggestedRevision:
      'Cancellation shall only be permitted by mutual written consent or upon material breach after a 60-day cure period. Unilateral cancellation by the Developer shall entitle the Purchaser to a full refund of all amounts paid with interest at SBI MCLR + 2% per annum as per MahaRERA Circular No. 28/2023.',
  },
  {
    id: 'r2',
    severity: 'HIGH',
    clauseRef: 'Clause 9.1 — No RERA-Compliant Possession Date',
    title: 'No Possession Date Specified (RERA Section 18 Exposure)',
    description:
      'No RERA-compliant possession date is specified. Vague timeline exposes both parties to legal uncertainty and violates mandatory RERA Section 18 compensation provisions for delayed possession.',
    originalText:
      'Possession shall be handed over upon completion of construction, timelines subject to change without liability to the Developer.',
    suggestedRevision:
      'Possession shall be delivered by [specific date]. Delay beyond 6 months shall entitle the Purchaser to compensation under Section 18 of the Real Estate (Regulation and Development) Act, 2016 at the prevailing SBI lending rate.',
  },
  {
    id: 'r3',
    severity: 'HIGH',
    clauseRef: 'Clause 12 — Missing Defect Liability Period',
    title: 'No Structural Defect Warranty (RERA Section 14(3) Mandatory)',
    description:
      'No structural defect warranty clause is present. Under Section 14(3) of RERA 2016, developers have a mandatory 5-year structural defect liability. Absence of this clause creates ambiguity about remedies available to the purchaser.',
    originalText:
      '[Clause absent from agreement]',
    suggestedRevision:
      'The Developer shall be liable to rectify any structural defects, defects in workmanship, quality or provision of services for a period of 5 years from the date of handing over possession, as mandated by Section 14(3) of the Real Estate (Regulation and Development) Act, 2016.',
  },
  {
    id: 'r4',
    severity: 'MEDIUM',
    clauseRef: 'Clause 11.3 — Uncapped Maintenance Charges',
    title: 'Uncapped Maintenance Charge Revisions',
    description:
      'Annual maintenance charge revisions are at sole discretion of developer with no ceiling. Can become disproportionately burdensome post-possession and is not compliant with Maharashtra Apartment Ownership Act, 1970.',
    originalText:
      'Maintenance charges may be revised annually at the Developer\'s discretion based on increased costs.',
    suggestedRevision:
      'Maintenance charges may be revised annually not exceeding the Consumer Price Index (CPI) inflation rate for that year, subject to approval of the Residents\' Welfare Association duly formed under Maharashtra Apartment Ownership Act, 1970.',
  },
  {
    id: 'r5',
    severity: 'MEDIUM',
    clauseRef: 'Clause 19.1 — Arbitration Seat Outside Maharashtra',
    title: 'Arbitration Seat in New Delhi — Inconvenient for Maharashtra Party',
    description:
      'Disputes referred to arbitration in New Delhi. Inconvenient for the Maharashtra-based purchaser and excludes Bombay High Court supervisory jurisdiction over arbitral proceedings.',
    originalText:
      'All disputes arising out of or in connection with this Agreement shall be referred to a sole arbitrator in New Delhi.',
    suggestedRevision:
      'Disputes shall be resolved by arbitration in Mumbai under the Arbitration & Conciliation Act, 1996. The seat and venue of arbitration shall be Mumbai, Maharashtra.',
  },
  {
    id: 'r6',
    severity: 'MEDIUM',
    clauseRef: 'Clause 3.1 — Area Specification (Carpet vs. Super Built-Up)',
    title: 'Sale Area Not Specified as Carpet Area (RERA Non-Compliant)',
    description:
      'Sale area stated as "1,050 sq.ft." without specifying whether this is carpet area or super built-up area. RERA mandates all sale agreements to specify carpet area under Section 2(k) of RERA 2016.',
    originalText:
      'The Developer agrees to sell and the Purchaser agrees to purchase the Flat admeasuring 1,050 sq.ft.',
    suggestedRevision:
      'The Developer agrees to sell Flat No. ___ admeasuring [XXX] sq.ft. carpet area as defined under Section 2(k) of the Real Estate (Regulation and Development) Act, 2016.',
  },
  {
    id: 'r7',
    severity: 'LOW',
    clauseRef: 'Clause 20.1 — Stamp Duty & Registration Costs',
    title: 'Stamp Duty Rates Not Specified (Maharashtra Stamp Act)',
    description:
      'Clause states stamp duty costs are to be borne by Purchaser without specifying applicable rates under the Maharashtra Stamp Act, 1958. Purchaser should be made aware of applicable rates on immovable property transactions.',
    originalText:
      'All stamp duty, registration charges and other incidental expenses shall be borne by the Purchaser.',
    suggestedRevision:
      'All stamp duty at applicable rates under Article 25 of Schedule I to the Maharashtra Stamp Act, 1958 (currently 5% in municipal areas) and registration charges under the Registration Act, 1908 shall be borne by the Purchaser.',
  },
];

// ===================== NOTIFICATIONS =====================
export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    text: 'Adv. Rahul Joshi finalised your Supplier Agreement',
    type: 'success',
    timestamp: '1 hour ago',
    read: false,
    icon: '✅',
  },
  {
    id: 'n2',
    text: 'Adv. Meera Kulkarni commented on your Leave & Licence Agreement',
    type: 'info',
    timestamp: '3 hours ago',
    read: false,
    icon: '💬',
  },
  {
    id: 'n3',
    text: 'Revision requested on your Affidavit — Name Correction',
    type: 'warning',
    timestamp: '1 day ago',
    read: false,
    icon: '⚠️',
  },
  {
    id: 'n4',
    text: 'Your Bail Application (FIR 187/2026) draft is incomplete',
    type: 'warning',
    timestamp: '2 days ago',
    read: false,
    icon: '🔔',
  },
  {
    id: 'n5',
    text: 'New case law match found for your search "bail conditions Maharashtra"',
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
    documentTitle: 'Bail Application — Ravi Patil, FIR 187/2026',
    clientName: 'Priya Suresh Deshmukh',
    priority: 'HIGH',
    receivedAt: '2 hours ago',
    documentType: 'Bail Application',
  },
  {
    id: 'q2',
    documentId: 'doc2',
    documentTitle: 'Leave & Licence — Flat 4B, Kothrud, Pune',
    clientName: 'Priya Suresh Deshmukh',
    priority: 'MEDIUM',
    receivedAt: '1 day ago',
    documentType: 'Leave & Licence Agreement',
  },
  {
    id: 'q3',
    documentId: 'doc3',
    documentTitle: 'Affidavit — Name Correction (Priya Deshmukh)',
    clientName: 'Priya Suresh Deshmukh',
    priority: 'LOW',
    receivedAt: '2 days ago',
    documentType: 'Affidavit',
  },
  {
    id: 'q4',
    documentId: 'doc6',
    documentTitle: 'Partnership Agreement — SwiftServe Solutions LLP',
    clientName: 'Vikram Dilip Pawar',
    priority: 'MEDIUM',
    receivedAt: '3 days ago',
    documentType: 'Business Agreement',
  },
  {
    id: 'q5',
    documentId: 'doc5',
    documentTitle: 'Vakalatnama — Civil Suit No. 112/2026',
    clientName: 'Priya Suresh Deshmukh',
    priority: 'LOW',
    receivedAt: '4 days ago',
    documentType: 'Vakalatnama',
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
  { query: 'bail conditions undertrial Maharashtra', time: '2h ago' },
  { query: 'landlord tenant Leave & Licence Bombay HC', time: '1d ago' },
  { query: 'specific performance agreement to sell', time: '2d ago' },
  { query: 'RERA possession delay compensation', time: '3d ago' },
  { query: 'IPC 420 cheating financial fraud bail', time: '5d ago' },
];
