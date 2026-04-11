from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship, backref

from app.database import Base


class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)

    # Relacionamento com o lojista — CASCADE: ao deletar o usuário, deleta a loja
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    owner = relationship("User", backref=backref("store", passive_deletes=True))
    products = relationship("Product", back_populates="store", passive_deletes=True)

    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    segment = Column(String(100), nullable=True)
    location = Column(String(100), nullable=True)

    whatsapp = Column(String(20), nullable=True)
    instagram = Column(String(100), nullable=True)

    logo_url = Column(String(500), nullable=True)
    cover_url = Column(String(500), nullable=True)

    plan = Column(
        Enum("gratis", "basico", "premium", name="store_plan"),
        nullable=False,
        default="gratis",
    )

    is_active = Column(Boolean, default=True, nullable=False)
    is_open = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Store id={self.id} name={self.name}>"
