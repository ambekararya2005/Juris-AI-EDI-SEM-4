from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from ..core.database import Base

class CaseLaw(Base):
    __tablename__ = "case_law"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_name = Column(String, nullable=False)

    # Indian citation formats: AIR 2019 SC 872 / (2019) 5 SCC 712 / 2021 Bom CR 445
    citation = Column(String, nullable=False, unique=True)

    court = Column(String, nullable=False)
    # Valid values: "Supreme Court of India", "Bombay High Court",
    # "Nagpur Bench (Bombay HC)", "Aurangabad Bench (Bombay HC)",
    # "Pune Sessions Court", "Mumbai Sessions Court", etc.

    year = Column(Integer, nullable=False)
    legal_domain = Column(String, nullable=False)
    # Values: criminal, civil, family, commercial, constitutional,
    #         consumer, labour, property, motor_accident

    bench_type = Column(String, nullable=True)
    # Values: single, division, full_bench, constitution

    outcome = Column(String, nullable=True)
    # Values: acquitted, convicted, remanded, appeal_allowed, appeal_dismissed,
    #         bail_granted, bail_rejected

    ipc_sections = Column(String, nullable=True)    # Relevant IPC/BNS sections
    summary = Column(Text, nullable=False)
    full_text = Column(Text, nullable=True)
    source_url = Column(String, nullable=True)
    faiss_id = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SavedCase(Base):
    __tablename__ = "saved_cases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    case_id = Column(UUID(as_uuid=True), ForeignKey("case_law.id"), nullable=True)
    matter_label = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="saved_cases")
    case = relationship("CaseLaw")
