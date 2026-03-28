from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import settings

# Motor de conexão com o PostgreSQL
engine = create_engine(settings.database_url)

# Fábrica de sessões — cada requisição abre e fecha sua própria sessão
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para os models herdarem
Base = declarative_base()


def get_db():
    """
    Dependência do FastAPI — injeta sessão do banco na rota
    e garante que ela seja fechada ao final da requisição.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
