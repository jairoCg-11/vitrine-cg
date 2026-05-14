from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.services.admin import approve_store, get_pending_stores
from app.services.email import send_store_approved_email
from app.services.plan import get_all_plan_limits, update_plan_limit

from app.database import get_db
from app.models.user import User
from app.routers.deps import get_current_user

from app.models.product import Product
from app.models.product_image import ProductImage
from app.services.storage import delete_image
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


# ─── Adicionar imports no topo de routers/admin.py ───────────────────────────
# from app.services.plan import get_all_plan_limits, update_plan_limit

# ─── Adicionar no final de routers/admin.py ───────────────────────────────────

@router.get("/plan-limits")
def list_plan_limits(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Lista os limites de produtos por plano. Apenas admin."""
    from app.services.plan import get_all_plan_limits
    limits = get_all_plan_limits(db)
    return [
        {
            "plan": l.plan,
            "max_products": l.max_products,
            "label": "Ilimitado" if l.max_products == 0 else str(l.max_products),
            "updated_at": l.updated_at.isoformat(),
        }
        for l in limits
    ]


@router.patch("/plan-limits/{plan}")
def update_plan_limit_route(
    plan: str,
    max_products: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Atualiza o limite de produtos de um plano.
    max_products=0 significa ilimitado.
    Apenas admin.
    """
    from app.services.plan import update_plan_limit

    if plan not in ["gratis", "basico", "premium"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Plano inválido. Use: gratis, basico ou premium.",
        )

    if max_products < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O limite deve ser 0 (ilimitado) ou maior.",
        )

    updated = update_plan_limit(db, plan, max_products)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plano não encontrado.",
        )

    return {
        "plan": updated.plan,
        "max_products": updated.max_products,
        "label": "Ilimitado" if updated.max_products == 0 else str(updated.max_products),
        "message": f"Limite do plano {plan} atualizado para {max_products if max_products > 0 else 'ilimitado'}.",
    }


# ─── Adicionar no routers/stores.py ──────────────────────────────────────────
# No endpoint create_my_product, ANTES de chamar create_product, adiciona:

# from app.services.plan import check_product_limit
#
# can_add, current, max_allowed = check_product_limit(db, store.id, store.plan)
# if not can_add:
#     raise HTTPException(
#         status_code=status.HTTP_400_BAD_REQUEST,
#         detail=f"Limite de produtos atingido para o plano {store.plan}. "
#                f"Você tem {current} de {max_allowed} produtos. "
#                f"Faça upgrade do plano para adicionar mais.",
#     )




# ─── Adicionar no final de routers/admin.py ───────────────────────────────────

# ═══════════════════════════════════════════════════════════════
# MODERAÇÃO DE CONTEÚDO
# ═══════════════════════════════════════════════════════════════

@router.delete("/stores/{store_id}/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def moderate_delete_product(
    store_id: int,
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Admin exclui um produto de qualquer loja.
    Remove também as imagens do MinIO.
    """
    from app.models.product import Product
    from app.models.product_image import ProductImage
    from app.services.storage import delete_image

    product = db.query(Product).filter(
        Product.id == product_id,
        Product.store_id == store_id,
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado.",
        )

    # Remove imagens do MinIO
    if product.image_url:
        delete_image(product.image_url)

    images = db.query(ProductImage).filter(ProductImage.product_id == product_id).all()
    for img in images:
        delete_image(img.image_url)

    db.delete(product)
    db.commit()


@router.delete("/stores/{store_id}/cover", status_code=status.HTTP_200_OK)
def moderate_delete_cover(
    store_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Admin remove a foto de capa de uma loja."""
    from app.models.store import Store
    from app.services.storage import delete_image

    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loja não encontrada.")

    if not store.cover_url:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Loja não tem foto de capa.")

    delete_image(store.cover_url)
    store.cover_url = None
    db.commit()
    return {"message": "Foto de capa removida com sucesso."}


@router.delete("/stores/{store_id}/logo", status_code=status.HTTP_200_OK)
def moderate_delete_logo(
    store_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Admin remove o logo de uma loja."""
    from app.models.store import Store
    from app.services.storage import delete_image

    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loja não encontrada.")

    if not store.logo_url:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Loja não tem logo.")

    delete_image(store.logo_url)
    store.logo_url = None
    db.commit()
    return {"message": "Logo removido com sucesso."}


@router.get("/stores/{store_id}/products")
def moderate_list_products(
    store_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Lista produtos de qualquer loja para moderação. Apenas admin."""
    from app.models.product import Product
    from app.models.store import Store

    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loja não encontrada.")

    products = db.query(Product).filter(Product.store_id == store_id).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "price": str(p.price),
            "category": p.category,
            "image_url": p.image_url,
            "is_available": p.is_available,
        }
        for p in products
    ]

# ─── Adicionar no final de routers/admin.py ───────────────────────────────────

@router.get("/analytics")
def get_global_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Retorna métricas globais da plataforma.
    - online: visitas nos últimos 5 minutos
    - today: visitas de hoje
    - total: total de visitas registradas
    - whatsapp_today: cliques no WhatsApp hoje
    - whatsapp_total: total de cliques no WhatsApp
    Apenas admin.
    """
    from datetime import datetime, timedelta
    from sqlalchemy import func
    from app.models.store_event import StoreEvent

    now = datetime.utcnow()
    five_minutes_ago = now - timedelta(minutes=5)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # Visitantes online — últimos 5 minutos
    online = db.query(func.count(StoreEvent.id)).filter(
        StoreEvent.event_type == "view",
        StoreEvent.created_at >= five_minutes_ago,
    ).scalar() or 0

    # Visitas hoje
    today_views = db.query(func.count(StoreEvent.id)).filter(
        StoreEvent.event_type == "view",
        StoreEvent.created_at >= today_start,
    ).scalar() or 0

    # Total de visitas
    total_views = db.query(func.count(StoreEvent.id)).filter(
        StoreEvent.event_type == "view",
    ).scalar() or 0

    # Cliques WhatsApp hoje
    whatsapp_today = db.query(func.count(StoreEvent.id)).filter(
        StoreEvent.event_type == "whatsapp_click",
        StoreEvent.created_at >= today_start,
    ).scalar() or 0

    # Total cliques WhatsApp
    whatsapp_total = db.query(func.count(StoreEvent.id)).filter(
        StoreEvent.event_type == "whatsapp_click",
    ).scalar() or 0

    # Loja mais visitada hoje
    top_store = db.query(
        StoreEvent.store_id,
        func.count(StoreEvent.id).label("count")
    ).filter(
        StoreEvent.event_type == "view",
        StoreEvent.created_at >= today_start,
    ).group_by(StoreEvent.store_id).order_by(func.count(StoreEvent.id).desc()).first()

    top_store_info = None
    if top_store:
        from app.models.store import Store
        store = db.query(Store).filter(Store.id == top_store.store_id).first()
        if store:
            top_store_info = {
                "id": store.id,
                "name": store.name,
                "visits": top_store.count,
            }

    return {
        "online": online,
        "today_views": today_views,
        "total_views": total_views,
        "whatsapp_today": whatsapp_today,
        "whatsapp_total": whatsapp_total,
        "top_store_today": top_store_info,
        "updated_at": now.isoformat(),
    }