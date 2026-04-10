from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel


class ProductImageResponse(BaseModel):
    """Dados de uma imagem do produto."""
    id: int
    image_url: str
    order: int

    class Config:
        from_attributes = True


class ProductCreate(BaseModel):
    """Dados para cadastrar um novo produto."""
    name: str
    description: Optional[str] = None
    price: Decimal
    category: Optional[str] = None
    sizes: Optional[str] = None


class ProductUpdate(BaseModel):
    """Dados para atualizar produto — todos opcionais."""
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    category: Optional[str] = None
    sizes: Optional[str] = None
    is_available: Optional[bool] = None
    image_url: Optional[str] = None


class ProductResponse(BaseModel):
    """Dados do produto retornados pela API."""
    id: int
    store_id: int
    name: str
    description: Optional[str]
    price: Decimal
    category: Optional[str]
    sizes: Optional[str]
    image_url: Optional[str]
    is_available: bool
    images: List[ProductImageResponse] = []

    class Config:
        from_attributes = True