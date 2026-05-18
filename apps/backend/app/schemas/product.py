from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel


class ProductImageResponse(BaseModel):
    id: int
    image_url: str
    order: int

    class Config:
        from_attributes = True


class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: Decimal
    original_price: Optional[Decimal] = None
    show_price: bool = True
    category: Optional[str] = None
    sizes: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    original_price: Optional[Decimal] = None
    show_price: Optional[bool] = None
    category: Optional[str] = None
    sizes: Optional[str] = None
    is_available: Optional[bool] = None
    image_url: Optional[str] = None


class ProductResponse(BaseModel):
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
    images: List[ProductImageResponse] = []

    class Config:
        from_attributes = True