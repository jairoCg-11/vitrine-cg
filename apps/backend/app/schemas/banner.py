from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class BannerResponse(BaseModel):
    """Dados do banner retornados pela API."""
    id: int
    image_url: str
    link_url: Optional[str]
    title: Optional[str]
    order: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class BannerUpdate(BaseModel):
    """Dados para atualizar um banner — todos opcionais."""
    link_url: Optional[str] = None
    title: Optional[str] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None


class BannerOrderUpdate(BaseModel):
    """Dados para reordenar um banner."""
    order: int