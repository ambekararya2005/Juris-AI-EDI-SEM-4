from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.api.deps import get_current_user
from app.models.user import User
from app.services.rag import semantic_search

router = APIRouter(prefix="/search", tags=["search"])


@router.get("/case-law")
async def search_case_law(
    q: str = Query(..., min_length=1),
    court: Optional[str] = Query(None),
    year_from: Optional[int] = Query(None),
    year_to: Optional[int] = Query(None),
    domain: Optional[str] = Query(None),
    top_k: int = Query(10, ge=1, le=25),
    current_user: User = Depends(get_current_user),
):
    court_filter = None if not court or court.lower() in ("all courts", "all") else court
    domain_filter = None if not domain or domain.lower() == "all" else domain

    results = await semantic_search(
        query=q,
        top_k=top_k,
        court_filter=court_filter,
        year_from=year_from,
        year_to=year_to,
        domain_filter=domain_filter,
    )

    return {
        "query": q,
        "count": len(results),
        "results": results,
    }
