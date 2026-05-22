import logging
import secrets
import uuid

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.security import decode_token, hash_password
from app.core.supabase_auth import decode_supabase_jwt, verify_supabase_access_token
from app.models.user import User, UserRole

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

_SUPABASE_USER_PASSWORD = "supabase-oauth-user-not-for-login"


async def get_or_create_user_from_supabase(db: AsyncSession, supabase_user: dict) -> User:
    user_id = uuid.UUID(str(supabase_user["id"]))
    email = supabase_user.get("email") or f"{user_id}@supabase.local"
    meta = supabase_user.get("user_metadata") or {}
    full_name = meta.get("full_name") or email.split("@")[0]
    role_str = str(meta.get("role", "client")).lower()

    for lookup_id in (user_id,):
        result = await db.execute(select(User).filter(User.id == lookup_id))
        user = result.scalars().first()
        if user:
            return user

    result = await db.execute(select(User).filter(User.email == email))
    user = result.scalars().first()
    if user:
        return user

    role = UserRole.LAWYER if role_str == "lawyer" else UserRole.CLIENT
    user = User(
        id=user_id,
        email=email,
        full_name=full_name,
        hashed_password=hash_password(_SUPABASE_USER_PASSWORD),
        role=role,
        bar_council_number=meta.get("bar_council_number"),
    )
    db.add(user)
    try:
        await db.commit()
        await db.refresh(user)
        logger.info("Created backend user for Supabase id=%s", user_id)
        return user
    except IntegrityError:
        await db.rollback()
        result = await db.execute(select(User).filter(User.email == email))
        user = result.scalars().first()
        if user:
            return user
        result = await db.execute(select(User).filter(User.id == user_id))
        user = result.scalars().first()
        if user:
            return user
        raise


def _is_supabase_token(token: str) -> bool:
    try:
        claims = decode_supabase_jwt(token)
        return bool(claims.get("id"))
    except Exception:
        return False


async def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated. Sign in via Supabase and try again.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credentials_exception

    # 1) Backend JWT
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if user_id:
            result = await db.execute(select(User).filter(User.id == user_id))
            user = result.scalars().first()
            if user:
                return user
    except JWTError:
        pass

    # 2) Supabase session JWT
    if _is_supabase_token(token):
        try:
            supabase_user = await verify_supabase_access_token(token)
            return await get_or_create_user_from_supabase(db, supabase_user)
        except IntegrityError:
            await db.rollback()
            raise credentials_exception
        except Exception as e:
            logger.warning("Supabase user resolution failed: %s", e)
            raise credentials_exception from e

    raise credentials_exception
