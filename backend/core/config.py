from pydantic_settings import BaseSettings
from typing import List, Union


class Settings(BaseSettings):
    # LLM
    llm_model: str = "mistral/mistral-small-latest"
    mistral_api_key: str = ""

    # STT
    speechmatics_api_key: str = ""

    # TTS (Azure Speech)
    azure_speech_key: str = ""
    azure_speech_region: str = ""

    # Database
    database_url: str = "sqlite+aiosqlite:///./interview.db"

    # RAG / ChromaDB
    chroma_persist_dir: str = "./chroma_db"

    # CORS — stored as comma-separated string in .env, parsed below
    allowed_origins_str: str = "http://localhost:5173,http://localhost:3000"

    # Interview settings
    default_max_questions: int = 5

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}

    @property
    def allowed_origins(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins_str.split(",") if o.strip()]


settings = Settings()
