from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class UserAdminResponse(BaseModel):
    """Dados completos do usuário para o painel do admin."""
    id: int
    name: str
    email: str
    phone: Optional[str]
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BlockUserResponse(BaseModel):
    """Resposta ao bloquear ou desbloquear um usuário."""
    id: int
    name: str
    email: str
    is_active: bool
    message: str

    class Config:
        from_attributes = True
