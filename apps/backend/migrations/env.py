from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool

from alembic import context

# Importa as configurações e models do projeto
from app.config import settings
from app.database import Base
import app.models  # garante que todos os models são carregados

# Configuração do Alembic
config = context.config

# Configura a URL do banco dinamicamente via settings
config.set_main_option("sqlalchemy.url", settings.database_url)

# Configura logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata dos models — Alembic usa para detectar mudanças
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Roda migrations sem conexão ativa com o banco."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Roda migrations com conexão ativa com o banco."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
