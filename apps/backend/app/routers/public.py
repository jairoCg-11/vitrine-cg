from typing import List

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
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

router = APIRouter(prefix="/public", tags=["Público"])


@router.get("/stores", response_model=List[PublicStoreResponse])
def list_stores(db: Session = Depends(get_db)):
    """Lista todas as lojas ativas do shopping. Sem autenticação."""
    return get_active_stores(db)


@router.get("/stores/{store_id}", response_model=PublicStoreDetailResponse)
def get_store(
    store_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Retorna detalhes de uma loja com seus produtos disponíveis.
    Registra uma visita em background. Sem autenticação.
    """
    store = get_store_with_products(db, store_id)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loja não encontrada.",
        )
    # Registra visita em background — não atrasa a resposta
    background_tasks.add_task(register_event, db, store_id, "view")
    return store


@router.get("/stores/{store_id}/products", response_model=List[PublicProductResponse])
def list_store_products(store_id: int, db: Session = Depends(get_db)):
    """Lista produtos disponíveis de uma loja. Sem autenticação."""
    products = get_products_by_store_public(db, store_id)
    if not products:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loja não encontrada ou sem produtos disponíveis.",
        )
    return products


@router.get("/stores/{store_id}/products/{product_id}", response_model=PublicProductResponse)
def get_store_product(store_id: int, product_id: int, db: Session = Depends(get_db)):
    """Retorna um produto específico de uma loja. Sem autenticação."""
    product = get_product_public(db, store_id, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado.",
        )
    return product


@router.post("/stores/{store_id}/events/whatsapp", status_code=200)
def track_whatsapp_click(
    store_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Registra um clique no botão WhatsApp da loja.
    Chamado pelo frontend ao clicar no botão. Sem autenticação.
    """
    background_tasks.add_task(register_event, db, store_id, "whatsapp_click")
    return {"ok": True}


@router.get("/search", response_model=SearchResponse)
def search_stores_and_products(
    q: str = Query(..., min_length=2, description="Termo de busca"),
    db: Session = Depends(get_db),
):
    """Busca lojas e produtos pelo termo informado. Sem autenticação."""
    results = search(db, q)
    return results