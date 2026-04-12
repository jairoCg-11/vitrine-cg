"""adiciona is_approved na tabela stores

Revision ID: h1i2j3k4l5m6
Revises: g1h2i3j4k5l6
Create Date: 2026-04-11

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'h1i2j3k4l5m6'
down_revision: Union[str, Sequence[str], None] = 'g1h2i3j4k5l6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Adiciona coluna is_approved — padrão False (pendente de aprovação)
    # Lojas existentes recebem True para não quebrar o que já está publicado
    op.add_column(
        'stores',
        sa.Column('is_approved', sa.Boolean(), nullable=False, server_default='true')
    )


def downgrade() -> None:
    op.drop_column('stores', 'is_approved')