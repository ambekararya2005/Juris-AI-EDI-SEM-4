from .llm import chat, stream_chat
from typing import AsyncGenerator

# ⚠️ All templates corrected to Indian / Maharashtra jurisdiction
DOCUMENT_TEMPLATES = {

    "vakalatnama": """
        Generate a formal Vakalatnama under Indian law.
        The Vakalatnama authorises an advocate enrolled with the Bar Council of Maharashtra & Goa
        to appear, act, and plead on behalf of the client in the specified court.
        Structure: court heading in English and Marathi (न्यायालय), case details,
        client particulars (name, Aadhaar last 4 optional), advocate details (name,
        Bar Council enrollment no., chamber address), scope of authority, revocation clause,
        signature block, date, and notary/oath commissioner attestation block.
        Reference: Order III Rule 4, CPC 1908.
        Inputs: {inputs}
    """,

    "affidavit": """
        Generate a formal Affidavit under Indian law.
        Reference: Indian Oaths Act 1969, Code of Civil Procedure Order XIX.
        Structure: court/authority heading, deponent's full details, statement of facts
        (numbered paragraphs), verification clause ("I, the above-named deponent, do hereby
        solemnly affirm and state..."), place/date, deponent's signature, and attestation
        block for Notary Public / Oath Commissioner / Executive Magistrate.
        Inputs: {inputs}
    """,

    "bail_application": """
        Generate a formal Regular Bail Application for a Maharashtra Sessions Court or
        Bombay High Court.
        Reference: Section 437 / 439 CrPC 1973 (or S.480 / S.483 BNSS 2023 if applicable).
        Structure:
        1. Court heading (court name, district, Maharashtra)
        2. Cause title (State of Maharashtra vs. Accused Name)
        3. FIR details (FIR No., Police Station, District, Date, IPC/BNS sections)
        4. Brief facts of the case
        5. Grounds for bail (factual + legal, cite relevant Supreme Court / Bombay HC precedents)
        6. Undertaking and surety details
        7. Prayer clause
        8. Advocate's signature block with Bar Council enrollment no.
        Inputs: {inputs}
    """,

    "anticipatory_bail": """
        Generate a formal Anticipatory Bail Application under Section 438 CrPC 1973
        (or Section 482 BNSS 2023 if applicable) for a Maharashtra Sessions Court or
        Bombay High Court.
        Include: court heading, applicant details, apprehension of arrest details,
        FIR/complaint details if registered, legal grounds citing landmark Supreme Court
        judgments (Gurbaksh Singh Sibbia v. State of Punjab, Sushila Aggarwal v. State),
        conditions the applicant is willing to comply with, prayer, and advocate's block.
        Inputs: {inputs}
    """,

    "petition": """
        Generate a formal Petition for a Maharashtra court or authority.
        Structure: court/authority heading (include district and Maharashtra state),
        cause title, jurisdiction statement citing relevant statute,
        facts (numbered), legal grounds, relief sought, verification clause,
        petitioner's signature, advocate's signature with Bar Council enrollment no.
        Inputs: {inputs}
    """,

    "business_agreement": """
        Generate a Business/Commercial Agreement governed by Indian law.
        Reference: Indian Contract Act 1872, Specific Relief Act 1963,
        Arbitration and Conciliation Act 1996.
        Structure: parties (with registered addresses in Maharashtra),
        recitals, definitions, obligations, payment terms in INR (₹),
        intellectual property clause, confidentiality and non-disclosure,
        termination and force majeure, dispute resolution (arbitration in Pune/Mumbai,
        governed by Arbitration & Conciliation Act 1996), governing law
        (laws of India, jurisdiction: competent courts in [city], Maharashtra),
        and signatures with witnesses.
        Inputs: {inputs}
    """,

    "rental_agreement": """
        Generate a Leave and Licence Agreement (Rental Agreement) compliant with
        Maharashtra law.
        Reference: Maharashtra Rent Control Act 1999, Registration Act 1908
        (mandatory registration for agreements > 11 months).
        Structure: licensor and licensee details, property address (Maharashtra),
        licence period (typically 11 months to avoid Rent Control Act protections),
        monthly licence fee in INR (₹), security deposit, maintenance responsibilities,
        lock-in period, notice period, prohibited uses, termination clause,
        registration clause and stamp duty note, witness block, and signatures.
        Inputs: {inputs}
    """,

    "legal_notice": """
        Generate a formal Legal Notice under Indian law.
        Structure: sender's advocate details (name, Bar Council enrollment, address),
        date, recipient details with address (Maharashtra), subject line,
        detailed facts, legal basis for the claim, specific demand / relief sought,
        consequences of non-compliance, response deadline (typically 15 or 30 days),
        and advocate's signature.
        Inputs: {inputs}
    """,

    "consumer_complaint": """
        Generate a Consumer Complaint for filing before a Maharashtra District Consumer
        Disputes Redressal Commission.
        Reference: Consumer Protection Act 2019.
        Structure: commission heading (district, Maharashtra), complainant details,
        opposite party (OP) details, jurisdiction statement (pecuniary + territorial),
        facts of the case, deficiency in service / unfair trade practice details,
        relief sought (compensation in INR, replacement, refund, damages),
        list of documents/annexures, verification clause, and complainant's signature.
        Inputs: {inputs}
    """,

    "rti_application": """
        Generate an RTI Application under the Right to Information Act 2005.
        Structure: To The Public Information Officer (with department name and
        Maharashtra government office address), applicant details (name, address,
        Aadhaar/ID optional), specific information sought (numbered points),
        application fee note (₹10 by IPO/DD/online for central; check state fee),
        declaration clause, date, place (Maharashtra), and applicant's signature.
        Inputs: {inputs}
    """,
}

async def generate_draft(doc_type: str, questionnaire_data: dict) -> str:
    template = DOCUMENT_TEMPLATES.get(doc_type)
    if not template:
        raise ValueError(f"Unsupported document type: {doc_type}")
    prompt = template.format(inputs=str(questionnaire_data))
    messages = [{"role": "user", "content": prompt}]
    return await chat(messages, temperature=0.2, max_tokens=12000)

async def stream_draft(doc_type: str, questionnaire_data: dict):
    template = DOCUMENT_TEMPLATES.get(doc_type)
    if not template:
        raise ValueError(f"Unsupported document type: {doc_type}")
    prompt = template.format(inputs=str(questionnaire_data))
    messages = [{"role": "user", "content": prompt}]
    async for chunk in stream_chat(messages):
        yield chunk
