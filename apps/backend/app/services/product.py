from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.product_image import ProductImage
from app.schemas.product import ProductCreate, ProductUpdate

MAX_IMAGES = 3


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
        sizes=data.sizes,
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


# ─── Imagens múltiplas ────────────────────────────────────────────────────────

def get_product_images(db: Session, product_id: int) -> List[ProductImage]:
    """Retorna todas as imagens de um produto ordenadas."""
    return (
        db.query(ProductImage)
        .filter(ProductImage.product_id == product_id)
        .order_by(ProductImage.order)
        .all()
    )


def count_product_images(db: Session, product_id: int) -> int:
    """Conta quantas imagens um produto tem."""
    return db.query(ProductImage).filter(ProductImage.product_id == product_id).count()


def add_product_image(db: Session, product_id: int, image_url: str) -> ProductImage:
    """
    Adiciona uma imagem ao produto.
    Lança ValueError se já tiver o máximo de imagens.
    A primeira imagem adicionada também é definida como image_url principal.
    """
    count = count_product_images(db, product_id)
    if count >= MAX_IMAGES:
        raise ValueError(f"Máximo de {MAX_IMAGES} imagens por produto.")

    # Define a ordem como próximo disponível
    order = count

    image = ProductImage(
        product_id=product_id,
        image_url=image_url,
        order=order,
    )
    db.add(image)

    # Se for a primeira imagem, define como principal
    if order == 0:
        product = db.query(Product).filter(Product.id == product_id).first()
        if product:
            product.image_url = image_url

    db.commit()
    db.refresh(image)
    return image


def delete_product_image(db: Session, image: ProductImage) -> None:
    """
    Remove uma imagem do produto.
    Se for a imagem principal (order=0), promove a próxima.
    """
    product_id = image.product_id
    was_first = image.order == 0

    db.delete(image)
    db.commit()

    # Reordena as imagens restantes
    remaining = (
        db.query(ProductImage)
        .filter(ProductImage.product_id == product_id)
        .order_by(ProductImage.order)
        .all()
    )

    for i, img in enumerate(remaining):
        img.order = i

    # Atualiza image_url principal
    product = db.query(Product).filter(Product.id == product_id).first()
    if product:
        product.image_url = remaining[0].image_url if remaining else None

    db.commit()


def get_product_image_by_id(db: Session, image_id: int, product_id: int) -> Optional[ProductImage]:
    """Busca uma imagem pelo ID garantindo que pertence ao produto."""
    return db.query(ProductImage).filter(
        ProductImage.id == image_id,
        ProductImage.product_id == product_id,
    ).first()