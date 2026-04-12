from typing import List, Optional

from sqlalchemy.orm import Session, joinedload

from app.models.product import Product
from app.models.store import Store


def get_active_stores(db: Session) -> List[Store]:
    """Retorna todas as lojas ativas E aprovadas ordenadas por nome."""
    return (
        db.query(Store)
        .filter(Store.is_active == True, Store.is_approved == True)
        .order_by(Store.name)
        .all()
    )


def get_store_with_products(db: Session, store_id: int) -> Optional[Store]:
    """
    Retorna uma loja ativa e aprovada com seus produtos disponíveis.
    Retorna None se a loja não existir, estiver inativa ou não aprovada.
    """
    return (
        db.query(Store)
        .options(joinedload(Store.products))
        .filter(
            Store.id == store_id,
            Store.is_active == True,
            Store.is_approved == True,
        )
        .first()
    )


def get_product_public(db: Session, store_id: int, product_id: int) -> Optional[Product]:
    """Retorna um produto disponível de uma loja ativa e aprovada."""
    return (
        db.query(Product)
        .join(Store)
        .filter(
            Product.id == product_id,
            Product.store_id == store_id,
            Product.is_available == True,
            Store.is_active == True,
            Store.is_approved == True,
        )
        .first()
    )


def get_products_by_store_public(db: Session, store_id: int) -> List[Product]:
    """Retorna produtos disponíveis de uma loja ativa e aprovada."""
    store = db.query(Store).filter(
        Store.id == store_id,
        Store.is_active == True,
        Store.is_approved == True,
    ).first()

    if not store:
        return []

    return (
        db.query(Product)
        .filter(
            Product.store_id == store_id,
            Product.is_available == True,
        )
        .order_by(Product.name)
        .all()
    )


def search(db: Session, query: str) -> dict:
    """Busca lojas e produtos aprovados pelo termo informado."""
    term = f"%{query}%"

    stores = (
        db.query(Store)
        .filter(
            Store.is_active == True,
            Store.is_approved == True,
            (Store.name.ilike(term) | Store.description.ilike(term) | Store.segment.ilike(term)),
        )
        .order_by(Store.name)
        .all()
    )

    products = (
        db.query(Product)
        .join(Store)
        .filter(
            Store.is_active == True,
            Store.is_approved == True,
            Product.is_available == True,
            (Product.name.ilike(term) | Product.description.ilike(term) | Product.category.ilike(term)),
        )
        .order_by(Product.name)
        .all()
    )

    return {"stores": stores, "products": products}