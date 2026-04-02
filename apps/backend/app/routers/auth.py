from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.auth import TokenResponse, UserLogin, UserRegister, UserResponse
from app.services.auth import authenticate_user, create_access_token, register_user

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserRegister, db: Session = Depends(get_db)):
    """
    Cadastra um novo usuário.
    - Role padrão: consumidor
    - Email deve ser único
    """
    try:
        user = register_user(db, data)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """
    Realiza login e retorna token JWT.
    - Token válido por 7 dias
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
