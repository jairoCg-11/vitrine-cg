"""cria tabela store_events

Revision ID: d1e2f3g4h5i6
Revises: c1d2e3f4g5h6
Create Date: 2026-04-10

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'd1e2f3g4h5i6'
down_revision: Union[str, Sequence[str], None] = 'c1d2e3f4g5h6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Cria o enum apenas se não existir
    op.execute("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'store_event_type') THEN CREATE TYPE store_event_type AS ENUM ('view', 'whatsapp_click'); END IF; END $$;")

    op.execute("""
        CREATE TABLE store_events (
            id SERIAL PRIMARY KEY,
            store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
            event_type store_event_type NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
    """)
    op.create_index('ix_store_events_id', 'store_events', ['id'], unique=False)
    op.create_index('ix_store_events_store_id', 'store_events', ['store_id'], unique=False)
    op.create_index('ix_store_events_event_type', 'store_events', ['event_type'], unique=False)
    op.create_index('ix_store_events_created_at', 'store_events', ['created_at'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_store_events_created_at', table_name='store_events')
    op.drop_index('ix_store_events_event_type', table_name='store_events')
    op.drop_index('ix_store_events_store_id', table_name='store_events')
    op.drop_index('ix_store_events_id', table_name='store_events')
    op.drop_table('store_events')
    op.execute("DROP TYPE IF EXISTS store_event_type")
