import pickle, os, faiss, numpy as np
from sentence_transformers import SentenceTransformer
from typing import Optional
from ..core.config import settings
from .llm import chat

_embedder = SentenceTransformer(settings.EMBEDDING_MODEL)
_index: Optional[faiss.IndexFlatL2] = None
_metadata: list[dict] = []

def load_vector_store():
    global _index, _metadata
    if os.path.exists(settings.FAISS_INDEX_PATH) and os.path.exists(settings.FAISS_METADATA_PATH):
        _index = faiss.read_index(settings.FAISS_INDEX_PATH)
        with open(settings.FAISS_METADATA_PATH, "rb") as f:
            _metadata = pickle.load(f)
        print(f"[RAG] Loaded {len(_metadata)} cases from vector store.")
    else:
        # Create vector store directory if it doesn't exist
        os.makedirs(os.path.dirname(settings.FAISS_INDEX_PATH), exist_ok=True)
        _index = faiss.IndexFlatL2(384)
        _metadata = []
        print("[RAG] No existing index. Starting fresh.")

def ingest_cases(cases: list[dict]):
    global _index, _metadata
    # Ensure loaded
    if _index is None:
        load_vector_store()
    texts = [
        f"{c['case_name']} | {c['court']} {c['year']} | {c['domain']} | {c['summary']}"
        for c in cases
    ]
    embeddings = _embedder.encode(texts, normalize_embeddings=True).astype("float32")
    _index.add(embeddings)
    _metadata.extend(cases)
    faiss.write_index(_index, settings.FAISS_INDEX_PATH)
    with open(settings.FAISS_METADATA_PATH, "wb") as f:
        pickle.dump(_metadata, f)

async def semantic_search(
    query: str,
    top_k: int = 5,
    court_filter: Optional[str] = None,
    year_from: Optional[int] = None,
    year_to: Optional[int] = None,
    domain_filter: Optional[str] = None,
    bench_filter: Optional[str] = None,
    outcome_filter: Optional[str] = None,
) -> list[dict]:
    # Ensure loaded
    if _index is None:
        load_vector_store()
    if _index is None or _index.ntotal == 0:
        return []
    query_vec = _embedder.encode([query], normalize_embeddings=True).astype("float32")
    distances, indices = _index.search(query_vec, min(top_k * 3, _index.ntotal))
    results = []
    for dist, idx in zip(distances[0], indices[0]):
        if idx == -1:
            continue
        case = _metadata[idx].copy()
        if court_filter and court_filter.lower() not in case.get("court", "").lower():
            continue
        if year_from and case.get("year", 0) < year_from:
            continue
        if year_to and case.get("year", 0) > year_to:
            continue
        if domain_filter and domain_filter.lower() != case.get("domain", "").lower():
            continue
        if bench_filter and bench_filter.lower() != case.get("bench_type", "").lower():
            continue
        if outcome_filter and outcome_filter.lower() != case.get("outcome", "").lower():
            continue
        case["relevance_score"] = float(1 - dist)
        results.append(case)
        if len(results) >= top_k:
            break
    return results

async def rag_query(query: str, top_k: int = 5, filters: dict = {}) -> dict:
    retrieved = await semantic_search(query, top_k=top_k, **filters)
    if not retrieved:
        return {
            "answer": "No relevant Indian case law found for this query. Try broader terms or different filters.",
            "sources": []
        }
    context_parts = []
    for i, case in enumerate(retrieved, 1):
        context_parts.append(
            f"[{i}] {case['case_name']} ({case['citation']})\n"
            f"Court: {case['court']} | Year: {case['year']} | Domain: {case['domain']}\n"
            f"Summary: {case['summary']}"
        )
    context = "\n\n".join(context_parts)
    messages = [{
        "role": "user",
        "content": (
            f"Based on the following Indian case law, answer the legal research query.\n\n"
            f"QUERY: {query}\n\n"
            f"RETRIEVED CASES:\n{context}\n\n"
            f"Provide a concise legal analysis referencing cases by citation. "
            f"Only cite cases provided — do not invent citations. "
            f"Prioritize Bombay High Court and Supreme Court of India authority."
        )
    }]
    answer = await chat(messages, temperature=0.2)
    return {"answer": answer, "sources": retrieved}

