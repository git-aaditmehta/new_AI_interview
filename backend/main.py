"""
FastAPI application entry point.

- CORS configured for React dev server (localhost:5173)
- Lifespan: creates DB tables on startup
- Routers: interview REST + websocket (added in Phase 3)
- Health check: GET /health
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from core.database import init_db
from api.routes.interview import router as interview_router
from api.routes.websocket import router as ws_router
from models.schemas import HealthResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run startup/shutdown logic."""
    print("[Startup] Initializing database...")
    await init_db()
    print("[Startup] Database ready ✅")
    yield
    print("[Shutdown] Closing...")


app = FastAPI(
    title="AI Interview System API",
    description="FastAPI backend for the AI Interview System",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(interview_router)
app.include_router(ws_router)


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health", response_model=HealthResponse, tags=["system"])
async def health_check():
    """Quick liveness probe."""
    return HealthResponse(status="ok", version="1.0.0")


@app.get("/", tags=["system"])
async def root():
    return {"message": "AI Interview System API", "docs": "/docs"}
