import secrets
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import settings
from app.models.user import User
from app.schemas.auth import UserRegister

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7
RESET_TOKEN_EXPIRE_MINUTES = 60

_reset_tokens: dict[str, tuple[int, datetime]] = {}


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def register_user(db: Session, data: UserRegister, client_ip: Optional[str] = None) -> User:
    """
    Cadastra um novo usuário.
    Se for lojista e terms_accepted=True, registra o aceite com IP e data/hora.
    Lança ValueError se o email já estiver em uso ou se lojista não aceitou os termos.
    """
    if get_user_by_email(db, data.email):
        raise ValueError("Email já cadastrado.")

    # Lojistas devem aceitar os termos obrigatoriamente
    if data.role == "lojista" and not data.terms_accepted:
        raise ValueError("Você deve aceitar os termos de uso para cadastrar sua loja.")

    user = User(
        name=data.name,
        email=data.email,
        phone=data.phone,
        password_hash=hash_password(data.password),
        role=data.role,
    )

    # Registra o aceite dos termos
    if data.terms_accepted:
        user.terms_accepted_at = datetime.utcnow()
        user.terms_ip = client_ip

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    if not user.is_active:
        return None
    return user


def change_password(db: Session, user: User, current_password: str, new_password: str) -> None:
    if not verify_password(current_password, user.password_hash):
        raise ValueError("Senha atual incorreta.")
    if len(new_password) < 6:
        raise ValueError("A nova senha deve ter pelo menos 6 caracteres.")
    user.password_hash = hash_password(new_password)
    db.commit()


def create_reset_token(user_id: int) -> str:
    now = datetime.utcnow()
    expired = [t for t, (_, exp) in _reset_tokens.items() if exp < now]
    for t in expired:
        del _reset_tokens[t]
    token = secrets.token_urlsafe(32)
    expiry = now + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
    _reset_tokens[token] = (user_id, expiry)
    return token


def validate_reset_token(token: str) -> Optional[int]:
    entry = _reset_tokens.get(token)
    if not entry:
        return None
    user_id, expiry = entry
    if datetime.utcnow() > expiry:
        del _reset_tokens[token]
        return None
    return user_id


def reset_password(db: Session, token: str, new_password: str) -> None:
    user_id = validate_reset_token(token)
    if not user_id:
        raise ValueError("Link inválido ou expirado. Solicite um novo.")
    if len(new_password) < 6:
        raise ValueError("A nova senha deve ter pelo menos 6 caracteres.")
    user = get_user_by_id(db, user_id)
    if not user:
        raise ValueError("Usuário não encontrado.")
    user.password_hash = hash_password(new_password)
    db.commit()
    del _reset_tokens[token]