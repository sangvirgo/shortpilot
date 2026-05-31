from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    GEMINI_API_KEY: str = ""
    PEXELS_API_KEY: str = ""
    PIXABAY_API_KEY: str = ""
    DEEPSEEK_API_KEY: str = ""  # optional fallback
    DATABASE_URL: str = "sqlite:////app/shortpilot.db"
    STORAGE_PATH: str = "./storage"

    class Config:
        env_file = ".env"


settings = Settings()
