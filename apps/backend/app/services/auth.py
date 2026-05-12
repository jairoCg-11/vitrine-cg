import secrets
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import settings
from app.models.user import User
from app.models.password_reset_token import PasswordResetToken
from app.schemas.auth import UserRegister

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7
RESET_TOKEN_EXPIRE_MINUTES = 60


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
    Para lojistas: exige aceite dos termos e registra IP + data/hora.
    """
    if get_user_by_email(db, data.email):
        raise ValueError("Email já cadastrado.")

    if data.role == "lojista" and not data.terms_accepted:
        raise ValueError("Você deve aceitar os termos de uso para cadastrar sua loja.")

    user = User(
        name=data.name,
        email=data.email,
        phone=data.phone,
        password_hash=hash_password(data.password),
        role=data.role,
    )

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


# ─── Reset de senha — persistido no banco ─────────────────────────────────────

def create_reset_token(db: Session, user_id: int) -> str:
    """
    Gera um token de reset e salva no banco com expiração de 1 hora.
    Invalida tokens anteriores do mesmo usuário.
    """
    # Invalida tokens anteriores não usados
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user_id,
        PasswordResetToken.used == False,
    ).delete(synchronize_session=False)

    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)

    reset = PasswordResetToken(
        user_id=user_id,
        token=token,
        expires_at=expires_at,
    )
    db.add(reset)
    db.commit()
    return token


def validate_reset_token(db: Session, token: str) -> Optional[int]:
    """
    Valida o token de reset.
    Retorna o user_id se válido, None se inválido ou expirado.
    """
    reset = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == token,
        PasswordResetToken.used == False,
    ).first()

    if not reset:
        return None

    if datetime.utcnow() > reset.expires_at:
        return None

    return reset.user_id


def reset_password(db: Session, token: str, new_password: str) -> None:
    """
    Redefine a senha usando o token de reset.
    Marca o token como usado após a operação.
    """
    reset = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == token,
        PasswordResetToken.used == False,
    ).first()

    if not reset:
        raise ValueError("Link inválido ou expirado. Solicite um novo.")

    if datetime.utcnow() > reset.expires_at:
        raise ValueError("Link expirado. Solicite um novo.")

    if len(new_password) < 6:
        raise ValueError("A nova senha deve ter pelo menos 6 caracteres.")

    user = get_user_by_id(db, reset.user_id)
    if not user:
        raise ValueError("Usuário não encontrado.")

    user.password_hash = hash_password(new_password)
    reset.used = True  # Token de uso único
    db.commit()