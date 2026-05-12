from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)

    # Usuário dono do token
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Token único gerado aleatoriamente
    token = Column(String(100), unique=True, nullable=False, index=True)

    # Expiração — 1 hora após criação
    expires_at = Column(DateTime, nullable=False)

    # Indica se já foi usado — tokens são de uso único
    used = Column(Boolean, default=False, nullable=False)

    # Data de criação
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<PasswordResetToken user_id={self.user_id} used={self.used}>"