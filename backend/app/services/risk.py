import json, re
from .llm import chat


def _parse_json(raw: str) -> dict:
    text = raw.strip()
    text = re.sub(r'^```(?:json)?\s*', '', text)
    text = re.sub(r'\s*```$', '', text)
    m = re.search(r'\{.*\}', text, re.DOTALL)
    if m:
        text = m.group(0)
    return json.loads(text)

# ⚠️ CORRECTED: Indian Contract Act 1872, not Pakistani
RISK_DETECTION_PROMPT = """
You are an Indian contract law expert specialising in Maharashtra jurisdiction.
Analyze the contract below under Indian law (Indian Contract Act 1872, Specific
Relief Act 1963, Arbitration & Conciliation Act 1996, applicable Maharashtra state laws).

Return ONLY a valid JSON object:
{{
  "risk_score": <integer 0-100>,
  "flagged_clauses": [
    {{
      "clause_type": "<type>",
      "severity": "<Low|Medium|High|Critical>",
      "excerpt": "<relevant text, max 100 chars>",
      "explanation": "<plain language explanation>",
      "applicable_law": "<e.g. Indian Contract Act 1872, S.XX>",
      "suggestion": "<alternative clause, only for High/Critical>"
    }}
  ],
  "summary": "<2-3 sentence overall assessment under Indian law>"
}}

Risk categories to check under Indian law:
- Unlimited / uncapped liability clauses (against S.73 Contract Act)
- Missing or vague termination clauses
- Unilateral amendment rights without notice
- Vague or unenforceable dispute resolution (check Arbitration & Conciliation Act 1996)
- Jurisdiction clause — must specify Indian court (preferably Maharashtra)
- One-sided penalty / liquidated damages clauses (S.74 Contract Act)
- Automatic renewal without adequate notice period
- Missing force majeure clause
- Non-compete clauses wider than reasonable (S.27 Contract Act — restraint of trade)
- Missing stamp duty compliance note (Maharashtra Stamp Act 1958)
- Absence of governing law clause (should specify "laws of India")

CONTRACT TEXT:
{text}
"""

async def analyze_contract_risk(text: str) -> dict:
    truncated = text[:10000] if len(text) > 10000 else text
    messages = [{"role": "user", "content": RISK_DETECTION_PROMPT.format(text=truncated)}]
    raw = await chat(messages, temperature=0.1, max_tokens=6000)
    if not raw or not raw.strip():
        return {"risk_score": 50, "flagged_clauses": [],
                "summary": "AI service returned no content. Please retry."}
    try:
        return _parse_json(raw)
    except (json.JSONDecodeError, ValueError, TypeError):
        return {"risk_score": 50, "flagged_clauses": [],
                "summary": "Analysis could not be parsed. Please retry.", "raw": raw}
