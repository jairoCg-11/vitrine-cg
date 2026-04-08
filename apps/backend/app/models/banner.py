from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String

from app.database import Base


class Banner(Base):
    __tablename__ = "banners"

    id = Column(Integer, primary_key=True, index=True)

    # Imagem armazenada no MinIO
    image_url = Column(String(500), nullable=False)

    # Link opcional — ao clicar no banner vai para este URL
    link_url = Column(String(500), nullable=True)

    # Título opcional — usado como alt text e tooltip
    title = Column(String(200), nullable=True)

    # Ordem de exibição no carrossel (menor = primeiro)
    order = Column(Integer, default=0, nullable=False)

    # Status
    is_active = Column(Boolean, default=True, nullable=False)

    # Datas
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Banner id={self.id} title={self.title} order={self.order}>"