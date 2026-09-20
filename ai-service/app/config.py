import os
from dotenv import load_dotenv

# Load variables from .env
load_dotenv()

# Where extracted/chunked PDFs are embedded and stored
CHROMA_PERSIST_DIR = os.getenv(
    "CHROMA_PERSIST_DIR",
    "./chroma_data"
)

COLLECTION_NAME = os.getenv(
    "CHROMA_COLLECTION",
    "clinical_docs"
)

# Embedding model
EMBEDDING_MODEL_NAME = os.getenv(
    "EMBEDDING_MODEL_NAME",
    "all-MiniLM-L6-v2"
)

# OpenAI configuration
OPENAI_API_KEY = os.getenv(
    "OPENAI_API_KEY",
    ""
)

OPENAI_MODEL = os.getenv(
    "OPENAI_MODEL",
    "gpt-4o-mini"
)

# Gemini configuration
GEMINI_API_KEY = os.getenv(
    "GEMINI_API_KEY",
    ""
)

GEMINI_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-flash-latest"
)

# OpenRouter configuration
OPENROUTER_API_KEY = os.getenv(
    "OPENROUTER_API_KEY",
    ""
)

OPENROUTER_MODEL = os.getenv(
    "OPENROUTER_MODEL",
    "openrouter/free"
)

# RAG configuration
CHUNK_SIZE = int(
    os.getenv("CHUNK_SIZE", "800")
)

CHUNK_OVERLAP = int(
    os.getenv("CHUNK_OVERLAP", "150")
)

TOP_K = int(
    os.getenv("TOP_K", "4")
)

# Medical categories
MEDICAL_CATEGORIES = [
    "Cardiology",
    "Neurology",
    "Pediatrics",
    "Dermatology",
    "Oncology",
    "General Medicine",
]