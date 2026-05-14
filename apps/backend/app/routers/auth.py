from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.main import limiter
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
@limiter.limit("5/hour")
def register(request: Request, data: UserRegister, db: Session = Depends(get_db)):
    """
    Cadastra um novo usuário.
    Limite: 5 cadastros por hora por IP.
    """
    client_ip = request.headers.get("X-Forwarded-For", request.client.host if request.client else None)
    if client_ip and "," in client_ip:
        client_ip = client_ip.split(",")[0].strip()
    try:
        return register_user(db, data, client_ip=client_ip)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
def login(request: Request, data: UserLogin, db: Session = Depends(get_db)):
    """
    Realiza login e retorna token JWT válido por 7 dias.
    Limite: 10 tentativas por minuto por IP — proteção contra brute force.
    """
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
@limiter.limit("3/hour")
async def forgot_password(request: Request, data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Solicita redefinição de senha via email.
    Limite: 3 solicitações por hora por IP — evita spam de email.
    """
    user = get_user_by_email(db, data.email)
    if user and user.is_active:
        token = create_reset_token(db, user.id)
        try:
            await send_reset_password_email(email=user.email, name=user.name, token=token)
            print(f"✅ Email enviado para {user.email}")
        except Exception as e:
            print(f"❌ ERRO ao enviar email: {e}")
    return MessageResponse(message="Se este email estiver cadastrado, você receberá as instruções em breve.")


@router.post("/reset-password", response_model=MessageResponse)
@limiter.limit("5/hour")
def reset_my_password(request: Request, data: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Redefine a senha usando o token recebido por email.
    Limite: 5 tentativas por hora por IP.
    """
    try:
        reset_password(db, data.token, data.new_password)
        return MessageResponse(message="Senha redefinida com sucesso! Faça login com a nova senha.")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))