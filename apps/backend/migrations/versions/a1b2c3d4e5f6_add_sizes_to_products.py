"""add sizes to products

Revision ID: a1b2c3d4e5f6
Revises: 995449898944
Create Date: 2026-04-07 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '995449898944'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('products', sa.Column('sizes', sa.String(length=100), nullable=True))


def downgrade() -> None:
    op.drop_column('products', 'sizes')
