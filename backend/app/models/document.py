from sqlalchemy import Column, String, Text, Enum, ForeignKey, DateTime, JSON, Integer, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from ..core.database import Base
from .enums import DocumentType, DocumentStatus  # noqa: F401

class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    doc_type = Column(
        Enum(DocumentType, native_enum=False, length=50),
        nullable=True,
    )
    status = Column(
        Enum(DocumentStatus, native_enum=False, length=30),
        default=DocumentStatus.DRAFT,
        nullable=True,
    )
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    lawyer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    court_name = Column(String, nullable=True)
    district = Column(String, nullable=True)
    case_number = Column(String, nullable=True)
    ipc_sections = Column(String, nullable=True)

    questionnaire_data = Column(JSON, nullable=True)
    content = Column(Text, nullable=True)
    storage_path = Column(String, nullable=True)
    risk_score = Column(Integer, nullable=True)
    risk_report = Column(JSON, nullable=True)
    summary = Column(JSON, nullable=True)
    version = Column(Integer, default=1, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="documents", foreign_keys=[owner_id])
    assigned_lawyer = relationship("User", back_populates="assigned_reviews", foreign_keys=[lawyer_id])
    versions = relationship("DocumentVersion", back_populates="document")


class DocumentVersion(Base):
    __tablename__ = "document_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False)
    version = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    change_note = Column(Text, nullable=True)
    changed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    document = relationship("Document", back_populates="versions")
