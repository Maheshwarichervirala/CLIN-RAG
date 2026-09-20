from sentence_transformers import SentenceTransformer
from typing import List
from .config import EMBEDDING_MODEL_NAME

_model = None


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer(EMBEDDING_MODEL_NAME)
    return _model


def embed_texts(texts: List[str]) -> List[List[float]]:
    model = get_model()
    return model.encode(texts, show_progress_bar=False).tolist()


def embed_query(text: str) -> List[float]:
    return embed_texts([text])[0]
