from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)

    # Relacionamento com o produto
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    product = relationship("Product", back_populates="images")

    # URL da imagem no MinIO
    image_url = Column(String(500), nullable=False)

    # Ordem de exibição (0 = principal)
    order = Column(Integer, default=0, nullable=False)

    # Data de criação
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<ProductImage id={self.id} product_id={self.product_id} order={self.order}>"