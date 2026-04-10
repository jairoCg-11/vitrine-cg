import secrets
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import settings
from app.models.user import User
from app.schemas.auth import UserRegister

# Hash de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

# Tokens de reset ficam válidos por 1 hora
RESET_TOKEN_EXPIRE_MINUTES = 60

# Armazena tokens de reset em memória — chave: token, valor: (user_id, expiry)
# Em produção com múltiplos workers usar Redis, mas para esta escala é suficiente
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


def register_user(db: Session, data: UserRegister) -> User:
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
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    if not user.is_active:
        return None
    return user


# ─── Trocar senha (usuário logado) ────────────────────────────────────────────

def change_password(db: Session, user: User, current_password: str, new_password: str) -> None:
    """
    Troca a senha do usuário logado.
    Lança ValueError se a senha atual estiver incorreta ou a nova for muito curta.
    """
    if not verify_password(current_password, user.password_hash):
        raise ValueError("Senha atual incorreta.")
    if len(new_password) < 6:
        raise ValueError("A nova senha deve ter pelo menos 6 caracteres.")
    user.password_hash = hash_password(new_password)
    db.commit()


# ─── Esqueci a senha ──────────────────────────────────────────────────────────

def create_reset_token(user_id: int) -> str:
    """
    Gera um token único para redefinição de senha.
    Armazena em memória com expiração de 1 hora.
    """
    # Remove tokens expirados antes de criar novo
    now = datetime.utcnow()
    expired = [t for t, (_, exp) in _reset_tokens.items() if exp < now]
    for t in expired:
        del _reset_tokens[t]

    token = secrets.token_urlsafe(32)
    expiry = now + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
    _reset_tokens[token] = (user_id, expiry)
    return token


def validate_reset_token(token: str) -> Optional[int]:
    """
    Valida o token de reset e retorna o user_id.
    Retorna None se o token for inválido ou expirado.
    """
    entry = _reset_tokens.get(token)
    if not entry:
        return None
    user_id, expiry = entry
    if datetime.utcnow() > expiry:
        del _reset_tokens[token]
        return None
    return user_id


def reset_password(db: Session, token: str, new_password: str) -> None:
    """
    Redefine a senha usando o token de reset.
    Lança ValueError se o token for inválido, expirado ou a senha for curta.
    """
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

    # Remove o token após uso — só pode ser usado uma vez
    del _reset_tokens[token]