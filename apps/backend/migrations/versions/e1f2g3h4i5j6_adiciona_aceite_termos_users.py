"""adiciona aceite de termos na tabela users

Revision ID: e1f2g3h4i5j6
Revises: d1e2f3g4h5i6
Create Date: 2026-04-11

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'e1f2g3h4i5j6'
down_revision: Union[str, Sequence[str], None] = 'd1e2f3g4h5i6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Data/hora em que o lojista aceitou os termos
    op.add_column('users', sa.Column('terms_accepted_at', sa.DateTime(), nullable=True))
    # IP de onde aceitou — prova adicional para fins jurídicos
    op.add_column('users', sa.Column('terms_ip', sa.String(length=45), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'terms_ip')
    op.drop_column('users', 'terms_accepted_at')