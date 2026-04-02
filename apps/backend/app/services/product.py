from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


def get_products_by_store(db: Session, store_id: int) -> List[Product]:
    """Lista todos os produtos de uma loja."""
    return db.query(Product).filter(Product.store_id == store_id).all()


def get_product_by_id(db: Session, product_id: int, store_id: int) -> Optional[Product]:
    """Busca um produto pelo ID garantindo que pertence à loja."""
    return db.query(Product).filter(
        Product.id == product_id,
        Product.store_id == store_id,
    ).first()


def create_product(db: Session, store_id: int, data: ProductCreate) -> Product:
    """Cadastra um novo produto na loja."""
    product = Product(
        store_id=store_id,
        name=data.name,
        description=data.description,
        price=data.price,
        category=data.category,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(db: Session, product: Product, data: ProductUpdate) -> Product:
    """Atualiza os dados do produto com os campos informados."""
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product: Product) -> None:
    """Exclui um produto da loja."""
    db.delete(product)
    db.commit()
