from typing import Optional

from sqlalchemy.orm import Session

from app.models.store import Store
from app.schemas.store import StoreCreate, StoreUpdate


def get_store_by_owner(db: Session, owner_id: int) -> Optional[Store]:
    """Busca a loja de um lojista pelo seu ID."""
    return db.query(Store).filter(Store.owner_id == owner_id).first()


def create_store(db: Session, owner_id: int, data: StoreCreate) -> Store:
    """
    Cadastra uma nova loja para o lojista.
    Lança ValueError se o lojista já tiver uma loja.
    """
    if get_store_by_owner(db, owner_id):
        raise ValueError("Você já possui uma loja cadastrada.")

    store = Store(
        owner_id=owner_id,
        name=data.name,
        description=data.description,
        segment=data.segment,
        location=data.location,
        whatsapp=data.whatsapp,
        instagram=data.instagram,
    )
    db.add(store)
    db.commit()
    db.refresh(store)
    return store


def update_store(db: Session, store: Store, data: StoreUpdate) -> Store:
    """Atualiza os dados da loja com os campos informados."""
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(store, field, value)
    db.commit()
    db.refresh(store)
    return store
