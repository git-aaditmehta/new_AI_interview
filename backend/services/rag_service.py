"""
RAG Service — ChromaDB vector store with sentence-transformers embeddings.

Responsible for:
  1. Ingesting resume chunks into ChromaDB (one collection per resume_id)
  2. Retrieving top-k relevant chunks given a query string
  3. Building an augmented context string for LLM prompts

Uses 'all-MiniLM-L6-v2' — a fast, high-quality embedding model (~90MB).
"""
import os
import uuid
from typing import List

import chromadb
from chromadb.utils import embedding_functions

from core.config import settings


# ── ChromaDB client (persistent) ─────────────────────────────────────────────
_chroma_client = chromadb.PersistentClient(path=settings.chroma_persist_dir)

# Sentence-transformers embedding function (downloaded on first use)
_embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)


def _get_collection(resume_id: str):
    """Get or create a ChromaDB collection for a specific resume."""
    # ChromaDB collection names must be 3-63 chars, alphanumeric + hyphens
    collection_name = f"resume-{resume_id[:32]}"
    return _chroma_client.get_or_create_collection(
        name=collection_name,
        embedding_function=_embedding_fn,
        metadata={"hnsw:space": "cosine"},
    )


def ingest_resume(resume_id: str, chunks: List[str]) -> int:
    """
    Store resume text chunks in ChromaDB under the given resume_id.

    Args:
        resume_id: Unique ID for this resume (used as collection key)
        chunks: List of text chunks from pdf_service

    Returns:
        Number of chunks stored
    """
    if not chunks:
        return 0

    collection = _get_collection(resume_id)

    # Generate unique IDs for each chunk
    ids = [f"{resume_id}-chunk-{i}" for i in range(len(chunks))]

    # Upsert to handle re-uploads
    collection.upsert(
        documents=chunks,
        ids=ids,
        metadatas=[{"chunk_index": i, "resume_id": resume_id} for i in range(len(chunks))],
    )

    return len(chunks)


def retrieve_context(resume_id: str, query: str, top_k: int = 5) -> str:
    """
    Retrieve the most relevant resume chunks for a given query.

    Args:
        resume_id: Which resume collection to search
        query: The question or text to find relevant context for
        top_k: Number of top chunks to retrieve

    Returns:
        Concatenated string of the most relevant resume excerpts
    """
    try:
        collection = _get_collection(resume_id)

        # Check if collection has any documents
        count = collection.count()
        if count == 0:
            return ""

        # Clamp top_k to what's available
        k = min(top_k, count)

        results = collection.query(
            query_texts=[query],
            n_results=k,
        )

        documents = results.get("documents", [[]])[0]
        if not documents:
            return ""

        # Join with separator for readability
        return "\n\n---\n\n".join(documents)

    except Exception as e:
        print(f"[RAGService] Retrieval error for resume_id={resume_id}: {e}")
        return ""


def delete_resume(resume_id: str) -> None:
    """Remove a resume's ChromaDB collection (e.g. on interview delete)."""
    try:
        collection_name = f"resume-{resume_id[:32]}"
        _chroma_client.delete_collection(collection_name)
    except Exception as e:
        print(f"[RAGService] Could not delete collection: {e}")
