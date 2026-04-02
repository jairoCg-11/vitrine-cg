from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
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
    get_products_by_store_public,
    get_store_with_products,
    search,
)

router = APIRouter(prefix="/public", tags=["Público"])


@router.get("/stores", response_model=List[PublicStoreResponse])
def list_stores(db: Session = Depends(get_db)):
    """Lista todas as lojas ativas do shopping. Sem autenticação."""
    return get_active_stores(db)


@router.get("/stores/{store_id}", response_model=PublicStoreDetailResponse)
def get_store(store_id: int, db: Session = Depends(get_db)):
    """Retorna detalhes de uma loja com seus produtos disponíveis. Sem autenticação."""
    store = get_store_with_products(db, store_id)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loja não encontrada.",
        )
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


@router.get("/search", response_model=SearchResponse)
def search_stores_and_products(
    q: str = Query(..., min_length=2, description="Termo de busca"),
    db: Session = Depends(get_db),
):
    """
    Busca lojas e produtos pelo termo informado.
    Pesquisa em nome, descrição e categoria/segmento.
    Sem autenticação.
    """
    results = search(db, q)
    return results
