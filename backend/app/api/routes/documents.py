import logging
import uuid
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.document import Document, DocumentVersion
from app.models.enums import DocumentStatus, DocumentType
from app.models.user import User
from app.schemas.document import (
    DocumentDraftRequest,
    DocumentQARequest,
    DocumentResponse,
    InlineQARequest,
)
from app.services.drafting import generate_draft, stream_draft
from app.services.risk import analyze_contract_risk
from app.services.summarize import document_qa, extract_text_from_file, summarize_document

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("/", response_model=list[DocumentResponse])
async def list_documents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Document)
        .where(Document.owner_id == current_user.id)
        .order_by(Document.created_at.desc())
    )
    return result.scalars().all()


@router.post("/draft", response_model=DocumentResponse)
async def draft_document(
    request: DocumentDraftRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        try:
            doc_enum = DocumentType(request.doc_type)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported document type: {request.doc_type}",
            )

        content = await generate_draft(request.doc_type, request.questionnaire_data)

        db_doc = Document(
            title=request.title,
            doc_type=doc_enum,
            status=DocumentStatus.DRAFT,
            owner_id=current_user.id,
            content=content,
            questionnaire_data=request.questionnaire_data,
            court_name=request.court_name or request.questionnaire_data.get("court"),
            district=request.district or request.questionnaire_data.get("district"),
            ipc_sections=request.ipc_sections or request.questionnaire_data.get("ipc_sections"),
        )
        db.add(db_doc)
        await db.commit()
        await db.refresh(db_doc)

        db_version = DocumentVersion(
            document_id=db_doc.id,
            version=1,
            content=content,
            change_note="Initial draft generation",
            changed_by=current_user.id,
        )
        db.add(db_version)
        await db.commit()

        return db_doc

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate draft: {str(e)}",
        )


@router.post("/draft/stream")
async def stream_document_draft(
    request: DocumentDraftRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        try:
            doc_enum = DocumentType(request.doc_type)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported document type: {request.doc_type}",
            )

        async def generator():
            full_content = []
            try:
                async for chunk in stream_draft(request.doc_type, request.questionnaire_data):
                    full_content.append(chunk)
                    yield chunk

                final_text = "".join(full_content)
                db_doc = Document(
                    title=request.title,
                    doc_type=doc_enum,
                    status=DocumentStatus.DRAFT,
                    owner_id=current_user.id,
                    content=final_text,
                    questionnaire_data=request.questionnaire_data,
                    court_name=request.court_name or request.questionnaire_data.get("court"),
                    district=request.district or request.questionnaire_data.get("district"),
                    ipc_sections=request.ipc_sections or request.questionnaire_data.get("ipc_sections"),
                )
                db.add(db_doc)
                await db.commit()
                await db.refresh(db_doc)

                db_version = DocumentVersion(
                    document_id=db_doc.id,
                    version=1,
                    content=final_text,
                    change_note="Initial stream-draft generation",
                    changed_by=current_user.id,
                )
                db.add(db_version)
                await db.commit()

            except Exception as e:
                await db.rollback()
                yield f"\n[STREAM ERROR: {str(e)}]"

        return StreamingResponse(generator(), media_type="text/event-stream")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Streaming initialization failed: {str(e)}",
        )


@router.post("/summarize")
async def summarize_uploaded_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    file_bytes = await file.read()
    filename = file.filename or "document.pdf"

    if len(file_bytes) < 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty. Choose a valid PDF or DOCX.",
        )

    try:
        text = await extract_text_from_file(file_bytes, filename)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    if not text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not extract text from this PDF. It may be a scanned image-only file.",
        )

    try:
        summary = await summarize_document(text)
    except Exception as e:
        logger.exception("LLM summarization failed")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI summarization failed: {str(e)}",
        )

    session_id = str(uuid.uuid4())
    document_id = None
    try:
        db_doc = Document(
            title=filename,
            doc_type=DocumentType.UPLOADED,
            status=DocumentStatus.DRAFT,
            owner_id=current_user.id,
            content=text[:50000],
            summary=summary,
        )
        db.add(db_doc)
        await db.commit()
        await db.refresh(db_doc)
        document_id = str(db_doc.id)
        session_id = document_id
    except Exception as db_err:
        await db.rollback()
        logger.warning("Summary OK; DB save skipped: %s", db_err)

    return {
        "document_id": document_id,
        "session_id": session_id,
        "filename": filename,
        "extracted_text": text[:8000],
        **summary,
    }


@router.post("/qa-inline")
async def ask_about_text_inline(
    body: InlineQARequest,
    current_user: User = Depends(get_current_user),
):
    if not body.text.strip():
        raise HTTPException(status_code=400, detail="No document text provided.")
    try:
        answer = await document_qa(body.text, body.question, body.history or [])
        return {"answer": answer}
    except Exception as e:
        logger.exception("Inline Q&A failed")
        raise HTTPException(status_code=502, detail=f"Q&A failed: {str(e)}")


@router.post("/risk-analysis")
async def analyze_document_risk(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    file_bytes = await file.read()
    filename = file.filename or "contract.pdf"

    if len(file_bytes) < 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    try:
        text = await extract_text_from_file(file_bytes, filename)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    if not text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not extract text from this file.",
        )

    try:
        report = await analyze_contract_risk(text)
    except Exception as e:
        logger.exception("LLM risk analysis failed")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI risk analysis failed: {str(e)}",
        )

    document_id = None
    try:
        db_doc = Document(
            title=filename,
            doc_type=DocumentType.UPLOADED,
            status=DocumentStatus.DRAFT,
            owner_id=current_user.id,
            content=text[:50000],
            risk_score=report.get("risk_score"),
            risk_report=report,
        )
        db.add(db_doc)
        await db.commit()
        await db.refresh(db_doc)
        document_id = str(db_doc.id)
    except Exception as db_err:
        await db.rollback()
        logger.warning("Risk analysis succeeded but DB save failed: %s", db_err)

    return {
        "document_id": document_id,
        "filename": filename,
        **report,
    }


class RejectBody(BaseModel):
    reason: str = ""


@router.patch("/{doc_id}/approve", response_model=DocumentResponse)
async def approve_document(
    doc_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role.value != "lawyer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only lawyers can approve documents.")
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")
    doc.status = DocumentStatus.FINALIZED
    doc.lawyer_id = current_user.id
    await db.commit()
    await db.refresh(doc)
    return doc


@router.patch("/{doc_id}/reject", response_model=DocumentResponse)
async def reject_document(
    doc_id: UUID,
    body: RejectBody = RejectBody(),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role.value != "lawyer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only lawyers can reject documents.")
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")
    doc.status = DocumentStatus.REVISION_REQUESTED
    doc.lawyer_id = current_user.id
    await db.commit()
    await db.refresh(doc)
    return doc


@router.post("/{doc_id}/qa")
async def ask_about_document(
    doc_id: UUID,
    body: DocumentQARequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Document).where(
            Document.id == doc_id,
            Document.owner_id == current_user.id,
        )
    )
    doc = result.scalars().first()
    if not doc or not doc.content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or has no text content.",
        )

    try:
        answer = await document_qa(doc.content, body.question, body.history or [])
        return {"answer": answer, "document_id": str(doc_id)}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Q&A failed: {str(e)}",
        )
