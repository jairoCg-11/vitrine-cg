from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)

    # Relacionamento com a loja
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    store = relationship("Store", backref="products")

    # Dados do produto
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    category = Column(String(100), nullable=True)
    sizes = Column(String(100), nullable=True)  # ex: "PP,P,M,G,GG,XG"

    # Imagem
    image_url = Column(String(500), nullable=True)

    # Status
    is_available = Column(Boolean, default=True, nullable=False)

    # Datas
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Product id={self.id} name={self.name} price={self.price}>"
