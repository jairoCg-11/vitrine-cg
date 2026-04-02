from typing import Optional
from pydantic import BaseModel


class StoreCreate(BaseModel):
    """Dados para cadastrar uma nova loja."""
    name: str
    description: Optional[str] = None
    segment: Optional[str] = None
    location: Optional[str] = None
    whatsapp: Optional[str] = None
    instagram: Optional[str] = None


class StoreUpdate(BaseModel):
    """Dados para atualizar a loja — todos opcionais."""
    name: Optional[str] = None
    description: Optional[str] = None
    segment: Optional[str] = None
    location: Optional[str] = None
    whatsapp: Optional[str] = None
    instagram: Optional[str] = None
    is_open: Optional[bool] = None


class StoreResponse(BaseModel):
    """Dados da loja retornados pela API."""
    id: int
    owner_id: int
    name: str
    description: Optional[str]
    segment: Optional[str]
    location: Optional[str]
    whatsapp: Optional[str]
    instagram: Optional[str]
    logo_url: Optional[str]
    cover_url: Optional[str]
    plan: str
    is_active: bool
    is_open: bool

    class Config:
        from_attributes = True
