from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from . import ingest, vectorstore, storage, rag
from .schemas import (
    UploadResponse, DocumentInfo, AskRequest, AskResponse, ReindexResponse
)
from .config import MEDICAL_CATEGORIES

app = FastAPI(title="RAG Clinical AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten to the Spring Boot origin in production
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/categories")
def categories():
    return {"categories": MEDICAL_CATEGORIES}


@app.post("/upload", response_model=UploadResponse)
async def upload(file: UploadFile = File(...), category: str = Form("General Medicine")):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are supported.")

    pdf_bytes = await file.read()
    document_id = storage.save_pdf(file.filename, category, pdf_bytes)

    pages = ingest.extract_pages(pdf_bytes)
    chunks = ingest.chunk_pages(pages)
    indexed = vectorstore.add_document_chunks(
        document_id, file.filename, category, chunks
    )

    return UploadResponse(
        document_id=document_id,
        filename=file.filename,
        category=category,
        chunks_indexed=indexed,
    )


@app.get("/documents")
def list_documents():
    return {"documents": storage.list_documents()}


@app.delete("/documents/{document_id}")
def delete_document(document_id: str):
    vectorstore.delete_document(document_id)
    storage.delete_document(document_id)
    return {"deleted": document_id}


@app.post("/reindex", response_model=ReindexResponse)
def reindex():
    docs = storage.list_documents()
    registry = []
    for doc in docs:
        pdf_bytes = storage.get_pdf_bytes(doc["document_id"])
        pages = ingest.extract_pages(pdf_bytes)
        chunks = ingest.chunk_pages(pages)
        registry.append({
            "document_id": doc["document_id"],
            "filename": doc["filename"],
            "category": doc["category"],
            "chunks": chunks,
        })
    total_chunks = vectorstore.reindex_all(registry)
    return ReindexResponse(documents_reindexed=len(registry), chunks_indexed=total_chunks)


@app.post("/ask", response_model=AskResponse)
def ask(request: AskRequest):
    result = rag.answer_question(request.question, category=request.category)
    return AskResponse(**result)
