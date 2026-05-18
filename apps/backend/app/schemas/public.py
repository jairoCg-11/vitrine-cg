from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel


class PublicProductImageResponse(BaseModel):
    id: int
    image_url: str
    order: int

    class Config:
        from_attributes = True


class PublicProductResponse(BaseModel):
    id: int
    store_id: int
    name: str
    description: Optional[str]
    price: Decimal
    original_price: Optional[Decimal]
    show_price: bool
    category: Optional[str]
    sizes: Optional[str]
    image_url: Optional[str]
    is_available: bool
    images: List[PublicProductImageResponse] = []

    class Config:
        from_attributes = True


class PublicStoreResponse(BaseModel):
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

    class Config:
        from_attributes = True


class PublicStoreDetailResponse(BaseModel):
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
    stores: List[PublicStoreResponse] = []
    products: List[PublicProductResponse] = []