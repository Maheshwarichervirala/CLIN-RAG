from typing import List, Dict
import re
from openai import OpenAI
from .config import OPENROUTER_API_KEY, OPENROUTER_MODEL, TOP_K
from . import vectorstore

_client = OpenAI(
    api_key=OPENROUTER_API_KEY,
    base_url="https://openrouter.ai/api/v1",
) if OPENROUTER_API_KEY else None

SYSTEM_PROMPT = (
    "You are a clinical knowledge assistant. Answer ONLY using the "
    "provided context from the uploaded medical documents. If the "
    "context does not contain enough information to answer, say so "
    "plainly instead of guessing. Keep the answer concise and clinical "
    "in tone, and do not fabricate citations."
)


def _build_context_block(chunks: List[str]) -> str:
    return "\n\n---\n\n".join(f"[{i+1}] {c}" for i, c in enumerate(chunks))


def _confidence_from_distances(distances: List[float]) -> float:
    """Piecewise-calibrated confidence, using distance ranges observed
    in our own evaluation (report Section 7): genuinely correct
    matches in our 15-question test set spanned roughly 0.40-0.85
    distance, while an unrelated control query (no relevant content
    in the corpus) exceeded ~1.1. This maps that observed 'related'
    band to ~70-90% and the 'unrelated' band to ~5-15%, rather than a
    flat linear scale across the whole range."""
    if not distances:
        return 0.0
    best = min(distances)

    if best <= 0.40:
        confidence = 90 + (0.40 - best) * 20
    elif best <= 0.85:
        frac = (best - 0.40) / (0.85 - 0.40)
        confidence = 90 - frac * 20
    elif best <= 1.10:
        frac = (best - 0.85) / (1.10 - 0.85)
        confidence = 70 - frac * 60
    else:
        confidence = 5.0

    return round(max(2.0, min(97.0, confidence)), 1)


def _no_match_response() -> Dict:
    return {
        "answer": "I couldn't find relevant information in the uploaded "
                   "documents to answer that confidently. Try rephrasing, "
                   "or ask the admin to upload a document covering this "
                   "topic.",
        "confidence": 0.0,
        "sources": [],
        "suggested_followups": [],
    }


def answer_question(question: str, category: str = None,
                     top_k: int = TOP_K) -> Dict:
    results = vectorstore.query(question, top_k=top_k, category=category)

    docs = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]

    if not docs:
        return _no_match_response()

    confidence = _confidence_from_distances(distances)

    context_block = _build_context_block(docs)
    sources = [{
        "document_id": meta["document_id"],
        "filename": meta["filename"],
        "page": meta["page"],
        "chapter": meta["chapter"],
        "snippet": doc[:400],
    } for doc, meta in zip(docs, metadatas)]

    if _client is None:
        answer = ("[LLM not configured — showing retrieved context only]\n\n"
                   + docs[0][:600])
    else:
        completion = _client.chat.completions.create(
            model=OPENROUTER_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content":
                    f"Context:\n{context_block}\n\nQuestion: {question}"},
            ],
        )
        answer = completion.choices[0].message.content

    return {
        "answer": answer,
        "confidence": confidence,
        "sources": sources,
        "suggested_followups": suggest_followups(question, docs),
    }


def _extract_topic(question: str) -> str:
    """Strips common leading question phrasing so the remaining text
    is just the medical topic, e.g. 'What causes insulin resistance?'
    -> 'insulin resistance'. Deterministic (no LLM call needed)."""
    text = question.strip().rstrip("?").strip()
    text_lower = text.lower()

    prefixes = [
        "what are the causes of ", "what causes ", "what is ", "what are ",
        "how is ", "how does ", "how do ", "why does ", "why do ",
        "what are the symptoms of ", "what are the treatment options for ",
    ]
    for prefix in prefixes:
        if text_lower.startswith(prefix):
            text = text[len(prefix):]
            break

    return text.strip().rstrip("?").strip() or text


def suggest_followups(question: str, retrieved_chunks: List[str]) -> List[str]:
    """Cheap, deterministic follow-up suggestions (no extra LLM call) so
    the feature works even without an OpenRouter key. Swap for an LLM
    call later if richer suggestions are wanted."""
    topic = _extract_topic(question)
    return [
        f"What are the causes of {topic}?",
        f"What are the treatment options for {topic}?",
        f"How is {topic} diagnosed?",
    ]