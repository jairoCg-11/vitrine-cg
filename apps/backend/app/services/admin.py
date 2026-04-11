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
    """Bloqueia ou desbloqueia um usuário."""
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: int) -> bool:
    """
    Exclui um usuário e todos os seus dados dependentes via cascata do banco.
    Usamos query.delete() para evitar que o ORM tente gerenciar objetos relacionados
    na memória, o que causava erros de NotNullViolation.
    """
    try:
        deleted_count = db.query(User).filter(User.id == user_id).delete(synchronize_session=False)
        db.commit()
        return deleted_count > 0
    except Exception as e:
        db.rollback()
        print(f"Erro ao excluir usuário {user_id}: {e}")
        raise e


def get_store_by_id(db: Session, store_id: int) -> Optional[Store]:
    """Retorna uma loja pelo ID."""
    return db.query(Store).filter(Store.id == store_id).first()


def update_store_plan(db: Session, store_id: int, plan: str) -> Optional[Store]:
    """Altera o plano de uma loja."""
    store = get_store_by_id(db, store_id)
    if not store:
        return None
    store.plan = plan
    db.commit()
    db.refresh(store)
    return store
