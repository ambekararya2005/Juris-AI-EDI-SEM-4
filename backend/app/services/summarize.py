import pdfplumber, docx as python_docx, io, json, re
from .llm import chat


def _parse_json(raw: str) -> dict:
    """Strip markdown fences and parse JSON, raising ValueError on failure."""
    text = raw.strip()
    # Strip ```json ... ``` or ``` ... ``` fences
    text = re.sub(r'^```(?:json)?\s*', '', text)
    text = re.sub(r'\s*```$', '', text)
    # Extract first JSON object if there's surrounding text
    m = re.search(r'\{.*\}', text, re.DOTALL)
    if m:
        text = m.group(0)
    return json.loads(text)

SUMMARY_PROMPT = """
Analyze this Indian legal document and produce a structured summary in JSON:

{{
  "overview": "2-3 sentence overview",
  "key_parties": [{{"name": "", "role": ""}}],
  "key_obligations": ["obligation 1"],
  "dates_and_deadlines": [{{"event": "", "date": ""}}],
  "applicable_statutes": ["Indian Contract Act 1872 S.XX", "IPC S.XX"],
  "jurisdiction": "e.g. Bombay High Court / Pune Sessions Court / Maharashtra",
  "risk_flags": ["risk 1"],
  "unusual_clauses": ["clause description"]
}}

Respond ONLY with valid JSON. No preamble, no markdown fences.

DOCUMENT TEXT:
{text}
"""

async def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    if len(file_bytes) < 50:
        raise ValueError("File is empty or too small to read.")

    if filename.lower().endswith(".pdf"):
        text_parts: list[str] = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text_parts.append(extracted)
        if not "".join(text_parts).strip():
            try:
                from PyPDF2 import PdfReader
                reader = PdfReader(io.BytesIO(file_bytes))
                text_parts = [p.extract_text() or "" for p in reader.pages]
            except Exception:
                pass
        return "\n".join(text_parts)
    elif filename.lower().endswith(".docx"):
        doc = python_docx.Document(io.BytesIO(file_bytes))
        return "\n".join(para.text for para in doc.paragraphs)
    else:
        raise ValueError("Only PDF and DOCX files are supported.")

async def summarize_document(text: str) -> dict:
    truncated = text[:12000] if len(text) > 12000 else text
    messages = [{"role": "user", "content": SUMMARY_PROMPT.format(text=truncated)}]
    raw = await chat(messages, temperature=0.1, max_tokens=6000)
    if not raw or not raw.strip():
        return {"overview": "AI service returned no content. Please retry.",
                "key_parties": [], "key_obligations": [], "dates_and_deadlines": [],
                "applicable_statutes": [], "jurisdiction": "", "risk_flags": [],
                "unusual_clauses": []}
    try:
        return _parse_json(raw)
    except (json.JSONDecodeError, ValueError, TypeError):
        return {"overview": raw, "key_parties": [], "key_obligations": [],
                "dates_and_deadlines": [], "applicable_statutes": [],
                "jurisdiction": "", "risk_flags": [], "unusual_clauses": []}

async def document_qa(text: str, question: str, history: list[dict]) -> str:
    system = (
        f"You are analyzing an Indian legal document governed by Indian law "
        f"(Maharashtra jurisdiction). Answer questions based ONLY on its content.\n\n"
        f"DOCUMENT:\n{text[:8000]}"
    )
    messages = [*history, {"role": "user", "content": question}]
    return await chat(messages, system=system, temperature=0.3)