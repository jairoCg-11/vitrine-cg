from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel


class PublicProductResponse(BaseModel):
    """Dados do produto visíveis para o consumidor."""
    id: int
    store_id: int
    name: str
    description: Optional[str]
    price: Decimal
    category: Optional[str]
    sizes: Optional[str]
    image_url: Optional[str]
    is_available: bool

    class Config:
        from_attributes = True


class PublicStoreResponse(BaseModel):
    """Dados da loja visíveis para o consumidor."""
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
    is_open: bool
    # Exposto para o frontend filtrar lojas em destaque
    plan: str

    class Config:
        from_attributes = True


class PublicStoreDetailResponse(BaseModel):
    """Dados completos da loja com seus produtos."""
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
    is_open: bool
    plan: str
    products: List[PublicProductResponse] = []

    class Config:
        from_attributes = True


class SearchResponse(BaseModel):
    """Resultado de busca — lojas e produtos encontrados."""
    stores: List[PublicStoreResponse] = []
    products: List[PublicProductResponse] = []