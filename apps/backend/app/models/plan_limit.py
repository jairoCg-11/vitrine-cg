from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String

from app.database import Base


class PlanLimit(Base):
    __tablename__ = "plan_limits"

    id = Column(Integer, primary_key=True, index=True)

    # Nome do plano: gratis, basico, premium
    plan = Column(String(20), unique=True, nullable=False, index=True)

    # Máximo de produtos permitidos — 0 = ilimitado
    max_products = Column(Integer, nullable=False, default=10)

    # Data da última alteração pelo admin
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<PlanLimit plan={self.plan} max_products={self.max_products}>"