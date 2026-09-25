# Retrieval-Augmented Language Models for Clinical Medicine

Capstone project: a clinical knowledge assistant that answers medical
questions using retrieval-augmented generation (RAG) over admin-uploaded
PDF documents.

## Services

- **ai-service/** — Python FastAPI microservice. Owns PDF extraction
  (PyMuPDF), chunking, embeddings (sentence-transformers), the ChromaDB
  vector store, and the RAG pipeline (retrieval + prompt + OpenAI call).
  Also computes the confidence score and returns the highlighted source
  paragraph, page number, and chapter guess for each citation.
- **backend/** — Spring Boot gateway. Owns auth (JWT), users, document
  metadata, question history, bookmarks, feedback, and dashboard/admin
  statistics in MySQL. Never talks to ChromaDB or the LLM directly —
  always proxies through `ai-service` via `AiServiceClient`.
- **frontend/** — React (Vite) UI. Login/register, ask-a-question flow
  with confidence badge + source citations + copy/bookmark/download-PDF/
  feedback, question history with search, a dashboard, dark mode, and
  an admin area for PDF upload/management/re-index.

## Feature coverage (from the finalized module list)

| Feature | Where it lives |
|---|---|
| Registration/Login, JWT | backend AuthController + SecurityConfig |
| Ask question, AI answer, citations | ai-service `rag.py` → backend QuestionController → frontend AskQuestion |
| Confidence score | ai-service `rag.py::_confidence_from_distances` |
| Highlighted source paragraph, page, chapter | ai-service `rag.py` sources + frontend SourceCitation |
| Question history + search | backend QuestionRepository/Controller + frontend History |
| Bookmark answers | backend BookmarkController + frontend AskQuestion |
| Feedback 👍/👎 | backend FeedbackController + frontend AskQuestion |
| Dark mode | frontend ThemeContext + styles.css |
| Download answer as PDF | frontend AskQuestion (jsPDF) |
| Suggested follow-up questions | ai-service `rag.py::suggest_followups` |
| Dashboard (docs, questions, saved, recent upload, last login) | backend DashboardController + frontend Dashboard |
| Admin: upload/delete/list/re-index PDFs | ai-service endpoints + backend DocumentController + frontend admin pages |
| Upload progress bar | frontend admin Upload (axios onUploadProgress) |
| Loading skeleton | frontend AskQuestion + styles.css `.skeleton` |
| Medical categories | ai-service `config.py::MEDICAL_CATEGORIES` + admin Upload dropdown |
| Admin statistics (users, docs, questions today, top category) | backend DashboardController::adminStats |

## Running it locally

1. **ai-service**
   ```
   cd ai-service
   pip install -r requirements.txt --break-system-packages
   export OPENAI_API_KEY=sk-...        # optional — pipeline still works without it
   uvicorn app.main:app --reload --port 8000
   ```
2. **backend** — create a MySQL database (or let `createDatabaseIfNotExist`
   handle it), update `src/main/resources/application.properties` with
   your MySQL credentials and a real `jwt.secret`, then:
   ```
   cd backend
   mvn spring-boot:run
   ```
3. **frontend**
   ```
   cd frontend
   npm install
   npm run dev
   ```
4. Register a user via the UI, then manually set that user's `role` to
   `ADMIN` in the `users` table to access the admin upload/document pages.

