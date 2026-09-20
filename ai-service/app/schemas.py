from pydantic import BaseModel
from typing import List, Optional


class UploadResponse(BaseModel):
    document_id: str
    filename: str
    category: str
    chunks_indexed: int


class DocumentInfo(BaseModel):
    document_id: str
    filename: str
    category: str
    page_count: int
    chunk_count: int


class Source(BaseModel):
    document_id: str
    filename: str
    page: int
    chapter: str
    snippet: str          # the highlighted paragraph shown to the user


class AskRequest(BaseModel):
    question: str
    category: Optional[str] = None   # optional filter, e.g. "Cardiology"


class AskResponse(BaseModel):
    answer: str
    confidence: float                 # 0-100
    sources: List[Source]
    suggested_followups: List[str]


class ReindexResponse(BaseModel):
    documents_reindexed: int
    chunks_indexed: int
