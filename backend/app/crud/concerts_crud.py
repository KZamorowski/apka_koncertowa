"""
concerts_crud.py
Warstwa dostępu do danych (CRUD) dla koncertów.
"""

from sqlalchemy.orm import Session

from ..models import concerts_models
from ..schemas import concerts_schema


def get_all_events(db: Session):
    """Zwraca wszystkie koncerty z bazy."""
    return db.query(concerts_models.Event).all()


def create_event(db: Session, event: concerts_schema.EventCreate):
    """Tworzy i zapisuje nowy koncert."""
    db_event = concerts_models.Event(**event.model_dump())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


def update_event(db: Session, event_id: int, event_data: concerts_schema.EventCreate):
    """Aktualizuje istniejący koncert. Zwraca None, jeśli nie istnieje."""
    db_event = db.query(concerts_models.Event).filter(concerts_models.Event.id == event_id).first()
    if db_event:
        for key, value in event_data.model_dump().items():
            setattr(db_event, key, value)
        db.commit()
        db.refresh(db_event)
    return db_event


def delete_event(db: Session, event_id: int):
    """Usuwa koncert. Zwraca None, jeśli nie istnieje."""
    db_event = db.query(concerts_models.Event).filter(concerts_models.Event.id == event_id).first()
    if db_event:
        db.delete(db_event)
        db.commit()
    return db_event


def create_events_bulk(db: Session, events: list[concerts_schema.EventCreate]):
    """Tworzy wiele koncertów w jednej transakcji (np. całą trasę koncertową)."""
    db_events = [concerts_models.Event(**event.model_dump()) for event in events]

    db.add_all(db_events)
    db.commit()

    # Odświeżamy obiekty, aby baza nadała im wygenerowane numery ID.
    for db_event in db_events:
        db.refresh(db_event)

    return db_events
