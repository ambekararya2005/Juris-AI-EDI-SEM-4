"""
Idempotent seed script — creates demo users and sample documents.
Run from the backend/ directory:
    python seed_demo.py
"""
import asyncio
import sys
import os

# ensure the app package is on the path
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models.user import User
from app.models.document import Document
from app.models.enums import UserRole, DocumentType, DocumentStatus


DEMO_CLIENT_EMAIL = "demo@jurisai.in"
DEMO_LAWYER_EMAIL = "lawyer@jurisai.in"
DEMO_PASSWORD = "Demo@1234"

SAMPLE_DOCS = [
    {
        "title": "Leave and Licence Agreement — Flat No. 304, Shivaji Nagar, Pune",
        "doc_type": DocumentType.RENTAL_AGREEMENT,
        "status": DocumentStatus.FINALIZED,
        "content": """LEAVE AND LICENCE AGREEMENT

This Leave and Licence Agreement is entered into at Pune on the 1st day of January 2026.

BETWEEN

Shri Ramesh Govind Kulkarni, residing at 12/A, Prabhat Road, Pune - 411004,
hereinafter referred to as the "Licensor";

AND

Shri Anand Suresh Patil, residing at 45, Deccan Gymkhana, Pune - 411004,
hereinafter referred to as the "Licensee".

WHEREAS the Licensor is the absolute owner of residential premises bearing Flat No. 304,
3rd Floor, Shivaji Towers, Shivaji Nagar, Pune - 411005 (hereinafter referred to as the
"Licensed Premises").

NOW THEREFORE this Agreement witnesses as follows:

1. LICENCE PERIOD: The licence is granted for a period of 11 (Eleven) months commencing
   from 1st January 2026 and ending on 30th November 2026.

2. LICENCE FEE: The monthly licence fee shall be Rs. 18,000/- (Rupees Eighteen Thousand
   Only) payable on or before the 5th of each month.

3. SECURITY DEPOSIT: The Licensee has paid a refundable security deposit of Rs. 54,000/-
   (Rupees Fifty-Four Thousand Only).

4. PURPOSE: The Licensed Premises shall be used for residential purpose only.

5. MAINTENANCE: The Licensee shall maintain the premises in good condition.

6. STAMP DUTY: This Agreement is registered pursuant to Section 55 of the Maharashtra
   Rent Control Act, 1999 and the Registration Act, 1908.

IN WITNESS WHEREOF the parties have executed this Agreement on the day first mentioned above.

LICENSOR: Ramesh Govind Kulkarni
LICENSEE: Anand Suresh Patil

⚠️ AI-generated. Must be reviewed by a qualified advocate enrolled with the Bar Council
of Maharashtra & Goa before use in any legal proceedings.
""",
    },
    {
        "title": "Legal Notice — Recovery of Dues — Shri Vijay Traders",
        "doc_type": DocumentType.LEGAL_NOTICE,
        "status": DocumentStatus.UNDER_REVIEW,
        "content": """LEGAL NOTICE

From:
Adv. Priya Desai
Bar Council Enr. No. MH/2018/4521
Chamber No. 12, Advocate's Association Building,
High Court Road, Nagpur - 440001.

Date: 15 January 2026

To:
M/s Vijay Traders,
Through its Proprietor Shri Vijay Kumar Sharma,
Plot No. 22, MIDC Industrial Area,
Butibori, Nagpur - 441108.

SUBJECT: Recovery of outstanding dues of Rs. 4,75,000/-

Sir,

Under instructions from and on behalf of my client, M/s Apex Manufacturing Pvt. Ltd.,
I hereby serve upon you this Legal Notice as under:

1. My client had supplied industrial components worth Rs. 4,75,000/- vide Invoice No.
   APX/2025/0892 dated 10 October 2025 to your firm under a Purchase Order dated 01
   October 2025.

2. Despite repeated requests and reminders, you have failed and neglected to make payment
   of the said amount, which has been outstanding for more than 90 days.

3. Your failure to pay constitutes a breach of contract and entitles my client to recover
   the said amount along with 18% interest per annum under the provisions of the Interest
   Act, 1978 and the Indian Contract Act, 1872.

DEMAND: You are hereby called upon to pay the outstanding sum of Rs. 4,75,000/- along
with interest and legal costs within 15 (Fifteen) days of receipt of this notice.

In default, my client shall be constrained to initiate appropriate legal proceedings
before the competent courts in Nagpur, at your risk, cost, and consequences.

Adv. Priya Desai

⚠️ AI-generated. Must be reviewed by a qualified advocate before use in legal proceedings.
""",
    },
    {
        "title": "Affidavit — Income Declaration — Suresh Bhimrao More",
        "doc_type": DocumentType.AFFIDAVIT,
        "status": DocumentStatus.DRAFT,
        "content": """AFFIDAVIT

I, Suresh Bhimrao More, aged about 42 years, residing at House No. 7, Ganesh Nagar,
Aurangabad - 431001, do hereby solemnly affirm and state as follows:

1. I am the deponent herein and am fully conversant with the facts stated herein.

2. I am employed as a Senior Technician at Maharashtra State Electricity Distribution Company
   Limited (MSEDCL), Aurangabad Division, bearing Employee No. MSEDCL/AUR/2834.

3. My gross monthly salary as per the last salary certificate dated December 2025 is
   Rs. 52,400/- per month. My annual income for the financial year 2024-25 was
   Rs. 5,78,600/-.

4. I do not have any other source of income except my employment income stated above.

5. I am making this affidavit for the purpose of submission to the District Collector's
   Office, Aurangabad in connection with an application for Government housing scheme.

6. I declare that the facts stated above are true and correct to the best of my knowledge,
   information, and belief.

DEPONENT: Suresh Bhimrao More
PLACE: Aurangabad
DATE: 20 January 2026

VERIFICATION: Verified at Aurangabad on this 20th day of January 2026 that the contents
of the above affidavit are true and correct to the best of my knowledge and belief and
nothing material has been concealed therefrom.

Solemnly affirmed before me on this 20th day of January 2026.

Notary Public / Oath Commissioner

⚠️ AI-generated. Must be reviewed by a qualified advocate enrolled with the Bar Council
of Maharashtra & Goa before use in any legal proceedings.
""",
    },
]


async def seed():
    async with AsyncSessionLocal() as db:
        # ── Client demo user ────────────────────────────────────────
        result = await db.execute(select(User).where(User.email == DEMO_CLIENT_EMAIL))
        client_user = result.scalars().first()
        if not client_user:
            client_user = User(
                email=DEMO_CLIENT_EMAIL,
                full_name="Demo Client",
                hashed_password=hash_password(DEMO_PASSWORD),
                role=UserRole.CLIENT,
                is_active=True,
                is_verified=True,
            )
            db.add(client_user)
            await db.commit()
            await db.refresh(client_user)
            print(f"Created client: {DEMO_CLIENT_EMAIL}")
        else:
            print(f"Client already exists: {DEMO_CLIENT_EMAIL}")

        # ── Lawyer demo user ────────────────────────────────────────
        result = await db.execute(select(User).where(User.email == DEMO_LAWYER_EMAIL))
        lawyer_user = result.scalars().first()
        if not lawyer_user:
            lawyer_user = User(
                email=DEMO_LAWYER_EMAIL,
                full_name="Demo Lawyer",
                hashed_password=hash_password(DEMO_PASSWORD),
                role=UserRole.LAWYER,
                is_active=True,
                is_verified=True,
                bar_council_number="MH/2020/9876",
            )
            db.add(lawyer_user)
            await db.commit()
            await db.refresh(lawyer_user)
            print(f"Created lawyer: {DEMO_LAWYER_EMAIL}")
        else:
            print(f"Lawyer already exists: {DEMO_LAWYER_EMAIL}")

        # ── Sample documents for client ─────────────────────────────
        for doc_data in SAMPLE_DOCS:
            result = await db.execute(
                select(Document).where(
                    Document.owner_id == client_user.id,
                    Document.title == doc_data["title"],
                )
            )
            existing = result.scalars().first()
            if not existing:
                doc = Document(
                    title=doc_data["title"],
                    doc_type=doc_data["doc_type"],
                    status=doc_data["status"],
                    owner_id=client_user.id,
                    content=doc_data["content"],
                    version=1,
                )
                db.add(doc)
                print(f"Created document: {doc_data['title'][:60]}")
            else:
                print(f"Document already exists: {doc_data['title'][:60]}")

        await db.commit()
        print("Seed complete.")


if __name__ == "__main__":
    asyncio.run(seed())
