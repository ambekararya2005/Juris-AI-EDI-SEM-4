# JurisAI

An AI-powered legal assistant for Indian law with a focus on Maharashtra jurisdiction. JurisAI helps clients draft legal documents, summarize uploaded contracts, analyse contract risk, and search case law — all guided by a FastAPI backend and a React frontend.

---

## Project Structure

```
Juris-AI-EDI-SEM-4/
├── backend/                  # FastAPI Python application
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py       # Auth dependency (get_current_user)
│   │   │   ├── router.py     # Aggregates all route prefixes
│   │   │   └── routes/
│   │   │       ├── auth.py       # /api/auth  — register, login, me
│   │   │       ├── documents.py  # /api/documents — draft, summarize, risk, Q&A
│   │   │       └── search.py     # /api/search — case law semantic search
│   │   ├── core/
│   │   │   ├── config.py         # Pydantic settings (reads .env)
│   │   │   ├── database.py       # Async SQLAlchemy engine + session
│   │   │   ├── security.py       # bcrypt password hashing, JWT
│   │   │   └── supabase_auth.py  # Supabase client wrapper
│   │   ├── models/               # SQLAlchemy ORM models
│   │   │   ├── user.py           # User, roles
│   │   │   ├── document.py       # Document, DocumentVersion
│   │   │   ├── case_law.py       # CaseLaw, SavedCase
│   │   │   └── enums.py          # UserRole, DocumentType, DocumentStatus
│   │   ├── schemas/              # Pydantic v2 request/response schemas
│   │   │   ├── auth.py
│   │   │   └── document.py
│   │   ├── services/             # Business logic
│   │   │   ├── llm.py            # OpenAI-compatible LLM calls (chat + streaming)
│   │   │   ├── drafting.py       # Legal document generation templates
│   │   │   ├── summarize.py      # PDF/DOCX extraction + AI summarization
│   │   │   ├── risk.py           # Contract risk scoring
│   │   │   └── rag.py            # FAISS vector store + semantic search
│   │   └── main.py               # App factory, CORS, lifespan, exception handlers
│   ├── alembic/                  # Database migrations
│   ├── rag_data/                 # Seed JSON for case law corpus
│   ├── vector_store/             # FAISS index + metadata pickle (auto-generated)
│   ├── requirements.txt
│   └── .env                      # NOT committed — see Environment Variables below
│
├── frontend/                 # React 19 + TypeScript application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/         Login.tsx
│   │   │   ├── client/       ClientDashboard, DocumentWizard, DocumentSummary, MyDocuments
│   │   │   ├── lawyer/       LawyerDashboard, CaseLawSearch, CaseLibrary, DocumentEditor, ReviewQueue
│   │   │   └── shared/       ContractRisk, DocumentViewer, Settings
│   │   ├── components/       Layout, Sidebar, TopBar, UI primitives (Button, Card, Modal…)
│   │   ├── context/          AppContext, AuthContext (Supabase session)
│   │   ├── lib/
│   │   │   ├── api.ts        Typed fetch wrappers for every backend endpoint
│   │   │   └── supabase.ts   Supabase JS client
│   │   ├── data/             mockData.ts, mockService.ts (demo/fallback data)
│   │   └── hooks/            useNotifications, useSavedCases, useSimulatedLoading
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS, React Router v6, Supabase JS |
| Backend | FastAPI, Python 3.13, Uvicorn |
| Database | Supabase (PostgreSQL), async SQLAlchemy 2.0, Alembic migrations |
| Auth | Supabase Auth (JWT) + custom JWT fallback via `python-jose` |
| LLM | OpenAI-compatible API via FastRouter (`openai/gpt-5-nano`) |
| Vector Search | FAISS-CPU + `sentence-transformers/all-MiniLM-L6-v2` |
| Document Parsing | `pdfplumber`, `PyPDF2`, `python-docx` |
| PDF Generation | `jsPDF` (frontend) |
| Background Tasks | Celery + Redis (scaffolded, not yet wired to routes) |

---

## Features

### Client Portal
- **Document Wizard** — multi-step form to generate any of 10 legal document types; calls backend `/api/documents/draft` and streams the result
- **Document Summary** — upload a PDF or DOCX; backend extracts text and returns a structured JSON summary (parties, obligations, deadlines, risk flags, statutes)
- **My Documents** — list previously generated documents
- **Contract Risk Analyser** — upload a contract; receives a 0–100 risk score and a list of flagged clauses with severity, applicable law, and suggested rewording

### Lawyer Portal
- **Case Law Search** — semantic search over an indexed corpus; filter by court, year range, and legal domain
- **Case Library** — saved cases
- **Document Editor** — rich text editor for drafting
- **Review Queue** — documents pending lawyer review

### Supported Document Types
| API key | Display name |
|---|---|
| `vakalatnama` | Vakalatnama |
| `affidavit` | Affidavit |
| `bail_application` | Bail Application |
| `anticipatory_bail` | Anticipatory Bail |
| `petition` | Petition |
| `business_agreement` | Business Agreement |
| `rental_agreement` | Rental Agreement (Leave & Licence) |
| `legal_notice` | Legal Notice |
| `consumer_complaint` | Consumer Complaint |
| `rti_application` | RTI Application |

All templates are tailored to Indian law / Maharashtra jurisdiction (IPC/BNS, CrPC/BNSS, Indian Contract Act 1872, Maharashtra Rent Control Act, Bombay High Court rules, etc.).

---

## API Endpoints

### Auth — `/api/auth`
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user profile |

### Documents — `/api/documents`
| Method | Path | Description |
|---|---|---|
| GET | `/api/documents/` | List documents for current user |
| POST | `/api/documents/draft` | Generate a legal document draft |
| POST | `/api/documents/draft/stream` | Same, but streamed (SSE) |
| POST | `/api/documents/summarize` | Summarize uploaded PDF/DOCX |
| POST | `/api/documents/risk-analysis` | Contract risk analysis |
| POST | `/api/documents/{docId}/qa` | Q&A on a stored document |
| POST | `/api/documents/qa-inline` | Q&A on inline document text |

### Search — `/api/search`
| Method | Path | Description |
|---|---|---|
| GET | `/api/search/case-law` | Semantic case law search (`?q=&court=&year_from=&year_to=&domain=&top_k=`) |

---

## Environment Variables

### Backend — `backend/.env` (create manually, never commit)

```env
# Application
APP_NAME=JurisAI
APP_VERSION=1.0.0
ENVIRONMENT=development
SECRET_KEY=<random 32+ char string>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql+asyncpg://<user>:<password>@<host>:5432/postgres
SYNC_DATABASE_URL=postgresql://<user>:<password>@<host>:5432/postgres

# Supabase
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_KEY=<service role key>
SUPABASE_BUCKET=jurisai-documents

# LLM (OpenAI-compatible)
LLM_API_KEY=<api key>
LLM_BASE_URL=https://go.fastrouter.ai/api/v1
LLM_MODEL=openai/gpt-5-nano

# Embeddings (local, no key needed)
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# Vector store
FAISS_INDEX_PATH=./vector_store/jurisai_caselaw.index
FAISS_METADATA_PATH=./vector_store/jurisai_metadata.pkl

# Redis (Celery)
REDIS_URL=redis://localhost:6379/0

# CORS
FRONTEND_URL=http://localhost:3000
FRONTEND_PROD_URL=https://jurisai.vercel.app
```

### Frontend — `frontend/.env.local` (create manually, never commit)

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_SUPABASE_URL=https://<project>.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<anon key>
```

---

## Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- A Supabase project (free tier works)
- Redis (optional — only needed for background tasks)

### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create backend/.env (see Environment Variables above)

# Run database migrations
alembic upgrade head

# (Optional) Ingest case law corpus into FAISS vector store
python ingest_corpus.py

# Start development server
uvicorn app.main:app --reload --port 8000
```

API docs available at [http://localhost:8000/docs](http://localhost:8000/docs) once running.

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create frontend/.env.local (see Environment Variables above)

# Start development server
npm start
```

App opens at [http://localhost:3000](http://localhost:3000).

---

## Database Migrations

Alembic is configured to run against the Supabase PostgreSQL instance.

```bash
# Apply all pending migrations
alembic upgrade head

# Create a new migration after changing models
alembic revision --autogenerate -m "describe your change"

# Downgrade one step
alembic downgrade -1
```

---

## LLM Notes

The backend uses an OpenAI-compatible API endpoint (FastRouter). The current model `openai/gpt-5-nano` is a **reasoning model** — it spends a portion of `max_tokens` on internal chain-of-thought before producing output. Token budgets across services are set accordingly:

| Service | max_tokens |
|---|---|
| Document drafting | 12 000 |
| Summarization | 6 000 |
| Risk analysis | 6 000 |
| Default chat | 8 000 |

If you switch to a standard instruction-following model (e.g. `gpt-4o-mini`) you can lower these values significantly.

---

## Known Limitations / TODO

- **Celery/Redis tasks** are scaffolded in requirements but no routes use background tasks yet
- **Document storage** — generated documents are stored in the local Supabase database; Supabase Storage bucket upload is not yet wired up
- **Lawyer review flow** — the Review Queue UI exists but the backend approval/rejection endpoint is not implemented
- **Streaming draft** — the SSE endpoint (`/draft/stream`) is implemented on the backend; the frontend `DocumentWizard` uses the non-streaming version
- **Authentication** — both Supabase Auth and a custom JWT path exist; some pages still fall back to mock data when the backend is unreachable
- **RAG corpus** — `rag_data/cases.json` contains a small seed corpus; a larger corpus and periodic re-indexing would improve case law search quality

---

## Disclaimer

All AI-generated documents are for informational purposes only. They must be reviewed and certified by a qualified advocate enrolled with the Bar Council of Maharashtra & Goa before use in any legal proceedings.
