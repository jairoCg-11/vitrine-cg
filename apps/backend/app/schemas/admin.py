from datetime import datetime
from typing import Optional, Literal
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
    # Registro de aceite dos termos
    terms_accepted_at: Optional[datetime]
    terms_ip: Optional[str]

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


PlanType = Literal["gratis", "basico", "premium"]


class UpdateStorePlanRequest(BaseModel):
    """Corpo da requisição para alterar o plano de uma loja."""
    plan: PlanType


class StorePlanResponse(BaseModel):
    """Resposta após alterar o plano de uma loja."""
    id: int
    name: str
    plan: str
    message: str

    class Config:
        from_attributes = True