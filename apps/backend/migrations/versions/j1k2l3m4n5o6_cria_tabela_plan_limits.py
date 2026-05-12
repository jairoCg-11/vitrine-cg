"""cria tabela plan_limits

Revision ID: j1k2l3m4n5o6
Revises: i1j2k3l4m5n6
Create Date: 2026-05-12

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'j1k2l3m4n5o6'
down_revision: Union[str, Sequence[str], None] = 'i1j2k3l4m5n6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'plan_limits',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('plan', sa.String(length=20), nullable=False, unique=True),
        sa.Column('max_products', sa.Integer(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_plan_limits_plan', 'plan_limits', ['plan'], unique=True)

    # Insere os valores padrão
    op.execute("""
        INSERT INTO plan_limits (plan, max_products, updated_at) VALUES
        ('gratis',  10,  NOW()),
        ('basico',  30,  NOW()),
        ('premium', 0,   NOW())
    """)


def downgrade() -> None:
    op.drop_index('ix_plan_limits_plan', table_name='plan_limits')
    op.drop_table('plan_limits')