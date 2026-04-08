from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.routers.deps import get_current_user
from app.schemas.admin import (
    BlockUserResponse,
    StorePlanResponse,
    UpdateStorePlanRequest,
    UserAdminResponse,
)
from app.services.admin import (
    delete_user,
    get_all_users,
    get_user_by_id,
    toggle_block_user,
    update_store_plan,
)

router = APIRouter(prefix="/admin", tags=["Admin"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependência — garante que apenas admins acessem a rota."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a administradores.",
        )
    return current_user


# ─── Usuários ─────────────────────────────────────────────────────────────────

@router.get("/users", response_model=List[UserAdminResponse])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Lista todos os usuários cadastrados. Apenas admin."""
    return get_all_users(db)


@router.get("/users/{user_id}", response_model=UserAdminResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Retorna detalhes de um usuário. Apenas admin."""
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado.",
        )
    return user


@router.patch("/users/{user_id}/block", response_model=BlockUserResponse)
def block_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Bloqueia ou desbloqueia um usuário. Apenas admin."""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você não pode bloquear a si mesmo.",
        )

    user = toggle_block_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado.",
        )

    action = "bloqueado" if not user.is_active else "desbloqueado"
    return BlockUserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        is_active=user.is_active,
        message=f"Usuário {action} com sucesso.",
    )


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Exclui um usuário permanentemente. Apenas admin."""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você não pode excluir a si mesmo.",
        )

    deleted = delete_user(db, user_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado.",
        )


# ─── Planos ───────────────────────────────────────────────────────────────────

@router.patch("/stores/{store_id}/plan", response_model=StorePlanResponse)
def change_store_plan(
    store_id: int,
    data: UpdateStorePlanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Altera o plano de uma loja. Apenas admin.
    Planos válidos: gratis | basico | premium
    """
    store = update_store_plan(db, store_id, data.plan)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loja não encontrada.",
        )

    return StorePlanResponse(
        id=store.id,
        name=store.name,
        plan=store.plan,
        message=f"Plano da loja '{store.name}' atualizado para '{store.plan}'.",
    )