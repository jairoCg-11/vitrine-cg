from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.routers.deps import get_current_user
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate
from app.schemas.store import StoreCreate, StoreResponse, StoreUpdate
from app.services.product import (
    create_product,
    delete_product,
    get_product_by_id,
    get_products_by_store,
    update_product,
)
from app.services.store import create_store, get_store_by_owner, update_store

router = APIRouter(prefix="/stores", tags=["Lojista"])


def require_lojista(current_user: User = Depends(get_current_user)) -> User:
    """Dependência — garante que apenas lojistas acessem a rota."""
    if current_user.role != "lojista":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a lojistas.",
        )
    return current_user


# ==============================
# ROTAS DA LOJA
# ==============================

@router.post("", response_model=StoreResponse, status_code=status.HTTP_201_CREATED)
def create_my_store(
    data: StoreCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_lojista),
):
    """Cadastra a loja do lojista. Apenas lojistas. Cada lojista pode ter apenas uma loja."""
    try:
        return create_store(db, current_user.id, data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/me", response_model=StoreResponse)
def get_my_store(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_lojista),
):
    """Retorna os dados da loja do lojista logado."""
    store = get_store_by_owner(db, current_user.id)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Você ainda não tem uma loja cadastrada.",
        )
    return store


@router.put("/me", response_model=StoreResponse)
def update_my_store(
    data: StoreUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_lojista),
):
    """Atualiza os dados da loja do lojista logado."""
    store = get_store_by_owner(db, current_user.id)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Você ainda não tem uma loja cadastrada.",
        )
    return update_store(db, store, data)


# ==============================
# ROTAS DOS PRODUTOS
# ==============================

@router.post("/me/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_my_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_lojista),
):
    """Cadastra um novo produto na loja do lojista logado."""
    store = get_store_by_owner(db, current_user.id)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Você ainda não tem uma loja cadastrada.",
        )
    return create_product(db, store.id, data)


@router.get("/me/products", response_model=List[ProductResponse])
def list_my_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_lojista),
):
    """Lista todos os produtos da loja do lojista logado."""
    store = get_store_by_owner(db, current_user.id)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Você ainda não tem uma loja cadastrada.",
        )
    return get_products_by_store(db, store.id)


@router.put("/me/products/{product_id}", response_model=ProductResponse)
def update_my_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_lojista),
):
    """Atualiza um produto da loja do lojista logado."""
    store = get_store_by_owner(db, current_user.id)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Você ainda não tem uma loja cadastrada.",
        )
    product = get_product_by_id(db, product_id, store.id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado.",
        )
    return update_product(db, product, data)


@router.delete("/me/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_lojista),
):
    """Exclui um produto da loja do lojista logado."""
    store = get_store_by_owner(db, current_user.id)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Você ainda não tem uma loja cadastrada.",
        )
    product = get_product_by_id(db, product_id, store.id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado.",
        )
    delete_product(db, product)
