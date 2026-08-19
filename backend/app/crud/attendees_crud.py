"""
attendees_crud.py
Warstwa dostępu do danych (CRUD) dla uczestników koncertów, wraz
z wyszukiwaniem i paginacją listy uczestników danego wydarzenia.
"""

from sqlalchemy.orm import Session

from ..models import concerts_models
from ..schemas import attendees_schema


def get_all_attendees(db: Session):
    """Zwraca wszystkich uczestników (wszystkich koncertów łącznie)."""
    return db.query(concerts_models.Attendee).all()


def get_attendees_by_event(
    db: Session,
    event_id: int,
    skip: int = 0,
    limit: int = 50,
    search: str = "",
):
    """Zwraca uczestników danego koncertu z obsługą wyszukiwania i paginacji.

    Args:
        event_id: ID koncertu, dla którego pobierani są uczestnicy.
        skip: liczba rekordów do pominięcia (offset paginacji).
        limit: maksymalna liczba rekordów zwracana w jednej stronie wyników.
        search: opcjonalna fraza filtrująca po imieniu, nazwisku lub
            numerze biletu.

    Returns:
        dict z kluczami "total" (łączna liczba pasujących rekordów)
        oraz "items" (wycinek wyników dla bieżącej strony).
    """
    query = db.query(concerts_models.Attendee).filter(concerts_models.Attendee.event_id == event_id)

    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (concerts_models.Attendee.ticket_number.ilike(search_fmt))
            | (concerts_models.Attendee.first_name.ilike(search_fmt))
            | (concerts_models.Attendee.last_name.ilike(search_fmt))
        )

    total = query.count()
    items = query.offset(skip).limit(limit).all()

    return {"total": total, "items": items}


def create_attendee(db: Session, attendee: attendees_schema.AttendeeCreate):
    """Dodaje nowego uczestnika."""
    db_attendee = concerts_models.Attendee(**attendee.model_dump())
    db.add(db_attendee)
    db.commit()
    db.refresh(db_attendee)
    return db_attendee


def delete_attendee(db: Session, attendee_id: int):
    """Usuwa uczestnika. Zwraca None, jeśli nie istnieje."""
    db_attendee = db.query(concerts_models.Attendee).filter(concerts_models.Attendee.id == attendee_id).first()
    if db_attendee:
        db.delete(db_attendee)
        db.commit()
    return db_attendee


def update_attendee(db: Session, attendee_id: int, attendee_data: attendees_schema.AttendeeCreate):
    """Aktualizuje dane uczestnika. Zwraca None, jeśli nie istnieje."""
    db_attendee = db.query(concerts_models.Attendee).filter(concerts_models.Attendee.id == attendee_id).first()
    if db_attendee:
        for key, value in attendee_data.model_dump().items():
            setattr(db_attendee, key, value)
        db.commit()
        db.refresh(db_attendee)
    return db_attendee
