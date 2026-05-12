from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.plan_limit import PlanLimit
from app.models.product import Product


# Limites padrão caso a tabela não tenha sido populada
DEFAULT_LIMITS = {
    "gratis": 10,
    "basico": 30,
    "premium": 0,  # 0 = ilimitado
}


def get_plan_limit(db: Session, plan: str) -> int:
    """
    Retorna o máximo de produtos permitidos para o plano.
    0 = ilimitado.
    """
    limit = db.query(PlanLimit).filter(PlanLimit.plan == plan).first()
    if not limit:
        return DEFAULT_LIMITS.get(plan, 10)
    return limit.max_products


def get_all_plan_limits(db: Session) -> List[PlanLimit]:
    """Retorna todos os limites de plano."""
    return db.query(PlanLimit).order_by(PlanLimit.id).all()


def update_plan_limit(db: Session, plan: str, max_products: int) -> Optional[PlanLimit]:
    """
    Atualiza o limite de produtos de um plano.
    Retorna None se o plano não existir.
    """
    limit = db.query(PlanLimit).filter(PlanLimit.plan == plan).first()
    if not limit:
        return None
    limit.max_products = max_products
    db.commit()
    db.refresh(limit)
    return limit


def count_store_products(db: Session, store_id: int) -> int:
    """Conta quantos produtos uma loja tem cadastrados."""
    return db.query(func.count(Product.id)).filter(Product.store_id == store_id).scalar() or 0


def check_product_limit(db: Session, store_id: int, plan: str) -> tuple[bool, int, int]:
    """
    Verifica se a loja pode adicionar mais um produto.

    Retorna uma tupla:
    - can_add: bool — True se pode adicionar
    - current: int — quantidade atual de produtos
    - max_allowed: int — limite do plano (0 = ilimitado)
    """
    max_allowed = get_plan_limit(db, plan)
    current = count_store_products(db, store_id)

    # 0 = ilimitado (plano premium)
    if max_allowed == 0:
        return True, current, max_allowed

    can_add = current < max_allowed
    return can_add, current, max_allowed