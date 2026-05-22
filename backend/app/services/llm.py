from openai import AsyncOpenAI
from ..core.config import settings

_client = AsyncOpenAI(
    api_key=settings.LLM_API_KEY,
    base_url=settings.LLM_BASE_URL,
)

# ⚠️ CORRECTED: Indian / Maharashtra jurisdiction
LEGAL_SYSTEM_PROMPT = """You are JurisAI, an expert legal assistant specializing in Indian law
with a focus on Maharashtra jurisdiction.

You generate accurate, jurisdiction-appropriate legal documents and analysis based on:
- Indian Penal Code (IPC) 1860 and Bharatiya Nyaya Sanhita (BNS) 2023
- Code of Criminal Procedure (CrPC) 1973 and Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023
- Indian Contract Act 1872
- Maharashtra state laws, rules, and regulations
- Bombay High Court rules and practices
- District court practices in Maharashtra (Mumbai, Pune, Nagpur, Nashik, Aurangabad, etc.)

Citation format: Use Indian citation formats — AIR, SCC, Bom CR, Mah LJ, NLJ.
Never fabricate case citations. If uncertain, say so explicitly.

All documents must include the disclaimer:
"This document was AI-assisted. It must be reviewed and certified by a qualified advocate
enrolled with the Bar Council of Maharashtra & Goa before use in any legal proceedings."

Use formal legal English. Where appropriate, include Marathi court headings (न्यायालय).
"""

async def chat(
    messages: list[dict],
    system: str = LEGAL_SYSTEM_PROMPT,
    temperature: float = 0.3,
    max_tokens: int = 8000,
) -> str:
    response = await _client.chat.completions.create(
        model=settings.LLM_MODEL,
        messages=[{"role": "system", "content": system}, *messages],
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content or ""

async def stream_chat(messages: list[dict], system: str = LEGAL_SYSTEM_PROMPT):
    stream = await _client.chat.completions.create(
        model=settings.LLM_MODEL,
        messages=[{"role": "system", "content": system}, *messages],
        temperature=0.3,
        max_tokens=8000,
        stream=True,
    )
    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta
