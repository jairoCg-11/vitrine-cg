from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.services.admin import approve_store, get_pending_stores
from app.services.email import send_store_approved_email

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


# ─── Aprovação de lojas ──────────────────────────────────────────────────────

@router.get("/stores/pending")
def list_pending_stores(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Lista lojas aguardando aprovação. Apenas admin."""
    from app.services.admin import get_pending_stores
    stores = get_pending_stores(db)
    return [
        {
            "id": s.id,
            "name": s.name,
            "segment": s.segment,
            "owner_id": s.owner_id,
            "is_approved": s.is_approved,
            "created_at": s.created_at.isoformat(),
        }
        for s in stores
    ]
 
 
@router.patch("/stores/{store_id}/approve")
async def toggle_store_approval(
    store_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Aprova ou rejeita uma loja.
    Se aprovada pela primeira vez, envia email de notificação ao lojista.
    Apenas admin.
    """
    from app.services.admin import approve_store, get_store_by_id
    from app.services.email import send_store_approved_email
    from app.models.user import User as UserModel
 
    store = get_store_by_id(db, store_id)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loja não encontrada.",
        )
 
    was_approved = store.is_approved
    updated = approve_store(db, store_id, not store.is_approved)
 
    # Envia email apenas quando aprova (não quando rejeita)
    if not was_approved and updated.is_approved:
        owner = db.query(UserModel).filter(UserModel.id == store.owner_id).first()
        if owner:
            try:
                await send_store_approved_email(
                    email=owner.email,
                    name=owner.name,
                    store_name=store.name,
                )
            except Exception as e:
                print(f"❌ Erro ao enviar email de aprovação: {e}")
 
    return {
        "id": updated.id,
        "name": updated.name,
        "is_approved": updated.is_approved,
        "message": f"Loja {'aprovada' if updated.is_approved else 'suspensa'} com sucesso.",
    }