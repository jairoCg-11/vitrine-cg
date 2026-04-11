from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.routers.deps import get_current_user
from app.schemas.auth import (
    TokenResponse, UserLogin, UserRegister, UserResponse,
    ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordRequest, MessageResponse,
)
from app.services.auth import (
    authenticate_user, create_access_token, register_user,
    change_password, create_reset_token, reset_password, get_user_by_email,
)
from app.services.email import send_reset_password_email

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserRegister, request: Request, db: Session = Depends(get_db)):
    """
    Cadastra um novo usuário.
    Para lojistas: exige aceite dos termos e registra IP + data/hora.
    """
    # Captura o IP real — considera proxy/load balancer
    client_ip = request.headers.get("X-Forwarded-For", request.client.host if request.client else None)
    if client_ip and "," in client_ip:
        client_ip = client_ip.split(",")[0].strip()

    try:
        user = register_user(db, data, client_ip=client_ip)
        return user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Realiza login e retorna token JWT válido por 7 dias."""
    user = authenticate_user(db, data.email, data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha inválidos.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=token, user=user)


@router.post("/token", include_in_schema=False)
def token_swagger(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email ou senha inválidos.")
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer"}


@router.patch("/me/password", response_model=MessageResponse)
def change_my_password(
    data: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Troca a senha do usuário logado. Requer senha atual."""
    try:
        change_password(db, current_user, data.current_password, data.new_password)
        return MessageResponse(message="Senha alterada com sucesso!")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Solicita redefinição de senha via email."""
    user = get_user_by_email(db, data.email)
    if user and user.is_active:
        token = create_reset_token(user.id)
        try:
            await send_reset_password_email(email=user.email, name=user.name, token=token)
            print(f"✅ Email enviado para {user.email}")
        except Exception as e:
            print(f"❌ ERRO ao enviar email: {e}")
    return MessageResponse(message="Se este email estiver cadastrado, você receberá as instruções em breve.")


@router.post("/reset-password", response_model=MessageResponse)
def reset_my_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Redefine a senha usando o token recebido por email."""
    try:
        reset_password(db, data.token, data.new_password)
        return MessageResponse(message="Senha redefinida com sucesso! Faça login com a nova senha.")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))