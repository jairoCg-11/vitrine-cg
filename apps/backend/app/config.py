from pathlib import Path

from pydantic_settings import BaseSettings

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
LOCAL_ENV = Path(__file__).resolve().parent.parent / ".env.local"
ROOT_ENV = ROOT_DIR / ".env"

ENV_FILE = str(LOCAL_ENV) if LOCAL_ENV.exists() else str(ROOT_ENV)


class Settings(BaseSettings):
    # Banco de dados
    postgres_host: str
    postgres_port: int = 5432
    postgres_db: str
    postgres_user: str
    postgres_password: str

    # MinIO
    minio_endpoint: str
    minio_port: int = 9000
    minio_access_key: str
    minio_secret_key: str
    minio_bucket_produtos: str = "produtos"
    minio_public_url: str = "http://localhost:9000"

    # Backend
    backend_port: int = 8000
    jwt_secret: str
    jwt_expires_in: str = "7d"

    @property
    def database_url(self) -> str:
        return (
            f"postgresql://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    class Config:
        env_file = ENV_FILE
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
