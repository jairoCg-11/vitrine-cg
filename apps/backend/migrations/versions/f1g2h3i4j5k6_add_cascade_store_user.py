"""adiciona cascade na fk stores.owner_id

Revision ID: f1g2h3i4j5k6
Revises: e1f2g3h4i5j6
Create Date: 2026-04-11

"""
from typing import Sequence, Union
from alembic import op

revision: str = 'f1g2h3i4j5k6'
down_revision: Union[str, Sequence[str], None] = 'e1f2g3h4i5j6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint('stores_owner_id_fkey', 'stores', type_='foreignkey')
    op.create_foreign_key(
        'stores_owner_id_fkey',
        'stores', 'users',
        ['owner_id'], ['id'],
        ondelete='CASCADE'
    )


def downgrade() -> None:
    op.drop_constraint('stores_owner_id_fkey', 'stores', type_='foreignkey')
    op.create_foreign_key(
        'stores_owner_id_fkey',
        'stores', 'users',
        ['owner_id'], ['id']
    )
