from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from app.models.enums import DocumentType, DocumentStatus


class InlineQARequest(BaseModel):
    text: str
    question: str
    history: Optional[List[Dict[str, Any]]] = []


class DocumentQARequest(BaseModel):
    question: str
    history: Optional[List[Dict[str, Any]]] = []

class DocumentDraftRequest(BaseModel):
    doc_type: str
    title: str
    questionnaire_data: Dict[str, Any]
    court_name: Optional[str] = None
    district: Optional[str] = None
    ipc_sections: Optional[str] = None

class DocumentResponse(BaseModel):
    id: Any
    title: str
    doc_type: Optional[DocumentType] = None
    status: Optional[DocumentStatus] = None
    owner_id: Any
    lawyer_id: Optional[Any] = None
    court_name: Optional[str] = None
    district: Optional[str] = None
    case_number: Optional[str] = None
    ipc_sections: Optional[str] = None
    questionnaire_data: Optional[Dict[str, Any]] = None
    content: Optional[str] = None
    created_at: Any
    
    class Config:
        from_attributes = True
