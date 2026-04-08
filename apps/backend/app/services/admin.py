from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.store import Store
from app.models.user import User


def get_all_users(db: Session) -> List[User]:
    """Retorna todos os usuários cadastrados."""
    return db.query(User).order_by(User.created_at.desc()).all()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Retorna um usuário pelo ID."""
    return db.query(User).filter(User.id == user_id).first()


def toggle_block_user(db: Session, user_id: int) -> Optional[User]:
    """
    Bloqueia o usuário se estiver ativo, desbloqueia se estiver bloqueado.
    Retorna None se o usuário não for encontrado.
    """
    user = get_user_by_id(db, user_id)
    if not user:
        return None

    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: int) -> bool:
    """
    Exclui um usuário pelo ID.
    Retorna True se excluído, False se não encontrado.
    """
    user = get_user_by_id(db, user_id)
    if not user:
        return False

    db.delete(user)
    db.commit()
    return True


# ─── Planos ───────────────────────────────────────────────────────────────────

def get_store_by_id(db: Session, store_id: int) -> Optional[Store]:
    """Retorna uma loja pelo ID."""
    return db.query(Store).filter(Store.id == store_id).first()


def update_store_plan(db: Session, store_id: int, plan: str) -> Optional[Store]:
    """
    Altera o plano de uma loja.
    Retorna a loja atualizada ou None se não encontrada.
    """
    store = get_store_by_id(db, store_id)
    if not store:
        return None

    store.plan = plan
    db.commit()
    db.refresh(store)
    return store