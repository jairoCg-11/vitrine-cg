from pydantic import BaseModel, EmailStr
from typing import Optional


# --- Entrada ---

class UserRegister(BaseModel):
    """Dados necessários para cadastrar um novo usuário."""
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    role: str = "consumidor"


class UserLogin(BaseModel):
    """Dados necessários para fazer login."""
    email: EmailStr
    password: str


class ChangePasswordRequest(BaseModel):
    """Dados para trocar a senha estando logado."""
    current_password: str
    new_password: str


class ForgotPasswordRequest(BaseModel):
    """Dados para solicitar redefinição de senha."""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Dados para redefinir a senha com token."""
    token: str
    new_password: str


# --- Saída ---

class UserResponse(BaseModel):
    """Dados do usuário retornados pela API — nunca expõe a senha."""
    id: int
    name: str
    email: str
    phone: Optional[str]
    role: str
    is_active: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Token JWT retornado após login bem sucedido."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class MessageResponse(BaseModel):
    """Resposta simples com mensagem de confirmação."""
    message: str