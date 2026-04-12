from typing import List

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.routers.deps import get_current_user
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate, ProductImageResponse
from app.schemas.store import StoreCreate, StoreResponse, StoreUpdate
from app.services.analytics import get_store_stats
from app.services.product import (
    create_product,
    delete_product,
    get_product_by_id,
    get_products_by_store,
    update_product,
    add_product_image,
    delete_product_image,
    get_product_image_by_id,
    count_product_images,
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

@router.post("", response_model=StoreResponse, status_code=status.HTTP_201_CREATED)
async def create_my_store(
    data: StoreCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_lojista),
):
    """Cadastra a loja do lojista. Apenas lojistas."""
    from app.services.email import send_store_pending_email

    try:
        store = create_store(db, current_user.id, data)
        # Envia email de confirmação em background
        background_tasks.add_task(
            send_store_pending_email,
            email=current_user.email,
            name=current_user.name,
            store_name=store.name,
        )
        return store
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


# ==============================
# ROTAS DE UPLOAD DE IMAGENS
# ==============================

from fastapi import UploadFile, File
from app.services.storage import upload_image, delete_image

ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
MAX_SIZE = 5 * 1024 * 1024  # 5MB


def validate_image(file: UploadFile) -> None:
    """Valida tipo e tamanho da imagem enviada."""
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato inválido. Use JPEG, PNG ou WebP.",
        )


@router.post("/me/logo", response_model=StoreResponse)
async def upload_logo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_lojista),
):
    """Faz upload da logo da loja. Apenas lojistas."""
    store = get_store_by_owner(db, current_user.id)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Você ainda não tem uma loja cadastrada.",
        )

    validate_image(file)
    data = await file.read()

    if len(data) > MAX_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Imagem muito grande. Máximo 5MB.",
        )

    # Remove logo antiga se existir
    if store.logo_url:
        delete_image(store.logo_url)

    url = upload_image(data, file.content_type, "logos")
    return update_store(db, store, StoreUpdate(logo_url=url))


@router.post("/me/cover", response_model=StoreResponse)
async def upload_cover(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_lojista),
):
    """Faz upload da foto de capa da loja. Apenas lojistas."""
    store = get_store_by_owner(db, current_user.id)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Você ainda não tem uma loja cadastrada.",
        )

    validate_image(file)
    data = await file.read()

    if len(data) > MAX_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Imagem muito grande. Máximo 5MB.",
        )

    # Remove capa antiga se existir
    if store.cover_url:
        delete_image(store.cover_url)

    url = upload_image(data, file.content_type, "covers")
    return update_store(db, store, StoreUpdate(cover_url=url))


@router.post("/me/products/{product_id}/image", response_model=ProductResponse)
async def upload_product_image(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_lojista),
):
    """Faz upload da foto do produto. Apenas lojistas."""
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

    validate_image(file)
    data = await file.read()

    if len(data) > MAX_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Imagem muito grande. Máximo 5MB.",
        )

    # Remove imagem antiga se existir
    if product.image_url:
        delete_image(product.image_url)

    url = upload_image(data, file.content_type, "products")
    return update_product(db, product, ProductUpdate(image_url=url))
@router.post(
    "/me/products/{product_id}/images",
    response_model=ProductImageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_product_image_route(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_lojista),
):
    """
    Adiciona uma imagem ao produto. Máximo 3 imagens por produto.
    A primeira imagem adicionada vira a imagem principal.
    Apenas lojistas.
    """
    store = get_store_by_owner(db, current_user.id)
    if not store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loja não encontrada.")
 
    product = get_product_by_id(db, product_id, store.id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produto não encontrado.")
 
    validate_image(file)
    data = await file.read()
 
    if len(data) > MAX_SIZE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Imagem muito grande. Máximo 5MB.")
 
    try:
        url = upload_image(data, file.content_type, "products")
        return add_product_image(db, product_id, url)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
 
 
@router.delete(
    "/me/products/{product_id}/images/{image_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_product_image_route(
    product_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_lojista),
):
    """
    Remove uma imagem do produto.
    Se for a principal, a próxima imagem assume o lugar.
    Apenas lojistas.
    """
    store = get_store_by_owner(db, current_user.id)
    if not store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loja não encontrada.")
 
    product = get_product_by_id(db, product_id, store.id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produto não encontrado.")
 
    image = get_product_image_by_id(db, image_id, product_id)
    if not image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Imagem não encontrada.")
 
    delete_image(image.image_url)
    delete_product_image(db, image)

@router.get("/me/stats")
def get_my_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_lojista),
):
    """
    Retorna estatísticas da loja do lojista logado.
    Visitas e cliques no WhatsApp nos últimos 7, 30 e 90 dias.
    """
    from app.services.analytics import get_store_stats
 
    store = get_store_by_owner(db, current_user.id)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Você ainda não tem uma loja cadastrada.",
        )
    return get_store_stats(db, store.id)
 