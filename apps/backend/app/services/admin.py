from typing import List, Optional

from sqlalchemy.orm import Session

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
