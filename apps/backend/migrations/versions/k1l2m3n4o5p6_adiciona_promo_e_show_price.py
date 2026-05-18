"""adiciona original_price e show_price em products

Revision ID: k1l2m3n4o5p6
Revises: j1k2l3m4n5o6
Create Date: 2026-05-14

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'k1l2m3n4o5p6'
down_revision: Union[str, Sequence[str], None] = 'j1k2l3m4n5o6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Preço original — preenchido apenas quando o produto está em promoção
    op.add_column('products', sa.Column('original_price', sa.Numeric(10, 2), nullable=True))

    # Exibir ou não o preço — False = "Consultar preço"
    op.add_column('products', sa.Column('show_price', sa.Boolean(), nullable=False, server_default='true'))


def downgrade() -> None:
    op.drop_column('products', 'show_price')
    op.drop_column('products', 'original_price')