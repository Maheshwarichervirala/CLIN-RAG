import chromadb
import uuid
from typing import List, Dict, Optional
from .config import CHROMA_PERSIST_DIR, COLLECTION_NAME
from .embeddings import embed_texts, embed_query

_client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
_collection = _client.get_or_create_collection(name=COLLECTION_NAME)


def add_document_chunks(document_id: str, filename: str, category: str,
                         chunks: List[Dict]) -> int:
    if not chunks:
        return 0
    ids = [f"{document_id}_{i}" for i in range(len(chunks))]
    texts = [c["text"] for c in chunks]
    embeddings = embed_texts(texts)
    metadatas = [{
        "document_id": document_id,
        "filename": filename,
        "category": category,
        "page": c["page"],
        "chapter": c["chapter"],
    } for c in chunks]

    _collection.add(ids=ids, embeddings=embeddings, documents=texts,
                     metadatas=metadatas)
    return len(chunks)


def delete_document(document_id: str):
    _collection.delete(where={"document_id": document_id})


def query(question: str, top_k: int, category: Optional[str] = None) -> Dict:
    query_embedding = embed_query(question)
    where = {"category": category} if category else None
    results = _collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where=where,
    )
    return results


def reindex_all(document_registry: List[Dict]) -> int:
    """Re-embeds and re-stores every chunk for every known document.
    document_registry: [{document_id, filename, category, chunks}]
    """
    total = 0
    for doc in document_registry:
        delete_document(doc["document_id"])
        total += add_document_chunks(
            doc["document_id"], doc["filename"], doc["category"], doc["chunks"]
        )
    return total
