# AI Interview System - Backend

This is the FastAPI-based backend for the AI Interview System. It handles resume parsing, RAG (Retrieval-Augmented Generation) with ChromaDB, LLM-based question generation, and real-time interview sessions via WebSockets.

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.9 or higher
- A virtual environment (recommended)

### 2. Installation

If you haven't already, create and activate a virtual environment:

```powershell
# Windows
python -m venv .venv
.\.venv\Scripts\activate

# macOS/Linux
python3 -m venv .venv
source .venv/bin/activate
```

Install the dependencies:
```bash
pip install -r requirements.txt
```

### 3. Environment Setup

Create a `.env` file in the `backend` directory based on `.env.example`:

```env
MISTRAL_API_KEY="your_mistral_api_key"
SPEECHMATICS_API_KEY="your_speechmatics_api_key"
LLM_MODEL=mistral/mistral-small-latest
```

### 4. Database Initialization
The application uses SQLite and will automatically initialize the database (`interview.db`) on the first run.

### 5. Running the Backend

Start the FastAPI server using Uvicorn:

```powershell
# From the backend directory
.\.venv\Scripts\uvicorn main:app --reload
```

The API will be available at: `http://127.0.0.1:8000`

## 🛠 Features
- **FastAPI**: High-performance web framework.
- **WebSocket**: Real-time communication for interview sessions.
- **ChromaDB**: Vector database for resume-based RAG.
- **LiteLLM**: Unified interface for various LLM providers (default: Mistral).
- **Speechmatics**: Real-time Speech-to-Text.

## 📄 API Documentation
Once the server is running, you can access the interactive API documentation at:
- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

## 📁 Directory Structure
- `api/`: API routes (REST & WebSockets).
- `core/`: Database configuration, settings, and main app entry.
- `models/`: Pydantic schemas and SQLAlchemy DB models.
- `services/`: Business logic (LLM, RAG, PDF parsing, TTS/STT).
- `prompts/`: LLM prompt templates.
- `chroma_db/`: Persistent storage for vector embeddings.
