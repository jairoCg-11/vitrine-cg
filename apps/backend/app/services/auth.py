from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import settings
from app.models.user import User
from app.schemas.auth import UserRegister

# Configuração do hash de senha — usa bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Algoritmo do JWT
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7


def hash_password(password: str) -> str:
    """Gera o hash seguro da senha."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha informada bate com o hash salvo."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    """Gera um token JWT com expiração."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """Decodifica e valida um token JWT. Retorna None se inválido."""
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Busca um usuário pelo email no banco."""
    return db.query(User).filter(User.email == email).first()


def register_user(db: Session, data: UserRegister) -> User:
    """
    Cadastra um novo usuário.
    Lança ValueError se o email já estiver em uso.
    """
    if get_user_by_email(db, data.email):
        raise ValueError("Email já cadastrado.")

    user = User(
        name=data.name,
        email=data.email,
        phone=data.phone,
        password_hash=hash_password(data.password),
        role=data.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Valida email e senha.
    Retorna o usuário se válido, None caso contrário.
    """
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    if not user.is_active:
        return None
    return user
