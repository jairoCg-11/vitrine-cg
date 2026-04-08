from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.banner import Banner
from app.schemas.banner import BannerUpdate


def get_all_banners(db: Session) -> List[Banner]:
    """Retorna todos os banners ordenados por ordem de exibição."""
    return db.query(Banner).order_by(Banner.order, Banner.created_at).all()


def get_active_banners(db: Session) -> List[Banner]:
    """Retorna apenas os banners ativos — usado na rota pública."""
    return (
        db.query(Banner)
        .filter(Banner.is_active == True)
        .order_by(Banner.order, Banner.created_at)
        .all()
    )


def get_banner_by_id(db: Session, banner_id: int) -> Optional[Banner]:
    """Retorna um banner pelo ID."""
    return db.query(Banner).filter(Banner.id == banner_id).first()


def create_banner(
    db: Session,
    image_url: str,
    title: Optional[str] = None,
    link_url: Optional[str] = None,
) -> Banner:
    """Cria um novo banner."""
    # Ordem = último + 1
    last = db.query(Banner).order_by(Banner.order.desc()).first()
    next_order = (last.order + 1) if last else 0

    banner = Banner(
        image_url=image_url,
        title=title,
        link_url=link_url,
        order=next_order,
    )
    db.add(banner)
    db.commit()
    db.refresh(banner)
    return banner


def update_banner(db: Session, banner: Banner, data: BannerUpdate) -> Banner:
    """Atualiza os dados de um banner."""
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(banner, field, value)
    db.commit()
    db.refresh(banner)
    return banner


def delete_banner(db: Session, banner: Banner) -> None:
    """Exclui um banner permanentemente."""
    db.delete(banner)
    db.commit()