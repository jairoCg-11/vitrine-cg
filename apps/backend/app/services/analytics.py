from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.store_event import StoreEvent


def register_event(db: Session, store_id: int, event_type: str) -> None:
    """
    Registra um evento de visita ou clique no WhatsApp.
    Fire-and-forget — não retorna nada.
    """
    event = StoreEvent(store_id=store_id, event_type=event_type)
    db.add(event)
    db.commit()


def get_store_stats(db: Session, store_id: int) -> dict:
    """
    Retorna estatísticas da loja para os períodos de 7, 30 e 90 dias.
    """
    now = datetime.utcnow()

    periods = {
        "7d":  now - timedelta(days=7),
        "30d": now - timedelta(days=30),
        "90d": now - timedelta(days=90),
    }

    result = {}

    for period_name, since in periods.items():
        views = (
            db.query(func.count(StoreEvent.id))
            .filter(
                StoreEvent.store_id == store_id,
                StoreEvent.event_type == "view",
                StoreEvent.created_at >= since,
            )
            .scalar()
        ) or 0

        clicks = (
            db.query(func.count(StoreEvent.id))
            .filter(
                StoreEvent.store_id == store_id,
                StoreEvent.event_type == "whatsapp_click",
                StoreEvent.created_at >= since,
            )
            .scalar()
        ) or 0

        result[period_name] = {
            "views": views,
            "whatsapp_clicks": clicks,
        }

    return result


def cleanup_old_events(db: Session, days: int = 90) -> int:
    """
    Remove eventos mais antigos que `days` dias.
    Retorna quantos registros foram removidos.
    Rodar periodicamente para manter o banco enxuto.
    """
    cutoff = datetime.utcnow() - timedelta(days=days)
    deleted = (
        db.query(StoreEvent)
        .filter(StoreEvent.created_at < cutoff)
        .delete(synchronize_session=False)
    )
    db.commit()
    return deleted