"""Lightweight local registry of uploaded PDFs (bytes on disk + a JSON
metadata index). Spring Boot is the system of record for document
metadata shown to users; this registry exists only so the AI service
can re-extract/re-chunk/re-embed a PDF later (delete, re-index) without
Spring Boot having to re-upload the file.
"""
import json
import os
import uuid
from typing import Dict, List, Optional

STORAGE_DIR = os.getenv("PDF_STORAGE_DIR", "./pdf_storage")
INDEX_FILE = os.path.join(STORAGE_DIR, "index.json")
os.makedirs(STORAGE_DIR, exist_ok=True)


def _load_index() -> Dict:
    if not os.path.exists(INDEX_FILE):
        return {}
    with open(INDEX_FILE, "r") as f:
        return json.load(f)


def _save_index(index: Dict):
    with open(INDEX_FILE, "w") as f:
        json.dump(index, f, indent=2)


def save_pdf(filename: str, category: str, pdf_bytes: bytes) -> str:
    document_id = str(uuid.uuid4())
    path = os.path.join(STORAGE_DIR, f"{document_id}.pdf")
    with open(path, "wb") as f:
        f.write(pdf_bytes)

    index = _load_index()
    index[document_id] = {
        "filename": filename,
        "category": category,
        "path": path,
    }
    _save_index(index)
    return document_id


def get_pdf_bytes(document_id: str) -> Optional[bytes]:
    index = _load_index()
    entry = index.get(document_id)
    if not entry:
        return None
    with open(entry["path"], "rb") as f:
        return f.read()


def list_documents() -> List[Dict]:
    index = _load_index()
    return [{"document_id": doc_id, **meta} for doc_id, meta in index.items()]


def delete_document(document_id: str):
    index = _load_index()
    entry = index.pop(document_id, None)
    _save_index(index)
    if entry and os.path.exists(entry["path"]):
        os.remove(entry["path"])
