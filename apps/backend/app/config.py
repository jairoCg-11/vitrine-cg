from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Banco de dados
    postgres_host: str = "postgres"
    postgres_port: int = 5432
    postgres_db: str = "vitrine_cg"
    postgres_user: str = ""
    postgres_password: str = ""

    # MinIO
    minio_endpoint: str = "minio"
    minio_port: int = 9000
    minio_access_key: str = ""
    minio_secret_key: str = ""
    minio_bucket_produtos: str = "produtos"
    minio_public_url: str = "http://localhost:9000"

    # JWT
    jwt_secret: str = "change-me-in-production"

    # Email (Gmail com App Password)
    mail_username: str = ""
    mail_password: str = ""

    # URL do frontend — usada nos links dos emails
    frontend_url: str = "http://localhost:3000"

    @property
    def database_url(self) -> str:
        return (
            f"postgresql://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    class Config:
        env_file = ".env"


settings = Settings()