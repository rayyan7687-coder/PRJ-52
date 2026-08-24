from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "BuildLoop API"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "buildloop-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # SQLite default, can override with MySQL DATABASE_URL
    DATABASE_URL: str = "sqlite:///./buildloop.db"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
