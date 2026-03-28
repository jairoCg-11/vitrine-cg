from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)

    # Relacionamento com o lojista
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", backref="store")

    # Dados da loja
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    segment = Column(String(100), nullable=True)  # ex: roupas, calçados, eletrônicos
    location = Column(String(100), nullable=True)  # ex: Loja 42, Bloco B

    # Contato
    whatsapp = Column(String(20), nullable=True)
    instagram = Column(String(100), nullable=True)

    # Imagens
    logo_url = Column(String(500), nullable=True)
    cover_url = Column(String(500), nullable=True)

    # Plano de assinatura
    plan = Column(
        Enum("gratis", "basico", "premium", name="store_plan"),
        nullable=False,
        default="gratis",
    )

    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_open = Column(Boolean, default=True, nullable=False)  # aberta/fechada no momento

    # Datas
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Store id={self.id} name={self.name}>"
