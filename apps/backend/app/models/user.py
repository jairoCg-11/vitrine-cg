from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Enum, Integer, String

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=False)

    role = Column(
        Enum("admin", "lojista", "consumidor", name="user_role"),
        nullable=False,
        default="consumidor",
    )

    is_active = Column(Boolean, default=True, nullable=False)

    terms_accepted_at = Column(DateTime, nullable=True)
    terms_ip = Column(String(45), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<User id={self.id} email={self.email} role={self.role}>"
