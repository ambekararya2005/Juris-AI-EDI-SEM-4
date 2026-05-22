"""PostgreSQL enum columns use member *names* (e.g. UPLOADED) to match the DB types."""
import enum


def pg_enum_values(enum_cls: type[enum.Enum]) -> list[str]:
    return [member.name for member in enum_cls]


class UserRole(str, enum.Enum):
    CLIENT = "client"
    LAWYER = "lawyer"
    ADMIN = "admin"


class DocumentType(str, enum.Enum):
    VAKALATNAMA = "vakalatnama"
    PETITION = "petition"
    AFFIDAVIT = "affidavit"
    BAIL_APPLICATION = "bail_application"
    ANTICIPATORY_BAIL = "anticipatory_bail"
    BUSINESS_AGREEMENT = "business_agreement"
    RENTAL_AGREEMENT = "rental_agreement"
    LEGAL_NOTICE = "legal_notice"
    CONSUMER_COMPLAINT = "consumer_complaint"
    RTI_APPLICATION = "rti_application"
    UPLOADED = "uploaded"


class DocumentStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    UNDER_REVIEW = "under_review"
    REVISION_REQUESTED = "revision_requested"
    FINALIZED = "finalized"
