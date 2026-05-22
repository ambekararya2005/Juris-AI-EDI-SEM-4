import httpx
from jose import jwt

from app.core.config import settings


def decode_supabase_jwt(token: str) -> dict:
    """Read user id/email from Supabase access token (no network call)."""
    claims = jwt.get_unverified_claims(token)
    if not claims.get("sub"):
        raise ValueError("Invalid Supabase token: missing sub")
    return {
        "id": claims["sub"],
        "email": claims.get("email"),
        "user_metadata": claims.get("user_metadata") or {},
    }


async def verify_supabase_access_token(token: str) -> dict:
    """Validate via Supabase Auth API when possible; fall back to JWT decode."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/user",
                headers={
                    "apikey": settings.SUPABASE_ANON_KEY,
                    "Authorization": f"Bearer {token}",
                },
            )
        if response.status_code == 200:
            return response.json()
    except httpx.HTTPError:
        pass
    return decode_supabase_jwt(token)
