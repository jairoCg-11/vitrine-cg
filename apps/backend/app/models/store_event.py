from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class StoreEvent(Base):
    __tablename__ = "store_events"

    id = Column(Integer, primary_key=True, index=True)

    # Loja que recebeu o evento
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)

    # Tipo de evento
    event_type = Column(
        Enum("view", "whatsapp_click", name="store_event_type"),
        nullable=False,
        index=True,
    )

    # Data do evento — usado para filtrar por período
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    def __repr__(self):
        return f"<StoreEvent store_id={self.store_id} type={self.event_type}>"