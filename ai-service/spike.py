import fitz

doc = fitz.open("sample.pdf")

CHUNK_SIZE = 500      # characters per chunk
CHUNK_OVERLAP = 100   # overlap between consecutive chunks

chunks = []  # will hold {"text": ..., "page": ...}

for i, page in enumerate(doc):
    text = page.get_text("text")
    if not text.strip():
        continue

    start = 0
    while start < len(text):
        end = start + CHUNK_SIZE
        chunk_text = text[start:end].strip()
        if chunk_text:
            chunks.append({"text": chunk_text, "page": i + 1})
        start += CHUNK_SIZE - CHUNK_OVERLAP

doc.close()

print(f"Total chunks created: {len(chunks)}")
print()
print("--- First chunk ---")
print(f"Page: {chunks[0]['page']}")
print(chunks[0]['text'])
print()
print("--- Second chunk (notice the overlapping text at the start) ---")
print(f"Page: {chunks[1]['page']}")
print(chunks[1]['text'])
from sentence_transformers import SentenceTransformer

print("\nLoading embedding model...")
model = SentenceTransformer("all-MiniLM-L6-v2")

texts = [c["text"] for c in chunks]
embeddings = model.encode(texts, show_progress_bar=True)

print(f"\nNumber of embeddings created: {len(embeddings)}")
print(f"Length of one embedding vector: {len(embeddings[0])}")
print(f"First 5 numbers of chunk 1's embedding: {embeddings[0][:5]}")
import chromadb

print("\nSetting up ChromaDB...")
client = chromadb.PersistentClient(path="./chroma_data")
collection = client.get_or_create_collection(name="diabetes_test")

ids = [f"chunk_{i}" for i in range(len(chunks))]
metadatas = [{"page": c["page"]} for c in chunks]

collection.add(
    ids=ids,
    embeddings=embeddings.tolist(),
    documents=texts,
    metadatas=metadatas,
)

print(f"Stored {collection.count()} chunks in ChromaDB.")
question = "What causes insulin resistance?"

print(f"\nQuestion: {question}")

question_embedding = model.encode([question]).tolist()

results = collection.query(
    query_embeddings=question_embedding,
    n_results=3,
)

print("\nTop 3 matching chunks:\n")
for i in range(len(results["documents"][0])):
    doc_text = results["documents"][0][i]
    page = results["metadatas"][0][i]["page"]
    distance = results["distances"][0][i]
    print(f"--- Match {i+1} (page {page}, distance {distance:.4f}) ---")
    print(doc_text[:300])
    print()