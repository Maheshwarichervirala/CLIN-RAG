"""PDF extraction + chunking. Also does a light-weight 'chapter' guess
from the nearest preceding heading-like line, purely for nicer citations
in the demo (not a real document-structure parser).
"""
import fitz  # PyMuPDF
from typing import List, Dict
from .config import CHUNK_SIZE, CHUNK_OVERLAP


def extract_pages(pdf_bytes: bytes) -> List[Dict]:
    """Returns [{page_number, text}] — 1-indexed pages."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages = []
    for i, page in enumerate(doc):
        pages.append({"page_number": i + 1, "text": page.get_text("text")})
    doc.close()
    return pages


def _guess_chapter(text_before: str) -> str:
    """Look at the last non-empty, short, title-cased-ish line before a
    chunk as a stand-in for a 'chapter/section' label."""
    lines = [l.strip() for l in text_before.splitlines() if l.strip()]
    for line in reversed(lines):
        if 3 <= len(line) <= 60 and (line.istitle() or line.isupper()):
            return line.title()
    return "General"


def chunk_pages(pages: List[Dict]) -> List[Dict]:
    """Fixed-size character chunking with overlap, tagged with page
    number and a best-effort chapter guess. Returns:
    [{text, page, chapter}]
    """
    chunks = []
    for page in pages:
        text = page["text"]
        if not text.strip():
            continue
        start = 0
        while start < len(text):
            end = start + CHUNK_SIZE
            chunk_text = text[start:end].strip()
            if chunk_text:
                chapter = _guess_chapter(text[:start])
                chunks.append({
                    "text": chunk_text,
                    "page": page["page_number"],
                    "chapter": chapter,
                })
            start += CHUNK_SIZE - CHUNK_OVERLAP
    return chunks
