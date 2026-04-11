"""adiciona cascade na fk products.store_id

Revision ID: g1h2i3j4k5l6
Revises: f1g2h3i4j5k6
Create Date: 2026-04-11

"""
from typing import Sequence, Union
from alembic import op

revision: str = 'g1h2i3j4k5l6'
down_revision: Union[str, Sequence[str], None] = 'f1g2h3i4j5k6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint('products_store_id_fkey', 'products', type_='foreignkey')
    op.create_foreign_key(
        'products_store_id_fkey',
        'products', 'stores',
        ['store_id'], ['id'],
        ondelete='CASCADE'
    )


def downgrade() -> None:
    op.drop_constraint('products_store_id_fkey', 'products', type_='foreignkey')
    op.create_foreign_key(
        'products_store_id_fkey',
        'products', 'stores',
        ['store_id'], ['id']
    )
