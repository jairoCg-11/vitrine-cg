from typing import List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.routers.deps import get_current_user
from app.schemas.banner import BannerOrderUpdate, BannerResponse, BannerUpdate
from app.services.banner import (
    create_banner,
    delete_banner,
    get_active_banners,
    get_all_banners,
    get_banner_by_id,
    update_banner,
)
from app.services.storage import delete_image, upload_image

router = APIRouter(tags=["Banners"])

ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
MAX_SIZE = 5 * 1024 * 1024  # 5MB


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependência — garante que apenas admins acessem a rota."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a administradores.",
        )
    return current_user


# ─── Rotas públicas ───────────────────────────────────────────────────────────

@router.get("/public/banners", response_model=List[BannerResponse], tags=["Público"])
def list_active_banners(db: Session = Depends(get_db)):
    """Retorna banners ativos para o carrossel da home. Sem autenticação."""
    return get_active_banners(db)


# ─── Rotas admin ──────────────────────────────────────────────────────────────

@router.get("/admin/banners", response_model=List[BannerResponse])
def list_all_banners(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Lista todos os banners (ativos e inativos). Apenas admin."""
    return get_all_banners(db)


@router.post("/admin/banners", response_model=BannerResponse, status_code=status.HTTP_201_CREATED)
async def create_new_banner(
    file: UploadFile = File(...),
    title: str = Form(None),
    link_url: str = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Faz upload de imagem e cria um novo banner. Apenas admin."""
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato inválido. Use JPEG, PNG ou WebP.",
        )

    data = await file.read()

    if len(data) > MAX_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Imagem muito grande. Máximo 5MB.",
        )

    image_url = upload_image(data, file.content_type, "banners")
    return create_banner(db, image_url=image_url, title=title, link_url=link_url)


@router.patch("/admin/banners/{banner_id}", response_model=BannerResponse)
def update_existing_banner(
    banner_id: int,
    data: BannerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Atualiza título, link, ordem ou status de um banner. Apenas admin."""
    banner = get_banner_by_id(db, banner_id)
    if not banner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Banner não encontrado.",
        )
    return update_banner(db, banner, data)


@router.delete("/admin/banners/{banner_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_banner(
    banner_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Exclui um banner e remove a imagem do MinIO. Apenas admin."""
    banner = get_banner_by_id(db, banner_id)
    if not banner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Banner não encontrado.",
        )
    # Remove imagem do MinIO
    delete_image(banner.image_url)
    delete_banner(db, banner)