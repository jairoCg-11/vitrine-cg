from typing import List

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.main import limiter
from app.schemas.public import (
    PublicStoreDetailResponse,
    PublicStoreResponse,
    PublicProductResponse,
    SearchResponse,
)
from app.services.public import (
    get_active_stores,
    get_product_public,
    get_products_by_store_public,
    get_store_with_products,
    search,
)
from app.services.analytics import register_event
from app.services.plan import get_all_plan_limits

router = APIRouter(prefix="/public", tags=["Público"])


@router.get("/stores", response_model=List[PublicStoreResponse])
@limiter.limit("120/minute")
def list_stores(request: Request, db: Session = Depends(get_db)):
    """Lista todas as lojas ativas e aprovadas. Limite: 120/minuto por IP."""
    return get_active_stores(db)


@router.get("/stores/{store_id}", response_model=PublicStoreDetailResponse)
@limiter.limit("120/minute")
def get_store(
    request: Request,
    store_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Retorna detalhes de uma loja com seus produtos. Limite: 120/minuto por IP."""
    store = get_store_with_products(db, store_id)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loja não encontrada.",
        )
    background_tasks.add_task(register_event, db, store_id, "view")
    return store


@router.get("/stores/{store_id}/products", response_model=List[PublicProductResponse])
@limiter.limit("120/minute")
def list_store_products(request: Request, store_id: int, db: Session = Depends(get_db)):
    """Lista produtos disponíveis de uma loja. Limite: 120/minuto por IP."""
    products = get_products_by_store_public(db, store_id)
    if not products:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loja não encontrada ou sem produtos disponíveis.",
        )
    return products


@router.get("/stores/{store_id}/products/{product_id}", response_model=PublicProductResponse)
@limiter.limit("120/minute")
def get_store_product(request: Request, store_id: int, product_id: int, db: Session = Depends(get_db)):
    """Retorna um produto específico de uma loja. Limite: 120/minuto por IP."""
    product = get_product_public(db, store_id, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado.",
        )
    return product


@router.post("/stores/{store_id}/events/whatsapp", status_code=200)
@limiter.limit("30/minute")
def track_whatsapp_click(
    request: Request,
    store_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Registra clique no WhatsApp. Limite: 30/minuto por IP."""
    background_tasks.add_task(register_event, db, store_id, "whatsapp_click")
    return {"ok": True}


@router.get("/search", response_model=SearchResponse)
@limiter.limit("30/minute")
def search_stores_and_products(
    request: Request,
    q: str = Query(..., min_length=2),
    db: Session = Depends(get_db),
):
    """Busca lojas e produtos. Limite: 30/minuto por IP."""
    results = search(db, q)
    return results


@router.get("/plan-limits")
@limiter.limit("60/minute")
def get_plan_limits_public(request: Request, db: Session = Depends(get_db)):
    """Retorna os limites de produtos por plano. Sem autenticação."""
    limits = get_all_plan_limits(db)
    return [
        {
            "plan": l.plan,
            "max_products": l.max_products,
            "label": "Ilimitado" if l.max_products == 0 else str(l.max_products),
        }
        for l in limits
    ]