from sqlalchemy import Column, String, Boolean, Enum, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from ..core.database import Base
from .enums import UserRole

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    # native_enum=False → VARCHAR, avoids PG enum mismatch
    role = Column(
        Enum(UserRole, native_enum=False, length=20),
        default=UserRole.CLIENT,
        nullable=False,
    )
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)

    bar_council_number = Column(String, nullable=True)
    enrollment_year = Column(String, nullable=True)
    aadhaar_last4 = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    documents = relationship("Document", back_populates="owner", foreign_keys="Document.owner_id")
    assigned_reviews = relationship("Document", back_populates="assigned_lawyer", foreign_keys="Document.lawyer_id")
    saved_cases = relationship("SavedCase", back_populates="user")
